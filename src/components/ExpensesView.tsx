'use client';

import React, { useState } from 'react';
import { Trip, Expense } from '@/types/trip';
import { Plus, Search, Trash2, Calendar, User, Users, Pencil } from 'lucide-react';

interface ExpensesViewProps {
  trip: Trip;
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export default function ExpensesView({
  trip,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
}: ExpensesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categoryIcons: Record<string, string> = {
    food: '🍱',
    transport: '🚕',
    stay: '🏨',
    activity: '🪂',
    shopping: '🛍️',
    other: '🧾',
  };

  const getParticipant = (id: string) => trip.participants.find((p) => p.id === id);

  const filteredExpenses = trip.expenses.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 space-y-4 animate-pop-in">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 leading-tight">Trip Expenses</h2>
          <p className="text-[11px] text-slate-500 font-medium">
            {trip.expenses.length} Total recorded items
          </p>
        </div>
        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search expense title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {['all', 'food', 'transport', 'stay', 'activity', 'shopping', 'other'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'All Items' : `${categoryIcons[cat] || ''} ${cat}`}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Cards List */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-2xl mb-2">🧾</p>
          <p className="text-xs font-bold text-slate-700">No expenses found</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your search or category filter.'
              : 'Tap "+ Add Expense" above to log your first expenditure.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredExpenses.map((expense) => {
              const payer = getParticipant(expense.paidById);
              const perPerson =
                expense.includedParticipantIds.length > 0
                  ? expense.amount / expense.includedParticipantIds.length
                  : 0;

              return (
                <div
                  key={expense.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shadow-xs">
                        {categoryIcons[expense.category] || '🧾'}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-tight">
                          {expense.title}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {expense.date}
                          </span>
                          <span>•</span>
                          <span className="capitalize px-1.5 py-0.2 rounded-md bg-slate-100 font-semibold text-slate-700">
                            {expense.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">
                        {trip.currencySymbol} {expense.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] font-semibold text-indigo-600 mt-0.5">
                        {trip.currencySymbol} {Math.round(perPerson).toLocaleString()} / person
                      </p>
                    </div>
                  </div>

                  {/* Details Footer: Who Paid & Included Badges */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-600 truncate max-w-[200px]">
                      <User className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                      <span className="truncate">
                        Paid by{' '}
                        {expense.payers && expense.payers.length > 0 ? (
                          <strong className="text-slate-900">
                            {expense.payers.map(p => {
                              const part = getParticipant(p.participantId);
                              return `${part?.name || 'Someone'} (${trip.currencySymbol}${p.amount})`;
                            }).join(', ')}
                          </strong>
                        ) : (
                          <strong className="text-slate-900">{payer?.avatar} {payer?.name}</strong>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                        <Users className="w-3 h-3" />
                        {expense.includedParticipantIds.length} members
                      </span>

                      <button onClick={() => onEditExpense(expense)} aria-label={`Edit ${expense.title}`} className="w-10 h-10 text-slate-500 hover:text-indigo-700 rounded-xl hover:bg-indigo-50 flex items-center justify-center cursor-pointer">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete “${expense.title}”? This will recalculate every balance.`)) onDeleteExpense(expense.id);
                        }}
                        className="w-10 h-10 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-center"
                        aria-label={`Delete ${expense.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
