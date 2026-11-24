"use client";
import { useState } from "react";
import type { Trip } from "@/types/trip";
import { tripCalculations } from "@/lib/trip-store";
import { formatMoney, roundMoney } from "@/lib/money";
import { getTripDurationInDays, formatDateRange } from "@/lib/date-utils";
import { getTripRecap, getCategoryConicGradient } from "@/lib/trip-recap";
import Pagination, { PAGE_SIZE } from "./Pagination";
export default function AnalyticsView({ trip }: { trip: Trip }) {
  const [page, setPage] = useState(0);
  const { stats, balances } = tripCalculations(trip);
  const recap = getTripRecap(trip);
  const days = getTripDurationInDays(trip);
  const sorted = [...balances].sort((a, b) => b.totalPaid - a.totalPaid);
  const max = Math.max(1, ...recap.dailySpending.map((d) => d.amount));
  return (
    <div className="tc-view">
      <div className="tc-page-heading">
        <div>
          <h1>Spending insights</h1>
          <p>
            {formatDateRange(trip)} ·{" "}
            {trip.status === "completed"
              ? "Completed trip"
              : "Updates as you spend"}
          </p>
        </div>
      </div>
      <section className="tc-card">
        <span className="tc-eyebrow">TOTAL SPENT</span>
        <strong className="tc-amount">
          {formatMoney(stats.totalSpent, trip.currencySymbol)}
        </strong>
        <p>
          {stats.totalExpensesCount} expenses across{" "}
          {recap.dailySpending.length} spending days
        </p>
      </section>
      <div className="tc-insight-grid">
        {[
          {
            label: "Average per person",
            value: formatMoney(stats.perPersonAvg, trip.currencySymbol),
          },
          {
            label: "Daily average",
            value: formatMoney(
              roundMoney(stats.totalSpent / days),
              trip.currencySymbol,
            ),
          },
          {
            label: "Biggest expense",
            value: recap.biggestExpense
              ? formatMoney(recap.biggestExpense.amount, trip.currencySymbol)
              : "No expenses",
            detail: recap.biggestExpense?.title,
          },
          {
            label: "Top payer",
            value: stats.totalSpent
              ? sorted[0]?.participantName
              : "No spending yet",
            detail: stats.totalSpent
              ? formatMoney(sorted[0].totalPaid, trip.currencySymbol)
              : "",
          },
        ].map((s) => (
          <section className="tc-card" key={s.label}>
            <p className="tc-help">{s.label}</p>
            <strong>{s.value}</strong>
            {s.detail && <p className="tc-help">{s.detail}</p>}
          </section>
        ))}
      </div>
      <section className="tc-card">
        <h2>Where it went</h2>
        {recap.categories.length ? (
          <div className="tc-category-chart">
            <div
              className="tc-donut"
              role="img"
              aria-label={recap.categories
                .map((c) => c.label + " " + c.percentage.toFixed(1) + "%")
                .join(", ")}
              style={{ background: getCategoryConicGradient(recap.categories) }}
            >
              <span>{recap.dominantCategory?.icon}</span>
            </div>
            <div>
              {recap.categories.map((c) => (
                <div className="tc-list-row" key={c.category}>
                  <div>
                    <strong>
                      {c.icon} {c.label}
                    </strong>
                    <p>{c.percentage.toFixed(1)}%</p>
                  </div>
                  <strong>{formatMoney(c.amount, trip.currencySymbol)}</strong>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="tc-empty">Categories appear after the first expense.</p>
        )}
      </section>
      <section className="tc-card">
        <div className="tc-section-title">
          <h2>Day by day</h2>
          {recap.highestSpendDay && (
            <p className="tc-help">Peak: {recap.highestSpendDay.label}</p>
          )}
        </div>
        {recap.dailySpending
          .slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
          .map((d) => (
            <div className="tc-daily-row" key={d.date}>
              <div className="tc-row">
                <span>
                  {d.label} · {d.expenseCount} entries
                </span>
                <strong>{formatMoney(d.amount, trip.currencySymbol)}</strong>
              </div>
              <div
                className="tc-bar"
                role="img"
                aria-label={
                  d.label + ": " + formatMoney(d.amount, trip.currencySymbol)
                }
              >
                <span style={{ width: (d.amount / max) * 100 + "%" }} />
              </div>
            </div>
          ))}
        {!recap.dailySpending.length && <p>No daily spending yet.</p>}
        <Pagination
          page={page}
          count={recap.dailySpending.length}
          onChange={setPage}
        />
      </section>
      <section className="tc-card">
        <h2>Who has paid</h2>
        {sorted.map((b) => (
          <div key={b.participantId} className="tc-list-row">
            <strong>
              {b.avatar} {b.participantName}
            </strong>
            <strong>{formatMoney(b.totalPaid, trip.currencySymbol)}</strong>
          </div>
        ))}
      </section>
      <section className="tc-card">
        <h2>Trip pace</h2>
        <p>
          {days} trip days · {recap.dailySpending.length} spending days ·{" "}
          {stats.totalExpensesCount} expenses
        </p>
      </section>
    </div>
  );
}
