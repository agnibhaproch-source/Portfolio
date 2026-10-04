"use client";

import { gsap } from "./gsap";

/**
 * The three motion contexts from docs/02-MOTION.md.
 * Exactly one is true at a time, so setup code can branch on them.
 */
export const MOTION_QUERIES = {
  desktop:
    "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  touch:
    "(prefers-reduced-motion: no-preference) and (max-width: 1023px), (prefers-reduced-motion: no-preference) and (pointer: coarse)",
  reduced: "(prefers-reduced-motion: reduce)",
} as const;

export type MotionContext = { [K in keyof typeof MOTION_QUERIES]: boolean };

/**
 * Wraps gsap.matchMedia with the site's contexts. Call inside useGSAP;
 * returns the MatchMedia so the caller can revert it on cleanup.
 */
export function matchMotion(setup: (ctx: MotionContext) => void | (() => void)) {
  const mm = gsap.matchMedia();
  mm.add(MOTION_QUERIES, (context) => setup(context.conditions as MotionContext));
  return mm;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(MOTION_QUERIES.reduced).matches;
}
