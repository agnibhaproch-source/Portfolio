"use client";

import { useRef } from "react";
import { DUR, gsap, ScrollTrigger } from "@/lib/gsap";
import { triggerFor, type Trigger } from "@/lib/motion";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";

type Props = {
  /** Small line above, e.g. "Chapter 01". */
  label: string;
  title: string;
  trigger?: Trigger;
  /** Seconds to hold before cutting out. Omit to stay on screen. */
  hold?: number;
  onComplete?: () => void;
  className?: string;
};

/**
 * Builds the slam-in / hold / cut-out timeline for a title card root.
 * Exported so sections can nest it inside their own timelines.
 */
export function titleCardTimeline(
  root: HTMLElement,
  { reduced = false, hold }: { reduced?: boolean; hold?: number } = {},
) {
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline();

  if (reduced) {
    tl.from(root, { opacity: 0, duration: DUR.micro });
    if (hold !== undefined) tl.to(root, { opacity: 0, duration: DUR.micro }, `+=${hold}`);
    return tl;
  }

  tl.fromTo(
    root,
    { clipPath: "inset(50% 0% 50% 0%)" },
    { clipPath: "inset(0% 0% 0% 0%)", duration: 0.3, ease: "snap" },
  )
    .from(q("[data-tc-title]"), { scale: 1.45, opacity: 0, duration: 0.36, ease: "steps(6)" }, 0.12)
    .from(q("[data-tc-label]"), { yPercent: 120, opacity: 0, duration: 0.3, ease: "ink" }, 0.2)
    .from(q("[data-tc-line]"), { scaleX: 0, duration: 0.6, ease: "ink" }, 0.3)
    // 2px camera shake as the title lands
    .to(
      q("[data-tc-inner]"),
      { x: 2, y: -2, duration: 0.05, repeat: 3, yoyo: true, ease: "steps(1)" },
      0.46,
    )
    .set(q("[data-tc-inner]"), { x: 0, y: 0 });

  if (hold !== undefined) {
    tl.to(root, { clipPath: "inset(0% 0% 0% 100%)", duration: 0.35, ease: "snap" }, `+=${hold}`);
  }
  return tl;
}

/** Full-bleed chapter card: ink ground, big display title, thin flame line. */
export function TitleCard({
  label,
  title,
  trigger = "scroll",
  hold,
  onComplete,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion(
    (ctx, el) => {
      const tl = titleCardTimeline(el, { reduced: ctx.reduced, hold });
      if (onComplete) tl.eventCallback("onComplete", onComplete);
      const st = triggerFor(el, trigger);
      if (st) {
        tl.pause();
        ScrollTrigger.create({ ...st, onEnter: () => tl.play() });
      }
    },
    ref,
    [label, title, hold],
  );

  return (
    <div
      ref={ref}
      data-mode="colour"
      className={cn(
        "@container relative flex min-h-[60svh] items-center justify-center overflow-hidden px-4 text-center",
        className,
      )}
    >
      <div data-tc-inner className="w-full">
        <p data-tc-label className="font-display text-18 text-muted md:text-24">
          {label}
        </p>
        <h2
          data-tc-title
          className="mt-3 text-[clamp(2.25rem,15cqi,10rem)] leading-[0.92] break-words"
        >
          {title}
        </h2>
        <div
          data-tc-line
          aria-hidden
          className="mx-auto mt-6 h-[3px] w-2/3 origin-left bg-[linear-gradient(90deg,var(--agni),var(--kiln))]"
        />
      </div>
    </div>
  );
}
