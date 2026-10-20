"use client";

import { useCallback, useSyncExternalStore } from "react";

// A per-browser preference kept in localStorage. The server render and first
// paint use the fallback, then the stored value takes over without an effect.
const EVENT = "ambtracker:storage";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function useStoredString(key: string, fallback: string) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key) ?? fallback,
    () => fallback
  );
  const set = useCallback(
    (next: string) => {
      try {
        localStorage.setItem(key, next);
      } catch {
        // private mode: keep working for this page only
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [key]
  );
  return [value, set] as const;
}

export function useStoredFlag(key: string) {
  const [raw, set] = useStoredString(key, "0");
  return [raw === "1", (next: boolean) => set(next ? "1" : "0")] as const;
}
