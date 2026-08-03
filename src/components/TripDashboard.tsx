'use client';

import React from 'react';
import { Trip, SimplifiedDebt } from '@/types/trip';
import { getTripStats, calculateParticipantBalances } from '@/lib/debt-simplification';
import { getTripDurationInDays, parseLocalDate } from '@/lib/date-utils';
import { Plus, ArrowRightLeft, Users, CheckCircle2, ArrowUpRight } from 'lucide-react';
import StoredPhoto from '@/components/StoredPhoto';
import PhotoPicker from '@/components/PhotoPicker';
import Avatar from '@/components/Avatar';
import CompletedTripOverview from '@/components/CompletedTripOverview';
import AppButton from '@/components/AppButton';

interface TripDashboardProps {
  trip: Trip;
  simplifiedDebts: SimplifiedDebt[];
  onOpenAddExpense: () => void;
  onOpenSettleUp: (debt?: SimplifiedDebt) => void;
  onNavigateTab: (tab: 'expenses' | 'balances' | 'analytics') => void;
  onOpenAddParticipant: () => void;
  onUpdateCover: (photoId: string | undefined, accentColor?: string) => void;
}

export default function TripDashboard({
  trip,
  simplifiedDebts,
  onOpenAddExpense,
  onOpenSettleUp,
  onNavigateTab,
  onOpenAddParticipant,
  onUpdateCover,
}: TripDashboardProps) {
  if (trip.status === 'completed') {
    return (
      <CompletedTripOverview
        trip={trip}
        simplifiedDebts={simplifiedDebts}
        onOpenSettleUp={onOpenSettleUp}
        onNavigateTab={onNavigateTab}
        onUpdateCover={onUpdateCover}
      />
    );
  }

  const stats = getTripStats(trip);
  const balances = calculateParticipantBalances(trip);
  const durationDays = getTripDurationInDays(trip);
  const dailyPace = Math.round(stats.totalSpent / durationDays);
  const startDate = parseLocalDate(trip.startDate || trip.createdAt);
  const startLabel = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(startDate.getFullYear() !== new Date().getFullYear() ? { year: 'numeric' as const } : {}),
  });
  const categoryIcons: Record<string, string> = {
    food: '🍱',
    transport: '🚕',
    stay: '🏨',
    activity: '🎟️',
    shopping: '🛍️',
    other: '🧾',
  };
  const getParticipant = (id: string) => trip.participants.find((participant) => participant.id === id);
  const hasSpending = stats.totalSpent > 0 && stats.totalExpensesCount > 0;

  return (
    <div className="space-y-4 p-4 animate-pop-in">
      <section aria-label="Trip overview">
        <div
          className="relative h-36 overflow-hidden rounded-2xl bg-indigo-800"
          style={trip.accentColor && !trip.coverPhotoId ? { backgroundColor: trip.accentColor } : undefined}
        >
          {trip.coverPhotoId ? (
            <StoredPhoto photoId={trip.coverPhotoId} alt={`${trip.name} cover`} priority />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.18),transparent_35%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/20 to-slate-950/75" />
          <div className="relative z-10 flex h-full items-start justify-between p-4">
            <div className="max-w-[calc(100%-4rem)] rounded-lg bg-slate-950/55 px-2.5 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
              Started {startLabel} · Day {durationDays}
            </div>
            <PhotoPicker compact kind="cover" photoId={trip.coverPhotoId} label="trip cover" onChange={onUpdateCover} />
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-bold text-slate-500">Total spent</p>
          <div className="mt-1 flex min-w-0 items-baseline gap-2">
            <p className="truncate text-3xl font-black tracking-tight text-slate-950">
              {trip.currencySymbol} {stats.totalSpent.toLocaleString()}
            </p>
            <span className="shrink-0 text-xs font-extrabold text-slate-500">{trip.currency}</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {stats.totalExpensesCount} {stats.totalExpensesCount === 1 ? 'expense' : 'expenses'}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
            <SummaryMetric label="Per person" value={`${trip.currencySymbol} ${stats.perPersonAvg.toLocaleString()}`} />
            <SummaryMetric label="Per day" value={`${trip.currencySymbol} ${dailyPace.toLocaleString()}`} />
            <div className="col-span-2 rounded-xl bg-slate-50 px-3 py-2.5">
              <p className="text-xs font-semibold text-slate-500">Top payer</p>
              {hasSpending && stats.topSpender ? (
                <div className="mt-1 flex min-w-0 items-center gap-2">
                  <Avatar person={{ name: stats.topSpender.participantName, avatar: stats.topSpender.avatar, photoId: stats.topSpender.photoId }} size="xs" />
                  <span className="truncate text-sm font-extrabold text-slate-900">{stats.topSpender.participantName}</span>
                </div>
              ) : (
                <p className="mt-1 text-sm font-bold text-slate-700">No spending yet</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <AppButton variant="primary" size="large" onClick={onOpenAddExpense} fullWidth>
          <Plus className="h-5 w-5" /> Add expense
        </AppButton>
        <AppButton variant="secondary" size="large" onClick={() => onOpenSettleUp()} fullWidth>
          <ArrowRightLeft className="h-5 w-5 text-emerald-600" /> Settle up
        </AppButton>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <Users className="h-4 w-4 text-indigo-600" /> Participants ({trip.participants.length})
          </h2>
          <AppButton variant="ghost" size="compact" onClick={onOpenAddParticipant}>
            Manage
          </AppButton>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {balances.map((balance) => (
            <div key={balance.participantId} className="flex min-w-[148px] shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <Avatar person={{ name: balance.participantName, avatar: balance.avatar, photoId: balance.photoId }} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-slate-900">{balance.participantName}</p>
                <p className={`mt-0.5 text-xs font-bold ${balance.netBalance > 0 ? 'text-emerald-700' : balance.netBalance < 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                  {balance.netBalance > 0
                    ? `+ ${trip.currencySymbol} ${balance.netBalance.toLocaleString()}`
                    : balance.netBalance < 0
                    ? `− ${trip.currencySymbol} ${Math.abs(balance.netBalance).toLocaleString()}`
                    : 'Settled'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-extrabold text-emerald-950">Who owes whom</h2>
          <AppButton variant="ghost" size="compact" onClick={() => onNavigateTab('balances')} className="text-emerald-800 hover:bg-emerald-100">
            View all <ArrowUpRight className="h-4 w-4" />
          </AppButton>
        </div>
        {simplifiedDebts.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white p-3 text-sm font-bold text-emerald-900">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> Everyone is settled up.
          </div>
        ) : (
          <div className="space-y-2">
            {simplifiedDebts.slice(0, 2).map((debt) => (
              <div key={debt.id} className="rounded-xl border border-emerald-200 bg-white p-3">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-sm text-slate-700">
                    <strong className="text-slate-900">{debt.from.name}</strong> pays <strong className="text-slate-900">{debt.to.name}</strong>
                  </p>
                  <span className="shrink-0 text-sm font-black text-emerald-700">{trip.currencySymbol} {debt.amount.toLocaleString()}</span>
                </div>
                <AppButton variant="success" size="standard" fullWidth className="mt-3" onClick={() => onOpenSettleUp(debt)}>
                  Settle payment
                </AppButton>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-extrabold text-slate-900">Recent expenses</h2>
          <AppButton variant="ghost" size="compact" onClick={() => onNavigateTab('expenses')}>
            View all <ArrowUpRight className="h-4 w-4" />
          </AppButton>
        </div>
        {trip.expenses.length === 0 ? (
          <div className="rounded-xl bg-slate-50 px-4 py-6 text-center">
            <p className="text-sm font-bold text-slate-700">No expenses recorded yet</p>
            <p className="mt-1 text-xs text-slate-500">Add the first expense when someone pays.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {trip.expenses.slice(0, 3).map((expense) => {
              const payer = getParticipant(expense.paidById);
              return (
                <div key={expense.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">{categoryIcons[expense.category] || '🧾'}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-slate-900">{expense.title}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">Paid by {payer?.name || 'Someone'} · {expense.includedParticipantIds.length} people</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-black text-slate-900">{trip.currencySymbol} {expense.amount.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2.5">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-extrabold text-slate-900">{value}</p>
    </div>
  );
}
