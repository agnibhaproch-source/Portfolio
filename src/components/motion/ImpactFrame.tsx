"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { IMPACT_EVENT } from "@/lib/impact";

/** Rough sketch strokes bursting from the centre, in a 200x200 box. */
const STROKES = (() => {
  let s = 1234567;
  const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  return Array.from({ length: 30 }, (_, i) => {
    const a = (i / 30) * Math.PI * 2 + (r() - 0.5) * 0.18;
    const r0 = 22 + r() * 26;
    const pts: string[] = [];
    for (let k = 0; k < 4; k++) {
      const rad = r0 + k * (40 + r() * 20);
      const wob = (r() - 0.5) * 0.06;
      pts.push(
        `${(100 + Math.cos(a + wob) * rad).toFixed(1)},${(100 + Math.sin(a + wob) * rad).toFixed(1)}`,
      );
    }
    return { pts: pts.join(" "), w: 0.6 + r() * 2.2 };
  });
})();

/**
 * Anime impact frame for the biggest hits: a frame of inverted colour with
 * sketch lines, a frame of flat ink, one more inverted frame, then back.
 * Listens for impactFrame() calls; nothing renders under reduced motion.
 */
export function ImpactFrame() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const q = gsap.utils.selector(el);
    let last = 0;
    const onImpact = (e: Event) => {
      const now = performance.now();
      if (now - last < 450) return;
      last = now;
      const strength = Math.min(Math.max(Number((e as CustomEvent).detail) || 1, 0.5), 1.6);
      const f = 0.055 * strength;
      gsap.killTweensOf(q("*"));
      gsap
        .timeline()
        .set(el, { autoAlpha: 1 })
        .set(q("[data-sketch]"), { rotation: Math.random() * 30, scale: 0.9 + strength * 0.15 })
        .set(q("[data-invert]"), { opacity: 1 })
        .set(q("[data-sketch]"), { opacity: 1, color: "#000" })
        .set(q("[data-invert]"), { opacity: 0 }, f)
        .set(q("[data-flat]"), { opacity: 1 }, f)
        .set(q("[data-sketch]"), { color: "var(--washi)" }, f)
        .set(q("[data-flat]"), { opacity: 0 }, f * 2)
        .set(q("[data-sketch]"), { opacity: 0 }, f * 2)
        .set(q("[data-invert]"), { opacity: 1 }, f * 2)
        .set(q("[data-invert]"), { opacity: 0 }, f * 2.8)
        .set(el, { autoAlpha: 0 }, f * 2.8);
    };
    window.addEventListener(IMPACT_EVENT, onImpact);
    return () => window.removeEventListener(IMPACT_EVENT, onImpact);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      data-no-print
      className="pointer-events-none invisible fixed inset-0 z-[160] opacity-0"
    >
      <div data-invert className="bg-white absolute inset-0 opacity-0 mix-blend-difference" />
      <div data-flat className="absolute inset-0 bg-sumi opacity-0" />
      <svg
        data-sketch
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full opacity-0"
      >
        {STROKES.map((s, i) => (
          <polyline
            key={i}
            points={s.pts}
            fill="none"
            stroke="currentColor"
            strokeWidth={s.w}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
}
