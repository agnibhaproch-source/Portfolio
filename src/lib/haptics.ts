"use client";

import { prefersReducedMotion } from "./motion";

/*
 * Short vibrations for big moments on phones that support them (Android).
 * iOS has no Vibration API, so calls are simply ignored there. Browsers only
 * allow vibration after the visitor has interacted with the page.
 */
const PATTERNS = {
  impact: [18],
  send: [12, 40, 30],
  rune: [10, 30, 10],
  limit: [30, 50, 30, 50, 60],
} as const;

export function haptic(kind: keyof typeof PATTERNS) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (prefersReducedMotion() || !window.matchMedia("(pointer: coarse)").matches) return;
  // Browsers block vibration until the visitor has interacted with the page.
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
  try {
    navigator.vibrate([...PATTERNS[kind]]);
  } catch {}
}
