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

test('a voluntary payment creates a matching obligation from receiver to payer', () => {
  const payment = {
    id: 's-voluntary',
    fromParticipantId: 'a',
    toParticipantId: 'b',
    amount: 25,
    date: '2026-08-01',
  };
  const afterPayment = makeTrip([], [payment]);

  assert.deepEqual(calculateParticipantBalances(afterPayment).map((balance) => [balance.participantId, balance.netBalance]), [
    ['a', 25],
    ['b', -25],
    ['c', 0],
  ]);
  assert.deepEqual(calculateSimplifiedDebts(afterPayment).map((debt) => [debt.from.id, debt.to.id, debt.amount]), [
    ['b', 'a', 25],
  ]);

  const repaid = makeTrip([], [
    payment,
    { id: 's-repay', fromParticipantId: 'b', toParticipantId: 'a', amount: 25, date: '2026-08-02' },
  ]);
  assert.deepEqual(calculateSimplifiedDebts(repaid), []);
});

test('paying beyond an outstanding debt creates only the surplus obligation in reverse', () => {
  const expense: Expense = {
    id: 'e-overpay', title: 'Room', amount: 100, paidById: 'a', includedParticipantIds: ['a', 'b'], category: 'stay', date: '2026-08-01',
  };
  const overpaid = makeTrip([expense], [{
    id: 's-overpay', fromParticipantId: 'b', toParticipantId: 'a', amount: 70, date: '2026-08-02',
  }]);

  assert.deepEqual(calculateSimplifiedDebts(overpaid).map((debt) => [debt.from.id, debt.to.id, debt.amount]), [
    ['a', 'b', 20],
  ]);
});

test('rounding residue is absorbed before settling two outstanding payments', () => {
  const expense: Expense = {
    id: 'e-rounding',
    title: 'Shared dinner',
    amount: 100,
    paidById: 'a',
    includedParticipantIds: ['a', 'b', 'c'],
    splitMode: 'exact',
    // These valid high-precision inputs used to be saved as 99.99 after each
    // line was rounded independently, leaving an artificial minor-unit debt.
    shares: [
      { participantId: 'a', amount: 33.333 },
      { participantId: 'b', amount: 33.333 },
      { participantId: 'c', amount: 33.334 },
    ],
    category: 'food',
    date: '2026-08-01',
  };

  const trip = makeTrip([expense]);
  assert.deepEqual(getExpenseShares(expense).map((share) => share.amount), [33.33, 33.33, 33.34]);
  assert.equal(calculateParticipantBalances(trip).reduce((sum, balance) => sum + balance.netBalance, 0), 0);

  const initialDebts = calculateSimplifiedDebts(trip);
  assert.deepEqual(initialDebts.map((debt) => [debt.from.id, debt.to.id, debt.amount]), [
    ['c', 'a', 33.34],
    ['b', 'a', 33.33],
  ]);

  const afterFirst = makeTrip([expense], [{
    id: 's1',
    fromParticipantId: initialDebts[0].from.id,
    toParticipantId: initialDebts[0].to.id,
    amount: initialDebts[0].amount,
    date: '2026-08-01',
  }]);
  assert.deepEqual(calculateSimplifiedDebts(afterFirst).map((debt) => [debt.from.id, debt.to.id, debt.amount]), [
    ['b', 'a', 33.33],
  ]);

  const fullySettled = makeTrip([expense], [
    ...afterFirst.settlements,
    { id: 's2', fromParticipantId: 'b', toParticipantId: 'a', amount: 33.33, date: '2026-08-01' },
  ]);
  assert.deepEqual(calculateSimplifiedDebts(fullySettled), []);
  assert.equal(getSettlementProgress(fullySettled).pending, 0);
});

test('multi-payer rounding remains conserved in minor units', () => {
  const expense: Expense = {
    id: 'e-payers',
    title: 'Tickets',
    amount: 100,
    paidById: 'a',
    payers: [
      { participantId: 'a', amount: 50.005 },
      { participantId: 'b', amount: 49.995 },
    ],
    includedParticipantIds: ['a', 'b'],
    category: 'activity',
    date: '2026-08-01',
  };
  const balances = calculateParticipantBalances(makeTrip([expense]));
  assert.equal(balances.reduce((sum, balance) => sum + balance.totalPaid, 0), 100);
  assert.equal(balances.reduce((sum, balance) => sum + balance.netBalance, 0), 0);
});
