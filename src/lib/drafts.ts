"use client";
import { useState, type SetStateAction } from "react";
const ROOT = "trip_calculator_draft:";
/** Best-effort draft persistence is separate from the committed, versioned library. */
export function useDraftState<T>(
  key: string,
  initial: T | (() => T),
): [T, (next: SetStateAction<T>) => void] {
  const [value, setValue] = useState<T>(() => {
    const fallback =
      typeof initial === "function" ? (initial as () => T)() : initial;
    try {
      const raw = localStorage.getItem(ROOT + key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (fallback === undefined)
        return typeof parsed === "string" ? (parsed as T) : fallback;
      if (
        typeof parsed !== typeof fallback ||
        Array.isArray(parsed) !== Array.isArray(fallback)
      )
        return fallback;
      return parsed;
    } catch {
      return fallback;
    }
  });
  const update = (next: SetStateAction<T>) =>
    setValue((current) => {
      const result =
        typeof next === "function" ? (next as (v: T) => T)(current) : next;
      try {
        if (result === undefined) localStorage.removeItem(ROOT + key);
        else localStorage.setItem(ROOT + key, JSON.stringify(result));
      } catch {
        /* The in-memory form remains available when storage is full. */
      }
      return result;
    });
  return [value, update];
}
export function clearDraft(prefix: string) {
  try {
    for (const key of Object.keys(localStorage))
      if (key.startsWith(ROOT + prefix + ":")) localStorage.removeItem(key);
  } catch {
    /* unavailable storage */
  }
}
