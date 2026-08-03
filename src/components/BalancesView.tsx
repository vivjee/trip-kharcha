'use client';

import React from 'react';
import { Settlement, Trip, SimplifiedDebt } from '@/types/trip';
import { calculateParticipantBalances, getSettlementProgress } from '@/lib/debt-simplification';
import { ArrowRight, CheckCircle2, Sparkles, Trophy, Pencil, Trash2, History } from 'lucide-react';
import { formatDateTime, toLocalDateTimeInput } from '@/lib/date-utils';
import Avatar from '@/components/Avatar';
import AppButton from '@/components/AppButton';

interface BalancesViewProps {
  trip: Trip;
  simplifiedDebts: SimplifiedDebt[];
  onOpenSettleUp: (debt?: SimplifiedDebt) => void;
  onEditSettlement: (settlement: Settlement) => void;
  onDeleteSettlement: (settlementId: string) => void;
}

export default function BalancesView({
  trip,
  simplifiedDebts,
  onOpenSettleUp,
  onEditSettlement,
  onDeleteSettlement,
}: BalancesViewProps) {
  const balances = calculateParticipantBalances(trip);
  const progress = getSettlementProgress(trip, simplifiedDebts);
  const getParticipant = (id: string) => trip.participants.find((participant) => participant.id === id);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 p-4 animate-pop-in md:p-5">
      {/* View Title */}
      <div>
        <h2 className="text-base font-black text-slate-900 leading-tight">Balances & Settlements</h2>
        <p className="text-[11px] text-slate-500 font-medium">
          Clear summary of trip balances and suggested payments
        </p>
      </div>

      {/* Visual Settlement Progress Bar Card */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Settlement Progress</span>
          </div>
          <span
            className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
              progress.percentage === 100
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}
          >
            {progress.percentage}% Settled
          </span>
        </div>

        {/* Animated Progress Stack */}
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>

        <div className="font-amount flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Recorded: {trip.currencySymbol} {progress.recorded.toLocaleString()}</span>
          <span>Pending: {trip.currencySymbol} {progress.pending.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <History className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">Recorded Settlements ({trip.settlements.length})</h3>
        </div>
        {trip.settlements.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No payments recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {trip.settlements.map((settlement) => {
              const from = getParticipant(settlement.fromParticipantId);
              const to = getParticipant(settlement.toParticipantId);
              return (
                <div key={settlement.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{from?.avatar} {from?.name} paid {to?.avatar} {to?.name}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(toLocalDateTimeInput(settlement.date, settlement.createdAt))} · {trip.currencySymbol} {settlement.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-shrink-0">
                    <AppButton onClick={() => onEditSettlement(settlement)} size="icon" variant="ghost" aria-label={`Edit settlement from ${from?.name}`}><Pencil className="w-4 h-4" /></AppButton>
                    <AppButton onClick={() => { if (window.confirm('Delete this settlement? Balances will be recalculated.')) onDeleteSettlement(settlement.id); }} size="icon" variant="ghost" className="hover:bg-rose-50 hover:text-rose-700" aria-label={`Delete settlement from ${from?.name}`}><Trash2 className="w-4 h-4" /></AppButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Simplified Debts Section (Optimal Payments needed) */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
              Who Owes Whom ({simplifiedDebts.length})
            </h3>
          </div>
          <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700">
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
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5 text-xs font-bold text-slate-800">
                    <span className="bg-white px-2 py-1 rounded-xl shadow-2xs flex items-center gap-1.5">
                      <Avatar person={debt.from} size="xs" /> {debt.from.name}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="bg-white px-2 py-1 rounded-xl shadow-2xs flex items-center gap-1.5">
                      <Avatar person={debt.to} size="xs" /> {debt.to.name}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-amount text-sm font-black text-slate-900">
                      {trip.currencySymbol} {debt.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">To settle</p>
                  </div>
                </div>
                <AppButton variant="success" size="standard" fullWidth className="mt-3" onClick={() => onOpenSettleUp(debt)}>Settle payment</AppButton>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Individual Net Balances Breakdown */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
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
                  <Avatar person={{ name: b.participantName, avatar: b.avatar, photoId: b.photoId }} size="sm" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{b.participantName}</p>
                    <p className="text-xs text-slate-500">
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
