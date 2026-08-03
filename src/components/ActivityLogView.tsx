'use client';

import React, { useState } from 'react';
import { Trip, AuditLogEntry } from '@/types/trip';
import { History, PlusCircle, Trash2, CheckCircle2, UserCheck, Sparkles, Filter, PencilLine, UserMinus, UserPlus } from 'lucide-react';
import Avatar from '@/components/Avatar';
import { formatDateTime } from '@/lib/date-utils';

interface ActivityLogViewProps {
  trip: Trip;
}

export default function ActivityLogView({ trip }: ActivityLogViewProps) {
  const [filterParticipantId, setFilterParticipantId] = useState<string>('all');

  const logs: AuditLogEntry[] = trip.auditLogs || [];

  const filteredLogs = logs.filter((log) => {
    if (filterParticipantId === 'all') return true;
    return log.performedBy.id === filterParticipantId;
  });

  const getActionBadge = (actionType: AuditLogEntry['actionType']) => {
    switch (actionType) {
      case 'ADD_EXPENSE':
        return { label: 'Added Expense', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: PlusCircle };
      case 'EDIT_EXPENSE':
        return { label: 'Edited Expense', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: PlusCircle };
      case 'DELETE_EXPENSE':
        return { label: 'Deleted Expense', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: Trash2 };
      case 'RECORD_SETTLEMENT':
        return { label: 'Settlement', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
      case 'EDIT_SETTLEMENT':
        return { label: 'Edited Payment', bg: 'bg-teal-50 text-teal-700 border-teal-200', icon: CheckCircle2 };
      case 'DELETE_SETTLEMENT':
        return { label: 'Deleted Settlement', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Trash2 };
      case 'CLAIM_IDENTITY':
        return { label: 'Joined / Claimed', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: UserCheck };
      case 'ADD_PARTICIPANT':
        return { label: 'Added Member', bg: 'bg-violet-50 text-violet-700 border-violet-200', icon: UserPlus };
      case 'UPDATE_PARTICIPANT':
        return { label: 'Renamed Member', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: PencilLine };
      case 'REMOVE_PARTICIPANT':
        return { label: 'Removed Member', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: UserMinus };
      case 'UPDATE_TRIP':
        return { label: 'Edited Trip', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: PencilLine };
      default:
        return { label: 'Trip Action', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: History };
    }
  };

  return (
    <div className="p-4 space-y-4 animate-pop-in">
      {/* Header */}
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-black text-slate-900 leading-tight flex items-center gap-1.5">
            <History className="w-4 h-4 text-indigo-600" />
            Activity & Audit Log
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            Complete transparent record of who did what
          </p>
        </div>

        {/* Filter Dropdown */}
        {trip.participants.length > 0 && (
          <div className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 shadow-2xs">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              aria-label="Filter activity by member"
              value={filterParticipantId}
              onChange={(e) => setFilterParticipantId(e.target.value)}
              className="min-h-10 flex-1 cursor-pointer bg-transparent text-xs font-extrabold text-slate-700 focus:outline-none"
            >
              <option value="all">All Members ({logs.length})</option>
              {trip.participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.avatar} {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Timeline */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-2">
          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
          <p className="text-xs font-bold text-slate-700">No activity logged yet</p>
          <p className="text-[10px] text-slate-400">
            Actions like adding expenses, settlements, or member changes will appear here chronologically.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.slice().reverse().map((log) => {
            const badge = getActionBadge(log.actionType);
            const Icon = badge.icon;

            return (
              <div
                key={log.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar person={log.performedBy} size="xs" />
                    <div>
                      <span className="text-xs font-black text-slate-900">{log.performedBy.name}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5 font-semibold">
                        {formatDateTime(log.timestamp)}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border flex items-center gap-1 ${badge.bg}`}>
                    <Icon className="w-3 h-3" />
                    {badge.label}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-bold pl-9">
                  {log.details}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
