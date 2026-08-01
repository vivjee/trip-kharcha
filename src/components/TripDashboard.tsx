'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trip, SimplifiedDebt } from '@/types/trip';
import { getTripStats, calculateParticipantBalances } from '@/lib/debt-simplification';
import { getTripDurationInDays, formatDateRange } from '@/lib/date-utils';
import { Plus, ArrowRightLeft, Users, CheckCircle, Sparkles, ArrowUpRight } from 'lucide-react';
import StoredPhoto from '@/components/StoredPhoto';
import PhotoPicker from '@/components/PhotoPicker';
import Avatar from '@/components/Avatar';

interface TripDashboardProps {
  trip: Trip;
  simplifiedDebts: SimplifiedDebt[];
  onOpenAddExpense: () => void;
  onOpenSettleUp: (debt?: SimplifiedDebt) => void;
  onNavigateTab: (tab: 'expenses' | 'balances') => void;
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
  const stats = getTripStats(trip);
  const balances = calculateParticipantBalances(trip);

  const durationDays = getTripDurationInDays(trip);
  const dailyPace = Math.round(stats.totalSpent / durationDays);

  const categoryIcons: Record<string, string> = {
    food: '🍱',
    transport: '🚕',
    stay: '🏨',
    activity: '🪂',
    shopping: '🛍️',
    other: '🧾',
  };

  const getParticipant = (id: string) => trip.participants.find((p) => p.id === id);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 350, damping: 25 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-4 space-y-4"
    >
      {/* Total Spent Hero Card */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl luxury-hero-gradient p-5 text-white shadow-xl shadow-indigo-950/20 border border-white/20"
        style={trip.accentColor ? { background: `linear-gradient(135deg, ${trip.accentColor}, #312e81)` } : undefined}
      >
        {trip.coverPhotoId && <StoredPhoto photoId={trip.coverPhotoId} alt={`${trip.name} cover`} priority className="opacity-55" />}
        {trip.coverPhotoId && <div className="absolute inset-0 bg-gradient-to-br from-slate-950/75 via-indigo-950/55 to-purple-950/75" />}
        <div className="relative z-10 flex items-center justify-between text-indigo-100 text-xs font-extrabold uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {formatDateRange(trip)} ({durationDays}d)
          </span>
          <span className="flex items-center gap-2"><span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-xs text-white font-bold border border-white/20">{stats.totalExpensesCount} Items</span><PhotoPicker compact kind="cover" photoId={trip.coverPhotoId} label="trip cover" onChange={onUpdateCover} /></span>
        </div>

        <div className="relative z-10 mt-2.5 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black tracking-tight text-white drop-shadow-sm">
              {trip.currencySymbol} {stats.totalSpent.toLocaleString()}
            </span>
            <span className="text-xs text-amber-300 font-extrabold tracking-wider">{trip.currency}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-indigo-200 uppercase font-extrabold block">Daily Pace</span>
            <span className="text-xs font-black text-amber-300">
              {trip.currencySymbol} {dailyPace.toLocaleString()} / day
            </span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-indigo-400/30">
          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/10">
            <p className="text-[10px] text-indigo-200 font-extrabold uppercase tracking-wider">Average / Person</p>
            <p className="text-xs font-black text-white mt-0.5">
              {trip.currencySymbol} {stats.perPersonAvg.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/10">
            <p className="text-[10px] text-indigo-200 font-extrabold uppercase tracking-wider">Top Spender</p>
            <p className="text-xs font-black text-white flex items-center gap-1 truncate mt-0.5">
              {stats.topSpender ? <Avatar person={{ name: stats.topSpender.participantName, avatar: stats.topSpender.avatar, photoId: stats.topSpender.photoId }} size="xs" /> : <span>👤</span>}
              <span className="truncate">{stats.topSpender?.participantName || 'N/A'}</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Primary Action Buttons */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onOpenAddExpense}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer border border-indigo-500/40"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Expense</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onOpenSettleUp()}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-extrabold text-xs shadow-2xs transition-all cursor-pointer"
        >
          <ArrowRightLeft className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
          <span>Settle Up</span>
        </motion.button>
      </motion.div>

      {/* Participants Avatar Carousel */}
      <motion.div variants={itemVariants} className="luxury-glass-card rounded-3xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            Participants ({trip.participants.length})
          </span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onOpenAddParticipant}
            className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-xl transition-all cursor-pointer border border-indigo-100 flex items-center gap-1"
          >
            <Users className="w-3 h-3 stroke-[2.5]" /> Manage
          </motion.button>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {balances.map((b) => (
            <motion.div
              whileHover={{ y: -2 }}
              key={b.participantId}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs"
            >
              <Avatar person={{ name: b.participantName, avatar: b.avatar, photoId: b.photoId }} size="sm" />
              <div>
                <p className="text-xs font-black text-slate-900 leading-tight">{b.participantName}</p>
                <p
                  className={`text-[10px] font-extrabold mt-0.5 ${
                    b.netBalance > 0
                      ? 'text-emerald-600'
                      : b.netBalance < 0
                      ? 'text-rose-600'
                      : 'text-slate-400'
                  }`}
                >
                  {b.netBalance > 0
                    ? `+ ${trip.currencySymbol} ${b.netBalance.toLocaleString()}`
                    : b.netBalance < 0
                    ? `− ${trip.currencySymbol} ${Math.abs(b.netBalance).toLocaleString()}`
                    : 'Settled'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Live Simplified Settlement Spotlight */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-50 border border-emerald-200/90 rounded-3xl p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wide">
              Who Owes Whom
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('balances')}
            className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-900 cursor-pointer flex items-center gap-0.5"
          >
            View All ({simplifiedDebts.length}) <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {simplifiedDebts.length === 0 ? (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-white/80 py-3 px-3.5 rounded-2xl border border-emerald-100 shadow-2xs">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Everyone is fully settled up! No payments pending.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {simplifiedDebts.slice(0, 2).map((debt) => (
              <motion.div
                whileHover={{ scale: 1.01 }}
                key={debt.id}
                className="flex items-center justify-between bg-white p-3 rounded-2xl border border-emerald-100 shadow-2xs"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-extrabold text-slate-900">{debt.from.name}</span>
                  <span className="text-slate-400 font-medium">pays</span>
                  <span className="font-extrabold text-slate-900">{debt.to.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-700">
                    {trip.currencySymbol} {debt.amount.toLocaleString()}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onOpenSettleUp(debt)}
                    className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold transition-all cursor-pointer shadow-2xs"
                  >
                    Settle
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Expenses List */}
      <motion.div variants={itemVariants} className="luxury-glass-card rounded-3xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-900">Recent Activity</span>
          <button
            onClick={() => onNavigateTab('expenses')}
            className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-0.5"
          >
            View All <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {trip.expenses.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">No expenses recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {trip.expenses.slice(0, 3).map((expense) => {
              const payer = getParticipant(expense.paidById);
              return (
                <motion.div
                  whileHover={{ y: -1 }}
                  key={expense.id}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-colors bg-white shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shadow-2xs">
                      {categoryIcons[expense.category] || '🧾'}
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900 leading-tight">{expense.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        Paid by <span className="font-bold text-slate-800">{payer?.name || 'Someone'}</span> •{' '}
                        {expense.includedParticipantIds.length} members
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    {trip.currencySymbol} {expense.amount.toLocaleString()}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
