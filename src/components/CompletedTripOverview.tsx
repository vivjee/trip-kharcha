'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, CalendarDays, CheckCircle2, Crown, ReceiptText, Sparkles, Users, WalletCards } from 'lucide-react';
import type { SimplifiedDebt, Trip } from '@/types/trip';
import { calculateParticipantBalances, getSettlementProgress, getTripStats } from '@/lib/debt-simplification';
import { formatDateRange, getTripDurationInDays } from '@/lib/date-utils';
import { getTripRecap } from '@/lib/trip-recap';
import AppButton from '@/components/AppButton';
import PhotoPicker from '@/components/PhotoPicker';
import StoredPhoto from '@/components/StoredPhoto';

interface CompletedTripOverviewProps {
  trip: Trip;
  simplifiedDebts: SimplifiedDebt[];
  onOpenSettleUp: (debt?: SimplifiedDebt) => void;
  onNavigateTab: (tab: 'expenses' | 'balances' | 'analytics') => void;
  onUpdateCover: (photoId: string | undefined, accentColor?: string) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
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
  const topPayer = stats.totalSpent > 0 ? balances[0] : undefined;

  const highlights = [
    { label: 'Per person', value: `${trip.currencySymbol} ${stats.perPersonAvg.toLocaleString()}`, icon: Users, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'Biggest expense', value: recap.biggestExpense?.title || 'No expenses', icon: ReceiptText, color: 'bg-amber-50 text-amber-700' },
    { label: 'Top payer', value: topPayer?.participantName || 'No one yet', icon: Crown, color: 'bg-violet-50 text-violet-700' },
  ];

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
      initial="hidden"
      animate="show"
      className="space-y-4 p-4 pb-6"
    >
      <motion.section
        variants={itemVariants}
        className="relative min-h-[280px] overflow-hidden rounded-2xl bg-slate-950 text-white shadow-md"
        style={!trip.coverPhotoId && trip.accentColor ? { background: `linear-gradient(145deg, ${trip.accentColor}, #0f172a 72%)` } : undefined}
      >
        {trip.coverPhotoId && <StoredPhoto photoId={trip.coverPhotoId} alt={`${trip.name} memory cover`} priority />}
        <div className={`absolute inset-0 ${trip.coverPhotoId ? 'bg-gradient-to-b from-slate-950/70 via-slate-950/25 to-slate-950/95' : 'bg-indigo-950/70'}`} />
        <div className="relative z-10 flex min-h-[280px] flex-col justify-between p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-slate-950/65 px-3 text-xs font-black text-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" /> Trip complete
            </div>
            <PhotoPicker compact kind="cover" photoId={trip.coverPhotoId} label="trip cover" onChange={onUpdateCover} />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-extrabold text-white/80">
              <CalendarDays className="h-3.5 w-3.5 text-amber-300" />
              {formatDateRange(trip)} · {durationDays} {durationDays === 1 ? 'day' : 'days'}
            </div>
            <h1 className="line-clamp-2 text-2xl font-black leading-tight tracking-tight">{trip.name}</h1>
            <div className="mt-4 rounded-xl bg-slate-950/70 p-4">
              <p className="text-xs font-bold text-white/70">Final trip spend</p>
              <div className="mt-1 flex min-w-0 items-end justify-between gap-3">
                <p className="min-w-0 truncate text-3xl font-black tracking-tight"><span className="mr-1 text-lg text-amber-300">{trip.currencySymbol}</span>{stats.totalSpent.toLocaleString()}</p>
                <p className="shrink-0 pb-1 text-xs font-extrabold text-white/70">{stats.totalExpensesCount} {stats.totalExpensesCount === 1 ? 'expense' : 'expenses'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={itemVariants} className="grid grid-cols-3 gap-2" aria-label="Final trip highlights">
        {highlights.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
            <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${color}`}><Icon className="h-4 w-4" /></div>
            <p className="text-xs font-bold text-slate-500">{label}</p>
            <p className="mt-0.5 truncate text-sm font-black text-slate-900" title={value}>{value}</p>
          </div>
        ))}
      </motion.section>

      <motion.section variants={itemVariants} className={`rounded-2xl border p-4 ${simplifiedDebts.length === 0 ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
        <div className="flex items-start gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white ${simplifiedDebts.length === 0 ? 'bg-emerald-600' : 'bg-amber-500'}`}>
            {simplifiedDebts.length === 0 ? <CheckCircle2 className="h-5 w-5" /> : <WalletCards className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-black ${simplifiedDebts.length === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>Settlement status</p>
            <h2 className="mt-0.5 text-base font-black text-slate-950">{simplifiedDebts.length === 0 ? 'Everyone is settled' : `${simplifiedDebts.length} payment${simplifiedDebts.length === 1 ? '' : 's'} still open`}</h2>
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
              {simplifiedDebts.length === 0
                ? 'The books are closed.'
                : `${settlement.percentage}% settled · ${trip.currencySymbol} ${settlement.pending.toLocaleString()} remains.`}
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
        <AppButton type="button" onClick={() => onNavigateTab('expenses')} size="large" fullWidth><ReceiptText className="h-4 w-4" /> Expenses</AppButton>
        <AppButton type="button" onClick={() => onNavigateTab('analytics')} variant="secondary" size="large" fullWidth><BarChart3 className="h-4 w-4 text-indigo-600" /> Analytics</AppButton>
      </motion.div>

      <motion.p variants={itemVariants} className="flex items-center justify-center gap-1.5 pb-1 text-center text-xs font-bold text-slate-500">
        <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Reopen from the Done status if the trip continues.
      </motion.p>
    </motion.div>
  );
}
