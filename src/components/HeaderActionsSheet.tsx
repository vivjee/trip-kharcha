'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ArchiveRestore,
  LayoutGrid,
  PencilLine,
  Plus,
  RefreshCw,
  Share2,
  Trash2,
  X,
} from 'lucide-react';
import type { Trip } from '@/types/trip';
import AppButton from '@/components/AppButton';

interface HeaderActionsSheetProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onOpenNewTripModal: () => void;
  onOpenEditTripModal: () => void;
  onOpenShareModal: () => void;
  onOpenSyncModal: () => void;
  onOpenTripsHub: () => void;
  onDeleteTrip: (tripId: string) => void;
  onResetDemoData: () => void;
}

export default function HeaderActionsSheet({
  trip,
  isOpen,
  onClose,
  onOpenNewTripModal,
  onOpenEditTripModal,
  onOpenShareModal,
  onOpenSyncModal,
  onOpenTripsHub,
  onDeleteTrip,
  onResetDemoData,
}: HeaderActionsSheetProps) {
  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const runAndClose = (action: () => void) => {
    onClose();
    action();
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/55 md:items-center md:p-4" onPointerDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="trip-actions-title"
        onPointerDown={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl border border-slate-200 bg-white shadow-2xl md:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id="trip-actions-title" className="text-base font-black text-slate-950">Trip actions</h2>
            <p className="mt-0.5 max-w-[260px] truncate text-xs font-medium text-slate-500">{trip.name}</p>
          </div>
          <AppButton size="icon" variant="ghost" onClick={onClose} aria-label="Close trip actions">
            <X className="h-5 w-5" />
          </AppButton>
        </div>

        <div className="space-y-4 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <div className="grid grid-cols-2 gap-3">
            <AppButton fullWidth onClick={() => runAndClose(onOpenShareModal)}><Share2 className="h-4 w-4 text-indigo-600" /> Share</AppButton>
            <AppButton fullWidth onClick={() => runAndClose(onOpenSyncModal)}><ArchiveRestore className="h-4 w-4 text-indigo-600" /> Backup</AppButton>
            <AppButton fullWidth onClick={() => runAndClose(onOpenEditTripModal)}><PencilLine className="h-4 w-4 text-indigo-600" /> Edit trip</AppButton>
            <AppButton fullWidth onClick={() => runAndClose(onOpenTripsHub)}><LayoutGrid className="h-4 w-4 text-indigo-600" /> Trips Hub</AppButton>
          </div>

          <AppButton variant="primary" size="large" fullWidth onClick={() => runAndClose(onOpenNewTripModal)}>
            <Plus className="h-5 w-5" /> Create new trip
          </AppButton>

          <div className="border-t border-slate-200 pt-4">
            <p className="mb-2 text-xs font-bold text-slate-500">Danger zone</p>
            <div className="grid grid-cols-2 gap-3">
              <AppButton variant="danger" fullWidth onClick={() => runAndClose(() => onDeleteTrip(trip.id))}>
                <Trash2 className="h-4 w-4" /> Delete trip
              </AppButton>
              <AppButton variant="danger" fullWidth onClick={() => runAndClose(onResetDemoData)}>
                <RefreshCw className="h-4 w-4" /> Clear all data
              </AppButton>
            </div>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
