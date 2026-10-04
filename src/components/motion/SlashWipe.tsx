"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { DUR, gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/*
 * "Dimension slash": the site's full-screen transition (replaces the brush
 * InkWipe, see DECISIONS.md). A blade line cuts the screen on a diagonal,
 * two ink halves slam shut along it, then slide apart to uncover.
 */

// Cut runs from (0, 82) to (100, 18) in a 100x100 box.
const HALF_A = "polygon(0% 0%, 100% 0%, 100% 18%, 0% 82%)";
const HALF_B = "polygon(0% 82%, 100% 18%, 100% 100%, 0% 100%)";

type Slash = {
  /** Resolves once the screen is fully covered. */
  cover: () => Promise<void>;
  /** Resolves once the screen is fully visible again. */
  uncover: () => Promise<void>;
  /** Cover then uncover, with an optional callback in between. */
  play: (between?: () => void | Promise<void>) => Promise<void>;
};

const SlashContext = createContext<Slash | null>(null);

export function useSlash() {
  const ctx = useContext(SlashContext);
  if (!ctx) throw new Error("useSlash must be used inside <SlashWipeProvider>");
  return ctx;
}

export function SlashWipeProvider({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  // The overlay lives as long as the app; kill anything in flight on unmount.
  useEffect(() => {
    const el = root.current;
    return () => {
      if (el) gsap.killTweensOf(el.querySelectorAll("*"));
    };
  }, []);

  const cover = useCallback(
    () =>
      new Promise<void>((resolve) => {
        const el = root.current;
        if (!el) return resolve();
        const q = gsap.utils.selector(el);
        gsap.killTweensOf(q("*"));
        gsap.set(el, { autoAlpha: 1 });

        if (prefersReducedMotion()) {
          gsap.set(q("[data-half]"), { xPercent: 0, opacity: 0 });
          gsap.to(q("[data-half]"), { opacity: 1, duration: DUR.micro, onComplete: resolve });
          return;
        }

        gsap
          .timeline({ onComplete: () => resolve() })
          .set(q("[data-half]"), { opacity: 1 })
          .set(q("[data-half='a']"), { xPercent: 105 })
          .set(q("[data-half='b']"), { xPercent: -105 })
          .set(q("[data-blade]"), { opacity: 1, drawSVG: "0% 0%" })
          .to(q("[data-blade]"), { drawSVG: "0% 100%", duration: 0.18, ease: "power2.in" })
          .to(q("[data-half]"), { xPercent: 0, duration: 0.42, ease: "snap" }, "-=0.04")
          .to(q("[data-blade]"), { opacity: 0, duration: 0.12 }, "-=0.1");
      }),
    [],
  );

  const uncover = useCallback(
    () =>
      new Promise<void>((resolve) => {
        const el = root.current;
        if (!el) return resolve();
        const q = gsap.utils.selector(el);
        const done = () => {
          gsap.set(el, { autoAlpha: 0 });
          resolve();
        };

        if (prefersReducedMotion()) {
          gsap.to(q("[data-half]"), { opacity: 0, duration: DUR.micro, onComplete: done });
          return;
        }

        gsap
          .timeline({ onComplete: done })
          .set(q("[data-blade]"), { opacity: 1, drawSVG: "0% 100%" })
          .to(q("[data-blade]"), { opacity: 0, duration: 0.25 })
          .to(q("[data-half='a']"), { xPercent: -105, duration: 0.5, ease: "ink" }, 0.05)
          .to(q("[data-half='b']"), { xPercent: 105, duration: 0.5, ease: "ink" }, 0.05);
      }),
    [],
  );

  const play = useCallback(
    async (between?: () => void | Promise<void>) => {
      await cover();
      await between?.();
      await uncover();
    },
    [cover, uncover],
  );

  const value = useMemo(() => ({ cover, uncover, play }), [cover, uncover, play]);

  return (
    <SlashContext.Provider value={value}>
      {children}
      <div
        ref={root}
        aria-hidden
        className="pointer-events-none invisible fixed inset-0 z-[150] opacity-0"
      >
        <div data-half="a" className="absolute inset-0 bg-sumi" style={{ clipPath: HALF_A }} />
        <div data-half="b" className="absolute inset-0 bg-sumi" style={{ clipPath: HALF_B }} />
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="blade" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="var(--agni)" />
              <stop offset="1" stopColor="var(--kiln)" />
            </linearGradient>
          </defs>
          <line
            data-blade
            x1="-2"
            y1="83.3"
            x2="102"
            y2="16.7"
            stroke="url(#blade)"
            strokeWidth="4"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity="0"
          />
        </svg>
      </div>
    </SlashContext.Provider>
  );
}
