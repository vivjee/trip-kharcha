import test from "node:test";
import assert from "node:assert/strict";
import {
  loadTripsFromStorage,
  saveTripsToStorage,
  LOCAL_STORAGE_KEY,
  emptyData,
  type StoragePort,
} from "./storage.ts";
import {
  validateTrip,
  validatePhotoDataUrl,
  validLocalDate,
  assertTripChange,
} from "./validation.ts";
import { allocateEqual, allocateWeighted, toMinorUnits } from "./money.ts";
import { toLocalDateTimeInput } from "./date-utils.ts";
import type { Trip } from "../types/trip.ts";
const trip = (): Trip => ({
  id: "trip-1",
  name: "Mountains",
  description: "",
  coverImageEmoji: "🏔️",
  currency: "NPR",
  currencySymbol: "रू",
  participants: [
    { id: "a", name: "A", avatar: "🙂", color: "blue" },
    { id: "b", name: "B", avatar: "🙂", color: "blue" },
  ],
  expenses: [],
  settlements: [],
  status: "active",
  startDate: "2026-10-01",
  createdAt: "2026-10-01T12:00:00Z",
});
test("fractional decimal equal splits do not lose a paisa to binary rounding", () => {
  assert.deepEqual(allocateEqual(0.58, 2), [0.29, 0.29]);
});
test("legacy expense migration keeps the recorded time", () => {
  const t = trip();
  t.expenses = [
    {
      id: "e",
      title: "Tea",
      amount: 10,
      paidById: "a",
      includedParticipantIds: ["a", "b"],
      category: "food",
      date: "2026-10-01",
      createdAt: "2026-10-01T05:15:00Z",
    },
  ];
  assert.equal(
    validateTrip(t).expenses[0].date,
    toLocalDateTimeInput("2026-10-01", "2026-10-01T05:15:00Z"),
  );
});
class MemoryStorage implements StoragePort {
  map = new Map<string, string>();
  writes = 0;
  fail = false;
  getItem(k: string) {
    return this.map.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    if (this.fail) throw new Error("quota");
    this.writes++;
    this.map.set(k, v);
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
}
test("one damaged record enters recovery without changing any original bytes", () => {
  const s = new MemoryStorage();
  const raw = JSON.stringify({ version: 2, trips: [trip(), null] });
  s.map.set(LOCAL_STORAGE_KEY, raw);
  assert.equal(loadTripsFromStorage(s).status, "recovery");
  assert.equal(s.getItem(LOCAL_STORAGE_KEY), raw);
  assert.equal(s.writes, 0);
});
test("quota failure does not crash loading or report a successful save", () => {
  const s = new MemoryStorage();
  s.fail = true;
  const read = loadTripsFromStorage(s);
  assert.equal(read.status, "empty");
  const save = saveTripsToStorage(emptyData(), null, LOCAL_STORAGE_KEY, s);
  assert.equal(save.ok, false);
  assert.equal(s.getItem(LOCAL_STORAGE_KEY), null);
});
test("storage access denial enters recovery", () => {
  const s = new MemoryStorage();
  s.getItem = () => {
    throw new Error("denied");
  };
  assert.equal(loadTripsFromStorage(s).status, "recovery");
});
test("legacy migration only writes on explicit save and retains the exact original", () => {
  const s = new MemoryStorage();
  const raw = JSON.stringify({
    version: 2,
    trips: [trip()],
    activeTripId: "trip-1",
  });
  s.map.set("trip_calculator_data_v3", raw);
  const r = loadTripsFromStorage(s);
  assert.notEqual(r.status, "recovery");
  assert.equal(s.writes, 0);
  if (r.status === "recovery") return;
  assert.equal(saveTripsToStorage(r.data, r.raw, r.sourceKey, s).ok, true);
  assert.equal(s.getItem("trip_calculator_data_v3"), raw);
  assert.equal(s.getItem(LOCAL_STORAGE_KEY + "_before_migration"), raw);
});
test("a stale writer cannot replace another window’s library", () => {
  const s = new MemoryStorage();
  const first = saveTripsToStorage(emptyData(), null, LOCAL_STORAGE_KEY, s);
  assert.equal(first.ok, true);
  const stale = saveTripsToStorage(emptyData(), null, LOCAL_STORAGE_KEY, s);
  assert.equal(stale.ok, false);
  if (!stale.ok) assert.equal(stale.kind, "conflict");
});
test("unsupported versions are preserved for recovery", () => {
  const s = new MemoryStorage();
  s.map.set(LOCAL_STORAGE_KEY, JSON.stringify({ version: 99, trips: [] }));
  assert.equal(loadTripsFromStorage(s).status, "recovery");
  assert.equal(s.writes, 0);
});
test("NPR 100 exact defaults preserve all 10000 paisa", () =>
  assert.deepEqual(allocateEqual(100, 3), [33.33, 33.33, 33.34]));
test("percentage rounding preserves tiny amounts without negative shares", () => {
  for (let cents = 1; cents < 100; cents++) {
    const shares = allocateWeighted(
      cents / 100,
      [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    );
    assert.equal(
      shares.reduce((s, v) => s + toMinorUnits(v), 0),
      cents,
    );
    assert.ok(shares.every((v) => v >= 0));
  }
});
test("invalid dates and completion chronology are rejected", () => {
  assert.equal(validLocalDate("2026-02-30"), false);
  assert.equal(validLocalDate("2024-02-29"), true);
  assert.throws(() =>
    validateTrip({ ...trip(), status: "completed", endDate: "2026-09-30" }),
  );
});
test("completed trips lock expenses and members but allow payments and reopening", () => {
  const previous = {
    ...trip(),
    status: "completed" as const,
    endDate: "2026-10-02",
  };
  assert.throws(() =>
    assertTripChange(previous, { ...previous, expenses: [] }),
  );
  assert.throws(() =>
    assertTripChange(previous, {
      ...previous,
      participants: [...previous.participants],
    }),
  );
  assert.doesNotThrow(() =>
    assertTripChange(previous, {
      ...previous,
      settlements: [
        {
          id: "s",
          fromParticipantId: "b",
          toParticipantId: "a",
          amount: 1,
          date: "2026-10-03",
        },
      ],
    }),
  );
  assert.doesNotThrow(() =>
    assertTripChange(previous, {
      ...previous,
      status: "active",
      endDate: undefined,
    }),
  );
});
for (const [label, patch] of Object.entries({
  negative: { amount: -1 },
  nonfinite: { amount: Infinity },
  payer: { paidById: "missing" },
  shares: { shares: [{ participantId: "a", amount: 90 }] },
  duplicate: { includedParticipantIds: ["a", "a"] },
  reference: { includedParticipantIds: ["missing"] },
}))
  test("rejects malformed expense: " + label, () => {
    assert.throws(() =>
      validateTrip({
        ...trip(),
        expenses: [
          {
            id: "e",
            title: "Lunch",
            amount: 100,
            paidById: "a",
            includedParticipantIds: ["a", "b"],
            category: "food",
            date: "2026-10-01",
            ...patch,
          },
        ],
      }),
    );
  });
test("historical one-paisa share allocation is retained", () => {
  const value = {
    ...trip(),
    expenses: [
      {
        id: "e",
        title: "Lunch",
        amount: 100,
        paidById: "a",
        includedParticipantIds: ["a", "b"],
        category: "food",
        date: "2026-10-01",
        shares: [
          { participantId: "a", amount: 50 },
          { participantId: "b", amount: 49.99 },
        ],
      },
    ],
  };
  assert.equal(validateTrip(value).expenses[0].shares?.[1].amount, 49.99);
});
test("packing quantities retain their units and invalid assignees are rejected", () => {
  const t = {
    ...trip(),
    checklist: [
      {
        id: "c",
        name: "Water",
        category: "essentials",
        quantity: "2 L",
        isChecked: false,
      },
    ],
  };
  assert.equal(validateTrip(t).checklist?.[0].quantity, "2 L");
  assert.throws(() =>
    validateTrip({
      ...t,
      checklist: [{ ...t.checklist[0], assignedToParticipantId: "missing" }],
    }),
  );
});
test("only bounded raster data URLs may be imported", () => {
  assert.doesNotThrow(() => validatePhotoDataUrl("data:image/png;base64,AA=="));
  for (const value of [
    "https://example.com/a.png",
    "data:image/svg+xml;base64,AA==",
    "data:image/png;base64,!",
    "data:image/png;base64," + "A".repeat(8 * 1024 * 1024),
  ])
    assert.throws(() => validatePhotoDataUrl(value));
});
