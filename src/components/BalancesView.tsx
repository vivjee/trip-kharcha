'use client';

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronDown, History, Pencil, Trash2 } from 'lucide-react';
import type { Settlement, SimplifiedDebt, Trip } from '@/types/trip';
import { calculateParticipantBalances, getSettlementProgress } from '@/lib/debt-simplification';
import { formatDateTime, toLocalDateTimeInput } from '@/lib/date-utils';
import AppButton from '@/components/AppButton';
import Avatar from '@/components/Avatar';

interface BalancesViewProps {
  trip: Trip;
  simplifiedDebts: SimplifiedDebt[];
  onOpenSettleUp: (debt?: SimplifiedDebt) => void;
  onEditSettlement: (settlement: Settlement) => void;
  onDeleteSettlement: (settlementId: string) => void;
}

export default function BalancesView({ trip, simplifiedDebts, onOpenSettleUp, onEditSettlement, onDeleteSettlement }: BalancesViewProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const balances = calculateParticipantBalances(trip);
  const progress = getSettlementProgress(trip, simplifiedDebts);
  const getParticipant = (id: string) => trip.participants.find((participant) => participant.id === id);

  return (
    <div className="space-y-4 p-4 animate-pop-in">
      <header>
        <h2 className="text-base font-black leading-tight text-slate-950">Balances</h2>
        <p className="mt-1 text-xs font-medium text-slate-500">The fewest payments needed to settle the trip.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs" aria-label="Settlement progress">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-semibold text-slate-500">Still pending</p>
            <p className="mt-0.5 text-base font-black text-slate-950">{trip.currencySymbol} {progress.pending.toLocaleString()}</p>
          </div>
          <p className="rounded-full bg-indigo-50 px-2.5 py-1 font-extrabold text-indigo-700">{progress.percentage}% settled</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Settlement progress" aria-valuenow={progress.percentage} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress.percentage}%` }} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-black text-slate-950">Who owes whom</h3>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{simplifiedDebts.length} {simplifiedDebts.length === 1 ? 'payment' : 'payments'}</span>
        </div>

        {simplifiedDebts.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <div><p className="text-sm font-extrabold text-emerald-950">Everyone is settled</p><p className="mt-0.5 text-xs font-semibold text-emerald-700">No payments are waiting.</p></div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {simplifiedDebts.map((debt) => (
              <div key={debt.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-bold text-slate-800"><strong className="text-slate-950">{debt.from.name}</strong> <ArrowRight className="mx-1 inline h-3.5 w-3.5 text-indigo-500" /> <strong className="text-slate-950">{debt.to.name}</strong></p>
                  <p className="shrink-0 text-sm font-black text-slate-950">{trip.currencySymbol} {debt.amount.toLocaleString()}</p>
                </div>
                <AppButton variant="success" size="standard" fullWidth className="mt-3" onClick={() => onOpenSettleUp(debt)}>Settle payment</AppButton>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <h3 className="mb-3 text-sm font-black text-slate-950">Participant balances</h3>
        <div className="divide-y divide-slate-100">
          {balances.map((balance) => {
            const isCreditor = balance.netBalance > 0;
            const isDebtor = balance.netBalance < 0;
            return (
              <div key={balance.participantId} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar person={{ name: balance.participantName, avatar: balance.avatar, photoId: balance.photoId }} size="xs" />
                  <p className="truncate text-sm font-extrabold text-slate-800">{balance.participantName}</p>
                </div>
                <span className={`shrink-0 text-sm font-black ${isCreditor ? 'text-emerald-700' : isDebtor ? 'text-rose-700' : 'text-slate-500'}`}>
                  {isCreditor ? `+${trip.currencySymbol} ${balance.netBalance.toLocaleString()}` : isDebtor ? `−${trip.currencySymbol} ${Math.abs(balance.netBalance).toLocaleString()}` : 'Settled'}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {trip.settlements.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <button
            type="button"
            aria-expanded={isHistoryOpen}
            onClick={() => setIsHistoryOpen((open) => !open)}
            className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left cursor-pointer hover:bg-slate-50"
          >
            <span className="flex items-center gap-2 text-sm font-black text-slate-950"><History className="h-4 w-4 text-emerald-600" /> Payment history ({trip.settlements.length})</span>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`} />
          </button>

          {isHistoryOpen && (
            <div className="space-y-2 border-t border-slate-200 p-3">
              {trip.settlements.map((settlement) => {
                const from = getParticipant(settlement.fromParticipantId);
                const to = getParticipant(settlement.toParticipantId);
                return (
                  <div key={settlement.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{from?.name} paid {to?.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{formatDateTime(toLocalDateTimeInput(settlement.date, settlement.createdAt))} · {trip.currencySymbol} {settlement.amount.toLocaleString()}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <AppButton onClick={() => onEditSettlement(settlement)} size="icon" variant="ghost" aria-label={`Edit settlement from ${from?.name}`}><Pencil className="h-4 w-4" /></AppButton>
                      <AppButton onClick={() => { if (window.confirm('Delete this settlement? Balances will be recalculated.')) onDeleteSettlement(settlement.id); }} size="icon" variant="ghost" className="hover:bg-rose-50 hover:text-rose-700" aria-label={`Delete settlement from ${from?.name}`}><Trash2 className="h-4 w-4" /></AppButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
