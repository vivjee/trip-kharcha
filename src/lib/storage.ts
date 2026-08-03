import { Trip, UserProfile } from '@/types/trip';
import { toLocalDateTimeInput } from '@/lib/date-utils';

const LOCAL_STORAGE_KEY = 'trip_calculator_data_v4_clean_slate';
const LEGACY_STORAGE_KEYS = ['trip_calculator_data_v3', 'trip_calculator_data_v2', 'trip_calculator_data_v1'];
const USER_PROFILE_STORAGE_KEY = 'user_profile_data_v1';
const DATA_VERSION = 2;

export interface StoredTripData {
  version: number;
  trips: Trip[];
  activeTripId: string;
  identityByTripId: Record<string, string>;
}

function migrateTrip(trip: Trip): Trip {
  const createdAt = trip.createdAt || new Date().toISOString();
  return {
    ...trip,
    coverImageEmoji: trip.coverImageEmoji || '🏔️',
    createdAt,
    updatedAt: trip.updatedAt || createdAt,
    participants: Array.isArray(trip.participants) ? trip.participants : [],
    expenses: (trip.expenses || []).map((expense) => ({
      ...expense,
      date: toLocalDateTimeInput(expense.date, expense.createdAt || createdAt),
      splitMode: expense.splitMode || 'equal',
      createdAt: expense.createdAt || createdAt,
      updatedAt: expense.updatedAt || expense.createdAt || createdAt,
    })),
    settlements: (trip.settlements || []).map((settlement) => ({
      ...settlement,
      date: toLocalDateTimeInput(settlement.date, settlement.createdAt || createdAt),
      createdAt: settlement.createdAt || createdAt,
      updatedAt: settlement.updatedAt || settlement.createdAt || createdAt,
    })),
    auditLogs: Array.isArray(trip.auditLogs) ? trip.auditLogs : [],
  };
}

export function loadUserProfileFromStorage(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    return data ? JSON.parse(data) as UserProfile : null;
  } catch (error) {
    console.error('Failed to load user profile:', error);
    return null;
  }
}

export function saveUserProfileToStorage(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function loadTripsFromStorage(): StoredTripData {
  if (typeof window === 'undefined') {
    return { version: DATA_VERSION, trips: [], activeTripId: '', identityByTripId: {} };
  }

  try {
    const current = localStorage.getItem(LOCAL_STORAGE_KEY);
    const legacy = LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
    const raw = current || legacy;
    if (!raw) return { version: DATA_VERSION, trips: [], activeTripId: '', identityByTripId: {} };
    const parsed = JSON.parse(raw) as Partial<StoredTripData>;
    const trips = Array.isArray(parsed.trips) ? parsed.trips.map(migrateTrip) : [];
    const activeTripId = trips.some((trip) => trip.id === parsed.activeTripId) ? parsed.activeTripId || '' : '';
    const migrated = {
      version: DATA_VERSION,
      trips,
      activeTripId,
      identityByTripId: parsed.identityByTripId || {},
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch (error) {
    console.error('Failed to load trips:', error);
    return { version: DATA_VERSION, trips: [], activeTripId: '', identityByTripId: {} };
  }
}

export function saveTripsToStorage(
  trips: Trip[],
  activeTripId: string,
  identityByTripId: Record<string, string> = {},
): void {
  if (typeof window === 'undefined') return;
  const data: StoredTripData = {
    version: DATA_VERSION,
    trips,
    activeTripId,
    identityByTripId,
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
}

export function clearAllStorageData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
  LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}
