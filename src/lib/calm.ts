"use client";

import { useSyncExternalStore } from "react";
import { ScrollTrigger } from "./gsap";

/*
 * Calm mode: html[data-calm] turns off the heavy scenes (summoning, duel,
 * swordsman cut, montage, segment cards, impact frames, speed lines, spell
 * casting, the cover intro) for visitors in a hurry. Light reveals stay.
 * The head script restores it before first paint; per-visitor localStorage.
 */

const KEY = "agni:calm";
const listeners = new Set<() => void>();

export function isCalm() {
  return typeof document !== "undefined" && document.documentElement.hasAttribute("data-calm");
}

export const calmMode = {
  get: isCalm,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  toggle() {
    const on = !isCalm();
    document.documentElement.toggleAttribute("data-calm", on);
    if (on) document.documentElement.removeAttribute("data-black-form");
    try {
      window.localStorage.setItem(KEY, on ? "1" : "0");
    } catch {}
    listeners.forEach((fn) => fn());
    // Scenes change height when calm flips; re-measure every trigger.
    requestAnimationFrame(() => ScrollTrigger.refresh());
  },
};

export function useCalm() {
  return useSyncExternalStore(calmMode.subscribe, isCalm, () => false);
}
