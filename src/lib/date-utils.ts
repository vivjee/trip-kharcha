import type { Trip } from '@/types/trip';

const DAY_MS = 24 * 60 * 60 * 1000;

export function getTodayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
