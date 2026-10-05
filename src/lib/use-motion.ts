"use client";

import type { RefObject } from "react";
import { ScrollTrigger, useGSAP } from "./gsap";
import { matchMotion, MOTION_QUERIES, type MotionContext } from "./motion";

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

/** The section element nearest the top of the viewport. */
function anchorAtTop(): Element | null {
  const hit = document.elementFromPoint(
    window.innerWidth / 2,
    Math.min(80, window.innerHeight / 4),
  );
  return hit?.closest("section, footer, [data-work-pin], main > *") ?? null;
}

function pump() {
  const job = queue.shift();
  if (!job) {
    pumping = false;
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      // Pins created late add spacing above the viewport; keep whatever the
      // visitor is looking at in place (e.g. after Back restores the scroll).
      const anchor = anchorAtTop();
      const before = anchor?.getBoundingClientRect().top ?? 0;
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      if (anchor && window.scrollY > 0) {
        const delta = anchor.getBoundingClientRect().top - before;
        if (Math.abs(delta) > 2) window.scrollTo(0, window.scrollY + delta);
      }
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
        const t = performance.now();
        mm = matchMotion((ctx) => setup(ctx, root), root);
        const w = window as unknown as { __motionProfile?: [string, number][] };
        if (w.__motionProfile)
          w.__motionProfile.push([
            root.id || root.className.toString().slice(0, 40),
            performance.now() - t,
          ]);
      };
      // Decide on-screen vs off-screen without forcing a synchronous layout
      // (reading rects during hydration stalled WebKit for seconds): the
      // first IntersectionObserver callback says where the element is.
      let io: IntersectionObserver | null = null;
      // Pinned sections set up at once on desktop (their pins add page height).
      if (root.closest("[data-motion-now]") && window.matchMedia(MOTION_QUERIES.desktop).matches)
        run();
      else {
        io = new IntersectionObserver(
          ([entry]) => {
            io?.disconnect();
            io = null;
            if (entry?.isIntersecting) run();
            else schedule(run);
          },
          { rootMargin: "25% 0px" },
        );
        io.observe(root);
      }
      return () => {
        cancelled = true;
        io?.disconnect();
        mm?.revert();
      };
    },
    { scope, dependencies, revertOnUpdate: true },
  );
}
