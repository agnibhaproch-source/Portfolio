"use client";

import type { RefObject } from "react";
import { useGSAP } from "./gsap";
import { matchMotion, type MotionContext } from "./motion";

/**
 * useGSAP + the site's matchMedia contexts, scoped to `scope` so selector
 * strings stay local. Everything created inside is reverted on unmount or
 * when a dependency changes.
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
      const mm = matchMotion((ctx) => setup(ctx, root), root);
      return () => mm.revert();
    },
    { scope, dependencies, revertOnUpdate: true },
  );
}
