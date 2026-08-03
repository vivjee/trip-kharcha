'use client';

import React, { useState } from 'react';
import { Calendar, Pencil, Search, Trash2, User, Users } from 'lucide-react';
import type { Expense, Trip } from '@/types/trip';
import { formatDateTime, toLocalDateTimeInput } from '@/lib/date-utils';
import AppButton from '@/components/AppButton';

interface ExpensesViewProps {
  trip: Trip;
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export default function ExpensesView({ trip, onOpenAddExpense, onEditExpense, onDeleteExpense }: ExpensesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categoryIcons: Record<string, string> = {
    food: '🍱',
    transport: '🚕',
    stay: '🏨',
    activity: '🎟️',
    shopping: '🛍️',
    other: '🧾',
  };

  const getParticipant = (id: string) => trip.participants.find((participant) => participant.id === id);
  const filteredExpenses = trip.expenses.filter((expense) => {
    const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4 p-4 animate-pop-in">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-base font-black leading-tight text-slate-950">Expenses</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-600">{trip.expenses.length} recorded</span>
      </header>

      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-4 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm font-medium text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar" aria-label="Filter expenses by category">
          {['all', 'food', 'transport', 'stay', 'activity', 'shopping', 'other'].map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
              className={`min-h-10 whitespace-nowrap rounded-lg px-3 text-xs font-bold capitalize transition-colors cursor-pointer ${selectedCategory === category ? 'bg-slate-900 text-white shadow-xs' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {category === 'all' ? 'All' : `${categoryIcons[category]} ${category}`}
            </button>
          ))}
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-2xl" aria-hidden="true">🧾</p>
          <p className="mt-2 text-sm font-extrabold text-slate-800">{trip.expenses.length === 0 ? 'No expenses yet' : 'No matching expenses'}</p>
          <p className="mt-1 text-xs text-slate-500">{trip.expenses.length === 0 ? 'Add the first expense when someone pays.' : 'Try another search or category.'}</p>
          {trip.expenses.length === 0 && <AppButton size="large" className="mt-4" onClick={onOpenAddExpense}>Add expense</AppButton>}
        </section>
      ) : (
        <div className="space-y-2.5">
          {filteredExpenses.map((expense) => {
            const payer = getParticipant(expense.paidById);
            const payerLabel = expense.payers && expense.payers.length > 0
              ? expense.payers.map((item) => getParticipant(item.participantId)?.name || 'Someone').join(', ')
              : payer?.name || 'Someone';

            return (
              <article key={expense.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">{categoryIcons[expense.category] || '🧾'}</div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-extrabold text-slate-950">{expense.title}</h3>
                      <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500"><Calendar className="h-3 w-3 shrink-0" /> {formatDateTime(toLocalDateTimeInput(expense.date, expense.createdAt))}</p>
                    </div>
                  </div>
                  <p className="max-w-[42%] shrink-0 truncate text-right text-sm font-black text-slate-950">{trip.currencySymbol} {expense.amount.toLocaleString()}</p>
                </div>

                <div className="mt-2 flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-600">
                  <span className="flex min-w-0 items-center gap-1 truncate"><User className="h-3.5 w-3.5 shrink-0 text-indigo-500" /> Paid by {payerLabel}</span>
                  <span className="shrink-0 text-slate-300">·</span>
                  <span className="flex shrink-0 items-center gap-1"><Users className="h-3.5 w-3.5" /> {expense.includedParticipantIds.length}</span>
                </div>

                {expense.notes && <p className="mt-2 line-clamp-2 whitespace-pre-line rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">{expense.notes}</p>}

                <div className="mt-2 flex justify-end gap-1 border-t border-slate-100 pt-2">
                  <AppButton onClick={() => onEditExpense(expense)} size="icon" variant="ghost" aria-label={`Edit ${expense.title}`}><Pencil className="h-4 w-4" /></AppButton>
                  <AppButton
                    onClick={() => { if (window.confirm(`Delete “${expense.title}”? This will recalculate every balance.`)) onDeleteExpense(expense.id); }}
                    size="icon"
                    variant="ghost"
                    className="text-slate-500 hover:bg-rose-50 hover:text-rose-700"
                    aria-label={`Delete ${expense.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </AppButton>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
