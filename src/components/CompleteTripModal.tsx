'use client';

import React, { useState } from 'react';
import { Trip, SimplifiedDebt } from '@/types/trip';
import { getTripStats } from '@/lib/debt-simplification';
import { X, CheckCircle2, Calendar, AlertTriangle, Sparkles, Flag } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CompleteTripModalProps {
  trip: Trip;
  simplifiedDebts: SimplifiedDebt[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmComplete: (endDate: string) => void;
}

export default function CompleteTripModal({
  trip,
  simplifiedDebts,
  isOpen,
  onClose,
  onConfirmComplete,
}: CompleteTripModalProps) {
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  if (!isOpen) return null;

  const stats = getTripStats(trip);

  const handleComplete = () => {
    onConfirmComplete(endDate);

    // Celebratory confetti
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-pop-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-900 to-purple-900 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              <Flag className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-black leading-tight">Complete {trip.name}</h2>
              <p className="text-[10px] text-indigo-200 font-medium">Finalize trip & record end date</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto no-scrollbar">
          {/* Summary Spotlight Card */}
          <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Trip Expenditure Summary
              </span>
              <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                {stats.totalExpensesCount} Expenses Logged
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[9px] font-extrabold uppercase text-slate-400">Total Expenditure</span>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {trip.currencySymbol} {stats.totalSpent.toLocaleString()}
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[9px] font-extrabold uppercase text-slate-400">Top Spender</span>
                <p className="text-xs font-extrabold text-slate-900 mt-0.5 flex items-center gap-1 truncate">
                  <span>{stats.topSpender?.avatar}</span>
                  <span className="truncate">{stats.topSpender?.participantName}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Pending Debts Warning or All Settled Badge */}
          {simplifiedDebts.length > 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900">
                  {simplifiedDebts.length} Unsettled Payments Remaining
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5 font-medium">
                  You can mark the trip complete now and settle payments anytime later in the Balances tab.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>All debts are 100% settled up! Perfect time to finish.</span>
            </div>
          )}

          {/* End Date Selection */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Select Trip End Date
              </label>
              <span className="text-[10px] font-bold text-slate-400">Defaults to Today</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              If your trip ended on a previous date, adjust the date below:
            </p>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs font-bold text-slate-900 bg-white cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleComplete}
              className="w-2/3 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete Trip 🏁
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
