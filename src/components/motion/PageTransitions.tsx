"use client";

import { useRef } from "react";
import { InkBlot } from "@/components/ui/InkBlot";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";

/*
 * Manga page transitions between sections, scrubbed to scroll both ways.
 * Each prints the next section's name on the page it destroys. Decorative
 * (aria-hidden); a still frame under reduced motion.
 */

const scrub = (el: Element) => ({ trigger: el, start: "top 85%", end: "bottom 25%", scrub: 0.5 });

/** Jagged tear across a 100x100 box, around y = 50. */
const TEAR = Array.from({ length: 21 }, (_, i) => {
  const x = i * 5;
  const y = 50 + (i % 2 ? 4 : -3) + ((i * 37) % 7) - 3;
  return [x, y] as const;
});
const TEAR_PTS = TEAR.map(([x, y]) => `${x}% ${y}%`).join(", ");

function Label({ text, className }: { text: string; className?: string }) {
  return (
    <p
      className={cn(
        "misprint absolute inset-0 grid place-items-center font-display text-[clamp(3.5rem,13vw,11rem)] leading-none text-sumi",
        className,
      )}
    >
      {text}
    </p>
  );
}

/** A paper strip printed with the next section's name tears in half. */
export function RipDivider({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const q = gsap.utils.selector(el);
    gsap
      .timeline({ scrollTrigger: scrub(el) })
      .fromTo(
        q("[data-half='top']"),
        { yPercent: 0, rotation: 0 },
        { yPercent: -70, rotation: -5, ease: "power2.in" },
        0.25,
      )
      .fromTo(
        q("[data-half='bottom']"),
        { yPercent: 0, rotation: 0 },
        { yPercent: 70, rotation: 4, ease: "power2.in" },
        0.25,
      )
      .fromTo(
        q("[data-rip-glow]"),
        { scaleX: 0, opacity: 1 },
        { scaleX: 1, opacity: 0, ease: "none" },
        0.2,
      );
  }, ref);

  const half = (which: "top" | "bottom") => (
    <div
      data-half={which}
      className="absolute inset-x-[-4%] inset-y-[18%] bg-washi tone-fade [--tone-dot:var(--tone)]"
      style={{
        clipPath:
          which === "top"
            ? `polygon(0% 0%, 100% 0%, ${TEAR_PTS.split(", ").reverse().join(", ")})`
            : `polygon(${TEAR_PTS}, 100% 100%, 0% 100%)`,
      }}
    >
      <Label text={label} />
    </div>
  );

  return (
    <div ref={ref} aria-hidden data-mode="colour" className="relative h-[55svh] overflow-hidden">
      <div
        data-rip-glow
        className="absolute inset-x-0 top-1/2 h-1 origin-center bg-agni shadow-[0_0_24px_var(--agni)]"
      />
      {half("top")}
      {half("bottom")}
    </div>
  );
}

/** Manga panel cells that a page shatters into, as [x, y] percentages. */
const SHARDS: [number, number][][] = [
  [
    [0, 0],
    [38, 0],
    [30, 46],
    [0, 52],
  ],
  [
    [38, 0],
    [72, 0],
    [66, 40],
    [30, 46],
  ],
  [
    [72, 0],
    [100, 0],
    [100, 44],
    [66, 40],
  ],
  [
    [0, 52],
    [30, 46],
    [34, 100],
    [0, 100],
  ],
  [
    [30, 46],
    [66, 40],
    [60, 72],
    [32, 76],
  ],
  [
    [66, 40],
    [100, 44],
    [100, 70],
    [60, 72],
  ],
  [
    [32, 76],
    [60, 72],
    [64, 100],
    [34, 100],
  ],
  [
    [60, 72],
    [100, 70],
    [100, 100],
    [64, 100],
  ],
];
const clipOf = (pts: [number, number][]) =>
  `polygon(${pts.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
const pointsOf = (pts: [number, number][]) => pts.map(([x, y]) => `${x},${y}`).join(" ");
const FLY: [number, number, number][] = [
  [-60, -40, -18],
  [0, -70, 10],
  [60, -50, 22],
  [-70, 30, 14],
  [-10, 10, -30],
  [70, 20, -12],
  [-20, 70, 20],
  [50, 60, -24],
];

/** A manga page printed with the next section's name shatters into panel shards. */
export function ShatterDivider({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const shards = el.querySelectorAll("[data-shard]");
    gsap.fromTo(
      shards,
      { xPercent: 0, yPercent: 0, rotation: 0, opacity: 1 },
      {
        xPercent: (i: number) => FLY[i]![0],
        yPercent: (i: number) => FLY[i]![1],
        rotation: (i: number) => FLY[i]![2],
        opacity: 0,
        ease: "power2.in",
        stagger: 0.03,
        scrollTrigger: { ...scrub(el), start: "top 45%" },
      },
    );
  }, ref);

  return (
    <div ref={ref} aria-hidden data-mode="colour" className="relative h-[60svh] overflow-hidden">
      <div className="absolute inset-x-4 inset-y-[12%] md:inset-x-10">
        {SHARDS.map((pts, i) => (
          <div key={i} data-shard className="absolute inset-0" style={{ clipPath: clipOf(pts) }}>
            <div className="absolute inset-0 bg-washi" />
            <div className="absolute inset-0 tone opacity-30 [--tone-dot:var(--sumi)]" />
            <Label text={label} />
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              <polygon
                points={pointsOf(pts)}
                fill="none"
                stroke="var(--sumi)"
                strokeWidth="4"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

/** A giant brush stroke paints across, carrying the next section's name. */
export function BrushDivider({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const q = gsap.utils.selector(el);
    gsap
      .timeline({ scrollTrigger: scrub(el) })
      .from(q("[data-brush-stroke]"), { drawSVG: "0%", ease: "power1.inOut", duration: 0.6 })
      .from(
        q("[data-brush-label]"),
        { clipPath: "inset(0% 100% 0% 0%)", ease: "none", duration: 0.5 },
        0.1,
      )
      .from(
        q("[data-splat]"),
        { scale: 0, opacity: 0, stagger: 0.05, duration: 0.15, ease: "steps(3)" },
        0.45,
      )
      .to(q("[data-brush-wrap]"), { opacity: 0, yPercent: -20, duration: 0.3 }, 0.8);
  }, ref);

  return (
    <div ref={ref} aria-hidden data-mode="colour" className="relative h-[55svh] overflow-hidden">
      <div data-brush-wrap className="absolute inset-0">
        <svg
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <filter id="brush-rough">
              <feTurbulence type="fractalNoise" baseFrequency="0.04 0.4" numOctaves="2" seed="3" />
              <feDisplacementMap in="SourceGraphic" scale="18" />
            </filter>
          </defs>
          <path
            data-brush-stroke
            d="M -40 170 C 180 120, 360 210, 520 150 S 860 120, 1040 160"
            fill="none"
            stroke="var(--washi)"
            strokeWidth="150"
            strokeLinecap="round"
            filter="url(#brush-rough)"
          />
        </svg>
        <div data-brush-label className="absolute inset-0">
          <Label text={label} />
        </div>
        <div data-splat className="absolute top-[18%] left-[14%] size-14">
          <InkBlot seed={21} className="size-full text-agni" />
        </div>
        <div data-splat className="absolute right-[18%] bottom-[16%] size-10">
          <InkBlot seed={34} className="size-full text-agni" />
        </div>
        <div data-splat className="absolute top-[24%] right-[30%] size-6">
          <InkBlot seed={55} className="size-full text-kiln" />
        </div>
      </div>
    </div>
  );
}
