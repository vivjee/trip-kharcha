"use client";
import { useState } from "react";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import type { Trip, Settlement, SimplifiedDebt } from "@/types/trip";
import { tripCalculations } from "@/lib/trip-store";
import { formatMoney } from "@/lib/money";
import { formatDateTime } from "@/lib/date-utils";
import Pagination, { PAGE_SIZE } from "./Pagination";
export default function BalancesView({
  trip,
  simplifiedDebts,
  onOpenSettleUp,
  onEditSettlement,
  onDeleteSettlement,
}: {
  trip: Trip;
  simplifiedDebts: SimplifiedDebt[];
  onOpenSettleUp: (d?: SimplifiedDebt) => void;
  onEditSettlement: (s: Settlement) => void;
  onDeleteSettlement: (id: string) => void;
}) {
  const [page, setPage] = useState(0);
  const { balances } = tripCalculations(trip);
  const name = (id: string) =>
    trip.participants.find((p) => p.id === id)?.name || "Member";
  const payments = [...trip.settlements].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const safePage = Math.min(
    page,
    Math.max(0, Math.ceil(payments.length / PAGE_SIZE) - 1),
  );
  return (
    <div className="tc-view">
      <div className="tc-page-heading">
        <div>
          <h1>Balances</h1>
          <p>Who pays whom, with less back and forth.</p>
        </div>
        <button className="tc-button primary" onClick={() => onOpenSettleUp()}>
          Record payment
        </button>
      </div>
      <section className="tc-card">
        <h2>Outstanding payments</h2>
        <p className="tc-help">
          Simplified payments based on all expenses and recorded payments.
        </p>
        {simplifiedDebts.length ? (
          simplifiedDebts.map((d) => (
            <div key={d.id} className="tc-debt">
              <div>
                <p>
                  <strong>{d.from.name}</strong>{" "}
                  <ArrowRight size={15} aria-label="pays" />{" "}
                  <strong>{d.to.name}</strong>
                </p>
                <strong className="tc-debt-amount">
                  {formatMoney(d.amount, trip.currencySymbol)}
                </strong>
              </div>
              <button className="tc-button" onClick={() => onOpenSettleUp(d)}>
                Record
              </button>
            </div>
          ))
        ) : (
          <p className="tc-empty">All square. No payments are outstanding.</p>
        )}
      </section>
      <p className="tc-info">
        Record a payment after money changes hands. This updates balances
        without changing the original expenses.
      </p>
      <section className="tc-card">
        <h2>Member balances</h2>
        {balances.map((b) => (
          <div className="tc-list-row" key={b.participantId}>
            <div>
              <strong>
                {b.avatar} {b.participantName}
              </strong>
              <p>
                Paid {formatMoney(b.totalPaid, trip.currencySymbol)} · Share{" "}
                {formatMoney(b.totalOwed, trip.currencySymbol)}
              </p>
            </div>
            <div className="tc-balance-value">
              <strong>
                {formatMoney(Math.abs(b.netBalance), trip.currencySymbol)}
              </strong>
              <p>
                {b.netBalance > 0
                  ? "To receive"
                  : b.netBalance < 0
                    ? "To pay"
                    : "Settled"}
              </p>
            </div>
          </div>
        ))}
      </section>
      <section className="tc-card">
        <h2>Payment history</h2>
        {payments
          .slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
          .map((s) => (
            <article className="tc-payment" key={s.id}>
              <div>
                <strong>
                  {name(s.fromParticipantId)} → {name(s.toParticipantId)}
                </strong>
                <p>{formatDateTime(s.date)}</p>
                {s.notes && <p>{s.notes}</p>}
              </div>
              <strong>{formatMoney(s.amount, trip.currencySymbol)}</strong>
              <div className="tc-actions">
                <button
                  className="tc-icon"
                  aria-label={"Edit payment from " + name(s.fromParticipantId)}
                  onClick={() => onEditSettlement(s)}
                >
                  <Pencil size={17} />
                </button>
                <button
                  className="tc-icon danger"
                  aria-label={
                    "Delete payment from " + name(s.fromParticipantId)
                  }
                  onClick={() => {
                    if (
                      confirm(
                        "Delete this recorded payment? Balances will be recalculated.",
                      )
                    )
                      onDeleteSettlement(s.id);
                  }}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        {!payments.length && <p>No payments recorded yet.</p>}
        <Pagination
          page={safePage}
          count={payments.length}
          onChange={setPage}
        />
      </section>
    </div>
  );
}
