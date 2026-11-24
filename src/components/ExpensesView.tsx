"use client";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Trip, Expense } from "@/types/trip";
import { formatMoney } from "@/lib/money";
import { getExpenseShares } from "@/lib/debt-simplification";
import { formatSingleDate } from "@/lib/date-utils";
import Pagination, { PAGE_SIZE } from "./Pagination";

export default function ExpensesView({
  trip,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
}: {
  trip: Trip;
  onOpenAddExpense: () => void;
  onEditExpense: (e: Expense) => void;
  onDeleteExpense: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(0);
  const filtered = useMemo(
    () =>
      trip.expenses
        .filter(
          (e) =>
            (e.title + " " + (e.notes || ""))
              .toLowerCase()
              .includes(query.toLowerCase()) &&
            (category === "all" || e.category === category),
        )
        .sort(
          (a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id),
        ),
    [trip.expenses, query, category],
  );
  const safePage = Math.min(
    page,
    Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1),
  );
  const visible = filtered.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE,
  );
  const editable = trip.status !== "completed";
  return (
    <div className="tc-view">
      <div className="tc-page-heading">
        <div>
          <h1>Expenses</h1>
          <p>
            {trip.expenses.length}{" "}
            {trip.expenses.length === 1 ? "expense" : "expenses"} recorded for
            this trip.
          </p>
        </div>
        {editable && (
          <button className="tc-button primary" onClick={onOpenAddExpense}>
            <Plus size={18} />
            Add expense
          </button>
        )}
      </div>
      {!editable && (
        <p className="tc-info">
          This trip is completed. Reopen it in Trip details to change expenses.
        </p>
      )}
      <div className="tc-filters">
        <label className="tc-field">
          <span className="sr-only">Search expenses</span>
          <input
            placeholder="Search expense title..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
        </label>
        <label className="tc-field">
          <span className="sr-only">Category</span>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(0);
            }}
          >
            {[
              "all",
              "food",
              "transport",
              "stay",
              "activity",
              "shopping",
              "other",
            ].map((c) => (
              <option key={c} value={c}>
                {c === "all"
                  ? "All categories"
                  : c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="tc-help">{filtered.length} matching expenses</p>
      {visible.map((e, i) => {
        const shares = getExpenseShares(e);
        const amounts = new Set(shares.map((s) => s.amount));
        const equal = amounts.size === 1;
        return (
          <div key={e.id}>
            {(i === 0 ||
              visible[i - 1].date.slice(0, 10) !== e.date.slice(0, 10)) && (
              <h2 className="tc-date-heading">{formatSingleDate(e.date)}</h2>
            )}
            <article className="tc-expense">
              <div className="tc-expense-main">
                <div>
                  <span className="tc-eyebrow">{e.category}</span>
                  <h3>{e.title}</h3>
                  <p>
                    {e.payers && e.payers.length > 1
                      ? e.payers.length + " people paid"
                      : (trip.participants.find((p) => p.id === e.paidById)
                          ?.name || "Member") + " paid"}
                  </p>
                </div>
                <strong>{formatMoney(e.amount, trip.currencySymbol)}</strong>
              </div>
              <div className="tc-expense-footer">
                <span>
                  {equal && shares.length
                    ? formatMoney(shares[0].amount, trip.currencySymbol) +
                      " each"
                    : shares.length +
                      " shares · " +
                      (e.splitMode === "equal"
                        ? "remainder included"
                        : "custom split")}
                </span>
                {editable && (
                  <div className="tc-actions">
                    <button
                      className="tc-icon"
                      aria-label={"Edit " + e.title}
                      onClick={() => onEditExpense(e)}
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      className="tc-icon danger"
                      aria-label={"Delete " + e.title}
                      onClick={() => {
                        if (confirm("Delete “" + e.title + "”?"))
                          onDeleteExpense(e.id);
                      }}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                )}
              </div>
              {e.notes && <p className="tc-help">{e.notes}</p>}
            </article>
          </div>
        );
      })}
      {!visible.length && (
        <p className="tc-empty">
          {trip.expenses.length
            ? "No expenses match your filters."
            : "No expenses yet. Add the first one when you are ready."}
        </p>
      )}
      <Pagination page={safePage} count={filtered.length} onChange={setPage} />
    </div>
  );
}
