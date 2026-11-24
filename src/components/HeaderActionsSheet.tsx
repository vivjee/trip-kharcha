'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ArchiveRestore,
  History,
  LayoutGrid,
  PencilLine,
  PieChart,
  Plus,
  RefreshCw,
  Settings2,
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
  onNavigateToTab?: (tab: 'analytics' | 'activity') => void;
  onOpenNewTripModal: () => void;
  onOpenEditTripModal: () => void;
  onOpenShareModal: () => void;
  onOpenSyncModal: () => void;
  onOpenSettings: () => void;
  onOpenTripsHub: () => void;
  onDeleteTrip: (tripId: string) => void;
  onResetDemoData: () => void;
}

export default function HeaderActionsSheet({
  trip,
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenNewTripModal,
  onOpenEditTripModal,
  onOpenShareModal,
  onOpenSyncModal,
  onOpenSettings,
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

  if (!isOpen) return null;

  const runAndClose = (action: () => void) => {
    action();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-fade-in md:items-center">
      <div className="absolute inset-0" onClick={onClose} />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Trip actions"
        className="surface-card app-modal-sheet relative z-10 w-full max-w-lg rounded-t-3xl border-x-0 border-b-0 p-0 shadow-2xl animate-slide-up md:rounded-3xl md:border"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-base font-black text-text-hi">{trip.name}</h2>
            <p className="text-xs text-text-low">Quick actions & navigation</p>
          </div>
          <AppButton size="icon" variant="secondary" onClick={onClose} aria-label="Close trip actions">
            <X className="h-5 w-5" />
          </AppButton>
        </div>

        <div className="space-y-4 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <div className="grid grid-cols-2 gap-3">
            {onNavigateToTab && (
              <>
                <AppButton fullWidth onClick={() => runAndClose(() => onNavigateToTab('analytics'))}><PieChart className="h-4 w-4 text-indigo-600" /> Analytics</AppButton>
                <AppButton fullWidth onClick={() => runAndClose(() => onNavigateToTab('activity'))}><History className="h-4 w-4 text-amber-600" /> Activity Log</AppButton>
              </>
            )}
            <AppButton fullWidth onClick={() => runAndClose(onOpenShareModal)}><Share2 className="h-4 w-4 text-indigo-600" /> Share</AppButton>
            <AppButton fullWidth onClick={() => runAndClose(onOpenSyncModal)}><ArchiveRestore className="h-4 w-4 text-indigo-600" /> Backup</AppButton>
            <AppButton fullWidth onClick={() => runAndClose(onOpenEditTripModal)}><PencilLine className="h-4 w-4 text-indigo-600" /> Edit trip</AppButton>
            <AppButton fullWidth onClick={() => runAndClose(onOpenTripsHub)}><LayoutGrid className="h-4 w-4 text-indigo-600" /> Trips Hub</AppButton>
            <AppButton fullWidth onClick={() => runAndClose(onOpenSettings)}><Settings2 className="h-4 w-4 text-accent-1" /> Appearance</AppButton>
          </div>

          <AppButton variant="primary" size="large" fullWidth onClick={() => runAndClose(onOpenNewTripModal)}>
            <Plus className="h-5 w-5" /> Create new trip
          </AppButton>

          <div className="border-t border-line pt-4">
            <p className="mb-2 text-xs font-bold text-text-low">Danger zone</p>
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
