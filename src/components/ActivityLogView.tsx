'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Camera, CheckCircle2, Download, Filter, Flag, History, MapPlus, PencilLine, PlusCircle, RotateCcw, Sparkles, Trash2, UserCheck, UserMinus, UserPlus } from 'lucide-react';
import type { AuditLogEntry, Trip } from '@/types/trip';
import { formatDateTime } from '@/lib/date-utils';
import AppButton from '@/components/AppButton';
import Avatar from '@/components/Avatar';

interface ActivityLogViewProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActivityLogView({ trip, isOpen, onClose }: ActivityLogViewProps) {
  const [filterParticipantId, setFilterParticipantId] = useState<string>('all');
  const logs: AuditLogEntry[] = trip.auditLogs || [];
  const filteredLogs = logs.filter((log) => filterParticipantId === 'all' || log.performedBy.id === filterParticipantId);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/55" onPointerDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-title"
        onPointerDown={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col bg-slate-50 shadow-2xl animate-pop-in"
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 pb-3 pt-[calc(.75rem+env(safe-area-inset-top))]">
          <AppButton size="icon" variant="ghost" onClick={onClose} aria-label="Back to trip"><ArrowLeft className="h-5 w-5" /></AppButton>
          <div className="min-w-0">
            <h2 id="activity-title" className="flex items-center gap-2 text-base font-black text-slate-950"><History className="h-4 w-4 text-indigo-600" /> Activity log</h2>
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">Who changed what in {trip.name}</p>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {trip.participants.length > 0 && (
            <div className="mb-4 flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 shadow-2xs">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                aria-label="Filter activity by member"
                value={filterParticipantId}
                onChange={(event) => setFilterParticipantId(event.target.value)}
                className="min-h-10 flex-1 cursor-pointer bg-transparent text-xs font-extrabold text-slate-700 focus:outline-none"
              >
                <option value="all">All activity ({logs.length})</option>
                {trip.participants.map((participant) => <option key={participant.id} value={participant.id}>{participant.avatar} {participant.name}</option>)}
              </select>
            </div>
          )}

          {filteredLogs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-indigo-400" />
              <p className="mt-3 text-sm font-extrabold text-slate-800">No activity logged yet</p>
              <p className="mt-1 text-xs text-slate-500">Expense, settlement, and member changes will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredLogs.slice().reverse().map((log) => {
                const badge = getActionBadge(log.actionType);
                const Icon = badge.icon;
                return (
                  <article key={log.id} className="space-y-1.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <Avatar person={log.performedBy} size="xs" />
                        <div className="min-w-0"><p className="truncate text-xs font-black text-slate-900">{log.performedBy.name}</p><p className="text-xs font-semibold text-slate-500">{formatDateTime(log.timestamp)}</p></div>
                      </div>
                      <span className={`flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-xs font-extrabold ${badge.bg}`}><Icon className="h-3 w-3" /> {badge.label}</span>
                    </div>
                    <p className="pl-9 text-xs font-bold text-slate-700">{log.details}</p>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}

function getActionBadge(actionType: AuditLogEntry['actionType']) {
  switch (actionType) {
    case 'ADD_EXPENSE': return { label: 'Added expense', bg: 'border-indigo-200 bg-indigo-50 text-indigo-700', icon: PlusCircle };
    case 'EDIT_EXPENSE': return { label: 'Edited expense', bg: 'border-blue-200 bg-blue-50 text-blue-700', icon: PencilLine };
    case 'DELETE_EXPENSE': return { label: 'Deleted expense', bg: 'border-rose-200 bg-rose-50 text-rose-700', icon: Trash2 };
    case 'RECORD_SETTLEMENT': return { label: 'Settlement', bg: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: CheckCircle2 };
    case 'EDIT_SETTLEMENT': return { label: 'Edited payment', bg: 'border-teal-200 bg-teal-50 text-teal-700', icon: PencilLine };
    case 'DELETE_SETTLEMENT': return { label: 'Deleted payment', bg: 'border-amber-200 bg-amber-50 text-amber-700', icon: Trash2 };
    case 'CLAIM_IDENTITY': return { label: 'Claimed identity', bg: 'border-purple-200 bg-purple-50 text-purple-700', icon: UserCheck };
    case 'ADD_PARTICIPANT': return { label: 'Added member', bg: 'border-violet-200 bg-violet-50 text-violet-700', icon: UserPlus };
    case 'UPDATE_PARTICIPANT': return { label: 'Renamed member', bg: 'border-blue-200 bg-blue-50 text-blue-700', icon: PencilLine };
    case 'REMOVE_PARTICIPANT': return { label: 'Removed member', bg: 'border-rose-200 bg-rose-50 text-rose-700', icon: UserMinus };
    case 'UPDATE_TRIP': return { label: 'Edited trip', bg: 'border-indigo-200 bg-indigo-50 text-indigo-700', icon: PencilLine };
    case 'CREATE_TRIP': return { label: 'Created trip', bg: 'border-indigo-200 bg-indigo-50 text-indigo-700', icon: MapPlus };
    case 'COMPLETE_TRIP': return { label: 'Completed trip', bg: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: Flag };
    case 'REOPEN_TRIP': return { label: 'Reopened trip', bg: 'border-amber-200 bg-amber-50 text-amber-700', icon: RotateCcw };
    case 'UPDATE_COVER': return { label: 'Changed cover', bg: 'border-violet-200 bg-violet-50 text-violet-700', icon: Camera };
    case 'IMPORT_TRIP': return { label: 'Imported trip', bg: 'border-blue-200 bg-blue-50 text-blue-700', icon: Download };
    default: return { label: 'Trip action', bg: 'border-slate-200 bg-slate-100 text-slate-700', icon: History };
  }
}
