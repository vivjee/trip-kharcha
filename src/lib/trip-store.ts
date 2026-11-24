"use client";

import { useEffect, useSyncExternalStore } from "react";
import type {
  AuditActionType,
  ChecklistItem,
  Expense,
  Participant,
  Settlement,
  Trip,
  TripType,
  UserProfile,
} from "@/types/trip";
import {
  emptyData,
  loadTripsFromStorage,
  saveTripsToStorage,
  LOCAL_STORAGE_KEY,
  type StoredTripData,
} from "./storage";
import { assertTripChange, validateProfile, validateTrip } from "./validation";
import { appendAuditLog, createAuditEntry } from "./audit";
import { generateDefaultChecklist } from "./essentials-templates";
import { deleteStoredPhoto } from "./image-storage";
import {
  calculateParticipantBalances,
  calculateSimplifiedDebts,
  getTripStats,
} from "./debt-simplification";

type Snapshot = {
  status: "loading" | "ready" | "empty" | "recovery";
  data: StoredTripData;
  error: string;
  conflict: boolean;
  raw: string | null;
  sourceKey: string;
};
const initial: Snapshot = {
  status: "loading",
  data: emptyData(),
  error: "",
  conflict: false,
  raw: null,
  sourceKey: LOCAL_STORAGE_KEY,
};
let state = initial;
const listeners = new Set<() => void>();
const emit = (next: Partial<Snapshot>) => {
  state = { ...state, ...next };
  listeners.forEach((fn) => fn());
};
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
const getSnapshot = () => state;
const getServerSnapshot = () => initial;
let listening = false;

export function reloadLibrary() {
  const result = loadTripsFromStorage();
  if (result.status === "recovery")
    emit({ ...result, error: result.message, conflict: false });
  else emit({ ...result, error: "", conflict: false });
}
export function useTripStore() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  useEffect(() => {
    if (state.status === "loading") reloadLibrary();
    if (!listening) {
      listening = true;
      window.addEventListener("storage", (e) => {
        if (e.key === LOCAL_STORAGE_KEY && e.newValue !== state.raw)
          emit({
            conflict: true,
            error:
              "Trips changed in another window. Load the latest library before saving. Open forms are kept.",
          });
      });
    }
  }, []);
  return snapshot;
}

/** Serialize writers across tabs, then compare the exact envelope before committing. */
export async function commitLibrary(
  change: (data: StoredTripData) => StoredTripData,
): Promise<boolean> {
  const write = () => {
    if (state.status === "recovery" || state.status === "loading") return false;
    try {
      const next = change(state.data);
      const result = saveTripsToStorage(next, state.raw, state.sourceKey);
      if (!result.ok) {
        emit({ error: result.message, conflict: result.kind === "conflict" });
        return false;
      }
      const previous = state.data;
      emit({
        data: result.data,
        raw: result.raw,
        sourceKey: LOCAL_STORAGE_KEY,
        status: next.trips.length ? "ready" : "empty",
        error: "",
        conflict: false,
      });
      // Only delete replaced assets after persistence succeeds, and never delete shared photos.
      const retained = photoReferences(next);
      for (const photo of photoReferences(previous))
        if (!retained.has(photo)) void deleteStoredPhoto(photo);
      return true;
    } catch (error) {
      emit({
        error:
          error instanceof Error
            ? error.message
            : "Could not save your changes.",
      });
      return false;
    }
  };
  return navigator.locks
    ? navigator.locks.request("trip-calculator-library", write)
    : write();
}
function photoReferences(data: StoredTripData) {
  const ids = new Set<string>();
  if (data.profile?.photoId) ids.add(data.profile.photoId);
  data.trips.forEach((t) => {
    if (t.coverPhotoId) ids.add(t.coverPhotoId);
    t.participants.forEach((p) => {
      if (p.photoId) ids.add(p.photoId);
    });
    t.auditLogs?.forEach((a) => {
      if (a.performedBy.photoId) ids.add(a.performedBy.photoId);
    });
  });
  return ids;
}
export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;
function updateTrip(
  tripId: string,
  update: (trip: Trip) => Trip,
  action?: AuditActionType,
  details = "",
) {
  return commitLibrary((data) => {
    const previous = data.trips.find((t) => t.id === tripId);
    if (!previous) throw new Error("This trip no longer exists.");
    let next = update(previous);
    assertTripChange(previous, next);
    const actor = previous.participants.find(
      (p) => p.id === data.identityByTripId[tripId],
    );
    if (action) next = appendAuditLog(next, action, details, actor);
    else next = { ...next, updatedAt: new Date().toISOString() };
    validateTrip(next);
    return {
      ...data,
      trips: data.trips.map((t) => (t.id === tripId ? next : t)),
    };
  });
}
export const tripActions = {
  async create(
    input: Omit<
      Trip,
      "id" | "expenses" | "settlements" | "status" | "createdAt"
    >,
    hostId?: string,
  ) {
    const trip: Trip = {
      ...input,
      id: newId("trip"),
      expenses: [],
      settlements: [],
      status: "active",
      createdAt: new Date().toISOString(),
    };
    trip.auditLogs = [
      createAuditEntry(
        "CREATE_TRIP",
        `Created trip “${trip.name}”`,
        trip.participants.find((p) => p.id === hostId),
      ),
    ];
    validateTrip(trip);
    const ok = await commitLibrary((d) => ({
      ...d,
      trips: [trip, ...d.trips],
      activeTripId: trip.id,
      identityByTripId: hostId
        ? { ...d.identityByTripId, [trip.id]: hostId }
        : d.identityByTripId,
    }));
    return ok ? trip.id : null;
  },
  import(trip: Trip) {
    validateTrip(trip);
    return commitLibrary((d) => ({
      ...d,
      trips: [
        appendAuditLog(trip, "IMPORT_TRIP", `Imported “${trip.name}”`),
        ...d.trips,
      ],
      activeTripId: trip.id,
    }));
  },
  profile(profile: UserProfile) {
    validateProfile(profile);
    return commitLibrary((d) => ({
      ...d,
      profile,
      trips: d.trips.map((t) =>
        t.status === "completed"
          ? t
          : {
              ...t,
              participants: t.participants.map((p) =>
                p.profileId === profile.id || p.id === profile.id
                  ? {
                      ...p,
                      profileId: profile.id,
                      name: profile.name,
                      avatar: profile.avatar,
                      photoId: profile.photoId,
                    }
                  : p,
              ),
            },
      ),
    }));
  },
  identity(tripId: string, participantId: string) {
    return commitLibrary((d) => {
      const trip = d.trips.find((t) => t.id === tripId);
      const person = trip?.participants.find((p) => p.id === participantId);
      if (!trip || !person) throw new Error("Choose an existing trip member.");
      return {
        ...d,
        identityByTripId: { ...d.identityByTripId, [tripId]: participantId },
        trips: d.trips.map((t) =>
          t.id === tripId
            ? appendAuditLog(
                t,
                "CLAIM_IDENTITY",
                `${person.name} selected on this device`,
                person,
              )
            : t,
        ),
      };
    });
  },
  expense(tripId: string, expense: Omit<Expense, "id">, id?: string) {
    return updateTrip(
      tripId,
      (t) => {
        if (id && !t.expenses.some((e) => e.id === id))
          throw new Error(
            "This expense was removed. Cancel and create a new entry.",
          );
        const saved = {
          ...expense,
          id: id || newId("expense"),
          createdAt: expense.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdByParticipantId:
            expense.createdByParticipantId ||
            state.data.identityByTripId[tripId],
        };
        return {
          ...t,
          expenses: id
            ? t.expenses.map((e) => (e.id === id ? saved : e))
            : [saved, ...t.expenses],
        };
      },
      id ? "EDIT_EXPENSE" : "ADD_EXPENSE",
      `${id ? "Updated" : "Added"} ${expense.title}`,
    );
  },
  deleteExpense: (tripId: string, id: string) =>
    updateTrip(
      tripId,
      (t) => ({ ...t, expenses: t.expenses.filter((e) => e.id !== id) }),
      "DELETE_EXPENSE",
      "Removed an expense",
    ),
  settlement(tripId: string, settlement: Omit<Settlement, "id">, id?: string) {
    return updateTrip(
      tripId,
      (t) => {
        if (id && !t.settlements.some((s) => s.id === id))
          throw new Error(
            "This payment was removed. Cancel and record a new payment.",
          );
        const saved = {
          ...settlement,
          id: id || newId("payment"),
          createdAt: settlement.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdByParticipantId:
            settlement.createdByParticipantId ||
            state.data.identityByTripId[tripId],
        };
        return {
          ...t,
          settlements: id
            ? t.settlements.map((s) => (s.id === id ? saved : s))
            : [saved, ...t.settlements],
        };
      },
      id ? "EDIT_SETTLEMENT" : "RECORD_SETTLEMENT",
      `Recorded payment of ${settlement.amount.toFixed(2)}`,
    );
  },
  deleteSettlement: (tripId: string, id: string) =>
    updateTrip(
      tripId,
      (t) => ({ ...t, settlements: t.settlements.filter((s) => s.id !== id) }),
      "DELETE_SETTLEMENT",
      "Removed a payment",
    ),
  details: (
    tripId: string,
    details: Partial<
      Pick<
        Trip,
        "name" | "description" | "startDate" | "endDate" | "coverImageEmoji"
      >
    >,
  ) =>
    updateTrip(
      tripId,
      (t) => ({ ...t, ...details }),
      "UPDATE_TRIP",
      "Updated trip details",
    ),
  complete: (tripId: string, endDate: string) =>
    updateTrip(
      tripId,
      (t) => ({ ...t, status: "completed", endDate }),
      "COMPLETE_TRIP",
      "Completed the trip",
    ),
  reopen: (tripId: string) =>
    updateTrip(
      tripId,
      (t) => ({ ...t, status: "active", endDate: undefined }),
      "REOPEN_TRIP",
      "Reopened the trip",
    ),
  cover: (tripId: string, photoId?: string, accentColor?: string) =>
    updateTrip(
      tripId,
      (t) => ({
        ...t,
        coverPhotoId: photoId,
        accentColor: photoId ? accentColor : undefined,
      }),
      "UPDATE_COVER",
      photoId ? "Updated cover photo" : "Removed cover photo",
    ),
  addMember: (tripId: string, p: Omit<Participant, "id">) =>
    updateTrip(
      tripId,
      (t) => ({
        ...t,
        participants: [...t.participants, { ...p, id: newId("member") }],
      }),
      "ADD_PARTICIPANT",
      `Added ${p.name}`,
    ),
  renameMember: (tripId: string, id: string, name: string) =>
    updateTrip(
      tripId,
      (t) => ({
        ...t,
        participants: t.participants.map((p) =>
          p.id === id ? { ...p, name } : p,
        ),
      }),
      "UPDATE_PARTICIPANT",
      `Renamed member to ${name}`,
    ),
  removeMember: (tripId: string, id: string) =>
    updateTrip(
      tripId,
      (t) => {
        if (
          state.data.identityByTripId[tripId] === id ||
          t.participants.length < 2
        )
          throw new Error(
            "Choose another device identity before removing this member.",
          );
        if (
          t.expenses.some(
            (e) =>
              e.paidById === id ||
              e.includedParticipantIds.includes(id) ||
              e.payers?.some((p) => p.participantId === id),
          ) ||
          t.settlements.some(
            (s) => s.fromParticipantId === id || s.toParticipantId === id,
          )
        )
          throw new Error(
            "This member is referenced in financial records and cannot be removed.",
          );
        return {
          ...t,
          participants: t.participants.filter((p) => p.id !== id),
          checklist: t.checklist?.map((c) =>
            c.assignedToParticipantId === id
              ? { ...c, assignedToParticipantId: undefined }
              : c,
          ),
        };
      },
      "REMOVE_PARTICIPANT",
      "Removed a member",
    ),
  checklist: (tripId: string, id: string, patch: Partial<ChecklistItem>) =>
    updateTrip(tripId, (t) => ({
      ...t,
      isPackingComplete: false,
      checklist: t.checklist?.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    })),
  toggleItem: (tripId: string, id: string) =>
    updateTrip(tripId, (t) => ({
      ...t,
      isPackingComplete: false,
      checklist: t.checklist?.map((c) =>
        c.id === id ? { ...c, isChecked: !c.isChecked } : c,
      ),
    })),
  addItem: (tripId: string, item: Omit<ChecklistItem, "id" | "isChecked">) =>
    updateTrip(
      tripId,
      (t) => ({
        ...t,
        isPackingComplete: false,
        checklist: [
          ...(t.checklist || []),
          { ...item, id: newId("item"), isChecked: false, isCustom: true },
        ],
      }),
      "ADD_CHECKLIST_ITEM",
      `Added ${item.name}`,
    ),
  deleteItem: (tripId: string, id: string) =>
    updateTrip(tripId, (t) => ({
      ...t,
      isPackingComplete: false,
      checklist: t.checklist?.filter((c) => c.id !== id),
    })),
  resetPacking: (tripId: string, type: TripType) =>
    updateTrip(
      tripId,
      (t) => ({
        ...t,
        tripType: type,
        isPackingComplete: false,
        checklist: generateDefaultChecklist(type),
      }),
      "RESET_CHECKLIST",
      "Reset packing list",
    ),
  finishPacking: (tripId: string) =>
    updateTrip(tripId, (t) => {
      if (
        !t.isPackingComplete &&
        (!t.checklist?.length || t.checklist.some((c) => !c.isChecked))
      )
        throw new Error("Check every item before finishing packing.");
      const actor = t.participants.find(
        (p) => p.id === state.data.identityByTripId[tripId],
      );
      return appendAuditLog(
        { ...t, isPackingComplete: !t.isPackingComplete },
        t.isPackingComplete ? "REOPEN_PACKING" : "COMPLETE_PACKING",
        t.isPackingComplete
          ? "Reopened packing; checked items are retained"
          : "Finished packing every item",
        actor,
      );
    }),
  remove: (tripId: string) =>
    commitLibrary((d) => ({
      ...d,
      trips: d.trips.filter((t) => t.id !== tripId),
      activeTripId: d.activeTripId === tripId ? "" : d.activeTripId,
      identityByTripId: Object.fromEntries(
        Object.entries(d.identityByTripId).filter(([id]) => id !== tripId),
      ),
    })),
  clear: () =>
    commitLibrary((d) => ({
      ...d,
      trips: [],
      activeTripId: "",
      identityByTripId: {},
    })),
};

const calculations = new WeakMap<
  Trip["expenses"],
  {
    participants: Trip["participants"];
    settlements: Trip["settlements"];
    result: ReturnType<typeof calculate>;
  }
>();
function calculate(trip: Trip) {
  const balances = calculateParticipantBalances(trip);
  return {
    balances,
    debts: calculateSimplifiedDebts(trip, balances),
    stats: getTripStats(trip, balances),
  };
}
export function tripCalculations(trip: Trip) {
  const cached = calculations.get(trip.expenses);
  if (
    cached?.participants === trip.participants &&
    cached.settlements === trip.settlements
  )
    return cached.result;
  const result = calculate(trip);
  calculations.set(trip.expenses, {
    participants: trip.participants,
    settlements: trip.settlements,
    result,
  });
  return result;
}
