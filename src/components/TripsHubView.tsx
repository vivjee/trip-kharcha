'use client';

import React, { useState } from 'react';
import { Trip, UserProfile } from '@/types/trip';
import { getTripInitials } from '@/lib/trip-utils';
import { getTripDurationInDays, formatDateRange } from '@/lib/date-utils';
import { Plus, User, Calendar, Trash2, CheckCircle2, ChevronRight, Map } from 'lucide-react';
import Avatar from '@/components/Avatar';
import StoredPhoto from '@/components/StoredPhoto';
import AppButton from '@/components/AppButton';

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
  const activeTrips = trips.filter((trip) => trip.status === 'active');
  const completedTrips = trips.filter((trip) => trip.status === 'completed');
  const filteredTrips = trips.filter((trip) => filter === 'all' || trip.status === filter);

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-50 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] text-slate-900 md:p-6">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Map className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-black text-slate-950">My trips</h1>
              <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-xs font-extrabold text-indigo-700">v2</span>
            </div>
            <p className="text-xs font-medium text-slate-500">{trips.length} {trips.length === 1 ? 'trip' : 'trips'} saved on this device</p>
          </div>
        </div>

        <AppButton variant="secondary" size={userProfile ? 'standard' : 'icon'} onClick={onOpenCreateProfile} aria-label="Open profile">
          {userProfile ? <><Avatar person={userProfile} size="xs" /><span className="max-w-20 truncate">{userProfile.name}</span></> : <User className="h-5 w-5" />}
        </AppButton>
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
              {filter === 'active' ? 'No active trips' : filter === 'completed' ? 'No completed trips' : 'No trips yet'}
            </p>
            <p className="mt-1 text-xs text-slate-500">Create a trip to start tracking shared expenses.</p>
            <AppButton size="large" className="mt-4" onClick={onOpenNewTripModal}>
              <Plus className="h-5 w-5" /> Create trip
            </AppButton>
          </div>
        ) : (
          <div className="space-y-3 pb-2">
            {filteredTrips.map((trip) => {
              const tripSpending = trip.expenses.reduce((sum, expense) => sum + expense.amount, 0);
              const durationDays = getTripDurationInDays(trip);
              return (
                <article key={trip.id} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
                  <button type="button" onClick={() => onSelectTrip(trip.id)} className="w-full cursor-pointer p-4 pr-14 text-left">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-indigo-100 font-black text-indigo-700">
                        {trip.coverPhotoId && <StoredPhoto photoId={trip.coverPhotoId} alt={`${trip.name} cover`} />}
                        <span className={trip.coverPhotoId ? 'opacity-0' : ''}>{getTripInitials(trip.name)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <h2 className="truncate text-sm font-black text-slate-950">{trip.name}</h2>
                          <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${trip.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {trip.status === 'active' ? 'Active' : <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Done</span>}
                          </span>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                          <Calendar className="h-3.5 w-3.5" /> {formatDateRange(trip)} · {durationDays}d
                        </p>
                        <div className="mt-3 flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
                          <p className="text-xs font-semibold text-slate-500">{trip.participants.length} people · {trip.expenses.length} expenses</p>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-slate-500">Total spent</p>
                            <p className="text-sm font-black text-slate-950">{trip.currencySymbol} {tripSpending.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                  <div className="absolute right-2 top-2 flex flex-col gap-1">
                    <AppButton
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${trip.name}`}
                      onClick={() => onDeleteTrip(trip.id)}
                      className="hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </AppButton>
                    <div className="flex h-11 w-11 items-center justify-center text-slate-400"><ChevronRight className="h-5 w-5" /></div>
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
