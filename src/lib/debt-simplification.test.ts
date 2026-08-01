import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateParticipantBalances,
  calculateSimplifiedDebts,
  getExpenseShares,
  getSettlementProgress,
  getTripStats,
} from './debt-simplification.ts';
import type { Expense, Participant, Trip } from '../types/trip.ts';

const participants: Participant[] = [
  { id: 'a', name: 'A', avatar: '🧔', color: 'indigo' },
  { id: 'b', name: 'B', avatar: '👩', color: 'rose' },
  { id: 'c', name: 'C', avatar: '👦', color: 'blue' },
];

const makeTrip = (expenses: Expense[], settlements: Trip['settlements'] = []): Trip => ({
  id: 'trip-test',
  name: 'Test',
  description: '',
  coverImageEmoji: '🏔️',
  currency: 'NPR',
  currencySymbol: 'रू',
  participants,
  expenses,
  settlements,
  status: 'active',
  startDate: '2026-08-01',
  createdAt: '2026-08-01T00:00:00.000Z',
});

test('equal splits preserve every paisa', () => {
  const expense: Expense = {
    id: 'e1', title: 'Lunch', amount: 100, paidById: 'a', includedParticipantIds: ['a', 'b', 'c'], category: 'food', date: '2026-08-01',
  };
  const shares = getExpenseShares(expense);
  assert.equal(shares.reduce((sum, share) => sum + share.amount, 0), 100);
  assert.deepEqual(shares.map((share) => share.amount), [33.33, 33.33, 33.34]);
});

test('multi-payer exact splits simplify into balanced debts', () => {
  const expense: Expense = {
    id: 'e1',
    title: 'Jeep',
    amount: 100,
    paidById: 'a',
    payers: [{ participantId: 'a', amount: 60 }, { participantId: 'b', amount: 40 }],
    includedParticipantIds: ['a', 'b', 'c'],
    splitMode: 'exact',
    shares: [{ participantId: 'a', amount: 20 }, { participantId: 'b', amount: 30 }, { participantId: 'c', amount: 50 }],
    category: 'transport',
    date: '2026-08-01',
  };
  const debts = calculateSimplifiedDebts(makeTrip([expense]));
  assert.equal(debts.reduce((sum, debt) => sum + debt.amount, 0), 50);
  assert.deepEqual(debts.map((debt) => [debt.from.id, debt.to.id, debt.amount]), [['c', 'a', 40], ['c', 'b', 10]]);
});

test('settlements change net balances without corrupting expense totals', () => {
  const expense: Expense = {
    id: 'e1', title: 'Hotel', amount: 90, paidById: 'a', includedParticipantIds: ['a', 'b', 'c'], category: 'stay', date: '2026-08-01',
  };
  const trip = makeTrip([expense], [{ id: 's1', fromParticipantId: 'b', toParticipantId: 'a', amount: 30, date: '2026-08-01' }]);
  const balances = calculateParticipantBalances(trip);
  assert.deepEqual(balances.map((balance) => [balance.participantId, balance.totalPaid, balance.totalOwed, balance.netBalance]), [
    ['a', 90, 30, 30],
    ['b', 0, 30, 0],
    ['c', 0, 30, -30],
  ]);
  assert.equal(getTripStats(trip).topSpender?.participantId, 'a');
  assert.deepEqual(getSettlementProgress(trip), { recorded: 30, pending: 30, percentage: 50 });
});
