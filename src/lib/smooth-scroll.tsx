"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "./gsap";
import { MOTION_QUERIES } from "./motion";

const LenisContext = createContext<Lenis | null>(null);

/** The active Lenis instance, or null under reduced motion / before mount. */
export function useLenis() {
  return useContext(LenisContext);
}

/**
 * Lenis driven by gsap.ticker so ScrollTrigger and smooth scroll share one clock.
 * Skipped entirely under prefers-reduced-motion (native scroll, no hijack).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia(MOTION_QUERIES.reduced);
    let instance: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    const start = () => {
      instance = new Lenis({ autoRaf: false, lerp: 0.1, anchors: true });
      instance.on("scroll", ScrollTrigger.update);
      tick = (time) => instance?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      setLenis(instance);
    };

    const stop = () => {
      if (tick) gsap.ticker.remove(tick);
      instance?.destroy();
      instance = null;
      tick = null;
      setLenis(null);
    };

    const onChange = () => (reduced.matches ? stop() : start());
    if (!reduced.matches) start();
    reduced.addEventListener("change", onChange);

    return () => {
      reduced.removeEventListener("change", onChange);
      stop();
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
