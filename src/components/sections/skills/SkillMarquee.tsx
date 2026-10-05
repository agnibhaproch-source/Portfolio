"use client";

import { useRef } from "react";
import { allSkills } from "@/content";
import { useCalm } from "@/lib/calm";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";

/**
 * A band of skill names in big manga lettering that scrolls sideways
 * forever; scrolling the page speeds it up (and flips it with direction).
 * Decorative: the same skills are listed in the cards. Still under reduced
 * motion and in calm mode.
 */
export function SkillMarquee({
  reverse = false,
  className,
}: {
  reverse?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const calm = useCalm();
  const items = reverse ? [...allSkills].reverse() : allSkills;

  useMotion(
    (ctx, el) => {
      if (ctx.reduced || calm) return;
      const track = el.querySelector("[data-track]");
      const loop = gsap.fromTo(
        track,
        { xPercent: reverse ? -50 : 0 },
        { xPercent: reverse ? 0 : -50, duration: 38, ease: "none", repeat: -1 },
      );
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
        onUpdate: (self) => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 150, 10);
          gsap.to(loop, { timeScale: self.direction * boost, duration: 0.15, overwrite: true });
          gsap.to(loop, { timeScale: 1, duration: 1, delay: 0.2, overwrite: false });
        },
      });
      return () => {
        st.kill();
        loop.kill();
      };
    },
    ref,
    [calm],
  );

  const run = (copy: number) =>
    items.map((s, i) => (
      <span key={`${copy}-${s}`} className="flex shrink-0 items-center gap-6 pr-6">
        <span
          className={cn(
            "font-display text-36 whitespace-nowrap md:text-56",
            i % 2 ? "text-transparent [-webkit-text-stroke:2px_var(--washi)]" : "text-washi",
          )}
        >
          {s}
        </span>
        <span className="text-24 text-agni">✦</span>
      </span>
    ));

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "overflow-hidden border-y-[3px] border-washi bg-sumi py-3",
        reverse ? "-rotate-1" : "rotate-1",
        className,
      )}
    >
      <div data-track className="flex w-max">
        {run(0)}
        {run(1)}
      </div>
    </div>
  );
}
