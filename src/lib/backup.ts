'use client';

import { blobToDataUrl, loadStoredPhoto, storeDataUrlPhoto, type PhotoKind } from '@/lib/image-storage';
import { Trip } from '@/types/trip';

interface BackupPhoto {
  kind: PhotoKind;
  dataUrl: string;
}

interface TripBackup {
  format: 'trip-calculator-v2';
  version: 2;
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

  const photos: Record<string, BackupPhoto> = {};
  await Promise.all([...photoKinds.entries()].map(async ([photoId, kind]) => {
    const blob = await loadStoredPhoto(photoId);
    if (blob) photos[photoId] = { kind, dataUrl: await blobToDataUrl(blob) };
  }));

  const backup: TripBackup = {
    format: 'trip-calculator-v2',
    version: 2,
    exportedAt: new Date().toISOString(),
    trip,
    photos,
  };
  return new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
}

export async function importTripBackup(file: File): Promise<Trip> {
  if (file.size > 25 * 1024 * 1024) throw new Error('Backup must be smaller than 25 MB.');
  const parsed = JSON.parse(await file.text()) as Partial<TripBackup>;
  if (parsed.format !== 'trip-calculator-v2' || parsed.version !== 2 || !parsed.trip) {
    throw new Error('This is not a Trip Calculator v2 backup.');
  }
  const trip = parsed.trip;
  if (!trip.name || !Array.isArray(trip.participants) || !Array.isArray(trip.expenses) || !Array.isArray(trip.settlements)) {
    throw new Error('The backup is incomplete or damaged.');
  }

  const mappedPhotoIds = new Map<string, string>();
  for (const [oldId, photo] of Object.entries(parsed.photos || {})) {
    if (!photo?.dataUrl || !['cover', 'profile'].includes(photo.kind)) continue;
    mappedPhotoIds.set(oldId, await storeDataUrlPhoto(photo.dataUrl, photo.kind));
  }

  const now = new Date().toISOString();
  return {
    ...trip,
    id: `trip-import-${Date.now()}`,
    name: `${trip.name} (Imported)`,
    coverPhotoId: trip.coverPhotoId ? mappedPhotoIds.get(trip.coverPhotoId) : undefined,
    participants: trip.participants.map((participant) => ({
      ...participant,
      photoId: participant.photoId ? mappedPhotoIds.get(participant.photoId) : undefined,
    })),
    createdAt: now,
    updatedAt: now,
  };
}
