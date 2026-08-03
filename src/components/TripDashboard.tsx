'use client';

import React from 'react';
import { ArrowRight, CheckCircle2, Plus } from 'lucide-react';
import type { SimplifiedDebt, Trip } from '@/types/trip';
import { getTripStats } from '@/lib/debt-simplification';
import { getTripDurationInDays, parseLocalDate } from '@/lib/date-utils';
import AppButton from '@/components/AppButton';
import CompletedTripOverview from '@/components/CompletedTripOverview';
import PhotoPicker from '@/components/PhotoPicker';
import StoredPhoto from '@/components/StoredPhoto';

interface TripDashboardProps {
  trip: Trip;
  simplifiedDebts: SimplifiedDebt[];
  onOpenAddExpense: () => void;
  onOpenSettleUp: (debt?: SimplifiedDebt) => void;
  onNavigateTab: (tab: 'expenses' | 'balances' | 'analytics') => void;
  onUpdateCover: (photoId: string | undefined, accentColor?: string) => void;
}

export default function TripDashboard({
  trip,
  simplifiedDebts,
  onOpenAddExpense,
  onOpenSettleUp,
  onNavigateTab,
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
  const durationDays = getTripDurationInDays(trip);
  const startDate = parseLocalDate(trip.startDate || trip.createdAt);
  const startLabel = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(startDate.getFullYear() !== new Date().getFullYear() ? { year: 'numeric' as const } : {}),
  });
  const pendingTotal = simplifiedDebts.reduce((sum, debt) => sum + debt.amount, 0);
  const nextDebt = simplifiedDebts[0];

  return (
    <div className="space-y-4 p-4 animate-pop-in">
      <section aria-label="Trip overview">
        <div
          className="relative h-32 overflow-hidden rounded-2xl bg-indigo-800"
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
            <p className="truncate text-3xl font-black tracking-tight text-slate-950">{trip.currencySymbol} {stats.totalSpent.toLocaleString()}</p>
            <span className="shrink-0 text-xs font-extrabold text-slate-500">{trip.currency}</span>
          </div>

          <div className="mt-4 grid grid-cols-2 divide-x divide-slate-200 border-y border-slate-100 py-3">
            <SummaryMetric label="Expenses" value={stats.totalExpensesCount.toLocaleString()} />
            <SummaryMetric label="Still pending" value={`${trip.currencySymbol} ${pendingTotal.toLocaleString()}`} />
          </div>

          <AppButton variant="primary" size="large" onClick={onOpenAddExpense} fullWidth className="mt-4">
            <Plus className="h-5 w-5" /> Add expense
          </AppButton>
        </div>
      </section>

      {nextDebt ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-emerald-700">Next payment</p>
              <h2 className="mt-0.5 truncate text-base font-black text-emerald-950">
                {nextDebt.from.name} pays {nextDebt.to.name}
              </h2>
              <p className="mt-1 text-lg font-black text-emerald-700">{trip.currencySymbol} {nextDebt.amount.toLocaleString()}</p>
            </div>
            <AppButton variant="ghost" size="compact" onClick={() => onNavigateTab('balances')} className="shrink-0 text-emerald-800 hover:bg-emerald-100">
              View all <ArrowRight className="h-4 w-4" />
            </AppButton>
          </div>
          {simplifiedDebts.length > 1 && (
            <p className="mt-2 text-xs font-semibold text-emerald-800">
              {trip.currencySymbol} {pendingTotal.toLocaleString()} across {simplifiedDebts.length} payments
            </p>
          )}
          <AppButton variant="success" size="large" fullWidth className="mt-3" onClick={() => onOpenSettleUp(nextDebt)}>
            Settle payment
          </AppButton>
        </section>
      ) : stats.totalExpensesCount > 0 ? (
        <section className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
          <div>
            <h2 className="text-sm font-black">Everyone is settled</h2>
            <p className="mt-0.5 text-xs font-semibold text-emerald-800">No payments are waiting.</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-3 first:pl-0 last:pr-0">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}
