import test from 'node:test';
import assert from 'node:assert/strict';
import type { Expense, Trip } from '../types/trip.ts';
import { getCategoryConicGradient, getTripRecap } from './trip-recap.ts';

const expenses: Expense[] = [
  { id: 'e1', title: 'Mountain lodge', amount: 240, paidById: 'a', includedParticipantIds: ['a', 'b'], category: 'stay', date: '2026-08-01T18:30' },
  { id: 'e2', title: 'Dinner', amount: 80, paidById: 'b', includedParticipantIds: ['a', 'b'], category: 'food', date: '2026-08-01T20:00' },
  { id: 'e3', title: 'Jeep', amount: 180, paidById: 'a', includedParticipantIds: ['a', 'b'], category: 'transport', date: '2026-08-02T09:15' },
  { id: 'e4', title: 'Lunch', amount: 40, paidById: 'b', includedParticipantIds: ['a', 'b'], category: 'food', date: '2026-08-02T13:00' },
];

const makeTrip = (tripExpenses: Expense[]): Trip => ({
  id: 'recap-trip',
  name: 'Recap Trip',
  description: '',
  coverImageEmoji: '🏔️',
  currency: 'USD',
  currencySymbol: '$',
  participants: [
    { id: 'a', name: 'A', avatar: '🧑', color: 'indigo' },
    { id: 'b', name: 'B', avatar: '👩', color: 'rose' },
  ],
  expenses: tripExpenses,
  settlements: [],
  status: 'completed',
  startDate: '2026-08-01',
  endDate: '2026-08-02',
  createdAt: '2026-08-01T00:00:00.000Z',
});

test('recap finds category, expense, and day highlights', () => {
  const recap = getTripRecap(makeTrip(expenses));

  assert.equal(recap.totalSpent, 540);
  assert.equal(recap.biggestExpense?.title, 'Mountain lodge');
  assert.equal(recap.dominantCategory?.category, 'stay');
  assert.equal(recap.highestSpendDay?.date, '2026-08-01');
  assert.equal(recap.highestSpendDay?.amount, 320);
  assert.deepEqual(recap.dailySpending.map((day) => [day.date, day.amount, day.expenseCount]), [
    ['2026-08-01', 320, 2],
    ['2026-08-02', 220, 2],
  ]);
  assert.equal(Math.round(recap.categories.reduce((sum, category) => sum + category.percentage, 0)), 100);
  assert.match(getCategoryConicGradient(recap.categories), /^conic-gradient\(/);
});

test('empty trips produce a safe, neutral recap', () => {
  const recap = getTripRecap(makeTrip([]));

  assert.equal(recap.totalSpent, 0);
  assert.deepEqual(recap.categories, []);
  assert.deepEqual(recap.dailySpending, []);
  assert.equal(recap.biggestExpense, undefined);
  assert.equal(getCategoryConicGradient([]), '#e2e8f0');
});
