'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Crown,
  ReceiptText,
  Sparkles,
  Users,
  WalletCards,
} from 'lucide-react';
import type { SimplifiedDebt, Trip } from '@/types/trip';
import { calculateParticipantBalances, getSettlementProgress, getTripStats } from '@/lib/debt-simplification';
import { formatDateRange, getTripDurationInDays } from '@/lib/date-utils';
import { getCategoryConicGradient, getTripRecap } from '@/lib/trip-recap';
import Avatar from '@/components/Avatar';
import PhotoPicker from '@/components/PhotoPicker';
import StoredPhoto from '@/components/StoredPhoto';
import AppButton from '@/components/AppButton';

interface CompletedTripOverviewProps {
  trip: Trip;
  simplifiedDebts: SimplifiedDebt[];
  onOpenSettleUp: (debt?: SimplifiedDebt) => void;
  onNavigateTab: (tab: 'expenses' | 'balances' | 'analytics') => void;
  onUpdateCover: (photoId: string | undefined, accentColor?: string) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 320, damping: 26 } },
};

export default function CompletedTripOverview({
  trip,
  simplifiedDebts,
  onOpenSettleUp,
  onNavigateTab,
  onUpdateCover,
}: CompletedTripOverviewProps) {
  const stats = getTripStats(trip);
  const recap = getTripRecap(trip);
  const balances = calculateParticipantBalances(trip).sort((first, second) => second.totalPaid - first.totalPaid);
  const settlement = getSettlementProgress(trip, simplifiedDebts);
  const durationDays = getTripDurationInDays(trip);
  const dailyAverage = Math.round(stats.totalSpent / durationDays);
  const maxDaySpend = Math.max(...recap.dailySpending.map((day) => day.amount), 1);
  const maxMemberSpend = Math.max(...balances.map((balance) => balance.totalPaid), 1);
  const categoryGradient = getCategoryConicGradient(recap.categories);
  const topPayer = balances[0];

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
      initial="hidden"
      animate="show"
      className="p-4 space-y-4 pb-6"
    >
      <motion.section
        variants={itemVariants}
        className="relative min-h-[320px] overflow-hidden rounded-2xl bg-slate-950 text-white shadow-md"
        style={!trip.coverPhotoId && trip.accentColor ? { background: `linear-gradient(145deg, ${trip.accentColor}, #0f172a 72%)` } : undefined}
      >
        {trip.coverPhotoId && <StoredPhoto photoId={trip.coverPhotoId} alt={`${trip.name} memory cover`} priority />}
        <div className={`absolute inset-0 ${trip.coverPhotoId ? 'bg-gradient-to-b from-slate-950/65 via-slate-950/25 to-slate-950/90' : 'bg-indigo-950/70'}`} />

        <div className="relative z-10 flex min-h-[320px] flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-slate-950/65 px-3 text-xs font-black text-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" /> Trip complete
            </div>
            <PhotoPicker compact kind="cover" photoId={trip.coverPhotoId} label="trip cover" onChange={onUpdateCover} />
          </div>

          {!trip.coverPhotoId && (
            <div className="self-end rounded-xl bg-slate-950/55 px-5 py-3 text-center">
              <div className="text-5xl" aria-hidden="true">{trip.coverImageEmoji || '✈️'}</div>
              <p className="mt-2 text-xs font-bold text-white/75">Add a photo to keep this memory vivid</p>
            </div>
          )}

          <div>
            <div className="mb-3 flex items-center gap-1.5 text-xs font-extrabold text-white/80">
              <CalendarDays className="h-3.5 w-3.5 text-amber-300" />
              {formatDateRange(trip)} · {durationDays} {durationDays === 1 ? 'day' : 'days'}
            </div>
            <p className="text-xs font-extrabold text-amber-300">A trip to remember</p>
            <h1 className="mt-1 line-clamp-2 text-[1.75rem] font-black leading-tight tracking-tight">{trip.name}</h1>
            {trip.description && <p className="mt-2 line-clamp-2 max-w-[90%] text-xs font-medium leading-relaxed text-white/75">{trip.description}</p>}

            <div className="mt-4 rounded-xl bg-slate-950/70 p-4">
              <p className="text-xs font-bold text-white/70">Final trip spend</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <p className="text-3xl font-black tracking-tight text-white">
                  <span className="mr-1 text-lg text-amber-300">{trip.currencySymbol}</span>{stats.totalSpent.toLocaleString()}
                </p>
                <p className="pb-1 text-xs font-extrabold text-white/70">{stats.totalExpensesCount} expenses</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={itemVariants} className="grid grid-cols-2 gap-3" aria-label="Final trip snapshot">
        {[
          { label: 'Per person', value: `${trip.currencySymbol} ${stats.perPersonAvg.toLocaleString()}`, icon: Users, color: 'text-indigo-700 bg-indigo-50' },
          { label: 'Daily average', value: `${trip.currencySymbol} ${dailyAverage.toLocaleString()}`, icon: Clock3, color: 'text-emerald-700 bg-emerald-50' },
          { label: 'Biggest expense', value: recap.biggestExpense?.title || 'No expenses', icon: ReceiptText, color: 'text-amber-700 bg-amber-50' },
          { label: 'Top payer', value: topPayer?.participantName || 'No one yet', icon: Crown, color: 'text-violet-700 bg-violet-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
            <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${color}`}><Icon className="h-4 w-4" /></div>
            <p className="text-xs font-bold text-slate-500">{label}</p>
            <p className="mt-0.5 truncate text-sm font-black text-slate-900">{value}</p>
          </div>
        ))}
      </motion.section>

      {recap.categories.length > 0 && (
        <motion.section variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600">The money story</p>
              <h2 className="mt-0.5 text-base font-black text-slate-950">Where it all went</h2>
            </div>
            <AppButton type="button" onClick={() => onNavigateTab('analytics')} variant="ghost" size="compact">
              Full analytics <ArrowRight className="h-3.5 w-3.5" />
            </AppButton>
          </div>

          <div className="grid grid-cols-[112px_1fr] items-center gap-4">
            <div className="relative mx-auto h-28 w-28 rounded-full" style={{ background: categoryGradient }} role="img" aria-label={`Donut chart. ${recap.categories.map((category) => `${category.label} ${category.percentage.toFixed(0)} percent`).join(', ')}`}>
              <div className="absolute inset-[16px] flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
                <span className="text-[9px] font-black uppercase text-slate-400">Top</span>
                <span className="text-xl" aria-hidden="true">{recap.dominantCategory?.icon}</span>
                <span className="max-w-[64px] truncate text-[10px] font-black text-slate-800">{recap.dominantCategory?.label}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {recap.categories.slice(0, 4).map((category) => (
                <div key={category.category} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="truncate font-bold text-slate-700">{category.icon} {category.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-950">{category.percentage.toFixed(0)}%</p>
                    <p className="text-[9px] font-bold text-slate-400">{trip.currencySymbol}{category.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {recap.dailySpending.length > 0 && (
        <motion.section variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">Spending rhythm</p>
              <h2 className="mt-0.5 text-base font-black text-slate-950">Day by day</h2>
            </div>
            {recap.highestSpendDay && (
              <div className="rounded-xl bg-emerald-50 px-2.5 py-1.5 text-right">
                <p className="text-[8px] font-black uppercase text-emerald-600">Peak day</p>
                <p className="text-[10px] font-black text-emerald-950">{recap.highestSpendDay.label}</p>
              </div>
            )}
          </div>

          <div className="overflow-x-auto pb-1 no-scrollbar">
            <div className="flex h-40 items-end gap-2" style={{ minWidth: `${Math.max(320, recap.dailySpending.length * 48)}px` }}>
              {recap.dailySpending.map((day) => {
                const height = Math.max(12, (day.amount / maxDaySpend) * 100);
                return (
                  <div key={day.date} className="flex min-w-[42px] flex-1 flex-col items-center justify-end gap-1.5" title={`${day.label}: ${trip.currencySymbol} ${day.amount.toLocaleString()}`}>
                    <p className="text-[9px] font-black text-slate-600">{trip.currencySymbol}{day.amount.toLocaleString()}</p>
                    <div className="flex h-24 w-full items-end rounded-xl bg-slate-100 p-1">
                      <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 0.65, delay: 0.18 }} className="w-full rounded-lg bg-gradient-to-t from-emerald-600 to-teal-400" />
                    </div>
                    <p className="whitespace-nowrap text-[9px] font-extrabold text-slate-500">{day.shortLabel}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>
      )}

      <motion.section variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-600">The crew</p>
            <h2 className="mt-0.5 text-base font-black text-slate-950">Who covered the trip</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black text-slate-500">{trip.participants.length} people</span>
        </div>
        <div className="space-y-3">
          {balances.map((balance, index) => (
            <div key={balance.participantId} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Avatar person={{ name: balance.participantName, avatar: balance.avatar, photoId: balance.photoId }} size="xs" />
                  <span className="truncate text-xs font-extrabold text-slate-800">{balance.participantName}</span>
                  {index === 0 && balance.totalPaid > 0 && <Crown className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label="Top payer" />}
                </div>
                <span className="text-xs font-black text-slate-950">{trip.currencySymbol} {balance.totalPaid.toLocaleString()}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500" style={{ width: `${Math.max(balance.totalPaid > 0 ? 4 : 0, (balance.totalPaid / maxMemberSpend) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={itemVariants} className={`rounded-2xl border p-4 ${simplifiedDebts.length === 0 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
        <div className="flex items-start gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${simplifiedDebts.length === 0 ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
            {simplifiedDebts.length === 0 ? <CheckCircle2 className="h-5 w-5" /> : <WalletCards className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-[10px] font-black uppercase tracking-[0.16em] ${simplifiedDebts.length === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>Settlement close</p>
            <h2 className="mt-0.5 text-base font-black text-slate-950">{simplifiedDebts.length === 0 ? 'Everyone is settled' : `${simplifiedDebts.length} payment${simplifiedDebts.length === 1 ? '' : 's'} still open`}</h2>
            <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-600">
              {simplifiedDebts.length === 0
                ? 'The books are closed. Keep this recap as the final memory of the trip.'
                : `${settlement.percentage}% settled so far · ${trip.currencySymbol} ${settlement.pending.toLocaleString()} remains to be paid.`}
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <AppButton type="button" onClick={() => onNavigateTab('balances')} variant="secondary" size="standard" fullWidth>
            View balances <ArrowRight className="h-3.5 w-3.5" />
          </AppButton>
          {simplifiedDebts.length > 0 && (
            <AppButton type="button" onClick={() => onOpenSettleUp(simplifiedDebts[0])} variant="success" size="standard" fullWidth>Settle now</AppButton>
          )}
        </div>
      </motion.section>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <AppButton type="button" onClick={() => onNavigateTab('expenses')} size="large" fullWidth>
          <ReceiptText className="h-4 w-4" /> All expenses
        </AppButton>
        <AppButton type="button" onClick={() => onNavigateTab('analytics')} variant="secondary" size="large" fullWidth>
          <BarChart3 className="h-4 w-4 text-indigo-600" /> Analytics
        </AppButton>
      </motion.div>

      <motion.p variants={itemVariants} className="flex items-center justify-center gap-1.5 pb-1 text-center text-[10px] font-bold text-slate-400">
        <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Tap “Done” in the header if you need to reopen this trip.
      </motion.p>
    </motion.div>
  );
}
