"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { rollOdometers } from "./Odometer";

const BOLTS = ["2,40 18,30 12,22 30,8", "98,60 84,70 90,78 70,94", "96,12 82,24 88,30 74,42"];

/** Hover a stat and it crackles with small lightning and re-counts. */
export function Surge({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const surge = () => {
    const el = ref.current;
    if (!el || busy.current || prefersReducedMotion()) return;
    busy.current = true;
    const bolts = el.querySelectorAll("[data-bolt]");
    gsap
      .timeline({ onComplete: () => void (busy.current = false) })
      .set(bolts, { opacity: 1 })
      .to(bolts, { opacity: 0, duration: 0.06, repeat: 5, yoyo: true, ease: "steps(1)" })
      .set(bolts, { opacity: 0 });
    rollOdometers(Array.from(el.querySelectorAll("[data-odo]")), 0.6);
  };
  return (
    <div ref={ref} onPointerEnter={surge} className={cn("relative", className)}>
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -inset-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)] overflow-visible"
      >
        {BOLTS.map((p) => (
          <polyline
            key={p}
            data-bolt
            points={p}
            fill="none"
            stroke="var(--kiln)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            opacity="0"
            className="[filter:drop-shadow(0_0_4px_var(--agni))]"
          />
        ))}
      </svg>
      {children}
    </div>
  );
}
