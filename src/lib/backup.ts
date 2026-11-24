'use client';

import { blobToDataUrl, loadStoredPhoto, storeDataUrlPhoto, deleteStoredPhoto, type PhotoKind } from '@/lib/image-storage';
import { validateTrip, validatePhotoDataUrl } from '@/lib/validation';
import { Trip } from '@/types/trip';
import { toLocalDateTimeInput } from '@/lib/date-utils';

interface BackupPhoto {
  kind: PhotoKind;
  dataUrl: string;
}

interface TripBackup {
  format: 'trip-calculator-v2' | 'trip-calculator-v3';
  version: 2 | 3;
  exportedAt: string;
  trip: Trip;
  photos: Record<string, BackupPhoto>;
}

export async function createTripBackup(trip: Trip): Promise<Blob> {
  const photoKinds = new Map<string, PhotoKind>();
  if (trip.coverPhotoId) photoKinds.set(trip.coverPhotoId, 'cover');
  trip.participants.forEach((participant) => {
    if (participant.photoId) photoKinds.set(participant.photoId, 'profile');
  });
  trip.auditLogs?.forEach((entry) => {
    if (entry.performedBy.photoId) photoKinds.set(entry.performedBy.photoId, 'profile');
  });

  const photos: Record<string, BackupPhoto> = {};
  await Promise.all([...photoKinds.entries()].map(async ([photoId, kind]) => {
    const blob = await loadStoredPhoto(photoId);
    if (blob) photos[photoId] = { kind, dataUrl: await blobToDataUrl(blob) };
  }));

  const backup: TripBackup = {
    format: 'trip-calculator-v3',
    version: 3,
    exportedAt: new Date().toISOString(),
    trip,
    photos,
  };
  return new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
}

export async function importTripBackup(file: File): Promise<Trip> {
  if (file.size > 25 * 1024 * 1024) throw new Error('Backup must be smaller than 25 MB.');
  const parsed = JSON.parse(await file.text()) as Partial<TripBackup>;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('This is not a valid Trip Calculator backup.');
  }
  const isValidFormat =
    (parsed.format === 'trip-calculator-v3' && parsed.version === 3) ||
    (parsed.format === 'trip-calculator-v2' && parsed.version === 2);
  if (!isValidFormat || !parsed.trip) {
    throw new Error('This is not a valid Trip Calculator backup.');
  }
  const trip = validateTrip(parsed.trip);
  if (!parsed.photos || typeof parsed.photos !== 'object' || Array.isArray(parsed.photos) || Object.keys(parsed.photos).length > 1000) throw new Error('Invalid backup photos.');
  // Validate every asset before writing any of them to IndexedDB.
  for (const photo of Object.values(parsed.photos)) {
    if (!photo || !['cover', 'profile'].includes(photo.kind)) throw new Error('Invalid backup photo type.');
    validatePhotoDataUrl(photo.dataUrl);
  }

  const mappedPhotoIds = new Map<string, string>();
  try {
    const referenced = new Set([trip.coverPhotoId, ...trip.participants.map(p => p.photoId), ...(trip.auditLogs || []).map(a => a.performedBy.photoId)]);
    for (const [oldId, photo] of Object.entries(parsed.photos)) {
      if (referenced.has(oldId)) mappedPhotoIds.set(oldId, await storeDataUrlPhoto(photo.dataUrl, photo.kind));
    }
  } catch (error) {
    await Promise.all([...mappedPhotoIds.values()].map(deleteStoredPhoto));
    throw error;
  }

  const now = new Date().toISOString();
  return {
    ...trip,
    id: `trip-import-${crypto.randomUUID()}`,
    name: trip.name.length <= 189 ? `${trip.name} (Imported)` : trip.name,
    coverPhotoId: trip.coverPhotoId ? mappedPhotoIds.get(trip.coverPhotoId) : undefined,
    participants: trip.participants.map((participant) => ({
      ...participant,
      photoId: participant.photoId ? mappedPhotoIds.get(participant.photoId) : undefined,
    })),
    auditLogs: trip.auditLogs?.map(log => ({ ...log, performedBy: { ...log.performedBy, photoId: log.performedBy.photoId ? mappedPhotoIds.get(log.performedBy.photoId) : undefined } })),
    expenses: trip.expenses.map((expense) => ({
      ...expense,
      date: toLocalDateTimeInput(expense.date, expense.createdAt),
    })),
    settlements: trip.settlements.map((settlement) => ({
      ...settlement,
      date: toLocalDateTimeInput(settlement.date, settlement.createdAt),
    })),
    createdAt: now,
    updatedAt: now,
  };
}

export async function discardImportedPhotos(trip: Trip) {
  await Promise.all([...new Set([trip.coverPhotoId, ...trip.participants.map(p => p.photoId), ...(trip.auditLogs || []).map(a => a.performedBy.photoId)])].map(deleteStoredPhoto));
}
