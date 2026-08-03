'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Trip } from '@/types/trip';
import { getTripDurationInDays, formatDateRange } from '@/lib/date-utils';
import { getTripInitials } from '@/lib/trip-utils';
import { ChevronDown, Plus, Check, CheckCircle2, Share2, Trash2, RefreshCw, ArchiveRestore, LayoutGrid, PencilLine } from 'lucide-react';

interface HeaderProps {
  currentTrip: Trip;
  trips: Trip[];
  onSelectTrip: (tripId: string) => void;
  onCloseTrip: () => void;
  onOpenNewTripModal: () => void;
  onOpenEditTripModal: () => void;
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
  onToggleTripStatus,
  onOpenShareModal,
  onOpenSyncModal,
  onDeleteTrip,
  onResetDemoData,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 md:px-4 pb-2 pt-[calc(.5rem+env(safe-area-inset-top))] z-30 flex items-center justify-between shadow-2xs">
      {/* Left: Trip Avatar & Switcher Dropdown */}
      <div ref={tripSwitcherRef} className="relative flex items-center gap-1.5 min-w-0">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-expanded={isDropdownOpen}
          aria-haspopup="menu"
          className="flex items-center gap-2 text-left cursor-pointer group focus:outline-none min-w-0"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-xs border border-white/20 flex-shrink-0">
            {getTripInitials(currentTrip.name)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h1 className="font-extrabold text-slate-900 text-xs leading-tight group-hover:text-indigo-600 transition-colors max-w-[95px] xs:max-w-[130px] sm:max-w-[180px] truncate">
                {currentTrip.name}
              </h1>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            <p className="text-[10px] text-slate-500 font-semibold truncate max-w-[120px] xs:max-w-[160px] hidden xs:block">
              {dateRangeStr} ({durationDays}d) • {currentTrip.participants.length} members
            </p>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute left-0 top-11 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-pop-in">
            {/* Return to Trips Hub */}
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                onCloseTrip();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer mb-1 border border-slate-200/80"
            >
              <LayoutGrid className="w-4 h-4 text-indigo-600" />
              <span>← All Trips Hub</span>
            </button>

            <button
              onClick={() => {
                setIsDropdownOpen(false);
                onOpenEditTripModal();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-bold transition-all cursor-pointer mb-1"
            >
              <PencilLine className="w-4 h-4 text-indigo-600" />
              <span>Edit Trip Details</span>
            </button>

            <div className="text-[10px] font-extrabold text-slate-400 px-3 py-1 uppercase tracking-wider">
              Your Trips ({trips.length})
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 my-1 no-scrollbar">
              {trips.map((t) => (
                <div
                  key={t.id}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
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
                    className="flex items-center gap-2 truncate flex-1 text-left cursor-pointer"
                  >
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-black text-[10px] flex items-center justify-center flex-shrink-0">
                      {getTripInitials(t.name)}
                    </span>
                    <span className="truncate">{t.name}</span>
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {t.id === currentTrip.id && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    {trips.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTrip(t.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Delete Trip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-1.5 mt-1 space-y-1">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onOpenNewTripModal();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Create New Trip
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onResetDemoData();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-[11px] font-semibold transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Clear All Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Controls: Sync, Share, Status Badge & Close Trip Button */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Offline backup button */}
        <button
          onClick={onOpenSyncModal}
          className="w-8 h-8 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer border border-indigo-100"
          title="Offline Trip Backup"
          aria-label="Offline Trip Backup"
        >
          <ArchiveRestore className="w-4 h-4" />
        </button>

        {/* Share Button */}
        <button
          onClick={onOpenShareModal}
          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Share Trip Summary"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Status Badge */}
        <button
          onClick={onToggleTripStatus}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer border active:scale-95 shadow-2xs ${
            currentTrip.status === 'active'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-xs'
          }`}
          title="Click to toggle trip active/completed status"
        >
          {currentTrip.status === 'active' ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Active</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Done</span>
            </>
          )}
        </button>

        {/* Responsive Close / Exit Trip Button */}
        <button
          onClick={onCloseTrip}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs"
          title="Exit to My Trips Hub"
          aria-label="Exit to My Trips Hub"
        >
          <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </header>
  );
}
