"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";

/** Panel gutters as lines in a 100x100 box: a manga page layout behind a section. */
const LAYOUTS = {
  contact: [
    [0, 30, 46, 22],
    [46, 0, 40, 100],
    [40, 62, 100, 70],
    [74, 0, 70, 66],
    [0, 78, 42, 82],
  ],
  finale: [
    [0, 18, 100, 12],
    [0, 86, 100, 92],
    [22, 12, 16, 88],
    [80, 13, 86, 90],
  ],
} as const;

/**
 * Ruled manga-panel gutters that ink themselves in when the section scrolls
 * into view, with screentone developing in two corners. Matches the site's
 * paper-and-ink language; static under reduced motion.
 */
export function MangaBackdrop({
  layout,
  className,
}: {
  layout: keyof typeof LAYOUTS;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const q = gsap.utils.selector(el);
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: "top 75%", once: true } })
      .from(q("[data-gutter]"), { drawSVG: "0%", duration: 0.9, stagger: 0.12, ease: "ink" })
      .fromTo(
        q(".tone-fade"),
        { "--dot": "0px" },
        { "--dot": "1.6px", duration: 1, ease: "steps(8)" },
        0.3,
      );
  }, ref);

  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none", className)}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {LAYOUTS[layout].map(([x1, y1, x2, y2], i) => (
          <g key={i}>
            <line
              data-gutter
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--washi)"
              strokeOpacity="0.14"
              strokeWidth="14"
              vectorEffect="non-scaling-stroke"
            />
            <line
              data-gutter
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--washi)"
              strokeOpacity="0.35"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}
      </svg>
      <div className="absolute top-0 right-0 h-1/3 w-1/3 tone-fade opacity-25 [--tone-dot:var(--washi)]" />
      <div className="absolute bottom-0 left-0 h-1/3 w-1/3 rotate-180 tone-fade opacity-25 [--tone-dot:var(--washi)]" />
    </div>
  );
}
