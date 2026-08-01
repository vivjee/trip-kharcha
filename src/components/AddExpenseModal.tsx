'use client';

import React, { useState, useEffect } from 'react';
import { Trip, CategoryType, Expense, ExpensePayer } from '@/types/trip';
import { X, Check, Calculator, UserCheck, Utensils, Car, Hotel, Compass, ShoppingBag, Receipt } from 'lucide-react';

interface AddExpenseModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: Omit<Expense, 'id'>) => void;
}

export default function AddExpenseModal({
  trip,
  isOpen,
  onClose,
  onSaveExpense,
}: AddExpenseModalProps) {
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<CategoryType>('food');
  const [paidById, setPaidById] = useState<string>(trip.participants[0]?.id || '');
  const [isMultiPayer, setIsMultiPayer] = useState(false);
  const [payerAmounts, setPayerAmounts] = useState<Record<string, string>>({});
  const [includedIds, setIncludedIds] = useState<string[]>(
    trip.participants.map((p) => p.id)
  );
  const [notes, setNotes] = useState('');

  // Auto-select ALL trip participants by default whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setIncludedIds(trip.participants.map((p) => p.id));
      if (!paidById && trip.participants[0]) {
        setPaidById(trip.participants[0].id);
      }
    }
  }, [isOpen, trip.participants]);

  if (!isOpen) return null;

  // Calculate total amount depending on payer mode
  const multiPayerTotal = Object.values(payerAmounts).reduce((sum, val) => {
    const num = parseFloat(val) || 0;
    return sum + num;
  }, 0);

  const numAmount = isMultiPayer ? multiPayerTotal : parseFloat(amountStr) || 0;

  const perPersonShare =
    includedIds.length > 0 ? Math.round((numAmount / includedIds.length) * 100) / 100 : 0;

  const categories: { id: CategoryType; label: string; icon: any }[] = [
    { id: 'food', label: 'Food', icon: Utensils },
    { id: 'transport', label: 'Transport', icon: Car },
    { id: 'stay', label: 'Stay', icon: Hotel },
    { id: 'activity', label: 'Activity', icon: Compass },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'other', label: 'Other', icon: Receipt },
  ];

  const selectedCatObj = categories.find((c) => c.id === category);
  const categoryLabel = selectedCatObj?.label || 'Expense';

  const isFormValid =
    numAmount > 0 &&
    includedIds.length > 0 &&
    (!isMultiPayer || multiPayerTotal > 0);

  const handlePayerAmountChange = (participantId: string, val: string) => {
    setPayerAmounts({
      ...payerAmounts,
      [participantId]: val,
    });
  };

  const toggleParticipant = (id: string) => {
    if (includedIds.includes(id)) {
      setIncludedIds(includedIds.filter((item) => item !== id));
    } else {
      setIncludedIds([...includedIds, id]);
    }
  };

  const handleSelectAll = () => {
    setIncludedIds(trip.participants.map((p) => p.id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    let finalPayers: ExpensePayer[] | undefined = undefined;
    let mainPayerId = paidById;

    if (isMultiPayer) {
      finalPayers = Object.entries(payerAmounts)
        .map(([id, val]) => ({
          participantId: id,
          amount: parseFloat(val) || 0,
        }))
        .filter((p) => p.amount > 0);

      if (finalPayers.length === 0) return;
      mainPayerId = finalPayers[0].participantId;
    }

    const finalTitle = title.trim() || categoryLabel;

    onSaveExpense({
      title: finalTitle,
      amount: numAmount,
      paidById: mainPayerId,
      payers: finalPayers,
      includedParticipantIds: includedIds,
      category,
      date: new Date().toISOString().split('T')[0],
      notes: notes.trim(),
    });

    // Reset form
    setTitle('');
    setAmountStr('');
    setPayerAmounts({});
    setIsMultiPayer(false);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-4 animate-pop-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Add New Expense</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* Title Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Expense Title</label>
              <span className="text-[10px] font-semibold text-slate-400">Optional (Defaults to {categoryLabel})</span>
            </div>
            <input
              type="text"
              placeholder={`e.g. Lunch, Resort Stay (Defaults to "${categoryLabel}")`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs font-medium text-slate-900 bg-slate-50/50"
            />
          </div>

          {/* Category Selector Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payer Mode Segment Toggle */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Who Paid?</label>
              <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setIsMultiPayer(false)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    !isMultiPayer ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Single Payer
                </button>
                <button
                  type="button"
                  onClick={() => setIsMultiPayer(true)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    isMultiPayer ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Multiple Payers
                </button>
              </div>
            </div>

            {!isMultiPayer ? (
              /* Single Payer Mode */
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Paid By
                  </label>
                  <select
                    value={paidById}
                    onChange={(e) => setPaidById(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 text-xs font-extrabold text-slate-900 bg-slate-50 cursor-pointer h-[42px]"
                  >
                    {trip.participants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.avatar} {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-40">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Total Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-black text-indigo-600">
                      {trip.currencySymbol}
                    </span>
                    <input
                      type="number"
                      step="any"
                      required={!isMultiPayer}
                      placeholder="0.00"
                      value={amountStr}
                      onChange={(e) => setAmountStr(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-black text-slate-900 text-right bg-slate-50 h-[42px]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Multiple Payers Mode */
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 font-medium">
                  Enter exact amounts paid by each contributor:
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                  {trip.participants.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 text-xs font-extrabold text-slate-900">
                        <span className="text-base">{p.avatar}</span>
                        <span>{p.name}</span>
                      </div>
                      <div className="relative w-36">
                        <span className="absolute left-3 top-2 text-sm font-black text-indigo-600">
                          {trip.currencySymbol}
                        </span>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={payerAmounts[p.id] || ''}
                          onChange={(e) => handlePayerAmountChange(p.id, e.target.value)}
                          className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-black text-slate-900 text-right bg-slate-50 h-[38px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-extrabold text-slate-900">
                  <span>Calculated Total Expense:</span>
                  <span className="text-indigo-600 text-sm">
                    {trip.currencySymbol} {multiPayerTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Who Participated (Opt-in / Opt-out Checkboxes) */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">Split Among Members</span>
              </div>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Select All ({trip.participants.length})
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mb-2 font-medium">
              Select everyone who shared/consumed this expense.
            </p>

            <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
              {trip.participants.map((p) => {
                const isIncluded = includedIds.includes(p.id);
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => toggleParticipant(p.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer border ${
                      isIncluded
                        ? 'bg-white border-indigo-200 shadow-2xs text-slate-900'
                        : 'bg-slate-100/90 border-slate-200 text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                          isIncluded
                            ? 'bg-indigo-600 text-white border border-indigo-600'
                            : 'bg-white border-2 border-slate-300 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className={`font-bold ${isIncluded ? 'text-slate-900' : 'text-slate-700'}`}>
                        {p.avatar} {p.name}
                      </span>
                    </div>

                    {isIncluded ? (
                      numAmount > 0 ? (
                        <span className="text-[11px] font-bold text-indigo-600">
                          {trip.currencySymbol} {perPersonShare.toLocaleString()}
                        </span>
                      ) : null
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-200/70 px-2 py-0.5 rounded-md">
                        Opted out
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Split summary footnote */}
            {numAmount > 0 && (
              <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>Total Per Member ({includedIds.length} members):</span>
                <span className="font-extrabold text-slate-900">
                  {trip.currencySymbol} {perPersonShare.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Notes Optional */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="Location, bill reference..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 bg-slate-50/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
