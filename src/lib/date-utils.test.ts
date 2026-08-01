import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDateRange, getTripDurationInDays, parseLocalDate } from './date-utils.ts';
import type { Trip } from '../types/trip.ts';

const trip = (startDate: string, endDate: string): Trip => ({
  id: 'trip-test',
  name: 'Test Trip',
  description: '',
  coverImageEmoji: '🏔️',
  currency: 'NPR',
  currencySymbol: 'रू',
  participants: [],
  expenses: [],
  settlements: [],
  status: 'completed',
  startDate,
  endDate,
  createdAt: `${startDate}T00:00:00.000Z`,
});

test('same-day trips are one day, not two', () => {
  assert.equal(getTripDurationInDays(trip('2026-08-01', '2026-08-01')), 1);
});

test('duration is inclusive across multiple local dates', () => {
  assert.equal(getTripDurationInDays(trip('2026-07-28', '2026-07-31')), 4);
  assert.equal(formatDateRange(trip('2026-07-28', '2026-07-31')), 'Jul 28 – Jul 31, 2026');
});

test('date-only strings are parsed in local time', () => {
  const parsed = parseLocalDate('2026-08-01');
  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 7);
  assert.equal(parsed.getDate(), 1);
});
