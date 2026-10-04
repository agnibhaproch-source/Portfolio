"use client";

import { useRef } from "react";
import { sections } from "@/content";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";

const CHAPTERS = Object.values(sections).map((s) => s.id);

/** Thin flame line along the top, with a tick where each section starts. */
export function ProgressLine() {
  const ref = useRef<HTMLDivElement>(null);

  useMotion((_ctx, el) => {
    const bar = el.querySelector("[data-bar]");
    gsap.fromTo(
      bar,
      { scaleX: 0 },
      { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } },
    );

    const ticks = Array.from(el.querySelectorAll<HTMLElement>("[data-tick]"));
    const place = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      ticks.forEach((tick) => {
        const target = document.getElementById(tick.dataset.tick ?? "");
        const ratio =
          target && max > 0 ? target.getBoundingClientRect().top / max + window.scrollY / max : -1;
        tick.style.display = target ? "block" : "none";
        tick.style.left = `${Math.min(Math.max(ratio, 0), 1) * 100}%`;
      });
    };
    place();
    ScrollTrigger.addEventListener("refresh", place);
    return () => ScrollTrigger.removeEventListener("refresh", place);
  }, ref);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-[3px]">
      <div
        data-bar
        className="h-full origin-left bg-[linear-gradient(90deg,var(--agni),var(--kiln))]"
        style={{ transform: "scaleX(0)" }}
      />
      {CHAPTERS.map((id) => (
        <span
          key={id}
          data-tick={id}
          className="absolute top-0 hidden h-[7px] w-[2px] -translate-x-1/2 bg-washi"
        />
      ))}
    </div>
  );
}
