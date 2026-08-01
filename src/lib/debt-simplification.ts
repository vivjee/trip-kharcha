import { Expense, ParticipantBalance, SimplifiedDebt, Trip } from '@/types/trip';

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function getExpenseShares(expense: Expense): { participantId: string; amount: number }[] {
  const savedShares = (expense.shares || []).filter((share) => share.amount > 0);
  const savedTotal = savedShares.reduce((sum, share) => sum + share.amount, 0);
  if (savedShares.length > 0 && Math.abs(savedTotal - expense.amount) < 0.02) {
    return savedShares.map((share) => ({ ...share, amount: roundMoney(share.amount) }));
  }

  const included = expense.includedParticipantIds || [];
  if (included.length === 0) return [];
  const baseShare = Math.floor((expense.amount * 100) / included.length) / 100;
  let assigned = 0;
  return included.map((participantId, index) => {
    const amount = index === included.length - 1 ? roundMoney(expense.amount - assigned) : baseShare;
    assigned = roundMoney(assigned + amount);
    return { participantId, amount };
  });
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
    const payers = expense.payers?.length
      ? expense.payers
      : [{ participantId: expense.paidById, amount: expense.amount }];
    payers.forEach((payer) => {
      if (balanceMap[payer.participantId] && payer.amount > 0) {
        balanceMap[payer.participantId].totalPaid += payer.amount;
      }
    });

    getExpenseShares(expense).forEach((share) => {
      if (balanceMap[share.participantId]) {
        balanceMap[share.participantId].totalOwed += share.amount;
      }
    });
  });

  trip.settlements.forEach((settlement) => {
    if (balanceMap[settlement.fromParticipantId]) {
      balanceMap[settlement.fromParticipantId].settlementPaid += settlement.amount;
    }
    if (balanceMap[settlement.toParticipantId]) {
      balanceMap[settlement.toParticipantId].settlementReceived += settlement.amount;
    }
  });

  return trip.participants.map((participant) => {
    const data = balanceMap[participant.id];
    const netBalance = data.totalPaid - data.totalOwed + data.settlementPaid - data.settlementReceived;
    return {
      participantId: participant.id,
      participantName: participant.name,
      avatar: participant.avatar,
      photoId: participant.photoId,
      color: participant.color,
      totalPaid: roundMoney(data.totalPaid),
      totalOwed: roundMoney(data.totalOwed),
      settlementPaid: roundMoney(data.settlementPaid),
      settlementReceived: roundMoney(data.settlementReceived),
      netBalance: roundMoney(netBalance),
    };
  });
}

export function calculateSimplifiedDebts(trip?: Trip): SimplifiedDebt[] {
  if (!trip?.participants || !Array.isArray(trip.participants)) return [];
  const balances = calculateParticipantBalances(trip);
  const participantMap = new Map(trip.participants.map((participant) => [participant.id, participant]));
  const debtors = balances
    .filter((balance) => balance.netBalance < -0.01)
    .map((balance) => ({ id: balance.participantId, amount: Math.abs(balance.netBalance) }))
    .sort((a, b) => b.amount - a.amount);
  const creditors = balances
    .filter((balance) => balance.netBalance > 0.01)
    .map((balance) => ({ id: balance.participantId, amount: balance.netBalance }))
    .sort((a, b) => b.amount - a.amount);

  const transactions: SimplifiedDebt[] = [];
  let debtorIndex = 0;
  let creditorIndex = 0;
  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    const amount = Math.min(debtor.amount, creditor.amount);
    const from = participantMap.get(debtor.id);
    const to = participantMap.get(creditor.id);
    if (from && to && amount > 0.009) {
      transactions.push({
        id: `debt-${debtor.id}-${creditor.id}-${transactions.length}`,
        from,
        to,
        amount: roundMoney(amount),
      });
    }
    debtor.amount -= amount;
    creditor.amount -= amount;
    if (debtor.amount < 0.01) debtorIndex += 1;
    if (creditor.amount < 0.01) creditorIndex += 1;
  }
  return transactions;
}

export function getSettlementProgress(trip: Trip, debts = calculateSimplifiedDebts(trip)) {
  const recorded = roundMoney(trip.settlements.reduce((sum, settlement) => sum + settlement.amount, 0));
  const pending = roundMoney(debts.reduce((sum, debt) => sum + debt.amount, 0));
  const total = recorded + pending;
  return {
    recorded,
    pending,
    percentage: total > 0 ? Math.round((recorded / total) * 100) : 100,
  };
}

export function getTripStats(trip: Trip) {
  const totalSpent = roundMoney(trip.expenses.reduce((sum, expense) => sum + expense.amount, 0));
  const balances = calculateParticipantBalances(trip);
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
