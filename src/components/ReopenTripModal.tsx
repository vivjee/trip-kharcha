'use client';

import React from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';
import type { Trip } from '@/types/trip';

interface ReopenTripModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ReopenTripModal({ trip, isOpen, onClose, onConfirm }: ReopenTripModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/65 backdrop-blur-sm md:items-center md:p-4 animate-pop-in">
      <div role="dialog" aria-modal="true" aria-labelledby="reopen-trip-title" className="w-full max-w-md overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl md:rounded-3xl">
        <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 id="reopen-trip-title" className="text-sm font-black text-slate-950">Reopen {trip.name}?</h2>
              <p className="text-[10px] font-semibold text-amber-800">This changes the trip back to Active</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close reopen warning" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-2xs cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-xs font-medium leading-relaxed text-slate-600">
            The completed recap will switch back to the live trip dashboard. You’ll be able to add expenses and manage members again, and the saved end date will be cleared.
          </p>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-[11px] font-semibold text-slate-600">
            Your expenses, settlements, cover photo, and trip history will stay unchanged.
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="min-h-12 w-2/5 rounded-xl border border-slate-300 text-xs font-black text-slate-700 cursor-pointer">Keep Done</button>
            <button type="button" onClick={onConfirm} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 text-xs font-black text-white shadow-md cursor-pointer">
              <RotateCcw className="h-4 w-4" /> Reopen Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
