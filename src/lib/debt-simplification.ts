import type { Expense, ExpensePayer, ExpenseShare, ParticipantBalance, SimplifiedDebt, Trip } from '@/types/trip';

import { toMinorUnits, fromMinorUnits, roundMoney } from './money.ts';

function normalizeEntriesToTotal<T extends { amount: number }>(entries: T[], total: number): T[] | null {
  const totalMinor = toMinorUnits(total);
  const normalized = entries
    .filter((entry) => Number.isFinite(entry.amount) && entry.amount > 0)
    .map((entry) => ({ entry, amountMinor: toMinorUnits(entry.amount) }))
    .filter(({ amountMinor }) => amountMinor > 0);

  if (normalized.length === 0) return null;
  const lastIndex = normalized.length - 1;
  const beforeLast = normalized
    .slice(0, lastIndex)
    .reduce((sum, item) => sum + item.amountMinor, 0);
  const correctedLast = totalMinor - beforeLast;
  if (correctedLast <= 0) return null;

  return normalized.map(({ entry, amountMinor }, index) => ({
    ...entry,
    amount: fromMinorUnits(index === lastIndex ? correctedLast : amountMinor),
  }));
}

function equalShares(expense: Expense): ExpenseShare[] {
  const included = expense.includedParticipantIds || [];
  if (included.length === 0) return [];
  const totalMinor = toMinorUnits(expense.amount);
  const baseMinor = Math.floor(totalMinor / included.length);
  let assignedMinor = 0;

  return included.map((participantId, index) => {
    const amountMinor = index === included.length - 1 ? totalMinor - assignedMinor : baseMinor;
    assignedMinor += amountMinor;
    return { participantId, amount: fromMinorUnits(amountMinor) };
  });
}

export function getExpenseShares(expense: Expense): ExpenseShare[] {
  const savedShares = (expense.shares || []).filter((share) => share.amount > 0);
  const savedTotalMinor = savedShares.reduce((sum, share) => sum + toMinorUnits(share.amount), 0);
  const differenceMinor = toMinorUnits(expense.amount) - savedTotalMinor;

  // Previously saved exact splits can be one minor unit short/over after each
  // row was rounded independently. Absorb that residue into the last share.
  if (savedShares.length > 0 && Math.abs(differenceMinor) <= 1) {
    return normalizeEntriesToTotal(savedShares, expense.amount) || equalShares(expense);
  }

  return equalShares(expense);
}

function getExpensePayers(expense: Expense): ExpensePayer[] {
  const savedPayers = expense.payers?.filter((payer) => payer.amount > 0) || [];
  const savedTotalMinor = savedPayers.reduce((sum, payer) => sum + toMinorUnits(payer.amount), 0);
  const differenceMinor = toMinorUnits(expense.amount) - savedTotalMinor;

  if (savedPayers.length > 0 && Math.abs(differenceMinor) <= 1) {
    const normalized = normalizeEntriesToTotal(savedPayers, expense.amount);
    if (normalized) return normalized;
  }

  return [{ participantId: expense.paidById, amount: roundMoney(expense.amount) }];
}

export function calculateParticipantBalances(trip?: Trip): ParticipantBalance[] {
  if (!trip?.participants || !Array.isArray(trip.participants)) return [];

  const balanceMap: Record<string, {
    totalPaid: number;
    totalOwed: number;
    settlementPaid: number;
    settlementReceived: number;
  }> = {};

  trip.participants.forEach((participant) => {
    balanceMap[participant.id] = {
      totalPaid: 0,
      totalOwed: 0,
      settlementPaid: 0,
      settlementReceived: 0,
    };
  });

  trip.expenses.forEach((expense) => {
    getExpensePayers(expense).forEach((payer) => {
      if (balanceMap[payer.participantId]) {
        balanceMap[payer.participantId].totalPaid += toMinorUnits(payer.amount);
      }
    });

    getExpenseShares(expense).forEach((share) => {
      if (balanceMap[share.participantId]) {
        balanceMap[share.participantId].totalOwed += toMinorUnits(share.amount);
      }
    });
  });

  trip.settlements.forEach((settlement) => {
    const amountMinor = toMinorUnits(settlement.amount);
    if (balanceMap[settlement.fromParticipantId]) {
      balanceMap[settlement.fromParticipantId].settlementPaid += amountMinor;
    }
    if (balanceMap[settlement.toParticipantId]) {
      balanceMap[settlement.toParticipantId].settlementReceived += amountMinor;
    }
  });

  return trip.participants.map((participant) => {
    const data = balanceMap[participant.id];
    const netMinor = data.totalPaid - data.totalOwed + data.settlementPaid - data.settlementReceived;
    return {
      participantId: participant.id,
      participantName: participant.name,
      avatar: participant.avatar,
      photoId: participant.photoId,
      color: participant.color,
      totalPaid: fromMinorUnits(data.totalPaid),
      totalOwed: fromMinorUnits(data.totalOwed),
      settlementPaid: fromMinorUnits(data.settlementPaid),
      settlementReceived: fromMinorUnits(data.settlementReceived),
      netBalance: fromMinorUnits(netMinor),
    };
  });
}

export function calculateSimplifiedDebts(trip?: Trip, existingBalances?: ParticipantBalance[]): SimplifiedDebt[] {
  if (!trip?.participants || !Array.isArray(trip.participants)) return [];
  const balances = existingBalances || calculateParticipantBalances(trip);
  const participantMap = new Map(trip.participants.map((participant) => [participant.id, participant]));
  const debtors = balances
    .map((balance) => ({ id: balance.participantId, amount: toMinorUnits(balance.netBalance) }))
    .filter((balance) => balance.amount < 0)
    .map((balance) => ({ ...balance, amount: Math.abs(balance.amount) }))
    .sort((a, b) => b.amount - a.amount);
  const creditors = balances
    .map((balance) => ({ id: balance.participantId, amount: toMinorUnits(balance.netBalance) }))
    .filter((balance) => balance.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const transactions: SimplifiedDebt[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;
  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amountMinor = Math.min(debtor.amount, creditor.amount);
    const from = participantMap.get(debtor.id);
    const to = participantMap.get(creditor.id);
    if (from && to && amountMinor > 0) {
      transactions.push({
        id: `debt-${debtor.id}-${creditor.id}-${transactions.length}`,
        from,
        to,
        amount: fromMinorUnits(amountMinor),
      });
    }
    debtor.amount -= amountMinor;
    creditor.amount -= amountMinor;
    if (debtor.amount === 0) debtorIndex += 1;
    if (creditor.amount === 0) creditorIndex += 1;
  }
  return transactions;
}

export function getSettlementProgress(trip: Trip, debts = calculateSimplifiedDebts(trip)) {
  const recordedMinor = trip.settlements.reduce((sum, settlement) => sum + toMinorUnits(settlement.amount), 0);
  const pendingMinor = debts.reduce((sum, debt) => sum + toMinorUnits(debt.amount), 0);
  const totalMinor = recordedMinor + pendingMinor;
  return {
    recorded: fromMinorUnits(recordedMinor),
    pending: fromMinorUnits(pendingMinor),
    percentage: totalMinor > 0 ? Math.round((recordedMinor / totalMinor) * 100) : 100,
  };
}

export function getTripStats(trip: Trip, balances = calculateParticipantBalances(trip)) {
  const totalSpentMinor = trip.expenses.reduce((sum, expense) => sum + toMinorUnits(expense.amount), 0);
  const totalSpent = fromMinorUnits(totalSpentMinor);
  const topSpender = balances.reduce<ParticipantBalance | null>((top, balance) => {
    if (!top || balance.totalPaid > top.totalPaid) return balance;
    return top;
  }, null);
  return {
    totalSpent,
    totalExpensesCount: trip.expenses.length,
    topSpender,
    perPersonAvg: trip.participants.length ? roundMoney(totalSpent / trip.participants.length) : 0,
  };
}
