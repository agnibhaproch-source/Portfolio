"use client";

import { useRef } from "react";
import type { SectionCopy } from "@/content";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";

const KATAKANA =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン";

/**
 * Section name with a retro print look: a crimson ink layer misregistered
 * behind the type snaps into register, a brush stroke paints in beneath,
 * and the subtitle resolves out of katakana noise. Plain text without JS.
 */
export function SectionHeading({ copy, className }: { copy: SectionCopy; className?: string }) {
  const ref = useRef<HTMLElement>(null);

  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const q = gsap.utils.selector(el);
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: "top 82%", once: true } })
      .fromTo(
        q("h2"),
        { "--mis-x": "0.22em", "--mis-y": "-0.12em" },
        { "--mis-x": "0.045em", "--mis-y": "0.04em", duration: 0.5, ease: "steps(5)" },
      )
      .fromTo(
        q("[data-brush]"),
        { clipPath: "inset(0% 100% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.65, ease: "ink" },
        0.15,
      )
      .to(
        q("[data-sub]"),
        {
          duration: 0.9,
          ease: "none",
          scrambleText: { text: copy.subtitle, chars: KATAKANA, speed: 0.6 },
        },
        0.25,
      );
  }, ref);

  return (
    <header ref={ref} className={cn("mb-10 md:mb-14", className)}>
      <h2 id={`${copy.id}-heading`} className="misprint text-56 md:text-96">
        {copy.heading}
      </h2>
      <svg
        aria-hidden
        data-brush
        viewBox="0 0 300 16"
        preserveAspectRatio="none"
        className="mt-1 h-3 w-[min(60%,22rem)] text-agni md:h-4"
      >
        <path
          d="M2 9 C 40 3, 90 12, 150 7 S 250 4, 298 8 L 296 11 C 240 13, 160 14, 100 12 S 30 14, 4 13 Z"
          fill="currentColor"
        />
      </svg>
      <p className="mt-2 text-18 text-muted md:text-24">
        <span className="sr-only">{copy.subtitle}</span>
        <span aria-hidden data-sub>
          {copy.subtitle}
        </span>
      </p>
    </header>
  );
}
