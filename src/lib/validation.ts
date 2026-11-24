import type { Trip, UserProfile } from "../types/trip.ts";
import { toMinorUnits } from "./money.ts";
import { toLocalDateTimeInput } from "./date-utils.ts";

const fail = (message: string): never => {
  throw new Error(message);
};
const object = (v: unknown): v is Record<string, unknown> =>
  Boolean(v && typeof v === "object" && !Array.isArray(v));
const text = (v: unknown, max = 500) =>
  typeof v === "string" && v.length > 0 && v.length <= max;
const id = (v: unknown) =>
  text(v, 160) &&
  !["__proto__", "constructor", "prototype"].includes(v as string);
export function validLocalDate(v: unknown): v is string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [y, m, d] = v.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    y >= 1900 &&
    y <= 2200 &&
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}
function validDateTime(v: unknown): v is string {
  if (typeof v !== "string" || !validLocalDate(v.slice(0, 10))) return false;
  return (
    v.length === 10 ||
    (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?$/.test(
      v,
    ) &&
      Number(v.slice(11, 13)) < 24 &&
      Number(v.slice(14, 16)) < 60 &&
      Number.isFinite(new Date(v).getTime()))
  );
}
function unique(
  records: unknown,
  label: string,
  max = 100000,
): asserts records is Record<string, unknown>[] {
  if (!Array.isArray(records) || records.length > max)
    fail(`Invalid ${label} list.`);
  const seen = new Set();
  for (const record of records as unknown[]) {
    if (!object(record) || !id(record.id) || seen.has(record.id))
      fail(`Invalid or duplicate ${label} identifier.`);
    seen.add((record as Record<string, unknown>).id);
  }
}
const amount = (v: unknown, zero = false) =>
  typeof v === "number" &&
  Number.isFinite(v) &&
  v >= (zero ? 0 : 0.01) &&
  v <= 1e9 &&
  Math.abs(v * 100 - toMinorUnits(v)) < 0.0001;

export function validateProfile(value: unknown): UserProfile | null {
  if (value === null || value === undefined) return null;
  if (
    !object(value) ||
    !id(value.id) ||
    !text(value.name, 160) ||
    !text(value.avatar, 100) ||
    !["male", "female"].includes(value.gender as string) ||
    (value.photoId !== undefined && !id(value.photoId))
  )
    fail("The saved profile is damaged.");
  return value as unknown as UserProfile;
}

/** Validate before migration; malformed records must never turn into an empty library. */
export function validateTrip(value: unknown): Trip {
  if (
    !object(value) ||
    !id(value.id) ||
    !text(value.name, 200) ||
    typeof value.description !== "string" ||
    value.description.length > 5000
  )
    fail("A trip record is damaged.");
  const t = value as Record<string, unknown>;
  if (
    !["planning", "active", "completed"].includes(t.status as string) ||
    !validLocalDate(t.startDate) ||
    !validDateTime(t.createdAt)
  )
    fail("Invalid trip status or date.");
  if (
    t.endDate !== undefined &&
    (!validLocalDate(t.endDate) || t.endDate < (t.startDate as string))
  )
    fail("The end date must be on or after the start date.");
  if (t.status === "completed" && !t.endDate)
    fail("A completed trip needs an end date.");
  if (!text(t.currency, 8) || !text(t.currencySymbol, 12))
    fail("Invalid trip currency.");
  if (t.coverPhotoId !== undefined && !id(t.coverPhotoId))
    fail("Invalid cover photo.");
  if (
    t.tripType !== undefined &&
    !["day_hike", "night_camp", "short_trek", "long_trek"].includes(
      t.tripType as string,
    )
  )
    fail("Invalid trip type.");
  unique(t.participants, "member", 500);
  if (t.participants.length < 1) fail("A trip needs at least one member.");
  const members = new Set(t.participants.map((p) => p.id));
  for (const p of t.participants) {
    if (
      !text(p.name, 160) ||
      !text(p.avatar, 100) ||
      !text(p.color, 100) ||
      (p.profileId !== undefined && !id(p.profileId)) ||
      (p.photoId !== undefined && !id(p.photoId))
    )
      fail("Invalid trip member.");
  }
  unique(t.expenses, "expense");
  unique(t.settlements ?? [], "payment");
  const allocations = (
    entries: unknown,
    total: unknown,
    allowed: Set<unknown>,
    label: string,
  ) => {
    if (!Array.isArray(entries) || entries.length === 0 || entries.length > 500)
      fail(`Invalid ${label}.`);
    const seen = new Set();
    let sum = 0;
    for (const row of entries as Record<string, unknown>[]) {
      if (
        !object(row) ||
        !allowed.has(row.participantId) ||
        seen.has(row.participantId) ||
        !amount(row.amount, true)
      )
        fail(`Invalid ${label} member or amount.`);
      seen.add(row.participantId);
      sum += toMinorUnits(row.amount as number);
    }
    // v2/v3 allowed one paisa of independent rounding; keep historical allocations.
    if (Math.abs(sum - toMinorUnits(total as number)) > 1)
      fail(`${label} must equal the expense total.`);
  };
  for (const e of t.expenses) {
    if (
      !text(e.title, 500) ||
      !amount(e.amount) ||
      !members.has(e.paidById) ||
      !validDateTime(e.date) ||
      !["food", "transport", "stay", "activity", "shopping", "other"].includes(
        e.category as string,
      )
    )
      fail("Invalid expense amount, payer, category, or date.");
    if (
      !Array.isArray(e.includedParticipantIds) ||
      !e.includedParticipantIds.length ||
      e.includedParticipantIds.some((p) => !members.has(p)) ||
      new Set(e.includedParticipantIds).size !== e.includedParticipantIds.length
    )
      fail("Invalid expense participants.");
    if (
      e.splitMode !== undefined &&
      !["equal", "exact", "percentage"].includes(e.splitMode as string)
    )
      fail("Invalid expense split.");
    if (e.payers !== undefined)
      allocations(e.payers, e.amount, members, "Payers");
    if (e.shares !== undefined)
      allocations(
        e.shares,
        e.amount,
        new Set(e.includedParticipantIds as string[]),
        "Shares",
      );
    if (
      e.notes !== undefined &&
      (typeof e.notes !== "string" || e.notes.length > 10000)
    )
      fail("Invalid expense notes.");
  }
  for (const s of (t.settlements ?? []) as Record<string, unknown>[]) {
    if (
      !members.has(s.fromParticipantId) ||
      !members.has(s.toParticipantId) ||
      s.fromParticipantId === s.toParticipantId ||
      !amount(s.amount) ||
      !validDateTime(s.date)
    )
      fail("Invalid payment member, amount, or date.");
  }
  unique(t.checklist ?? [], "packing item", 10000);
  const categories = [
    "wearables",
    "essentials",
    "electronics",
    "health",
    "first_aid",
    "food",
    "hi_protein",
    "utensils",
    "lodging",
    "apps_tech",
    "other",
  ];
  for (const c of (t.checklist ?? []) as Record<string, unknown>[]) {
    if (
      !text(c.name, 500) ||
      !categories.includes(c.category as string) ||
      typeof c.isChecked !== "boolean" ||
      (c.quantity !== undefined &&
        (typeof c.quantity !== "string" || c.quantity.length > 100)) ||
      (c.assignedToParticipantId !== undefined &&
        !members.has(c.assignedToParticipantId))
    )
      fail("Invalid packing item.");
  }
  if (
    t.isPackingComplete !== undefined &&
    typeof t.isPackingComplete !== "boolean"
  )
    fail("Invalid packing status.");
  unique(t.auditLogs ?? [], "activity");
  for (const log of (t.auditLogs ?? []) as Record<string, unknown>[]) {
    if (
      !validDateTime(log.timestamp) ||
      !text(log.details, 10000) ||
      !text(log.actionType, 100) ||
      !object(log.performedBy) ||
      !text(log.performedBy.name, 160) ||
      !text(log.performedBy.avatar, 100)
    )
      fail("Invalid activity record.");
  }
  const trip = value as unknown as Trip;
  return {
    ...trip,
    coverImageEmoji: trip.coverImageEmoji || "🏔️",
    settlements: trip.settlements || [],
    auditLogs: trip.auditLogs || [],
    expenses: trip.expenses.map((e) => ({
      ...e,
      date: toLocalDateTimeInput(e.date, e.createdAt),
      splitMode: e.splitMode || "equal",
    })),
  };
}

export function validatePhotoDataUrl(value: unknown): asserts value is string {
  if (
    typeof value !== "string" ||
    value.length > 8 * 1024 * 1024 ||
    !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)
  )
    fail("Backup contains an invalid or oversized photo.");
}

export function assertTripChange(previous: Trip, next: Trip) {
  if (
    previous.status === "completed" &&
    (previous.expenses !== next.expenses ||
      previous.participants !== next.participants)
  )
    fail("Reopen this trip before changing expenses or members.");
  if (
    !validLocalDate(next.startDate) ||
    (next.endDate !== undefined &&
      (!validLocalDate(next.endDate) || next.endDate < next.startDate))
  )
    fail("The end date must be on or after the start date.");
}
