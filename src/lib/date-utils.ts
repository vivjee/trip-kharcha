import { Trip } from '@/types/trip';

/**
 * Calculates total trip duration in days
 */
export function getTripDurationInDays(trip: Trip): number {
  const start = trip.startDate ? new Date(trip.startDate) : new Date(trip.createdAt);
  const end = trip.endDate 
    ? new Date(trip.endDate) 
    : new Date(); // If active, use current date

  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(1, diffDays === 0 ? 1 : diffDays + 1); // Inclusive day count
}

/**
 * Formats date range string (e.g. "Jul 28 – Jul 31, 2026" or "Jul 28, 2026")
 */
export function formatDateRange(trip: Trip): string {
  const start = trip.startDate ? new Date(trip.startDate) : new Date(trip.createdAt);
  const end = trip.endDate ? new Date(trip.endDate) : new Date();

  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  if (trip.status === 'completed' && trip.endDate) {
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} – ${endStr}`;
  }

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (startStr === todayStr.split(',')[0]) {
    return `Started Today (${todayStr})`;
  }

  return `Started ${startStr}`;
}

/**
 * Formats a single date string
 */
export function formatSingleDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
