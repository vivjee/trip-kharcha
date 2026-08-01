'use client';

import React, { useState } from 'react';
import { Trip } from '@/types/trip';
import { X, UserCheck, CheckCircle2 } from 'lucide-react';

interface ClaimIdentityModalProps {
  trip: Trip;
  currentParticipantId?: string;
  isOpen: boolean;
  onClose: () => void;
  onClaimIdentity: (participantId: string) => void;
}

export default function ClaimIdentityModal({
  trip,
  currentParticipantId,
  isOpen,
  onClose,
  onClaimIdentity,
}: ClaimIdentityModalProps) {
  const [selectedId, setSelectedId] = useState<string>(
    currentParticipantId || trip.participants[0]?.id || ''
  );

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedId) return;
    onClaimIdentity(selectedId);
    onClose();
  };

  const selectedParticipant = trip.participants.find((p) => p.id === selectedId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-pop-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-purple-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Who Are You On This Trip?</h2>
              <p className="text-[10px] text-slate-500 font-medium">Claim your participant identity for audit trail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto no-scrollbar">
          <p className="text-xs font-semibold text-slate-600">
            Select your name from the participant list below so expenses you add or settle are correctly attributed to you:
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar py-1">
            {trip.participants.map((p) => {
              const isSelected = selectedId === p.id;
              const isCurrentActive = currentParticipantId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-400/40 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-2xs">
                      {p.avatar}
                    </span>
                    <div>
                      <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {isCurrentActive && (
                          <span className="bg-purple-100 text-purple-800 text-[9px] font-extrabold px-2 py-0.2 rounded-full">
                            Current Device
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-3 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="w-2/3 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              Claim &quot;{selectedParticipant?.name}&quot; Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
