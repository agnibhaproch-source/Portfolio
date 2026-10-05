"use client";

import { isCalm } from "./calm";
import { prefersReducedMotion } from "./motion";

export const IMPACT_EVENT = "agni:impact";

/**
 * Ask the global <ImpactFrame> to flash an anime impact frame (two or three
 * frames of inverted colour and rough sketch lines). Ignored under reduced
 * motion.
 */
export function impactFrame(strength = 1) {
  if (typeof window === "undefined" || prefersReducedMotion() || isCalm()) return;
  window.dispatchEvent(new CustomEvent(IMPACT_EVENT, { detail: strength }));
}
