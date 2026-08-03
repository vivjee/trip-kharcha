'use client';

import React from 'react';
import { Trip, SimplifiedDebt } from '@/types/trip';
import { getTripStats, calculateParticipantBalances } from '@/lib/debt-simplification';
import { formatDateTime, getTripDurationInDays, parseLocalDate, toLocalDateTimeInput } from '@/lib/date-utils';
import { getTripRecap } from '@/lib/trip-recap';
import { Plus, ArrowRightLeft, Users, CheckCircle2, ArrowUpRight, CalendarDays, ChartPie, ReceiptText } from 'lucide-react';
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
  const contributionBalances = [...balances].sort((first, second) => second.totalPaid - first.totalPaid);
  const recap = getTripRecap(trip);
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
  const pendingTotal = simplifiedDebts.reduce((sum, debt) => sum + debt.amount, 0);

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
            <p className="truncate text-3xl font-black tracking-tight text-slate-950">{trip.currencySymbol} {stats.totalSpent.toLocaleString()}</p>
            <span className="shrink-0 text-xs font-extrabold text-slate-500">{trip.currency}</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-500">{stats.totalExpensesCount} {stats.totalExpensesCount === 1 ? 'expense' : 'expenses'}</p>

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
        <AppButton variant="primary" size="large" onClick={onOpenAddExpense} fullWidth className="whitespace-nowrap px-2"><Plus className="h-5 w-5" /> Add expense</AppButton>
        <AppButton variant="secondary" size="large" onClick={() => onOpenSettleUp()} fullWidth className="whitespace-nowrap px-2"><ArrowRightLeft className="h-5 w-5 text-emerald-600" /> Settle up</AppButton>
      </div>

      {hasSpending && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-extrabold text-slate-900">Trip highlights</h2>
            <AppButton variant="ghost" size="compact" onClick={() => onNavigateTab('analytics')}>Analytics <ArrowUpRight className="h-4 w-4" /></AppButton>
          </div>
          <div className="divide-y divide-slate-100">
            <HighlightRow icon={ReceiptText} label="Biggest expense" value={recap.biggestExpense?.title || 'No expenses yet'} detail={recap.biggestExpense ? `${trip.currencySymbol} ${recap.biggestExpense.amount.toLocaleString()}` : undefined} tone="amber" />
            <HighlightRow icon={ChartPie} label="Top category" value={recap.dominantCategory ? `${recap.dominantCategory.icon} ${recap.dominantCategory.label}` : 'No category yet'} detail={recap.dominantCategory ? `${recap.dominantCategory.percentage.toFixed(0)}% of spending` : undefined} tone="indigo" />
            <HighlightRow icon={CalendarDays} label="Spending days" value={`${recap.dailySpending.length} of ${durationDays} ${durationDays === 1 ? 'trip day' : 'trip days'}`} detail={recap.highestSpendDay ? `Peak: ${recap.highestSpendDay.label}` : undefined} tone="emerald" />
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><Users className="h-4 w-4 text-indigo-600" /> Participants ({trip.participants.length})</h2>
          <AppButton variant="ghost" size="compact" onClick={onOpenAddParticipant}>Manage</AppButton>
        </div>
        <div className={`grid gap-2 ${contributionBalances.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {contributionBalances.map((balance) => {
            const contribution = stats.totalSpent > 0 ? (balance.totalPaid / stats.totalSpent) * 100 : 0;
            const paidAmountLabel = `${trip.currencySymbol} ${formatCompactAmount(balance.totalPaid)}`;
            return (
              <div key={balance.participantId} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar person={{ name: balance.participantName, avatar: balance.avatar, photoId: balance.photoId }} size="xs" />
                  <p className="min-w-0 truncate text-sm font-extrabold text-slate-900" title={balance.participantName}>{balance.participantName}</p>
                </div>
                <div className="mt-1 flex min-w-0 items-center justify-between gap-1.5">
                  <p className="min-w-0 truncate text-[13px] font-black text-slate-950" title={`${trip.currencySymbol} ${balance.totalPaid.toLocaleString()} paid`}>{paidAmountLabel}</p>
                  <p className="shrink-0 text-[11px] font-bold text-slate-500">{contribution.toFixed(0)}%</p>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label={`${balance.participantName} contribution`} aria-valuenow={Math.round(contribution)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full rounded-full bg-indigo-600" style={{ width: `${Math.min(contribution, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold text-emerald-950">Who owes whom</h2>
            {simplifiedDebts.length > 0 && <p className="mt-0.5 truncate text-xs font-semibold text-emerald-800">{trip.currencySymbol} {pendingTotal.toLocaleString()} pending · {simplifiedDebts.length} {simplifiedDebts.length === 1 ? 'payment' : 'payments'}</p>}
          </div>
          <AppButton variant="ghost" size="compact" onClick={() => onNavigateTab('balances')} className="shrink-0 text-emerald-800 hover:bg-emerald-100">View all <ArrowUpRight className="h-4 w-4" /></AppButton>
        </div>
        {simplifiedDebts.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white p-3 text-sm font-bold text-emerald-900"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> Everyone is settled up.</div>
        ) : (
          <div className="space-y-2">
            {simplifiedDebts.slice(0, 2).map((debt) => (
              <div key={debt.id} className="rounded-xl border border-emerald-200 bg-white p-3">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-sm text-slate-700"><strong className="text-slate-900">{debt.from.name}</strong> pays <strong className="text-slate-900">{debt.to.name}</strong></p>
                  <span className="shrink-0 text-sm font-black text-emerald-700">{trip.currencySymbol} {debt.amount.toLocaleString()}</span>
                </div>
                <AppButton variant="success" size="standard" fullWidth className="mt-3" onClick={() => onOpenSettleUp(debt)}>Settle payment</AppButton>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-extrabold text-slate-900">Recent expenses</h2>
          <AppButton variant="ghost" size="compact" onClick={() => onNavigateTab('expenses')}>View all <ArrowUpRight className="h-4 w-4" /></AppButton>
        </div>
        {trip.expenses.length === 0 ? (
          <div className="rounded-xl bg-slate-50 px-4 py-6 text-center"><p className="text-sm font-bold text-slate-700">No expenses recorded yet</p><p className="mt-1 text-xs text-slate-500">Add the first expense when someone pays.</p></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {trip.expenses.slice(0, 3).map((expense) => {
              const payer = getParticipant(expense.paidById);
              return (
                <div key={expense.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">{categoryIcons[expense.category] || '🧾'}</div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-slate-900">{expense.title}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{formatDateTime(toLocalDateTimeInput(expense.date, expense.createdAt))} · {payer?.name || 'Someone'}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-black text-slate-900">{trip.currencySymbol} {expense.amount.toLocaleString()}</span>
                  </div>
                  {expense.notes && <p className="ml-14 mt-2 line-clamp-1 whitespace-pre-line text-xs leading-relaxed text-slate-500">{expense.notes}</p>}
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

function formatCompactAmount(amount: number) {
  return new Intl.NumberFormat('en-US', {
    notation: Math.abs(amount) >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: Math.abs(amount) >= 10_000 ? 1 : 2,
  }).format(amount);
}

const highlightTones = {
  amber: 'bg-amber-50 text-amber-700',
  indigo: 'bg-indigo-50 text-indigo-700',
  emerald: 'bg-emerald-50 text-emerald-700',
};

function HighlightRow({ icon: Icon, label, value, detail, tone }: {
  icon: typeof ReceiptText;
  label: string;
  value: string;
  detail?: string;
  tone: keyof typeof highlightTones;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${highlightTones[tone]}`}><Icon className="h-4 w-4" /></div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="truncate text-sm font-extrabold text-slate-900">{value}</p>
      </div>
      {detail && <p className="max-w-28 shrink-0 truncate text-right text-xs font-bold text-slate-600">{detail}</p>}
    </div>
  );
}
