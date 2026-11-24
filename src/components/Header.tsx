'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Trip } from '@/types/trip';
import { getTripDurationInDays, formatDateRange } from '@/lib/date-utils';
import { getTripTypeMeta } from '@/lib/essentials-templates';
import { ChevronDown, Check, Ellipsis, LayoutGrid, Plus } from 'lucide-react';
import AppButton from '@/components/AppButton';
import HeaderActionsSheet from '@/components/HeaderActionsSheet';
import TripThumbnail from '@/components/TripThumbnail';

interface HeaderProps {
  currentTrip: Trip;
  trips: Trip[];
  onSelectTrip: (tripId: string) => void;
  onCloseTrip: () => void;
  onSelectTab?: (tab: 'analytics' | 'activity') => void;
  onOpenNewTripModal: () => void;
  onOpenEditTripModal: () => void;
  onOpenAddExpense: () => void;
  onToggleTripStatus: () => void;
  onOpenShareModal: () => void;
  onOpenSyncModal: () => void;
  onOpenSettings: () => void;
  onDeleteTrip: (tripId: string) => void;
  onResetDemoData: () => void;
}

export default function Header({
  currentTrip,
  trips,
  onSelectTrip,
  onCloseTrip,
  onSelectTab,
  onOpenNewTripModal,
  onOpenEditTripModal,
  onOpenAddExpense,
  onToggleTripStatus,
  onOpenShareModal,
  onOpenSyncModal,
  onOpenSettings,
  onDeleteTrip,
  onResetDemoData,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const tripSwitcherRef = useRef<HTMLDivElement>(null);
  const durationDays = getTripDurationInDays(currentTrip);
  const dateRangeStr = formatDateRange(currentTrip);
  const currentTripMeta = getTripTypeMeta(currentTrip.tripType);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!tripSwitcherRef.current?.contains(event.target as Node)) setIsDropdownOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDropdownOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isDropdownOpen]);

  return (
    <header className="surface-card app-header sticky top-0 z-30 flex items-center justify-between rounded-none border-x-0 border-t-0 px-3 pb-2 pt-[calc(.5rem+env(safe-area-inset-top))] md:px-5">
      {/* Left: Trip Avatar & Switcher Dropdown */}
      <div ref={tripSwitcherRef} className="relative flex items-center gap-1.5 min-w-0">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-expanded={isDropdownOpen}
          aria-haspopup="menu"
          className="flex min-h-11 min-w-0 items-center gap-2 rounded-xl pr-2 text-left cursor-pointer group focus:outline-none"
        >
          <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent-1 text-xs font-black text-white shadow-xs ring-1 ring-black/10 dark:ring-white/10">
            <TripThumbnail trip={currentTrip} size="xs" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h1 className="max-w-[105px] truncate text-sm font-extrabold leading-tight text-text-hi transition-colors group-hover:text-accent-1 xs:max-w-[145px] sm:max-w-[190px] lg:max-w-[300px]">
                {currentTrip.name}
              </h1>
              <ChevronDown className={`w-3.5 h-3.5 text-text-low flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            <p className="max-w-[125px] xs:max-w-[180px] sm:max-w-[240px] lg:max-w-[420px] truncate text-[10px] sm:text-[11px] font-semibold text-text-low leading-tight flex items-center gap-1">
              <span className="truncate">{currentTripMeta.emoji} {currentTripMeta.title}</span>
              <span className="hidden sm:inline text-text-faint">•</span>
              <span className="hidden sm:inline shrink-0">{dateRangeStr} ({durationDays}d)</span>
            </p>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div role="menu" className="surface-card-strong absolute left-0 top-12 z-50 w-80 rounded-2xl p-2.5 animate-pop-in shadow-xl border border-line">
            {/* Header: All Trips Hub + New Trip */}
            <div className="flex items-center justify-between gap-1.5">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onCloseTrip();
                }}
                role="menuitem"
                className="flex min-h-10 items-center gap-2 rounded-xl px-2.5 text-left text-xs font-bold text-accent-1 transition-colors hover:bg-surface-deep cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>All Trips Hub</span>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onOpenNewTripModal();
                }}
                role="menuitem"
                className="flex min-h-10 items-center gap-1.5 rounded-xl px-2.5 text-left text-xs font-bold text-accent-1 transition-colors hover:bg-surface-deep cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>New Trip</span>
              </button>
            </div>

            <div className="my-1.5 border-t border-line" />

            <div className="flex items-center justify-between px-2.5 py-1">
              <span className="text-[10px] font-bold text-text-low uppercase tracking-wider">
                Switch Trip
              </span>
              <span className="text-[10px] font-semibold text-text-low">
                {trips.length} {trips.length === 1 ? 'trip' : 'trips'}
              </span>
            </div>

            {/* List of other trips as tiny cards with image thumbnails */}
            <div className="max-h-60 space-y-1 overflow-y-auto no-scrollbar py-0.5">
              {trips.map((trip) => {
                const isCurrent = trip.id === currentTrip.id;
                const meta = getTripTypeMeta(trip.tripType);
                const duration = getTripDurationInDays(trip);
                const tripSpending = trip.expenses.reduce((sum, exp) => sum + exp.amount, 0);

                return (
                  <button
                    key={trip.id}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSelectTrip(trip.id);
                    }}
                    role="menuitem"
                    className={`group flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-accent-1/15 ring-1 ring-accent-1/30 text-text-hi'
                        : 'hover:bg-surface-deep text-text-mid hover:text-text-hi'
                    }`}
                  >
                    {/* Tiny card image thumbnail */}
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-raised ring-1 ring-black/10 dark:ring-white/10 shadow-2xs">
                      <TripThumbnail trip={trip} size="sm" />
                    </div>

                    {/* Trip details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-bold text-text-hi leading-tight">
                          {trip.name}
                        </span>
                        {isCurrent && (
                          <span className="shrink-0 rounded bg-accent-1/20 px-1.5 py-0.2 text-[9px] font-bold text-accent-1">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-text-low mt-0.5 truncate">
                        <span>{meta.emoji} {meta.title}</span>
                        <span>•</span>
                        <span>{duration}d</span>
                        <span>•</span>
                        <span>{trip.currencySymbol} {tripSpending.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Right active check indicator */}
                    {isCurrent && (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-1 text-white shadow-xs mr-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="my-1.5 border-t border-line" />

            {/* Quick stats in dropdown */}
            <div className="p-2 space-y-1 text-[11px] text-text-low bg-surface-deep/40 rounded-xl">
              <div className="flex justify-between">
                <span>Current:</span>
                <span className="font-semibold text-text-hi truncate max-w-[150px]">{currentTrip.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Expenses:</span>
                <span className="font-semibold text-text-hi">{currentTrip.expenses.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Settlements:</span>
                <span className="font-semibold text-text-hi">{currentTrip.settlements.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex flex-shrink-0 items-center gap-1.5">
        {currentTrip.status === 'active' ? (
          <AppButton
            onClick={onToggleTripStatus}
            size="standard"
            variant="secondary"
            className="rounded-full bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 px-3 cursor-pointer"
            title="Click to complete trip"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs">Active</span>
          </AppButton>
        ) : (
          <AppButton
            onClick={onToggleTripStatus}
            size="standard"
            variant="primary"
            className="rounded-full px-3 cursor-pointer"
            title="Click to reopen trip"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span className="text-xs">Done</span>
          </AppButton>
        )}
        <AppButton
          size="icon"
          variant="primary"
          className="app-plus-button"
          onClick={onOpenAddExpense}
          disabled={currentTrip.status === 'completed'}
          title={currentTrip.status === 'completed' ? 'Reopen the trip to add an expense' : 'Add expense'}
          aria-label={currentTrip.status === 'completed' ? 'Reopen the trip to add an expense' : 'Add expense'}
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </AppButton>
        <AppButton
          size="icon"
          variant="secondary"
          onClick={() => setIsActionsOpen(true)}
          title="More trip actions"
          aria-label="More trip actions"
        >
          <Ellipsis className="h-5 w-5" />
        </AppButton>
      </div>

      <HeaderActionsSheet
        trip={currentTrip}
        isOpen={isActionsOpen}
        onClose={() => setIsActionsOpen(false)}
        onNavigateToTab={onSelectTab}
        onOpenNewTripModal={onOpenNewTripModal}
        onOpenEditTripModal={onOpenEditTripModal}
        onOpenShareModal={onOpenShareModal}
        onOpenSyncModal={onOpenSyncModal}
        onOpenSettings={onOpenSettings}
        onOpenTripsHub={onCloseTrip}
        onDeleteTrip={onDeleteTrip}
        onResetDemoData={onResetDemoData}
      />
    </header>
  );
}
