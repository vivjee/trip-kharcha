"use client";

import React, { useState } from "react";
import { Trip, SimplifiedDebt } from "@/types/trip";
import { tripCalculations } from "@/lib/trip-store";
import { formatMoney } from "@/lib/money";
import {
  X,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Sparkles,
  Flag,
} from "lucide-react";
import { getTodayLocalDate } from "@/lib/date-utils";
import { validLocalDate } from "@/lib/validation";
import SaveStatus, { useSaveForm } from "./SaveStatus";

interface CompleteTripModalProps {
  trip: Trip;
  simplifiedDebts: SimplifiedDebt[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmComplete: (endDate: string) => Promise<boolean>;
}

export default function CompleteTripModal({
  trip,
  simplifiedDebts,
  isOpen,
  onClose,
  onConfirmComplete,
}: CompleteTripModalProps) {
  const { saving, error, run } = useSaveForm();
  const [endDate, setEndDate] = useState<string>(getTodayLocalDate());

  if (!isOpen) return null;

  const { stats } = tripCalculations(trip);

  const handleComplete = async () => {
    if (!validLocalDate(endDate) || endDate < trip.startDate) return;
    if (await run(() => onConfirmComplete(endDate))) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-pop-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-trip-title"
        className="app-modal-sheet w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-indigo-900 bg-surface-deep px-5 py-4 text-text-hi">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              <Flag className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2
                id="complete-trip-title"
                className="text-sm font-black leading-tight"
              >
                Complete {trip.name}
              </h2>
              <p className="text-xs text-text-mid font-medium">
                Finalize trip and record the end date
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close completion form"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <SaveStatus saving={saving} error={error} />
        <div className="p-5 space-y-4 overflow-y-auto no-scrollbar">
          {/* Summary Spotlight Card */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-text-hi" />
                Trip Expenditure Summary
              </span>
              <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-extrabold text-text-hi">
                {stats.totalExpensesCount} {stats.totalExpensesCount === 1 ? "expense" : "expenses"} logged
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold text-text-mid">
                  Total spent
                </span>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {formatMoney(stats.totalSpent, trip.currencySymbol)}
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold text-text-mid">
                  Top payer
                </span>
                <p className="text-xs font-extrabold text-slate-900 mt-0.5 flex items-center gap-1 truncate">
                  <span>{stats.topSpender?.avatar}</span>
                  <span className="truncate">
                    {stats.totalSpent > 0
                      ? stats.topSpender?.participantName
                      : "No spending yet"}
                  </span>
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
                <p className="mt-0.5 text-xs font-medium text-amber-700">
                  You can mark the trip complete now and settle payments anytime
                  later in the Balances tab.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                All debts are 100% settled up! Perfect time to finish.
              </span>
            </div>
          )}

          {/* End Date Selection */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-text-hi" />
                Select Trip End Date
              </label>
              <span className="text-xs font-bold text-text-mid">
                Defaults to today
              </span>
            </div>
            <p className="text-xs font-medium text-text-mid">
              If your trip ended on a previous date, adjust the date below:
            </p>
            <input
              type="date"
              aria-label="End date"
              min={trip.startDate}
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-12 w-1/3 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={
                saving || !validLocalDate(endDate) || endDate < trip.startDate
              }
              onClick={handleComplete}
              className="flex min-h-12 w-2/3 items-center justify-center gap-1.5 rounded-xl tc-selected text-sm font-extrabold text-white  cursor-pointer"
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
