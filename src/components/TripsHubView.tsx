'use client';

import React, { useState } from 'react';
import { Trip, UserProfile } from '@/types/trip';
import { getTripDurationInDays, formatDateRange } from '@/lib/date-utils';
import { getTripTypeMeta } from '@/lib/essentials-templates';
import { Plus, User, Calendar, Trash2, CheckCircle2, Map, Settings2 } from 'lucide-react';
import Avatar from '@/components/Avatar';
import AppButton from '@/components/AppButton';
import TripThumbnail from '@/components/TripThumbnail';

interface TripsHubViewProps {
  trips: Trip[];
  userProfile: UserProfile | null;
  onSelectTrip: (tripId: string) => void;
  onOpenNewTripModal: () => void;
  onOpenCreateProfile: () => void;
  onOpenSettings: () => void;
  onDeleteTrip: (tripId: string) => void;
}

export default function TripsHubView({
  trips,
  userProfile,
  onSelectTrip,
  onOpenNewTripModal,
  onOpenCreateProfile,
  onOpenSettings,
  onDeleteTrip,
}: TripsHubViewProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const activeTrips = trips.filter((trip) => trip.status === 'active' || trip.status === 'planning');
  const completedTrips = trips.filter((trip) => trip.status === 'completed');
  const filteredTrips = trips.filter((trip) => {
    if (filter === 'all') return true;
    if (filter === 'active') return trip.status === 'active' || trip.status === 'planning';
    return trip.status === 'completed';
  });

  return (
    <div className="relative mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col overflow-hidden px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] text-text-hi md:p-6">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Map className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-black text-slate-950">My trips</h1>
              <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-xs font-extrabold text-indigo-700">v3</span>
            </div>
            <p className="text-xs font-medium text-slate-500">{trips.length} {trips.length === 1 ? 'trip' : 'trips'} saved on this device</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AppButton variant="secondary" size="icon" onClick={onOpenSettings} aria-label="Open appearance settings">
            <Settings2 className="h-5 w-5" />
          </AppButton>
          <AppButton variant="secondary" size={userProfile ? 'standard' : 'icon'} onClick={onOpenCreateProfile} aria-label="Open profile">
            {userProfile ? (
              <>
                <Avatar person={userProfile} size="xs" />
                <span className="max-w-20 truncate">{userProfile.name}</span>
              </>
            ) : (
              <User className="h-5 w-5" />
            )}
          </AppButton>
        </div>
      </header>

      <div className="shrink-0 py-4">
        <div className="grid grid-cols-3 rounded-xl border border-slate-200 bg-white p-1" aria-label="Filter trips">
          {([
            ['all', `All (${trips.length})`],
            ['active', `Active (${activeTrips.length})`],
            ['completed', `Done (${completedTrips.length})`],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`min-h-10 rounded-lg px-2 text-xs font-extrabold transition-colors cursor-pointer ${filter === value ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain no-scrollbar">
        {filteredTrips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <Map className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm font-extrabold text-slate-800">
              {filter === 'active'
                ? 'No active trips'
                : filter === 'completed'
                ? 'No completed trips'
                : 'No trips yet'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Create a trip to start tracking shared expenses and gear.
            </p>
            <AppButton size="large" className="mt-4" onClick={onOpenNewTripModal}>
              <Plus className="h-5 w-5" /> Create trip
            </AppButton>
          </div>
        ) : (
          <div className="grid gap-3 pb-2 md:grid-cols-2 xl:grid-cols-3">
            {filteredTrips.map((trip) => {
              const tripSpending = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);
              const durationDays = getTripDurationInDays(trip);
              const tripTypeMeta = trip.tripType ? getTripTypeMeta(trip.tripType) : null;

              return (
                <article
                  key={trip.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectTrip(trip.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectTrip(trip.id);
                    }
                  }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:border-indigo-300 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {/* Hero Image Thumbnail */}
                  <div className="media-overlay relative h-60 w-full overflow-hidden">
                    <TripThumbnail
                      trip={trip}
                      size="hero"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />

                    {/* Multi-layer Dark Gradient Overlay for Maximum Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-black/35" />

                    {/* Top Bar Over Image: Badges & Delete Action */}
                    <div className="absolute top-3 inset-x-3.5 flex items-center justify-between gap-2 z-10">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold backdrop-blur-md ${
                            trip.status === 'completed'
                              ? 'bg-slate-800/90 text-white'
                              : 'bg-emerald-500/95 text-white'
                          }`}
                        >
                          {trip.status === 'completed' ? (
                            <><CheckCircle2 className="h-3 w-3" /> Done</>
                          ) : (
                            <><span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Active</>
                          )}
                        </span>

                        {tripTypeMeta && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-xs font-semibold text-white/95">
                            <span>{tripTypeMeta.emoji}</span>
                            <span>{tripTypeMeta.title}</span>
                          </span>
                        )}
                      </div>

                      {/* Delete button (with stopPropagation) */}
                      <button
                        type="button"
                        aria-label={`Delete ${trip.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTrip(trip.id);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white/80 transition-all hover:bg-rose-600 hover:text-white hover:border-transparent cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Bottom Content Over Image: Title, Date, and Overlaid Statistics */}
                    <div className="absolute bottom-3 inset-x-3.5 z-10">
                      <h2 className="text-base font-black text-white leading-tight tracking-tight drop-shadow-md truncate">
                        {trip.name}
                      </h2>

                      <p className="flex items-center gap-1.5 text-xs font-medium text-white/80 mt-0.5 drop-shadow-xs">
                        <Calendar className="h-3 w-3 text-white/70" />
                        <span>{formatDateRange(trip)}</span>
                        <span>·</span>
                        <span>{durationDays}d</span>
                      </p>

                      {/* Statistics Overlaid Directly Over Image */}
                      <div className="mt-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 p-2.5 text-white overlay-glass">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Records</p>
                            <p className="text-xs font-bold text-white mt-0.5">
                              {trip.participants.length} {trip.participants.length === 1 ? 'member' : 'members'} · {trip.expenses.length} {trip.expenses.length === 1 ? 'expense' : 'expenses'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Total Spent</p>
                            <p className="text-sm font-black text-white mt-0.5 font-amount">
                              {trip.currencySymbol} {tripSpending.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <footer className="shrink-0 border-t border-slate-200 pt-4">
        <AppButton size="large" fullWidth onClick={onOpenNewTripModal}>
          <Plus className="h-5 w-5" /> Create new trip
        </AppButton>
      </footer>
    </div>
  );
}
