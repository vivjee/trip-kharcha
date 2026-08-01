'use client';

import React from 'react';
import { Trip, CategoryType } from '@/types/trip';
import { getTripStats, calculateParticipantBalances } from '@/lib/debt-simplification';
import { getTripDurationInDays, formatDateRange } from '@/lib/date-utils';
import { TrendingUp, Award, DollarSign } from 'lucide-react';

interface AnalyticsViewProps {
  trip: Trip;
}

export default function AnalyticsView({ trip }: AnalyticsViewProps) {
  const stats = getTripStats(trip);
  const balances = calculateParticipantBalances(trip);
  const durationDays = getTripDurationInDays(trip);
  const dailyPace = Math.round(stats.totalSpent / durationDays);

  const categoryIcons: Record<string, string> = {
    food: '🍱 Food',
    transport: '🚕 Transport',
    stay: '🏨 Stay',
    activity: '🪂 Activity',
    shopping: '🛍️ Shopping',
    other: '🧾 Other',
  };

  const categoryColors: Record<string, string> = {
    food: 'bg-amber-500',
    transport: 'bg-blue-500',
    stay: 'bg-purple-500',
    activity: 'bg-emerald-500',
    shopping: 'bg-rose-500',
    other: 'bg-slate-500',
  };

  // Group total spending by category
  const categoryTotals: Record<CategoryType, number> = {
    food: 0,
    transport: 0,
    stay: 0,
    activity: 0,
    shopping: 0,
    other: 0,
  };

  trip.expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const categoriesSorted = Object.entries(categoryTotals)
    .filter(([, amount]) => amount > 0)
    .sort(([, firstAmount], [, secondAmount]) => secondAmount - firstAmount);

  return (
    <div className="p-4 space-y-4 animate-pop-in">
      {/* Title */}
      <div>
        <h2 className="text-base font-black text-slate-900 leading-tight">Trip Analytics</h2>
        <p className="text-[11px] text-slate-500 font-medium">
          {formatDateRange(trip)} • {durationDays} Days Duration
        </p>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1 text-slate-400">
            <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
              Total
            </span>
          </div>
          <p className="text-xs font-black text-slate-900 truncate">
            {trip.currencySymbol}{stats.totalSpent.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1 text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
              Daily
            </span>
          </div>
          <p className="text-xs font-black text-emerald-700 truncate">
            {trip.currencySymbol}{dailyPace.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1 text-slate-400">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
              Top
            </span>
          </div>
          <p className="text-xs font-black text-slate-900 flex items-center gap-0.5 truncate">
            <span>{stats.topSpender?.avatar}</span>
            <span className="truncate">{stats.topSpender?.participantName?.split(' ')[0] || 'N/A'}</span>
          </p>
        </div>
      </div>

      {/* Category Spending Breakdown */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
            Spending by Category
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">
            {categoriesSorted.length} Categories
          </span>
        </div>

        {categoriesSorted.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">No data to display.</p>
        ) : (
          <div className="space-y-3">
            {/* Visual Progress Stack Bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              {categoriesSorted.map(([cat, amt]) => {
                const pct = stats.totalSpent > 0 ? (amt / stats.totalSpent) * 100 : 0;
                return (
                  <div
                    key={cat}
                    style={{ width: `${pct}%` }}
                    className={`h-full ${categoryColors[cat] || 'bg-slate-400'} transition-all`}
                    title={`${cat}: ${pct.toFixed(1)}%`}
                  />
                );
              })}
            </div>

            {/* List */}
            <div className="space-y-2 pt-1">
              {categoriesSorted.map(([cat, amt]) => {
                const pct = stats.totalSpent > 0 ? (amt / stats.totalSpent) * 100 : 0;
                return (
                  <div key={cat} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${categoryColors[cat] || 'bg-slate-400'}`}
                      />
                      <span className="font-bold text-slate-800">{categoryIcons[cat] || cat}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {pct.toFixed(1)}%
                      </span>
                      <span className="font-extrabold text-slate-900">
                        {trip.currencySymbol} {amt.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Member Expenditure Breakdown */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
          Who Paid How Much
        </h3>

        <div className="space-y-2.5">
          {balances.map((b) => {
            const pct = stats.totalSpent > 0 ? (b.totalPaid / stats.totalSpent) * 100 : 0;
            return (
              <div key={b.participantId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <span>{b.avatar}</span>
                    <span>{b.participantName}</span>
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {trip.currencySymbol} {b.totalPaid.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
