'use client';

import React, { useState } from 'react';
import { Trip, UserProfile } from '@/types/trip';
import { getTripInitials } from '@/lib/trip-utils';
import { getTripDurationInDays, formatDateRange } from '@/lib/date-utils';
import { Plus, User, Calendar, Trash2, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Avatar from '@/components/Avatar';
import StoredPhoto from '@/components/StoredPhoto';

interface TripsHubViewProps {
  trips: Trip[];
  userProfile: UserProfile | null;
  onSelectTrip: (tripId: string) => void;
  onOpenNewTripModal: () => void;
  onOpenCreateProfile: () => void;
  onDeleteTrip: (tripId: string) => void;
}

export default function TripsHubView({
  trips,
  userProfile,
  onSelectTrip,
  onOpenNewTripModal,
  onOpenCreateProfile,
  onDeleteTrip,
}: TripsHubViewProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const activeTrips = trips.filter((t) => t.status === 'active');
  const completedTrips = trips.filter((t) => t.status === 'completed');

  const filteredTrips = trips.filter((t) => {
    if (filter === 'active') return t.status === 'active';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  // Total Spending across all trips
  const grandTotalSpent = trips.reduce((acc, t) => {
    const tripTotal = t.expenses.reduce((eAcc, e) => eAcc + e.amount, 0);
    return acc + tripTotal;
  }, 0);

  return (
    <div className="w-full h-full min-h-0 overflow-hidden bg-slate-900 text-slate-100 flex flex-col justify-between p-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6 relative select-none">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/60 pointer-events-none" />

      {/* Top Bar Header */}
      <div className="relative z-10 flex items-center justify-between pt-2 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg shadow-lg shadow-indigo-950/50 border border-white/20">
            🏔️
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-wide flex items-center gap-1.5">
              <span>My Trips Hub</span>
              <span className="text-[9px] font-extrabold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-400/30">
                v2
              </span>
            </h1>
            <p className="text-[10px] font-semibold text-slate-400">
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'} recorded • रू {grandTotalSpent.toLocaleString('ne-NP')} total
            </p>
          </div>
        </div>

        {userProfile ? (
          <button
            onClick={onOpenCreateProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Avatar person={userProfile} size="xs" />
            <span>{userProfile.name}</span>
          </button>
        ) : (
          <button
            onClick={onOpenCreateProfile}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold border border-purple-400/40 hover:bg-purple-500/40 transition-all cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Setup Profile</span>
          </button>
        )}
      </div>

      {/* Center Content */}
      <div className="relative z-10 min-h-0 flex-1 my-4 space-y-4 overflow-y-auto overscroll-contain no-scrollbar">
        {/* Filter Badges & Quick Action Header */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center bg-slate-800/80 p-1 rounded-2xl border border-slate-700/80">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({trips.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filter === 'active'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active ({activeTrips.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filter === 'completed'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Completed ({completedTrips.length})
            </button>
          </div>

          <button
            onClick={onOpenNewTripModal}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-950/50 border border-white/20 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Trip</span>
          </button>
        </div>

        {/* Trips List Cards */}
        {filteredTrips.length === 0 ? (
          <div className="py-12 text-center bg-slate-800/40 rounded-3xl border border-slate-800 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400 text-2xl">
              🗺️
            </div>
            <p className="text-xs font-bold text-slate-300">
              {filter === 'active'
                ? 'No active trips right now.'
                : filter === 'completed'
                ? 'No completed trips in archive.'
                : 'No trips created yet.'}
            </p>
            <button
              onClick={onOpenNewTripModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Start New Trip
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTrips.map((t) => {
              const tripSpending = t.expenses.reduce((sum, e) => sum + e.amount, 0);
              const durationDays = getTripDurationInDays(t);
              const dateRangeStr = formatDateRange(t);

              return (
                <motion.div
                  key={t.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectTrip(t.id)}
                  className="w-full bg-slate-800/80 hover:bg-slate-800/95 border border-slate-700/80 rounded-3xl p-4 transition-all cursor-pointer shadow-xl relative overflow-hidden group"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Initial Avatar Badge + Info */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="relative overflow-hidden w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white font-black text-base flex items-center justify-center shadow-md border border-white/20 flex-shrink-0">
                        {t.coverPhotoId && <StoredPhoto photoId={t.coverPhotoId} alt={`${t.name} cover`} />}
                        <span className={t.coverPhotoId ? 'opacity-0' : ''}>{getTripInitials(t.name)}</span>
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-white truncate group-hover:text-indigo-300 transition-colors">
                            {t.name}
                          </h3>
                          {t.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                              </span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-700 text-slate-300 border border-slate-600 flex-shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-slate-400" />
                              Completed
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-indigo-400" />
                            {dateRangeStr} ({durationDays}d)
                          </span>
                        </p>

                        {/* Members Stack & Spending */}
                        <div className="pt-2 flex items-center justify-between border-t border-slate-700/60 mt-2">
                          <div className="flex items-center gap-1">
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {t.participants.slice(0, 4).map((p) => (
                                <span
                                  key={p.id}
                                  className="inline-block w-6 h-6 rounded-full bg-slate-700 border border-slate-600 text-center text-xs leading-5 shadow-2xs"
                                  title={p.name}
                                >
                                  <Avatar person={p} size="xs" />
                                </span>
                              ))}
                            </div>
                            <span className="text-[10px] font-extrabold text-slate-400 ml-1">
                              {t.participants.length} {t.participants.length === 1 ? 'member' : 'members'}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-medium uppercase">Total Spent</span>
                            <span className="text-xs font-black text-amber-400">
                              रू {tripSpending.toLocaleString('ne-NP')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arrow / Actions */}
                    <div className="flex items-center gap-1 self-center pl-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTrip(t.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-xl hover:bg-slate-700/50 transition-colors cursor-pointer"
                        title="Delete Trip"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="w-8 h-8 rounded-xl bg-slate-700/60 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white flex items-center justify-center transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="relative z-10 pt-3 border-t border-slate-800">
        <button
          onClick={onOpenNewTripModal}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-xl shadow-indigo-950/60 border border-white/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create New Trip
        </button>
      </div>
    </div>
  );
}
