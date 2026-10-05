"use client";

import { useRef } from "react";
import type { SectionCopy } from "@/content";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";

const KATAKANA =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン";

/**
 * Section name cast like a spell: an incantation chants itself in, a circle
 * flashes, and the heading forms out of blurred ink. Then the retro print look: a crimson ink layer misregistered
 * behind the type snaps into register, a brush stroke paints in beneath,
 * and the subtitle resolves out of katakana noise. Plain text without JS.
 */
export function SectionHeading({ copy, className }: { copy: SectionCopy; className?: string }) {
  const ref = useRef<HTMLElement>(null);

  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const q = gsap.utils.selector(el);
    const chant = q("[data-chant-text]")[0];
    if (chant) chant.textContent = "";
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: "top 82%", once: true } })
      .to(
        chant ?? {},
        {
          duration: 0.5,
          ease: "none",
          scrambleText: { text: copy.chant ?? "", chars: KATAKANA, speed: 0.8 },
        },
        0,
      )
      .fromTo(
        q("[data-cast-ring]"),
        { drawSVG: "0%", scale: 0.6, opacity: 1 },
        { drawSVG: "100%", scale: 1, duration: 0.3, ease: "power2.out" },
        0.25,
      )
      .to(q("[data-cast-ring]"), { scale: 1.6, opacity: 0, duration: 0.35, ease: "power2.in" }, 0.6)
      .fromTo(
        q("h2"),
        { opacity: 0, filter: "blur(12px)", scaleX: 1.12 },
        {
          opacity: 1,
          filter: "blur(0px)",
          scaleX: 1,
          duration: 0.45,
          ease: "ink",
          clearProps: "filter,transform",
        },
        0.45,
      )
      .fromTo(
        q("h2"),
        { "--mis-x": "0.22em", "--mis-y": "-0.12em" },
        { "--mis-x": "0.045em", "--mis-y": "0.04em", duration: 0.5, ease: "steps(5)" },
        0.75,
      )
      .fromTo(
        q("[data-brush]"),
        { clipPath: "inset(0% 100% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.65, ease: "ink" },
        0.85,
      )
      .to(
        q("[data-sub]"),
        {
          duration: 0.9,
          ease: "none",
          scrambleText: { text: copy.subtitle, chars: KATAKANA, speed: 0.6 },
        },
        0.95,
      );
  }, ref);

  return (
    <header ref={ref} className={cn("mb-10 md:mb-14", className)}>
      {copy.chant && (
        <p
          aria-hidden
          className="mb-1 flex min-h-6 items-center gap-2 text-14 tracking-[0.3em] text-muted"
        >
          <svg viewBox="0 0 24 24" className="size-4 text-aura">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M12 5 L17 17 L6 9.5 L18 9.5 L7 17 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
          <span data-chant-text>{copy.chant}</span>
        </p>
      )}
      <div className="relative w-fit">
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          className="pointer-events-none absolute top-1/2 left-0 size-[1.6em] -translate-x-1/4 -translate-y-1/2 text-56 text-aura md:text-96"
        >
          <circle
            data-cast-ring
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0"
          />
        </svg>
        {/* black form: the heading wreathed in black flame */}
        <span
          aria-hidden
          className="aura-text text-black pointer-events-none absolute inset-0 origin-bottom -translate-y-[0.06em] scale-y-[1.12] font-display text-56 [filter:url(#black-flame)] [-webkit-text-stroke:3px_var(--agni)] md:text-96"
        >
          {copy.heading}
        </span>
        <h2 id={`${copy.id}-heading`} className="misprint relative text-56 md:text-96">
          {copy.heading}
        </h2>
      </div>
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
