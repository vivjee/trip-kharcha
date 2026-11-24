import type { CategoryType, Expense, Trip } from '../types/trip.ts';
import { sumMoney } from './money.ts';
import { parseLocalDate } from './date-utils.ts';

export const CATEGORY_DETAILS: Record<CategoryType, { label: string; icon: string; color: string }> = {
  food: { label: 'Food', icon: '🍱', color: '#f59e0b' },
  transport: { label: 'Transport', icon: '🚕', color: '#3b82f6' },
  stay: { label: 'Stay', icon: '🏨', color: '#8b5cf6' },
  activity: { label: 'Activities', icon: '🎟️', color: '#10b981' },
  shopping: { label: 'Shopping', icon: '🛍️', color: '#f43f5e' },
  other: { label: 'Other', icon: '🧾', color: '#64748b' },
};

export interface RecapCategory {
  category: CategoryType;
  label: string;
  icon: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface RecapDay {
  date: string;
  label: string;
  shortLabel: string;
  amount: number;
  expenseCount: number;
}

export interface TripRecap {
  totalSpent: number;
  categories: RecapCategory[];
  dailySpending: RecapDay[];
  biggestExpense?: Expense;
  highestSpendDay?: RecapDay;
  dominantCategory?: RecapCategory;
}

const recapCache = new WeakMap<Trip['expenses'], TripRecap>();
export function getTripRecap(trip: Trip): TripRecap {
  const cached = recapCache.get(trip.expenses);
  if (cached) return cached;
  const totalSpent = sumMoney(trip.expenses.map(e => e.amount));
  const categoryTotals = new Map<CategoryType, number>();
  const dayTotals = new Map<string, { amount: number; expenseCount: number }>();

  let biggestExpense: Expense | undefined;
  trip.expenses.forEach((expense) => {
    categoryTotals.set(expense.category, sumMoney([categoryTotals.get(expense.category) || 0, expense.amount]));
    const date = expense.date.slice(0, 10);
    const day = dayTotals.get(date) || { amount: 0, expenseCount: 0 };
    dayTotals.set(date, { amount: sumMoney([day.amount, expense.amount]), expenseCount: day.expenseCount + 1 });
    if (!biggestExpense || expense.amount > biggestExpense.amount) biggestExpense = expense;
  });

  const categories = Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({
      category,
      ...CATEGORY_DETAILS[category],
      amount,
      percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
    }))
    .sort((first, second) => second.amount - first.amount);

  const dailySpending = Array.from(dayTotals.entries())
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([date, day]) => {
      const parsed = parseLocalDate(date);
      return {
        date,
        label: parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        shortLabel: parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...day,
      };
    });

  const highestSpendDay = dailySpending.reduce<RecapDay | undefined>((highest, day) => (
    !highest || day.amount > highest.amount ? day : highest
  ), undefined);

  const result = {
    totalSpent,
    categories,
    dailySpending,
    biggestExpense,
    highestSpendDay,
    dominantCategory: categories[0],
  };
  recapCache.set(trip.expenses, result);
  return result;
}

export function getCategoryConicGradient(categories: RecapCategory[]): string {
  if (categories.length === 0) return '#e2e8f0';
  let cursor = 0;
  const stops = categories.map((category) => {
    const start = cursor;
    cursor += category.percentage;
    return `${category.color} ${start.toFixed(2)}% ${cursor.toFixed(2)}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
}
