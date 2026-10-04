"use client";

import { useSyncExternalStore } from "react";

/*
 * Tiny store for the hero's anti-magic mode. The hero name toggles it; the
 * full-screen layer in the root layout renders it, above nav and content.
 */

type State = { active: boolean; x: number; y: number };

const SERVER: State = { active: false, x: 0, y: 0 };
let state: State = SERVER;
const listeners = new Set<() => void>();

export const antiMagic = {
  get: () => state,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  /** origin: viewport point the sigil and cracks project from. */
  set(active: boolean, origin?: { x: number; y: number }) {
    if (state.active === active) return;
    state = { active, x: origin?.x ?? state.x, y: origin?.y ?? state.y };
    listeners.forEach((fn) => fn());
  },
};

export function useAntiMagic() {
  return useSyncExternalStore(antiMagic.subscribe, antiMagic.get, () => SERVER);
}
