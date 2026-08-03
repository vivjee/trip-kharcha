'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Trip } from '@/types/trip';
import { getTripDurationInDays, formatDateRange } from '@/lib/date-utils';
import { getTripInitials } from '@/lib/trip-utils';
import { ChevronDown, Check, CheckCircle2, Ellipsis, LayoutGrid, Plus } from 'lucide-react';
import AppButton from '@/components/AppButton';
import HeaderActionsSheet from '@/components/HeaderActionsSheet';

interface HeaderProps {
  currentTrip: Trip;
  trips: Trip[];
  onSelectTrip: (tripId: string) => void;
  onCloseTrip: () => void;
  onOpenNewTripModal: () => void;
  onOpenEditTripModal: () => void;
  onOpenAddExpense: () => void;
  onOpenAddParticipant: () => void;
  onOpenActivity: () => void;
  onToggleTripStatus: () => void;
  onOpenShareModal: () => void;
  onOpenSyncModal: () => void;
  onDeleteTrip: (tripId: string) => void;
  onResetDemoData: () => void;
}

export default function Header({
  currentTrip,
  trips,
  onSelectTrip,
  onCloseTrip,
  onOpenNewTripModal,
  onOpenEditTripModal,
  onOpenAddExpense,
  onOpenAddParticipant,
  onOpenActivity,
  onToggleTripStatus,
  onOpenShareModal,
  onOpenSyncModal,
  onDeleteTrip,
  onResetDemoData,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const tripSwitcherRef = useRef<HTMLDivElement>(null);
  const durationDays = getTripDurationInDays(currentTrip);
  const dateRangeStr = formatDateRange(currentTrip);

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
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-3 pb-2 pt-[calc(.5rem+env(safe-area-inset-top))] shadow-2xs md:px-4">
      {/* Left: Trip Avatar & Switcher Dropdown */}
      <div ref={tripSwitcherRef} className="relative flex items-center gap-1.5 min-w-0">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-expanded={isDropdownOpen}
          aria-haspopup="menu"
          className="flex min-h-11 min-w-0 items-center gap-2 rounded-xl pr-2 text-left cursor-pointer group focus:outline-none"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-black text-white shadow-xs">
            {getTripInitials(currentTrip.name)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h1 className="max-w-[105px] truncate text-sm font-extrabold leading-tight text-slate-900 transition-colors group-hover:text-indigo-600 xs:max-w-[145px] sm:max-w-[190px]">
                {currentTrip.name}
              </h1>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            <p className="hidden max-w-[165px] truncate text-[11px] font-semibold text-slate-500 xs:block">
              {dateRangeStr} ({durationDays}d) • {currentTrip.participants.length} members
            </p>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div role="menu" className="absolute left-0 top-12 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-pop-in">
            {/* Return to Trips Hub */}
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                onCloseTrip();
              }}
              className="mb-1 flex min-h-11 w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 text-[13px] font-bold text-slate-800 transition-colors hover:bg-slate-200 cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 text-indigo-600" />
              <span>← All Trips Hub</span>
            </button>

            <div className="px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Your Trips ({trips.length})
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 my-1 no-scrollbar">
              {trips.map((t) => (
                <div
                  key={t.id}
                  className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-[13px] font-semibold transition-colors ${
                    t.id === currentTrip.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectTrip(t.id);
                      setIsDropdownOpen(false);
                    }}
                    className="flex min-h-10 flex-1 items-center gap-2 truncate text-left cursor-pointer"
                  >
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black text-[10px] flex items-center justify-center flex-shrink-0">
                      {getTripInitials(t.name)}
                    </span>
                    <span className="truncate">{t.name}</span>
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {t.id === currentTrip.id && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-1.5">
        <AppButton
          onClick={onToggleTripStatus}
          size="standard"
          variant={currentTrip.status === 'active' ? 'secondary' : 'primary'}
          className={`rounded-full px-3 ${
            currentTrip.status === 'active'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : ''
          }`}
          title="Click to toggle trip active/completed status"
        >
          {currentTrip.status === 'active' ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs">Active</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span className="text-xs">Done</span>
            </>
          )}
        </AppButton>
        <AppButton
          size="icon"
          variant="primary"
          onClick={onOpenAddExpense}
          disabled={currentTrip.status === 'completed'}
          title={currentTrip.status === 'active' ? 'Add expense' : 'Reopen the trip to add an expense'}
          aria-label={currentTrip.status === 'active' ? 'Add expense' : 'Reopen the trip to add an expense'}
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
        </AppButton>
        <AppButton
          size="icon"
          variant="ghost"
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
        onOpenNewTripModal={onOpenNewTripModal}
        onOpenEditTripModal={onOpenEditTripModal}
        onOpenAddParticipant={onOpenAddParticipant}
        onOpenActivity={onOpenActivity}
        onOpenShareModal={onOpenShareModal}
        onOpenSyncModal={onOpenSyncModal}
        onOpenTripsHub={onCloseTrip}
        onDeleteTrip={onDeleteTrip}
        onResetDemoData={onResetDemoData}
      />
    </header>
  );
}
