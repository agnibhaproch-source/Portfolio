"use client";

import { useEffect } from "react";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Scroll-speed reactions: fast scrolling streaks speed lines across the
 * screen and stretches/blurs headings (via --vel on <html>, 0 to 1).
 * Settles when you slow down. Past a threshold the page enters "black form":
 * headings are wreathed in black flame and the cursor trail turns to shadow.
 * Off under reduced motion.
 */
export function VelocityFx() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const root = document.documentElement;
    let last = window.scrollY;
    let vel = 0;
    let shown = -1;
    let form = false;
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
      // Hysteresis so the form doesn't flicker at the threshold.
      const next = form ? vel > 0.3 : vel > 0.55;
      if (next !== form) {
        form = next;
        root.toggleAttribute("data-black-form", form);
      }
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      root.style.removeProperty("--vel");
      root.removeAttribute("data-black-form");
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30 text-tone/40">
      <SpeedLines variant="parallel" followScroll />
      {/* Black-flame distortion for the heading aura (only painted in black form) */}
      <svg width="0" height="0" className="absolute">
        <filter id="black-flame" x="-20%" y="-60%" width="140%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.09" numOctaves="2" seed="4">
            <animate
              attributeName="baseFrequency"
              dur="0.9s"
              values="0.02 0.09;0.03 0.13;0.02 0.09"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="16" />
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </svg>
    </div>
  );
}
