"use client";

import { useSyncExternalStore } from "react";

/*
 * Rune hunt progress, per visitor. Stored in localStorage as a convenience;
 * every read and write is guarded so private windows just start fresh.
 */

const KEY = "agni:runes";
const EMPTY: readonly string[] = [];
let found: readonly string[] | null = null;
const listeners = new Set<() => void>();

function read(): readonly string[] {
  if (found) return found;
  try {
    const raw = window.localStorage.getItem(KEY);
    found = raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    found = [];
  }
  return found;
}

export const runes = {
  get: read,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  /** Returns the new count, or null if this rune was already found. */
  collect(id: string): number | null {
    const now = read();
    if (now.includes(id)) return null;
    found = [...now, id];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(found));
    } catch {}
    listeners.forEach((fn) => fn());
    return found.length;
  },
};

export function useRunes() {
  return useSyncExternalStore(runes.subscribe, runes.get, () => EMPTY);
}

/* Toast channel so any rune can announce progress through one live region. */
type Toast = { text: string; link?: { href: string; label: string } } | null;
let toast: Toast = null;
const toastListeners = new Set<() => void>();
export const toasts = {
  get: () => toast,
  subscribe(fn: () => void) {
    toastListeners.add(fn);
    return () => {
      toastListeners.delete(fn);
    };
  },
  show(t: Toast) {
    toast = t;
    toastListeners.forEach((fn) => fn());
  },
};
export function useToast() {
  return useSyncExternalStore(toasts.subscribe, toasts.get, () => null);
}
