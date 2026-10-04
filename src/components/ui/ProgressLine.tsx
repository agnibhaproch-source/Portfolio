"use client";

import { useRef, useState } from "react";
import { progressCopy, sections } from "@/content";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";

const CHAPTERS = [{ id: "top", heading: progressCopy.opening }, ...Object.values(sections)];

/**
 * The grimoire's page counter: a thin flame line along the top with a
 * clickable tick at each section, and a small book in the corner that fills
 * as you read, showing "p. 3 / 9" and the current section.
 */
export function ProgressLine() {
  const ref = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState({ n: 0, total: 0, name: "" });

  useMotion((_ctx, el) => {
    const bar = el.querySelector("[data-bar]");
    const fill = el.querySelector("[data-book-fill]");
    gsap.fromTo(
      bar,
      { scaleX: 0 },
      { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } },
    );
    gsap.fromTo(
      fill,
      { scaleY: 0 },
      { scaleY: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } },
    );

    const ticks = Array.from(el.querySelectorAll<HTMLElement>("[data-tick]"));
    const present = () => CHAPTERS.filter((c) => document.getElementById(c.id));
    const place = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      ticks.forEach((tick) => {
        const target = document.getElementById(tick.dataset.tick ?? "");
        const ratio =
          target && max > 0 ? (target.getBoundingClientRect().top + window.scrollY) / max : -1;
        tick.style.display = target && tick.dataset.tick !== "top" ? "block" : "none";
        tick.style.left = `${Math.min(Math.max(ratio, 0), 1) * 100}%`;
      });
    };
    const update = () => {
      const list = present();
      if (!list.length) return;
      const line = window.innerHeight * 0.4;
      let idx = 0;
      list.forEach((c, i) => {
        if ((document.getElementById(c.id)?.getBoundingClientRect().top ?? Infinity) <= line)
          idx = i;
      });
      const next = { n: idx + 1, total: list.length, name: list[idx]!.heading };
      setPage((p) => (p.n === next.n && p.total === next.total ? p : next));
    };
    place();
    update();
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: update });
    ScrollTrigger.addEventListener("refresh", place);
    return () => ScrollTrigger.removeEventListener("refresh", place);
  }, ref);

  return (
    <div data-no-print ref={ref}>
      <nav
        aria-label={progressCopy.label}
        className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-[3px]"
      >
        <div
          aria-hidden
          data-bar
          className="h-full origin-left bg-[linear-gradient(90deg,var(--agni),var(--kiln))]"
          style={{ transform: "scaleX(0)" }}
        />
        {CHAPTERS.map((c) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            data-tick={c.id}
            aria-label={progressCopy.jump(c.heading)}
            className="group/tick pointer-events-auto absolute top-0 hidden h-4 w-5 -translate-x-1/2"
          >
            <span className="absolute top-0 left-1/2 h-[7px] w-[2px] -translate-x-1/2 bg-washi transition-[height,background-color] duration-200 group-hover/tick:h-3 group-hover/tick:bg-kiln" />
            <span
              aria-hidden
              className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 bg-sumi px-2 py-0.5 font-display text-[11px] whitespace-nowrap text-washi opacity-0 transition-opacity duration-200 group-hover/tick:opacity-100 group-focus-visible/tick:opacity-100"
            >
              {c.heading}
            </span>
          </a>
        ))}
      </nav>

      {/* page counter */}
      <div
        aria-hidden
        className={`pointer-events-none fixed right-4 bottom-4 z-[55] items-center gap-2 border-2 border-washi/50 bg-sumi/85 px-2.5 py-1 text-washi backdrop-blur-sm ${page.total ? "flex" : "hidden"}`}
      >
        <span className="relative block h-5 w-4 overflow-hidden border-2 border-washi">
          <span
            data-book-fill
            className="absolute inset-0 origin-bottom bg-[linear-gradient(0deg,var(--agni),var(--kiln))]"
          />
          <span className="absolute inset-y-0 left-0.5 w-px bg-sumi/60" />
        </span>
        <span className="font-display text-14">{progressCopy.page(page.n, page.total)}</span>
        <span className="hidden text-14 text-muted sm:inline">{page.name}</span>
      </div>
    </div>
  );
}
