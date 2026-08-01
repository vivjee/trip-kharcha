'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Trip } from '@/types/trip';
import { X, QrCode, Copy, Check, Radio, Wifi, ShieldCheck, UserCheck } from 'lucide-react';

interface SyncTripModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onOpenClaimIdentity: () => void;
}

export default function SyncTripModal({
  trip,
  isOpen,
  onClose,
  onOpenClaimIdentity,
}: SyncTripModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const roomCode = trip.roomCode || `TRIP-${trip.id.slice(-4).toUpperCase()}`;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}?code=${roomCode}` : roomCode;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-pop-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/40">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black leading-tight">Sync & Share Access</h2>
              <p className="text-[10px] text-slate-300 font-medium">Multi-device real-time sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto no-scrollbar">
          {/* QR Code Display */}
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-3">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md">
              <QRCodeSVG value={shareUrl} size={150} level="M" />
            </div>
            <p className="text-xs font-extrabold text-slate-800">
              Scan with friend&apos;s phone to join {trip.name}
            </p>
          </div>

          {/* 6-Digit Room Code Card */}
          <div className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-widest block">
                1-Time Sync Code
              </span>
              <span className="text-lg font-black text-slate-900 tracking-wider">
                {roomCode}
              </span>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          {/* Claim Identity Action Button */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-slate-800">Participant Identity</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              If joining on a friend&apos;s phone, claim which participant profile you are so your actions are attributed in the audit trail.
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenClaimIdentity();
              }}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              Claim My Participant Profile
            </button>
          </div>

          {/* Security & Offline Guarantee */}
          <div className="bg-slate-100/70 p-3 rounded-2xl border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="font-medium">
              Transparent Audit History logs every expense and payment with the member who performed it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
