'use client';

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
  onSave: (updates: TripDetailsUpdate) => void;
}

export default function EditTripModal({ trip, isOpen, onClose, onSave }: EditTripModalProps) {
  const [name, setName] = useState(trip.name);
  const [description, setDescription] = useState(trip.description);
  const [startDate, setStartDate] = useState(trip.startDate);

  if (!isOpen) return null;

  const isValid = Boolean(name.trim() && startDate && (!trip.endDate || startDate <= trip.endDate));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) return;
    onSave({ name: name.trim(), description: description.trim(), startDate });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-4 animate-pop-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-trip-title"
        className="w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/60">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h2 id="edit-trip-title" className="text-sm font-bold text-slate-900">Edit Trip Details</h2>
              <p className="text-[10px] text-slate-500 font-medium">The cover photo can be changed from the dashboard</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close trip editor"
            className="w-8 h-8 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-600 hover:bg-slate-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor="edit-trip-name" className="block text-xs font-bold text-slate-700 mb-1">Trip name</label>
            <input
              id="edit-trip-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
              required
              className="w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-900 bg-white"
            />
          </div>

          <div>
            <label htmlFor="edit-trip-description" className="block text-xs font-bold text-slate-700 mb-1">Short note <span className="font-medium text-slate-400">(optional)</span></label>
            <textarea
              id="edit-trip-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={160}
              rows={3}
              placeholder="What is this trip about?"
              className="w-full resize-none px-3.5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs font-semibold text-slate-900 bg-white"
            />
            <p className="mt-1 text-right text-[10px] font-semibold text-slate-400">{description.length}/160</p>
          </div>

          <div>
            <label htmlFor="edit-trip-start" className="block text-xs font-bold text-slate-700 mb-1">Start date</label>
            <div className="relative">
              <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="edit-trip-start"
                type="date"
                value={startDate}
                max={trip.endDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs font-bold text-slate-900 bg-white"
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
              className="w-1/3 min-h-11 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="w-2/3 min-h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-[.98] cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
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
