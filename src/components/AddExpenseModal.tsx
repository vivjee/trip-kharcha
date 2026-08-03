'use client';

import React, { useState } from 'react';
import {
  Calculator,
  Car,
  Check,
  Compass,
  Hotel,
  Receipt,
  ShoppingBag,
  UserCheck,
  Utensils,
  X,
  type LucideIcon,
} from 'lucide-react';
import { getNowLocalDateTime, toLocalDateTimeInput } from '@/lib/date-utils';
import { getExpenseShares } from '@/lib/debt-simplification';
import { CategoryType, Expense, ExpensePayer, ExpenseShare, SplitMode, Trip } from '@/types/trip';

interface AddExpenseModalProps {
  trip: Trip;
  isOpen: boolean;
  expenseToEdit?: Expense;
  onClose: () => void;
  onSaveExpense: (expense: Omit<Expense, 'id'>, expenseId?: string) => void;
}

const categories: { id: CategoryType; label: string; icon: LucideIcon }[] = [
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'transport', label: 'Transport', icon: Car },
  { id: 'stay', label: 'Stay', icon: Hotel },
  { id: 'activity', label: 'Activity', icon: Compass },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'other', label: 'Other', icon: Receipt },
];

const toInputMap = (items?: { participantId: string; amount: number }[]) =>
  Object.fromEntries((items || []).map((item) => [item.participantId, String(item.amount)]));

function ExpenseForm({ trip, expense, onClose, onSaveExpense }: {
  trip: Trip;
  expense?: Expense;
  onClose: () => void;
  onSaveExpense: AddExpenseModalProps['onSaveExpense'];
}) {
  const initialShares = expense ? getExpenseShares(expense) : [];
  const [title, setTitle] = useState(expense?.title || '');
  const [amountStr, setAmountStr] = useState(expense ? String(expense.amount) : '');
  const [category, setCategory] = useState<CategoryType>(expense?.category || 'food');
  const [date, setDate] = useState(
    expense ? toLocalDateTimeInput(expense.date, expense.createdAt) : getNowLocalDateTime(),
  );
  const [paidById, setPaidById] = useState(expense?.paidById || trip.participants[0]?.id || '');
  const [isMultiPayer, setIsMultiPayer] = useState(Boolean(expense?.payers?.length));
  const [payerAmounts, setPayerAmounts] = useState<Record<string, string>>(toInputMap(expense?.payers));
  const [splitMode, setSplitMode] = useState<SplitMode>(expense?.splitMode || 'equal');
  const [includedIds, setIncludedIds] = useState<string[]>(
    expense?.includedParticipantIds?.length
      ? expense.includedParticipantIds
      : trip.participants.map((participant) => participant.id),
  );
  const [splitInputs, setSplitInputs] = useState<Record<string, string>>(() => {
    if (!expense || expense.splitMode === 'equal' || !expense.splitMode) return {};
    if (expense.splitMode === 'percentage') {
      return Object.fromEntries(initialShares.map((share) => [
        share.participantId,
        String(Math.round((share.amount / expense.amount) * 10000) / 100),
      ]));
    }
    return toInputMap(initialShares);
  });
  const [notes, setNotes] = useState(expense?.notes || '');

  const payerTotal = Object.values(payerAmounts).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const amount = isMultiPayer ? payerTotal : Number(amountStr) || 0;
  const splitInputTotal = Object.values(splitInputs).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const selectedCategory = categories.find((item) => item.id === category);

  const buildShares = (): ExpenseShare[] => {
    if (splitMode === 'equal') {
      const base = Math.floor((amount * 100) / includedIds.length) / 100;
      let assigned = 0;
      return includedIds.map((participantId, index) => {
        const shareAmount = index === includedIds.length - 1
          ? Math.round((amount - assigned) * 100) / 100
          : base;
        assigned += shareAmount;
        return { participantId, amount: shareAmount };
      });
    }

    const positiveEntries = Object.entries(splitInputs).filter(([, value]) => Number(value) > 0);
    if (splitMode === 'exact') {
      const totalMinor = Math.round(amount * 100);
      let assignedMinor = 0;
      return positiveEntries.map(([participantId, value], index) => {
        const amountMinor = index === positiveEntries.length - 1
          ? totalMinor - assignedMinor
          : Math.round(Number(value) * 100);
        assignedMinor += amountMinor;
        return { participantId, amount: amountMinor / 100 };
      });
    }

    let assigned = 0;
    return positiveEntries.map(([participantId, value], index) => {
      const shareAmount = index === positiveEntries.length - 1
        ? Math.round((amount - assigned) * 100) / 100
        : Math.round((amount * Number(value)) ) / 100;
      assigned += shareAmount;
      return { participantId, amount: shareAmount };
    });
  };

  const sharesValid = splitMode === 'equal'
    ? includedIds.length > 0
    : splitMode === 'exact'
      ? Math.abs(splitInputTotal - amount) < 0.01 && splitInputTotal > 0
      : Math.abs(splitInputTotal - 100) < 0.01;
  const payerValuesValid = !isMultiPayer || Object.values(payerAmounts).every((value) => !value || Number(value) >= 0);
  const isFormValid = amount > 0 && amount <= 1_000_000_000 && sharesValid && payerValuesValid && Boolean(date);

  const selectSplitMode = (mode: SplitMode) => {
    setSplitMode(mode);
    if (mode === 'equal') return;
    const members = includedIds.length ? includedIds : trip.participants.map((participant) => participant.id);
    if (mode === 'exact') {
      const each = members.length ? Math.round((amount / members.length) * 100) / 100 : 0;
      setSplitInputs(Object.fromEntries(members.map((id) => [id, each ? String(each) : ''])));
    } else {
      const each = members.length ? Math.round((100 / members.length) * 100) / 100 : 0;
      setSplitInputs(Object.fromEntries(members.map((id, index) => [
        id,
        String(index === members.length - 1 ? Math.round((100 - each * (members.length - 1)) * 100) / 100 : each),
      ])));
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid) return;
    const shares = buildShares();
    const positivePayers = Object.entries(payerAmounts).filter(([, value]) => Number(value) > 0);
    const payerTotalMinor = Math.round(amount * 100);
    let assignedPayerMinor = 0;
    const payers: ExpensePayer[] | undefined = isMultiPayer
      ? positivePayers.map(([participantId, value], index) => {
          const amountMinor = index === positivePayers.length - 1
            ? payerTotalMinor - assignedPayerMinor
            : Math.round(Number(value) * 100);
          assignedPayerMinor += amountMinor;
          return { participantId, amount: amountMinor / 100 };
        })
      : undefined;
    const now = new Date().toISOString();
    onSaveExpense({
      title: title.trim() || selectedCategory?.label || 'Expense',
      amount: Math.round(amount * 100) / 100,
      paidById: payers?.[0]?.participantId || paidById,
      payers,
      includedParticipantIds: shares.map((share) => share.participantId),
      splitMode,
      shares,
      category,
      date,
      notes: notes.trim(),
      createdAt: expense?.createdAt || now,
      updatedAt: now,
      createdByParticipantId: expense?.createdByParticipantId,
    }, expense?.id);
    onClose();
  };

  const splitHint = splitMode === 'exact'
    ? `${trip.currencySymbol} ${splitInputTotal.toLocaleString()} of ${amount.toLocaleString()}`
    : splitMode === 'percentage'
      ? `${splitInputTotal.toLocaleString()}% of 100%`
      : `${includedIds.length} selected`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4 animate-pop-in" role="dialog" aria-modal="true" aria-labelledby="expense-modal-title">
      <div className="w-full max-w-2xl bg-white rounded-t-[28px] md:rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden max-h-[94dvh] flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center"><Calculator className="w-4 h-4" /></div>
            <div>
              <h2 id="expense-modal-title" className="text-base font-extrabold text-slate-900">{expense ? 'Edit Expense' : 'Add New Expense'}</h2>
              <p className="text-xs text-slate-500">Amounts update balances instantly</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close expense form" className="w-11 h-11 -mr-2 rounded-full bg-slate-200/70 flex items-center justify-center text-slate-600 hover:bg-slate-300 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="p-5 overflow-y-auto space-y-5 no-scrollbar">
          <section className="rounded-3xl border border-slate-700 bg-slate-950 px-5 py-4 shadow-lg shadow-slate-900/15" aria-labelledby="total-amount-label">
            <div className="flex items-center justify-between">
              <span id="total-amount-label" className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-300">Total amount</span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-slate-300">{trip.currency}</span>
            </div>
            {!isMultiPayer ? (
              <label className="mt-2 flex items-center gap-3">
                <span className="text-2xl font-black text-indigo-300">{trip.currencySymbol}</span>
                <input
                  aria-label={`Total amount in ${trip.currency}`}
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  max="1000000000"
                  step="0.01"
                  required
                  autoFocus={!expense}
                  value={amountStr}
                  onChange={(event) => setAmountStr(event.target.value)}
                  placeholder="0"
                  className="font-amount min-w-0 flex-1 border-0 bg-transparent p-0 text-right text-4xl font-black tracking-tight text-white placeholder:text-slate-600 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </label>
            ) : (
              <div className="mt-2 flex items-center justify-between gap-3" aria-live="polite">
                <span className="text-2xl font-black text-indigo-300">{trip.currencySymbol}</span>
                <span className="font-amount text-right text-4xl font-black tracking-tight text-white">{payerTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            )}
            <p className="mt-2 text-right text-xs font-semibold text-slate-400">
              {isMultiPayer ? 'Calculated from everyone’s payments below' : 'Enter the full expense before choosing the split'}
            </p>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_190px] gap-3">
            <label className="space-y-1.5 text-sm font-bold text-slate-700">
              Expense title
              <input type="text" placeholder={`Defaults to ${selectedCategory?.label}`} value={title} onChange={(event) => setTitle(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500" />
            </label>
            <label className="space-y-1.5 text-sm font-bold text-slate-700">
              Date & time
              <input type="datetime-local" required value={date} onChange={(event) => setDate(event.target.value)} className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500" />
            </label>
          </div>

          <fieldset>
            <legend className="text-sm font-bold text-slate-700 mb-2">Category</legend>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((item) => {
                const Icon = item.icon;
                const selected = category === item.id;
                return <button type="button" key={item.id} aria-pressed={selected} onClick={() => setCategory(item.id)} className={`min-h-11 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-bold border cursor-pointer ${selected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}><Icon className="w-4 h-4" />{item.label}</button>;
              })}
            </div>
          </fieldset>

          <section className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3" aria-labelledby="payer-heading">
            <div className="flex items-center justify-between gap-3">
              <h3 id="payer-heading" className="text-sm font-bold text-slate-800">Who paid?</h3>
              <div className="flex bg-slate-200 p-1 rounded-xl text-xs font-bold">
                <button type="button" onClick={() => setIsMultiPayer(false)} className={`min-h-10 rounded-lg px-3 cursor-pointer ${!isMultiPayer ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>One person</button>
                <button type="button" onClick={() => setIsMultiPayer(true)} className={`min-h-10 rounded-lg px-3 cursor-pointer ${isMultiPayer ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>Multiple</button>
              </div>
            </div>

            {!isMultiPayer ? (
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase space-y-1">Paid by
                  <select value={paidById} onChange={(event) => setPaidById(event.target.value)} className="w-full px-3 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white">
                    {trip.participants.map((participant) => <option key={participant.id} value={participant.id}>{participant.avatar} {participant.name}</option>)}
                  </select>
                </label>
              </div>
            ) : (
              <div className="space-y-2">
                {trip.participants.map((participant) => <label key={participant.id} className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 text-sm font-bold"><span>{participant.avatar} {participant.name}</span><span className="relative w-36"><span className="absolute left-3 top-2.5 text-indigo-600 font-black">{trip.currencySymbol}</span><input aria-label={`Amount paid by ${participant.name}`} type="number" inputMode="decimal" min="0" step="0.01" value={payerAmounts[participant.id] || ''} onChange={(event) => setPayerAmounts({ ...payerAmounts, [participant.id]: event.target.value })} className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm font-black text-right" /></span></label>)}
                <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-slate-200"><span>Expense total</span><span className="text-indigo-700">{trip.currencySymbol} {payerTotal.toLocaleString()}</span></div>
              </div>
            )}
          </section>

          <section className="bg-indigo-50/60 rounded-2xl p-3.5 border border-indigo-100 space-y-3" aria-labelledby="split-heading">
            <div className="flex items-center justify-between">
              <h3 id="split-heading" className="text-sm font-bold text-slate-800 flex items-center gap-1.5"><UserCheck className="w-4 h-4 text-indigo-600" />How should it be split?</h3>
              <span className={`text-xs font-bold ${sharesValid ? 'text-emerald-700' : 'text-rose-600'}`}>{splitHint}</span>
            </div>
            <div className="grid grid-cols-3 bg-white p-1 rounded-xl border border-indigo-100 text-xs font-bold">
              {(['equal', 'exact', 'percentage'] as SplitMode[]).map((mode) => <button key={mode} type="button" onClick={() => selectSplitMode(mode)} aria-pressed={splitMode === mode} className={`min-h-10 rounded-lg capitalize cursor-pointer ${splitMode === mode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'}`}>{mode === 'percentage' ? 'Percent' : mode}</button>)}
            </div>

            {splitMode === 'equal' ? (
              <div className="space-y-2">
                <button type="button" onClick={() => setIncludedIds(trip.participants.map((participant) => participant.id))} className="min-h-10 rounded-lg px-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 cursor-pointer">Select everyone</button>
                {trip.participants.map((participant) => {
                  const included = includedIds.includes(participant.id);
                  return <button type="button" key={participant.id} aria-pressed={included} onClick={() => setIncludedIds(included ? includedIds.filter((id) => id !== participant.id) : [...includedIds, participant.id])} className={`w-full min-h-11 flex items-center justify-between px-3 rounded-xl border text-sm font-bold cursor-pointer ${included ? 'bg-white border-indigo-300 text-slate-900' : 'bg-slate-100 border-slate-200 text-slate-500'}`}><span className="flex items-center gap-2"><span className={`w-5 h-5 rounded-md flex items-center justify-center ${included ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-300'}`}>{included && <Check className="w-3.5 h-3.5" />}</span>{participant.avatar} {participant.name}</span>{included && amount > 0 && <span className="text-indigo-700">{trip.currencySymbol} {(amount / includedIds.length).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>}</button>;
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {trip.participants.map((participant) => <label key={participant.id} className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-indigo-100 text-sm font-bold"><span>{participant.avatar} {participant.name}</span><span className="relative w-36">{splitMode === 'exact' && <span className="absolute left-3 top-2.5 text-indigo-600 font-black">{trip.currencySymbol}</span>}<input aria-label={`${splitMode} share for ${participant.name}`} type="number" inputMode="decimal" min="0" step="0.01" value={splitInputs[participant.id] || ''} onChange={(event) => setSplitInputs({ ...splitInputs, [participant.id]: event.target.value })} className={`w-full ${splitMode === 'exact' ? 'pl-8' : 'pl-3'} pr-8 py-2.5 rounded-xl border border-slate-300 text-sm font-black text-right`} />{splitMode === 'percentage' && <span className="absolute right-3 top-2.5 text-indigo-600 font-black">%</span>}</span></label>)}
                {!sharesValid && <p className="text-xs font-semibold text-rose-600">{splitMode === 'exact' ? `Shares must total ${trip.currencySymbol} ${amount.toLocaleString()}.` : 'Percentages must total 100%.'}</p>}
              </div>
            )}
          </section>

          <label className="block space-y-1.5 text-sm font-bold text-slate-700">
            Notes <span className="font-medium text-slate-400">(optional)</span>
            <textarea
              rows={3}
              placeholder="Location, bill reference, or anything worth remembering…"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-24 w-full resize-y rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-medium leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <div className="sticky bottom-0 -mx-5 -mb-5 px-5 py-4 bg-white/95 backdrop-blur border-t border-slate-100 flex gap-3">
            <button type="button" onClick={onClose} className="w-1/3 min-h-12 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 cursor-pointer">Cancel</button>
            <button type="submit" disabled={!isFormValid} className="w-2/3 min-h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed">{expense ? 'Save Changes' : 'Save Expense'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AddExpenseModal({ trip, isOpen, expenseToEdit, onClose, onSaveExpense }: AddExpenseModalProps) {
  if (!isOpen) return null;
  return <ExpenseForm key={expenseToEdit?.id || `new-${trip.id}-${trip.expenses.length}`} trip={trip} expense={expenseToEdit} onClose={onClose} onSaveExpense={onSaveExpense} />;
}
