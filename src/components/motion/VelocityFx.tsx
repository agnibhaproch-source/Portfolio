"use client";

import { useEffect } from "react";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Scroll-speed reactions: fast scrolling streaks speed lines across the
 * screen and stretches/blurs headings (via --vel on <html>, 0 to 1).
 * Settles when you slow down. Off under reduced motion.
 */
export function VelocityFx() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const root = document.documentElement;
    let last = window.scrollY;
    let vel = 0;
    let shown = -1;
    const tick = (_t: number, delta: number) => {
      const dt = Math.max(delta, 1) / 1000;
      const y = window.scrollY;
      const v = Math.min(Math.abs(y - last) / dt / 8000, 1);
      last = y;
      vel += (v - vel) * Math.min(dt * 8, 1);
      const rounded = Math.round(vel * 50) / 50;
      if (rounded !== shown) {
        shown = rounded;
        root.style.setProperty("--vel", String(rounded));
      }
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      root.style.removeProperty("--vel");
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30 text-tone/40">
      <SpeedLines variant="parallel" followScroll />
    </div>
  );
}
