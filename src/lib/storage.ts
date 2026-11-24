import type { Trip, UserProfile } from "../types/trip.ts";
import { validateTrip, validateProfile } from "./validation.ts";

export const LOCAL_STORAGE_KEY = "trip_calculator_data_v4_clean_slate";
export const LEGACY_STORAGE_KEYS = [
  "trip_calculator_data_v3",
  "trip_calculator_data_v2",
  "trip_calculator_data_v1",
];
const PROFILE_KEY = "user_profile_data_v1";
export interface StoredTripData {
  version: 3;
  revision: string;
  trips: Trip[];
  activeTripId: string;
  identityByTripId: Record<string, string>;
  profile: UserProfile | null;
}
export type LoadResult =
  | {
      status: "ready" | "empty";
      data: StoredTripData;
      raw: string | null;
      sourceKey: string;
    }
  | {
      status: "recovery";
      message: string;
      raw: string | null;
      sourceKey: string;
    };
export type SaveResult =
  | { ok: true; raw: string; data: StoredTripData }
  | { ok: false; kind: "conflict" | "storage"; message: string };
export const emptyData = (): StoredTripData => ({
  version: 3,
  revision: "",
  trips: [],
  activeTripId: "",
  identityByTripId: {},
  profile: null,
});
export type StoragePort = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function loadTripsFromStorage(storage?: StoragePort): LoadResult {
  let raw: string | null = null;
  let sourceKey = LOCAL_STORAGE_KEY;
  try {
    storage = storage ?? localStorage;
    raw = storage.getItem(sourceKey);
    if (!raw)
      for (const key of LEGACY_STORAGE_KEYS) {
        const value = storage.getItem(key);
        if (value) {
          raw = value;
          sourceKey = key;
          break;
        }
      }
    const profileRaw = storage.getItem(PROFILE_KEY);
    if (!raw)
      return {
        status: "empty",
        data: {
          ...emptyData(),
          profile: validateProfile(profileRaw ? JSON.parse(profileRaw) : null),
        },
        raw,
        sourceKey,
      };
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      ![1, 2, 3].includes(parsed.version ?? 1) ||
      !Array.isArray(parsed.trips)
    )
      throw new Error("Unsupported or damaged library format.");
    const trips = parsed.trips.map(validateTrip) as Trip[];
    if (new Set(trips.map((t) => t.id)).size !== trips.length)
      throw new Error("Duplicate trip identifiers.");
    const identities: Record<string, string> = {};
    for (const trip of trips) {
      const identity = parsed.identityByTripId?.[trip.id];
      if (identity && trip.participants.some((p) => p.id === identity))
        identities[trip.id] = identity;
    }
    const data: StoredTripData = {
      version: 3,
      revision: parsed.revision || "",
      trips,
      activeTripId: trips.some((t) => t.id === parsed.activeTripId)
        ? parsed.activeTripId
        : "",
      identityByTripId: identities,
      profile: validateProfile(
        parsed.version === 3
          ? parsed.profile
          : profileRaw
            ? JSON.parse(profileRaw)
            : null,
      ),
    };
    // Loading never writes, even when migration succeeds.
    return { status: trips.length ? "ready" : "empty", data, raw, sourceKey };
  } catch (error) {
    return {
      status: "recovery",
      message:
        error instanceof Error
          ? error.message
          : "Device storage could not be read.",
      raw,
      sourceKey,
    };
  }
}

export function saveTripsToStorage(
  data: StoredTripData,
  expectedRaw: string | null,
  sourceKey = LOCAL_STORAGE_KEY,
  storage?: StoragePort,
): SaveResult {
  try {
    storage = storage ?? localStorage;
    const current = storage.getItem(LOCAL_STORAGE_KEY);
    const actual =
      sourceKey === LOCAL_STORAGE_KEY ? current : storage.getItem(sourceKey);
    if (
      actual !== expectedRaw ||
      (sourceKey !== LOCAL_STORAGE_KEY && current !== null)
    )
      return {
        ok: false,
        kind: "conflict",
        message:
          "This library changed in another window. Load the latest version before retrying; your open form will stay here.",
      };
    // Retain the exact old envelope before the first migration.
    if (expectedRaw && (!data.revision || sourceKey !== LOCAL_STORAGE_KEY))
      storage.setItem(LOCAL_STORAGE_KEY + "_before_migration", expectedRaw);
    const next: StoredTripData = {
      ...data,
      version: 3,
      revision: crypto.randomUUID(),
    };
    const raw = JSON.stringify(next);
    storage.setItem(LOCAL_STORAGE_KEY, raw);
    return { ok: true, raw, data: next };
  } catch {
    return {
      ok: false,
      kind: "storage",
      message:
        "Could not save to this device. Storage may be full or unavailable. Your form is still open; free some space and retry.",
    };
  }
}
