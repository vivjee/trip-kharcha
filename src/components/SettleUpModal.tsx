'use client';

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, HandCoins, X } from 'lucide-react';
import { getNowLocalDateTime, toLocalDateTimeInput } from '@/lib/date-utils';
import { calculateSimplifiedDebts } from '@/lib/debt-simplification';
import { Settlement, SimplifiedDebt, Trip } from '@/types/trip';

interface SettleUpModalProps {
  trip: Trip;
  isOpen: boolean;
  presetDebt?: SimplifiedDebt;
  settlementToEdit?: Settlement;
  onClose: () => void;
  onSaveSettlement: (settlement: Omit<Settlement, 'id'>, settlementId?: string) => void;
}

function SettlementForm({ trip, presetDebt, settlement, onClose, onSaveSettlement }: {
  trip: Trip;
  presetDebt?: SimplifiedDebt;
  settlement?: Settlement;
  onClose: () => void;
  onSaveSettlement: SettleUpModalProps['onSaveSettlement'];
}) {
  const tripBeforeEdit = settlement
    ? { ...trip, settlements: trip.settlements.filter((item) => item.id !== settlement.id) }
    : trip;
  const debts = calculateSimplifiedDebts(tripBeforeEdit);
  const initialDebt = presetDebt || debts.find((debt) => (
    debt.from.id === settlement?.fromParticipantId && debt.to.id === settlement?.toParticipantId
  )) || debts[0];
  const initialFromId = settlement?.fromParticipantId || initialDebt?.from.id || trip.participants[0]?.id || '';
  const initialToId = settlement?.toParticipantId
    || initialDebt?.to.id
    || trip.participants.find((participant) => participant.id !== initialFromId)?.id
    || '';
  const [fromId, setFromId] = useState(initialFromId);
  const [toId, setToId] = useState(initialToId);
  const [amountStr, setAmountStr] = useState(String(settlement?.amount || initialDebt?.amount || ''));
  const [date, setDate] = useState(
    settlement ? toLocalDateTimeInput(settlement.date, settlement.createdAt) : getNowLocalDateTime(),
  );
  const [notes, setNotes] = useState(settlement?.notes || '');

  const selectedDebt = debts.find((debt) => debt.from.id === fromId && debt.to.id === toId);
  const amount = Number(amountStr) || 0;
  const valid = Boolean(fromId && toId && fromId !== toId && amount > 0 && date);
  const from = trip.participants.find((participant) => participant.id === fromId);
  const to = trip.participants.find((participant) => participant.id === toId);

  const changeFrom = (id: string) => {
    setFromId(id);
    const matching = debts.find((debt) => debt.from.id === id);
    if (matching) {
      setToId(matching.to.id);
      setAmountStr(String(matching.amount));
    } else if (toId === id) {
      setToId(trip.participants.find((participant) => participant.id !== id)?.id || '');
    }
  };

  const changeTo = (id: string) => {
    setToId(id);
    const nextFromId = fromId === id
      ? trip.participants.find((participant) => participant.id !== id)?.id || ''
      : fromId;
    if (nextFromId !== fromId) setFromId(nextFromId);
    const matching = debts.find((debt) => debt.from.id === nextFromId && debt.to.id === id);
    if (matching) setAmountStr(String(matching.amount));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    const now = new Date().toISOString();
    onSaveSettlement({
      fromParticipantId: fromId,
      toParticipantId: toId,
      amount: Math.round(amount * 100) / 100,
      date,
      notes: notes.trim(),
      createdAt: settlement?.createdAt || now,
      updatedAt: now,
      createdByParticipantId: settlement?.createdByParticipantId,
    }, settlement?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4 animate-pop-in" role="dialog" aria-modal="true" aria-labelledby="settlement-title">
      <div className="w-full max-w-md bg-white rounded-t-[28px] md:rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94dvh]">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><HandCoins className="w-5 h-5" /></div>
            <div><h2 id="settlement-title" className="text-base font-extrabold text-slate-900">{settlement ? 'Edit Settlement' : 'Record Settlement'}</h2><p className="text-xs text-slate-500">Settle a balance or record another payment</p></div>
          </div>
          <button onClick={onClose} aria-label="Close settlement form" className="w-11 h-11 -mr-2 rounded-full bg-slate-200/70 flex items-center justify-center text-slate-600 hover:bg-slate-300 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-5 overflow-y-auto">
          {debts.length === 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-extrabold text-emerald-900">Nothing to settle</p>
              <p className="text-sm text-emerald-700 mt-1">Everyone’s balance is even. You can still record a payment; the receiver will then owe the payer.</p>
            </div>
          )}

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="text-center flex-1"><span className="text-3xl">{from?.avatar || '👤'}</span><p className="text-sm font-extrabold text-slate-900 mt-1">{from?.name || 'Payer'}</p><span className="text-xs text-rose-600 font-semibold">pays</span></div>
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm"><ArrowRight className="w-5 h-5" /></div>
            <div className="text-center flex-1"><span className="text-3xl">{to?.avatar || '👤'}</span><p className="text-sm font-extrabold text-slate-900 mt-1">{to?.name || 'Receiver'}</p><span className="text-xs text-emerald-600 font-semibold">receives</span></div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-700 space-y-1.5">Who is paying?
              <select value={fromId} onChange={(event) => changeFrom(event.target.value)} className="w-full px-3 py-3 rounded-xl border border-slate-300 text-sm font-bold bg-white">
                {trip.participants.map((participant) => <option key={participant.id} value={participant.id}>{participant.avatar} {participant.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700 space-y-1.5">Who receives?
              <select value={toId} onChange={(event) => changeTo(event.target.value)} className="w-full px-3 py-3 rounded-xl border border-slate-300 text-sm font-bold bg-white">
                {trip.participants.map((participant) => <option key={participant.id} value={participant.id}>{participant.avatar} {participant.name}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_180px]">
            <label className="text-sm font-bold text-slate-700 space-y-1.5">Payment amount
              <div className="relative"><span className="absolute left-3.5 top-3.5 text-emerald-700 font-black">{trip.currencySymbol}</span><input type="number" inputMode="decimal" min="0.01" step="0.01" required value={amountStr} onChange={(event) => setAmountStr(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-300 pl-9 pr-3 text-xl font-black text-slate-950" /></div>
              {selectedDebt ? (
                <span className="block text-xs font-medium text-slate-500">Suggested outstanding payment: {trip.currencySymbol} {selectedDebt.amount.toLocaleString()}</span>
              ) : (
                <span className="block text-xs font-medium text-slate-500">This payment may create or reverse who owes whom.</span>
              )}
            </label>
            <label className="text-sm font-bold text-slate-700 space-y-1.5">Payment time
              <input type="datetime-local" required value={date} onChange={(event) => setDate(event.target.value)} className="w-full px-3 py-3 rounded-xl border border-slate-300 text-sm font-semibold" />
            </label>
          </div>

          <label className="block text-sm font-bold text-slate-700 space-y-1.5">Notes <span className="font-medium text-slate-400">(optional)</span><input type="text" placeholder="Cash, eSewa, bank transfer…" value={notes} onChange={(event) => setNotes(event.target.value)} className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm" /></label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="w-1/3 min-h-12 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 cursor-pointer">Cancel</button>
            <button type="submit" disabled={!valid} className="w-2/3 min-h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed">{settlement ? 'Save Changes' : 'Confirm Payment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SettleUpModal({ trip, isOpen, presetDebt, settlementToEdit, onClose, onSaveSettlement }: SettleUpModalProps) {
  if (!isOpen) return null;
  return <SettlementForm key={settlementToEdit?.id || `${presetDebt?.id || 'first'}-${trip.settlements.length}`} trip={trip} presetDebt={presetDebt} settlement={settlementToEdit} onClose={onClose} onSaveSettlement={onSaveSettlement} />;
}
