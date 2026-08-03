import type { Trip } from '@/types/trip';

const DAY_MS = 24 * 60 * 60 * 1000;

export function getTodayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toLocalInputParts(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function getNowLocalDateTime(): string {
  return toLocalInputParts(new Date());
}

export function toLocalDateTimeInput(value?: string, fallbackIso?: string): string {
  if (value && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(value)) {
    return value.slice(0, 16);
  }

  const isDateOnly = Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
  const source = fallbackIso || (!isDateOnly ? value : undefined);
  const clock = source ? new Date(source) : new Date();
  const safeClock = Number.isNaN(clock.getTime()) ? new Date() : clock;
  const time = `${String(safeClock.getHours()).padStart(2, '0')}:${String(safeClock.getMinutes()).padStart(2, '0')}`;
  return isDateOnly ? `${value}T${time}` : toLocalInputParts(safeClock);
}

export function parseLocalDate(dateString?: string): Date {
  if (!dateString) return new Date();
  const dateOnly = dateString.slice(0, 10);
  const [year, month, day] = dateOnly.split('-').map(Number);
  if (year && month && day) return new Date(year, month - 1, day, 12);
  return new Date(dateString);
}

export function getTripDurationInDays(trip: Trip): number {
  const start = parseLocalDate(trip.startDate || trip.createdAt);
  const end = parseLocalDate(trip.status === 'completed' && trip.endDate ? trip.endDate : getTodayLocalDate());
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return Math.max(1, Math.floor((endDay - startDay) / DAY_MS) + 1);
}

export function formatDateRange(trip: Trip): string {
  const start = parseLocalDate(trip.startDate || trip.createdAt);
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (trip.status === 'completed' && trip.endDate) {
    const end = parseLocalDate(trip.endDate);
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} – ${endStr}`;
  }

  if (trip.startDate === getTodayLocalDate()) {
    return `Started Today (${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`;
  }

  return `Started ${startStr}`;
}

export function formatSingleDate(dateString: string): string {
  try {
    return parseLocalDate(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
      ? parseLocalDate(dateString)
      : new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const includeYear = date.getFullYear() !== new Date().getFullYear();
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(includeYear ? { year: 'numeric' as const } : {}),
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}
