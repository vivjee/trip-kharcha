"use client";
import { useState } from "react";
import { X } from "lucide-react";
import type { SimplifiedDebt, Trip } from "@/types/trip";
import { tripCalculations } from "@/lib/trip-store";
import { formatMoney } from "@/lib/money";
import { formatDateRange } from "@/lib/date-utils";
export default function ShareSummaryModal({
  trip,
  simplifiedDebts,
  isOpen,
  onClose,
}: {
  trip: Trip;
  simplifiedDebts: SimplifiedDebt[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  if (!isOpen) return null;
  const { stats, balances } = tripCalculations(trip);
  const summary = [
    trip.name + " — Trip summary",
    formatDateRange(trip),
    "Total spent: " + formatMoney(stats.totalSpent, trip.currencySymbol),
    "",
    "SIMPLIFIED PAYMENTS",
    ...(simplifiedDebts.length
      ? simplifiedDebts.map(
          (d, i) =>
            i +
            1 +
            ". " +
            d.from.name +
            " → " +
            d.to.name +
            ": " +
            formatMoney(d.amount, trip.currencySymbol),
        )
      : ["All square. No pending payments."]),
    "",
    "MEMBER SPENDING",
    ...balances.map(
      (b) =>
        b.participantName +
        ": paid " +
        formatMoney(b.totalPaid, trip.currencySymbol) +
        ", share " +
        formatMoney(b.totalOwed, trip.currencySymbol),
    ),
    "",
    "Shared with Trip Calculator",
  ].join("\n");
  const filename = trip.name.replace(/[^a-z0-9]/gi, "_");
  const exportFiles = async (images: boolean) => {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const { shareFiles } = await import("@/lib/platform");
      const files = images
        ? (
            await (
              await import("@/lib/share-card")
            ).createShareCards(trip, simplifiedDebts)
          ).map(
            (b, i) =>
              new File([b], filename + "_summary_" + (i + 1) + ".png", {
                type: "image/png",
              }),
          )
        : [
            new File([summary], filename + "_summary.txt", {
              type: "text/plain",
            }),
          ];
      await shareFiles(files, trip.name + " summary");
      setMessage(
        files.length +
          " " +
          (images ? "image page(s)" : "text file") +
          " prepared.",
      );
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError"))
        setMessage(e instanceof Error ? e.message : "Could not export.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      className="tc-dialog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-title"
    >
      <div className="tc-dialog">
        <div className="tc-section-title">
          <h2 id="share-title">Share trip summary</h2>
          <button
            className="tc-icon"
            aria-label="Close share summary"
            disabled={busy}
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        <div className="tc-view">
          <textarea
            aria-label="Trip summary text"
            className="tc-summary-text"
            rows={10}
            readOnly
            value={summary}
          />
          <p className="tc-help">
            Includes every pending payment. Image summaries add pages as needed
            so names and amounts stay readable.
          </p>
          <button
            className="tc-button primary"
            disabled={busy}
            onClick={() => void exportFiles(true)}
          >
            {busy ? "Preparing…" : "Share / download images"}
          </button>
          <button
            className="tc-button"
            disabled={busy}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(summary);
                setMessage("Summary copied.");
              } catch {
                setMessage("Clipboard unavailable. Download the text instead.");
              }
            }}
          >
            Copy summary
          </button>
          <button
            className="tc-button"
            disabled={busy}
            onClick={() => void exportFiles(false)}
          >
            Export text summary
          </button>
          {message && <p role="status">{message}</p>}
        </div>
      </div>
    </div>
  );
}
