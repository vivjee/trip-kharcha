import { Trip, ParticipantBalance, SimplifiedDebt } from '@/types/trip';

/**
 * Calculates individual balances for all participants in a trip
 */
export function calculateParticipantBalances(trip?: Trip): ParticipantBalance[] {
  if (!trip || !trip.participants || !Array.isArray(trip.participants)) {
    return [];
  }

  const balanceMap: Record<
    string,
    { totalPaid: number; totalOwed: number }
  > = {};

  // Initialize map for all participants
  trip.participants.forEach((p) => {
    balanceMap[p.id] = { totalPaid: 0, totalOwed: 0 };
  });

  // Calculate from expenses
  trip.expenses.forEach((expense) => {
    // Payers get credit for paid amounts
    if (expense.payers && expense.payers.length > 0) {
      expense.payers.forEach((payer) => {
        if (balanceMap[payer.participantId]) {
          balanceMap[payer.participantId].totalPaid += payer.amount;
        }
      });
    } else if (balanceMap[expense.paidById]) {
      balanceMap[expense.paidById].totalPaid += expense.amount;
    }

    // Split equally among included participants
    if (expense.includedParticipantIds && expense.includedParticipantIds.length > 0) {
      const perPersonShare = expense.amount / expense.includedParticipantIds.length;
      expense.includedParticipantIds.forEach((id) => {
        if (balanceMap[id]) {
          balanceMap[id].totalOwed += perPersonShare;
        }
      });
    }
  });

  // Factor in recorded settlements (repayments)
  trip.settlements.forEach((settlement) => {
    if (balanceMap[settlement.fromParticipantId]) {
      balanceMap[settlement.fromParticipantId].totalPaid += settlement.amount;
    }
    if (balanceMap[settlement.toParticipantId]) {
      balanceMap[settlement.toParticipantId].totalOwed += settlement.amount;
    }
  });

  // Map to final array
  return trip.participants.map((p) => {
    const data = balanceMap[p.id] || { totalPaid: 0, totalOwed: 0 };
    const netBalance = data.totalPaid - data.totalOwed;
    return {
      participantId: p.id,
      participantName: p.name,
      avatar: p.avatar,
      color: p.color,
      totalPaid: Math.round(data.totalPaid * 100) / 100,
      totalOwed: Math.round(data.totalOwed * 100) / 100,
      netBalance: Math.round(netBalance * 100) / 100,
    };
  });
}

/**
 * Minimum Cash Flow Algorithm to simplify debt transactions to the fewest possible payments.
 */
export function calculateSimplifiedDebts(trip?: Trip): SimplifiedDebt[] {
  if (!trip || !trip.participants || !Array.isArray(trip.participants)) {
    return [];
  }

  const balances = calculateParticipantBalances(trip);
  const participantMap = new Map(trip.participants.map((p) => [p.id, p]));

  // Debtors have negative net balance (they owe money)
  const debtors: { id: string; amount: number }[] = [];
  // Creditors have positive net balance (they should receive money)
  const creditors: { id: string; amount: number }[] = [];

  balances.forEach((b) => {
    if (b.netBalance < -0.01) {
      debtors.push({ id: b.participantId, amount: Math.abs(b.netBalance) });
    } else if (b.netBalance > 0.01) {
      creditors.push({ id: b.participantId, amount: b.netBalance });
    }
  });

  // Sort descending by amount to maximize greedy matching
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions: SimplifiedDebt[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const amount = Math.min(debtor.amount, creditor.amount);
    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount > 0) {
      const fromPart = participantMap.get(debtor.id);
      const toPart = participantMap.get(creditor.id);

      if (fromPart && toPart) {
        transactions.push({
          id: `debt-${debtor.id}-${creditor.id}-${transactions.length}`,
          from: fromPart,
          to: toPart,
          amount: roundedAmount,
        });
      }
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) dIdx++;
    if (creditor.amount < 0.01) cIdx++;
  }

  return transactions;
}

/**
 * Calculates trip overall summary statistics
 */
export function getTripStats(trip: Trip) {
  const totalSpent = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpensesCount = trip.expenses.length;
  const balances = calculateParticipantBalances(trip);
  
  // Find top spender
  let topSpender = balances.length > 0 ? balances[0] : null;
  balances.forEach((b) => {
    if (topSpender && b.totalPaid > topSpender.totalPaid) {
      topSpender = b;
    }
  });

  const perPersonAvg = trip.participants.length > 0 
    ? totalSpent / trip.participants.length 
    : 0;

  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    totalExpensesCount,
    topSpender,
    perPersonAvg: Math.round(perPersonAvg * 100) / 100,
  };
}
