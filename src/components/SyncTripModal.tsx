"use client";
import { useRef, useState } from "react";
import { Download, FileUp, X } from "lucide-react";
import type { Trip } from "@/types/trip";
import SaveStatus from "./SaveStatus";
export default function SyncTripModal({
  trip,
  isOpen,
  onClose,
  onOpenClaimIdentity,
  onImportTrip,
}: {
  trip?: Trip;
  isOpen: boolean;
  onClose: () => void;
  onOpenClaimIdentity: () => void;
  onImportTrip: (trip: Trip) => Promise<boolean>;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  if (!isOpen) return null;
  const exportBackup = async () => {
    if (!trip || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const [{ createTripBackup }, { shareFiles }] = await Promise.all([
        import("@/lib/backup"),
        import("@/lib/platform"),
      ]);
      const blob = await createTripBackup(trip);
      await shareFiles(
        [
          new File(
            [blob],
            trip.name.replace(/[^a-z0-9]/gi, "_") + "_backup.json",
            { type: "application/json" },
          ),
        ],
        trip.name + " backup",
      );
      setMessage("Backup prepared. Keep a copy somewhere safe.");
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError"))
        setMessage("Could not export. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  const restore = async (file?: File) => {
    if (!file || busy) return;
    setBusy(true);
    setMessage("");
    const { importTripBackup, discardImportedPhotos } = await import(
      "@/lib/backup"
    );
    let imported: Trip | undefined;
    let persisted = false;
    try {
      imported = await importTripBackup(file);
      persisted = await onImportTrip(imported);
      if (persisted) onClose();
      else
        setMessage(
          "Import was not saved. Your original trips are unchanged. Retry after resolving the storage issue.",
        );
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Could not import this backup.",
      );
    } finally {
      if (imported && !persisted) await discardImportedPhotos(imported);
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };
  return (
    <div
      className="tc-dialog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-title"
    >
      <div className="tc-dialog">
        <div className="tc-section-title">
          <h2 id="backup-title">Backup & restore</h2>
          <button
            className="tc-icon"
            aria-label="Close backup"
            onClick={onClose}
            disabled={busy}
          >
            <X />
          </button>
        </div>
        <p className="tc-help">
          A portable copy of your trip, including its photos. Restoring adds a
          separate trip and keeps existing trips.
        </p>
        <SaveStatus />
        <div className="tc-view">
          {trip && (
            <button
              className="tc-button primary"
              disabled={busy}
              onClick={() => void exportBackup()}
            >
              <Download size={18} />
              Export {trip.name}
            </button>
          )}
          <button
            className="tc-button"
            disabled={busy}
            onClick={() => fileInput.current?.click()}
          >
            <FileUp size={18} />
            {busy ? "Working…" : "Import a backup"}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => void restore(e.target.files?.[0])}
          />
          <p className="tc-help">
            Compatible with v2 and v3 Trip Calculator backups. Maximum file
            size: 25 MB.
          </p>
          {trip && (
            <button
              className="tc-text-button"
              onClick={() => {
                onClose();
                onOpenClaimIdentity();
              }}
            >
              Choose device identity
            </button>
          )}
          {message && (
            <p role="status" className="tc-info">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
