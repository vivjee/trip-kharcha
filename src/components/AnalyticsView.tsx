'use client';

import React from 'react';
import { Trip } from '@/types/trip';
import { getTripStats, calculateParticipantBalances } from '@/lib/debt-simplification';
import { getTripDurationInDays, formatDateRange } from '@/lib/date-utils';
import { getCategoryConicGradient, getTripRecap } from '@/lib/trip-recap';
import { CalendarDays, Crown, ReceiptText, TrendingUp, Users } from 'lucide-react';
import Avatar from '@/components/Avatar';

interface AnalyticsViewProps {
  trip: Trip;
}

export default function AnalyticsView({ trip }: AnalyticsViewProps) {
  const stats = getTripStats(trip);
  const recap = getTripRecap(trip);
  const balances = calculateParticipantBalances(trip).sort((first, second) => second.totalPaid - first.totalPaid);
  const durationDays = getTripDurationInDays(trip);
  const dailyAverage = Math.round(stats.totalSpent / durationDays);
  const maxDaySpend = Math.max(...recap.dailySpending.map((day) => day.amount), 1);
  const maxMemberSpend = Math.max(...balances.map((balance) => balance.totalPaid), 1);
  const categoryGradient = getCategoryConicGradient(recap.categories);
  const topPayer = stats.totalSpent > 0 ? balances[0] : undefined;
  const isLive = trip.status === 'active';

  return (
    <div className="space-y-4 p-4 pb-6 animate-pop-in">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-black leading-tight text-slate-950">{isLive ? 'Live trip analytics' : 'Trip analytics'}</h2>
          <p className="mt-1 text-xs font-medium text-slate-500">{formatDateRange(trip)} · {durationDays} {durationDays === 1 ? 'day' : 'days'}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ${isLive ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
          {isLive ? 'Updates live' : 'Final totals'}
        </span>
      </header>

      <section className="rounded-2xl border border-indigo-200 bg-indigo-600 p-4 text-white shadow-2xs" aria-label="Trip spending total">
        <p className="text-xs font-bold text-indigo-100">Total spent so far</p>
        <p className="mt-1 truncate text-3xl font-black tracking-tight">{trip.currencySymbol} {stats.totalSpent.toLocaleString()}</p>
        <p className="mt-2 text-xs font-semibold text-indigo-100">
          {stats.totalExpensesCount} {stats.totalExpensesCount === 1 ? 'expense' : 'expenses'} across {recap.dailySpending.length} spending {recap.dailySpending.length === 1 ? 'day' : 'days'}
        </p>
      </section>

      <section className="grid grid-cols-2 gap-2" aria-label="Trip snapshot">
        <SnapshotCard icon={Users} label="Per person" value={`${trip.currencySymbol} ${stats.perPersonAvg.toLocaleString()}`} tone="indigo" />
        <SnapshotCard icon={TrendingUp} label="Per day" value={`${trip.currencySymbol} ${dailyAverage.toLocaleString()}`} tone="emerald" />
        <SnapshotCard icon={ReceiptText} label="Biggest expense" value={recap.biggestExpense?.title || 'No expenses yet'} detail={recap.biggestExpense ? `${trip.currencySymbol} ${recap.biggestExpense.amount.toLocaleString()}` : undefined} tone="amber" />
        <SnapshotCard icon={Crown} label="Top payer" value={topPayer?.participantName || 'No spending yet'} detail={topPayer ? `${trip.currencySymbol} ${topPayer.totalPaid.toLocaleString()}` : undefined} tone="violet" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold text-indigo-600">The money story</p>
            <h3 className="mt-0.5 text-base font-black text-slate-950">Spending by category</h3>
          </div>
          {recap.dominantCategory && (
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
              Top: {recap.dominantCategory.label}
            </span>
          )}
        </div>

        {recap.categories.length === 0 ? (
          <EmptyAnalytics message="Category insights will appear after the first expense." />
        ) : (
          <div className="grid grid-cols-[104px_1fr] items-center gap-4">
            <div
              className="relative mx-auto h-26 w-26 rounded-full"
              style={{ background: categoryGradient }}
              role="img"
              aria-label={`Category chart. ${recap.categories.map((category) => `${category.label} ${category.percentage.toFixed(0)} percent`).join(', ')}`}
            >
              <div className="absolute inset-[15px] flex flex-col items-center justify-center rounded-full bg-white text-center">
                <span className="text-2xl" aria-hidden="true">{recap.dominantCategory?.icon}</span>
                <span className="max-w-[62px] truncate text-xs font-black text-slate-800">{recap.dominantCategory?.percentage.toFixed(0)}%</span>
              </div>
            </div>
            <div className="min-w-0 space-y-2.5">
              {recap.categories.map((category) => (
                <div key={category.category} className="flex min-w-0 items-center justify-between gap-2 text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="truncate font-bold text-slate-700">{category.icon} {category.label}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-black text-slate-950">{category.percentage.toFixed(0)}%</p>
                    <p className="max-w-24 truncate font-semibold text-slate-500">{trip.currencySymbol}{category.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold text-emerald-600">Spending rhythm</p>
            <h3 className="mt-0.5 text-base font-black text-slate-950">Day by day</h3>
          </div>
          {recap.highestSpendDay && (
            <div className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-right">
              <p className="text-xs font-bold text-emerald-700">Peak day</p>
              <p className="text-xs font-black text-emerald-950">{recap.highestSpendDay.label}</p>
            </div>
          )}
        </div>

        {recap.dailySpending.length === 0 ? (
          <EmptyAnalytics message="Daily trends will appear as expenses are added." />
        ) : (
          <div className="overflow-x-auto pb-1 no-scrollbar">
            <div className="flex h-44 items-end gap-2" style={{ minWidth: `${Math.max(300, recap.dailySpending.length * 54)}px` }}>
              {recap.dailySpending.map((day) => {
                const height = Math.max(10, (day.amount / maxDaySpend) * 100);
                return (
                  <div key={day.date} className="flex min-w-[46px] flex-1 flex-col items-center justify-end gap-1.5" title={`${day.label}: ${trip.currencySymbol} ${day.amount.toLocaleString()}`}>
                    <p className="max-w-full truncate text-xs font-black text-slate-600">{trip.currencySymbol}{day.amount.toLocaleString()}</p>
                    <div className="flex h-24 w-full items-end rounded-lg bg-slate-100 p-1">
                      <div className="w-full rounded-md bg-emerald-500" style={{ height: `${height}%` }} />
                    </div>
                    <p className="whitespace-nowrap text-xs font-extrabold text-slate-500">{day.shortLabel}</p>
                    <p className="text-xs font-medium text-slate-400">{day.expenseCount} {day.expenseCount === 1 ? 'item' : 'items'}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold text-violet-600">The crew</p>
            <h3 className="mt-0.5 text-base font-black text-slate-950">Who has paid</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{trip.participants.length} people</span>
        </div>
        <div className="space-y-3">
          {balances.map((balance, index) => (
            <div key={balance.participantId} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar person={{ name: balance.participantName, avatar: balance.avatar, photoId: balance.photoId }} size="xs" />
                  <span className="truncate text-sm font-extrabold text-slate-800">{balance.participantName}</span>
                  {index === 0 && balance.totalPaid > 0 && <Crown className="h-4 w-4 shrink-0 text-amber-500" aria-label="Top payer" />}
                </div>
                <span className="shrink-0 text-sm font-black text-slate-950">{trip.currencySymbol} {balance.totalPaid.toLocaleString()}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-indigo-600" style={{ width: `${Math.max(balance.totalPaid > 0 ? 4 : 0, (balance.totalPaid / maxMemberSpend) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-indigo-600" />
          <h3 className="text-sm font-black text-slate-950">Trip pace</h3>
        </div>
        <div className="mt-3 grid grid-cols-3 divide-x divide-slate-200 text-center">
          <PaceMetric label="Trip days" value={durationDays.toLocaleString()} />
          <PaceMetric label="Spending days" value={recap.dailySpending.length.toLocaleString()} />
          <PaceMetric label="Expenses" value={stats.totalExpensesCount.toLocaleString()} />
        </div>
      </section>
    </div>
  );
}

const toneClasses = {
  indigo: 'bg-indigo-50 text-indigo-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  violet: 'bg-violet-50 text-violet-700',
};

function SnapshotCard({ icon: Icon, label, value, detail, tone }: {
  icon: typeof Users;
  label: string;
  value: string;
  detail?: string;
  tone: keyof typeof toneClasses;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
      <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses[tone]}`}><Icon className="h-4 w-4" /></div>
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-0.5 truncate text-sm font-black text-slate-950">{value}</p>
      {detail && <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{detail}</p>}
    </div>
  );
}

function EmptyAnalytics({ message }: { message: string }) {
  return <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">{message}</p>;
}

function PaceMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2">
      <p className="text-lg font-black text-slate-950">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );
}
