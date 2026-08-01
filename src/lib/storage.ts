import { Trip, UserProfile } from '@/types/trip';

const LOCAL_STORAGE_KEY = 'trip_calculator_data_v4_clean_slate';
const USER_PROFILE_STORAGE_KEY = 'user_profile_data_v1';

export function loadUserProfileFromStorage(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load user profile:', e);
  }
  return null;
}

export function saveUserProfileToStorage(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile:', e);
  }
}

export function loadTripsFromStorage(): { trips: Trip[]; activeTripId: string } {
  if (typeof window === 'undefined') {
    return { trips: [], activeTripId: '' };
  }

  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.trips && Array.isArray(parsed.trips)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load trips from storage:', e);
  }

  // Clear legacy localStorage keys if present
  try {
    localStorage.removeItem('trip_calculator_data_v1');
    localStorage.removeItem('trip_calculator_data_v2');
    localStorage.removeItem('trip_calculator_data_v3');
  } catch (e) {}

  return { trips: [], activeTripId: '' };
}

export function saveTripsToStorage(trips: Trip[], activeTripId: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ trips, activeTripId })
    );
  } catch (e) {
    console.error('Failed to save trips to storage:', e);
  }
}

export function clearAllStorageData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
    localStorage.removeItem('trip_calculator_data_v1');
    localStorage.removeItem('trip_calculator_data_v2');
    localStorage.removeItem('trip_calculator_data_v3');
  } catch (e) {}
}
