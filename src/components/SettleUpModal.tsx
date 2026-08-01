'use client';

import React, { useState, useEffect } from 'react';
import { Trip, Settlement, SimplifiedDebt } from '@/types/trip';
import { X, ArrowRight, CheckCircle2, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SettleUpModalProps {
  trip: Trip;
  isOpen: boolean;
  presetDebt?: SimplifiedDebt;
  onClose: () => void;
  onConfirmSettlement: (settlement: Omit<Settlement, 'id'>) => void;
}

export default function SettleUpModal({
  trip,
  isOpen,
  presetDebt,
  onClose,
  onConfirmSettlement,
}: SettleUpModalProps) {
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (presetDebt) {
        setFromId(presetDebt.from.id);
        setToId(presetDebt.to.id);
        setAmountStr(presetDebt.amount.toString());
        setNotes(`Settlement payment from ${presetDebt.from.name} to ${presetDebt.to.name}`);
      } else if (trip.participants.length >= 2) {
        setFromId(trip.participants[0].id);
        setToId(trip.participants[1].id);
        setAmountStr('');
        setNotes('Debt settlement');
      }
    }
  }, [presetDebt, trip.participants, isOpen]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amountStr) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromId || !toId || fromId === toId || numAmount <= 0) return;

    onConfirmSettlement({
      fromParticipantId: fromId,
      toParticipantId: toId,
      amount: numAmount,
      date: new Date().toISOString().split('T')[0],
      notes: notes.trim(),
    });

    onClose();
  };

  const fromPart = trip.participants.find((p) => p.id === fromId);
  const toPart = trip.participants.find((p) => p.id === toId);

  const isFormValid =
    fromId.length > 0 &&
    toId.length > 0 &&
    fromId !== toId &&
    numAmount > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-4 animate-pop-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Record Settlement Payment</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Payer & Receiver Cards Visual */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="text-center flex-1">
              <span className="text-2xl">{fromPart?.avatar || '👤'}</span>
              <p className="text-xs font-bold text-slate-800 mt-1">{fromPart?.name || 'Payer'}</p>
              <span className="text-[10px] text-rose-600 font-semibold">Payer</span>
            </div>

            <div className="px-3 flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <ArrowRight className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-1">Repays</span>
            </div>

            <div className="text-center flex-1">
              <span className="text-2xl">{toPart?.avatar || '👤'}</span>
              <p className="text-xs font-bold text-slate-800 mt-1">{toPart?.name || 'Receiver'}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Receiver</span>
            </div>
          </div>

          {/* Select Payer */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Who is paying?</label>
            <select
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50/50 cursor-pointer"
            >
              {trip.participants.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === toId}>
                  {p.avatar} {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Receiver */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Who receives payment?</label>
            <select
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50/50 cursor-pointer"
            >
              {trip.participants.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === fromId}>
                  {p.avatar} {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Payment Amount ({trip.currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-emerald-600">
                {trip.currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-extrabold text-slate-900 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Settlement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
