'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trip, AuditLogEntry } from '@/types/trip';
import { History, PlusCircle, Trash2, CheckCircle2, UserCheck, Sparkles, Filter } from 'lucide-react';

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
      case 'DELETE_EXPENSE':
        return { label: 'Deleted Expense', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: Trash2 };
      case 'RECORD_SETTLEMENT':
        return { label: 'Settlement', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
      case 'DELETE_SETTLEMENT':
        return { label: 'Deleted Settlement', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Trash2 };
      case 'CLAIM_IDENTITY':
        return { label: 'Joined / Claimed', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: UserCheck };
      default:
        return { label: 'Trip Action', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: History };
    }
  };

  const formatLogTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="p-4 space-y-4 animate-pop-in">
      {/* Header */}
      <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={filterParticipantId}
              onChange={(e) => setFilterParticipantId(e.target.value)}
              className="text-[10px] font-extrabold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
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
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={log.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm shadow-2xs">
                      {log.performedBy.avatar}
                    </span>
                    <div>
                      <span className="text-xs font-black text-slate-900">{log.performedBy.name}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5 font-semibold">
                        {formatLogTime(log.timestamp)}
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
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
