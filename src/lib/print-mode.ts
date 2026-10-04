"use client";

import { useSyncExternalStore } from "react";

/*
 * Print reading mode: html[data-print] swaps the colour tokens so the whole
 * site reads as black-and-white manga print. The head script restores it
 * before first paint; the choice is a per-visitor convenience in localStorage.
 */

const KEY = "agni:print";
const listeners = new Set<() => void>();

function get() {
  return document.documentElement.hasAttribute("data-print");
}

export const printMode = {
  get,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  toggle() {
    const on = !get();
    document.documentElement.toggleAttribute("data-print", on);
    try {
      window.localStorage.setItem(KEY, on ? "1" : "0");
    } catch {}
    listeners.forEach((fn) => fn());
  },
};

export function usePrintMode() {
  return useSyncExternalStore(printMode.subscribe, printMode.get, () => false);
}
