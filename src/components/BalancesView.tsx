'use client';

import React, { useEffect } from 'react';
import { Trip, SimplifiedDebt } from '@/types/trip';
import { calculateParticipantBalances, getTripStats } from '@/lib/debt-simplification';
import { ArrowRight, CheckCircle2, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BalancesViewProps {
  trip: Trip;
  simplifiedDebts: SimplifiedDebt[];
  onOpenSettleUp: (debt?: SimplifiedDebt) => void;
  onDeleteSettlement: (settlementId: string) => void;
}

export default function BalancesView({
  trip,
  simplifiedDebts,
  onOpenSettleUp,
  onDeleteSettlement,
}: BalancesViewProps) {
  const balances = calculateParticipantBalances(trip);
  const stats = getTripStats(trip);

  const pendingTotal = simplifiedDebts.reduce((sum, d) => sum + d.amount, 0);
  const totalSpent = stats.totalSpent;

  // Calculate Settlement Progress Percentage
  const settledPct =
    totalSpent > 0
      ? Math.max(0, Math.min(100, Math.round(((totalSpent - pendingTotal) / totalSpent) * 100)))
      : 100;

  return (
    <div className="p-4 space-y-4 animate-pop-in">
      {/* View Title */}
      <div>
        <h2 className="text-base font-black text-slate-900 leading-tight">Balances & Settlements</h2>
        <p className="text-[11px] text-slate-500 font-medium">
          Clear summary of trip balances and suggested payments
        </p>
      </div>

      {/* Visual Settlement Progress Bar Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-4 text-white shadow-xl space-y-2 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Settlement Progress</span>
          </div>
          <span
            className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
              settledPct === 100
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/30'
            }`}
          >
            {settledPct}% Settled
          </span>
        </div>

        {/* Animated Progress Stack */}
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${settledPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-0.5">
          <span>Pending: {trip.currencySymbol} {pendingTotal.toLocaleString()}</span>
          <span>Total Spent: {trip.currencySymbol} {totalSpent.toLocaleString()}</span>
        </div>
      </div>

      {/* Simplified Debts Section (Optimal Payments needed) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
              Who Owes Whom ({simplifiedDebts.length})
            </h3>
          </div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
            Min Cash-Flow
          </span>
        </div>

        {simplifiedDebts.length === 0 ? (
          <div className="text-center py-6 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 p-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs font-bold text-emerald-950">All Debts Fully Settled!</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              No one owes anyone anything in {trip.name}.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {simplifiedDebts.map((debt) => (
              <div
                key={debt.id}
                className="bg-slate-50 hover:bg-indigo-50/40 p-3.5 rounded-2xl border border-slate-200 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <span className="bg-white px-2 py-1 rounded-xl shadow-2xs">
                      {debt.from.avatar} {debt.from.name}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="bg-white px-2 py-1 rounded-xl shadow-2xs">
                      {debt.to.avatar} {debt.to.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-900">
                      {trip.currencySymbol} {debt.amount.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium">To Settle</p>
                  </div>
                  <button
                    onClick={() => onOpenSettleUp(debt)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    Settle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Individual Net Balances Breakdown */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
          Net Balances Summary
        </h3>

        <div className="space-y-2">
          {balances.map((b) => {
            const isCreditor = b.netBalance > 0;
            const isDebtor = b.netBalance < 0;

            return (
              <div
                key={b.participantId}
                className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{b.avatar}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{b.participantName}</p>
                    <p className="text-[10px] text-slate-400">
                      Paid: {trip.currencySymbol}{b.totalPaid.toLocaleString()} • Share: {trip.currencySymbol}{b.totalOwed.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-xl text-xs font-extrabold ${
                      isCreditor
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : isDebtor
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCreditor
                      ? `+${trip.currencySymbol} ${b.netBalance.toLocaleString()}`
                      : isDebtor
                      ? `-${trip.currencySymbol} ${Math.abs(b.netBalance).toLocaleString()}`
                      : 'Settled'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
