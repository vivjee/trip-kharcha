"use client";
import { useRef, useState } from "react";
import { reloadLibrary, useTripStore } from "@/lib/trip-store";

export function useSaveForm() {
  const lock = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const run = async (action: () => Promise<boolean>) => {
    if (lock.current) return false;
    lock.current = true;
    setSaving(true);
    setError("");
    try {
      return await action();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not save. Please retry.",
      );
      return false;
    } finally {
      lock.current = false;
      setSaving(false);
    }
  };
  return { saving, error, run };
}
export default function SaveStatus({
  saving = false,
  error = "",
}: {
  saving?: boolean;
  error?: string;
}) {
  const store = useTripStore();
  const message = error || store.error;
  if (saving)
    return (
      <p role="status" className="save-feedback">
        Saving to this device…
      </p>
    );
  if (!message) return null;
  return (
    <div role="alert" className="save-feedback">
      <p>{message}</p>
      {store.conflict && (
        <button type="button" className="tc-button" onClick={reloadLibrary}>
          Load latest library
        </button>
      )}
    </div>
  );
}
