"use client";

import type { RefObject } from "react";
import { ScrollTrigger, useGSAP } from "./gsap";
import { matchMotion, type MotionContext } from "./motion";

/*
 * Animation setup for anything starting off screen is queued and run one
 * component per idle slice, instead of all at once during hydration (which
 * blocked slow phones for seconds). On-screen components still set up
 * immediately so nothing visible flashes. Once the queue drains, triggers
 * are re-sorted and measured.
 */
const queue: (() => void)[] = [];
let pumping = false;
let refreshTimer = 0;

const idle =
  typeof window !== "undefined" && "requestIdleCallback" in window
    ? (fn: () => void) => window.requestIdleCallback(fn, { timeout: 250 })
    : (fn: () => void) => window.setTimeout(fn, 16);

function pump() {
  const job = queue.shift();
  if (!job) {
    pumping = false;
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, 50);
    return;
  }
  job();
  idle(pump);
}

function schedule(job: () => void) {
  queue.push(job);
  if (!pumping) {
    pumping = true;
    idle(pump);
  }
}

/**
 * useGSAP + the site's matchMedia contexts, scoped to `scope` so selector
 * strings stay local. Everything created inside is reverted on unmount or
 * when a dependency changes. Off-screen components set up during idle time.
 */
export function useMotion(
  setup: (ctx: MotionContext, root: HTMLElement) => void | (() => void),
  scope: RefObject<HTMLElement | null>,
  dependencies: unknown[] = [],
) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      let mm: ReturnType<typeof matchMotion> | null = null;
      let cancelled = false;
      const run = () => {
        if (cancelled) return;
        mm = matchMotion((ctx) => setup(ctx, root), root);
      };
      const r = root.getBoundingClientRect();
      const onScreen = r.top < window.innerHeight * 1.25 && r.bottom > -window.innerHeight * 0.25;
      if (onScreen || root.closest("[data-motion-now]")) run();
      else schedule(run);
      return () => {
        cancelled = true;
        mm?.revert();
      };
    },
    { scope, dependencies, revertOnUpdate: true },
  );
}
