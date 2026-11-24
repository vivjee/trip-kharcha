'use client';

import SaveStatus, { useSaveForm } from './SaveStatus';
import React, { useState } from 'react';
import type { Trip } from '@/types/trip';
import { CalendarDays, Pencil, Save, X } from 'lucide-react';

export interface TripDetailsUpdate {
  name: string;
  description: string;
  startDate: string;
}

interface EditTripModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: TripDetailsUpdate) => Promise<boolean>;
}

export default function EditTripModal({ trip, isOpen, onClose, onSave }: EditTripModalProps) {
  const { saving, error, run } = useSaveForm();
  const [name, setName] = useState(trip.name);
  const [description, setDescription] = useState(trip.description);
  const [startDate, setStartDate] = useState(trip.startDate);

  if (!isOpen) return null;

  const isValid = Boolean(name.trim() && startDate && (!trip.endDate || startDate <= trip.endDate));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) return;
    await run(() => onSave({ name: name.trim(), description: description.trim(), startDate }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-4 animate-pop-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-trip-title"
        data-long-form className="app-modal-sheet w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/60">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-text-hi flex items-center justify-center">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h2 id="edit-trip-title" className="text-sm font-bold text-slate-900">Edit Trip Details</h2>
              <p className="text-xs text-text-mid font-medium">Your cover photo is in Trip details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close trip editor"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4"><SaveStatus saving={saving} error={error} />
          <div>
            <label htmlFor="edit-trip-name" className="block text-xs font-bold text-slate-700 mb-1">Trip Name</label>
            <input
              id="edit-trip-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              required
              className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="edit-trip-description" className="block text-xs font-bold text-slate-700 mb-1">Short Note <span className="font-medium text-text-mid">(Optional)</span></label>
            <textarea
              id="edit-trip-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={160}
              rows={3}
              placeholder="What is this trip about?"
              className="min-h-24 w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-right text-[10px] font-semibold text-text-mid">{description.length}/160</p>
          </div>

          <div>
            <label htmlFor="edit-trip-start" className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
            <div className="relative">
              <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-mid pointer-events-none" />
              <input
                id="edit-trip-start"
                type="date"
                value={startDate}
                max={trip.endDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {trip.endDate && startDate > trip.endDate && (
              <p className="mt-1 text-[10px] font-bold text-rose-600">Start date must be on or before the completion date.</p>
            )}
          </div>

          <div className="pt-1 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-12 w-1/3 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="flex min-h-12 w-2/3 items-center justify-center gap-1.5 rounded-xl tc-selected text-sm font-bold text-white  cursor-pointer disabled:bg-slate-200 disabled:text-text-mid disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
