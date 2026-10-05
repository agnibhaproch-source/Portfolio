"use client";

import { useEffect, useRef, useState } from "react";
import { Grimoire } from "@/components/sections/contact/Grimoire";
import { gsap } from "@/lib/gsap";
import { isCalm } from "@/lib/calm";
import { MOTION_QUERIES, SUMMON_MS } from "@/lib/motion";

/**
 * Hovering a chapter's media (desktop) summons it: a grimoire rises, opens,
 * flips two pages, casts, and a column of light flashes as the card (or its
 * preview loop) appears. Closes and sinks on leave. Touch and reduced motion
 * keep the plain card.
 */
export function GrimoireSummon() {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [turn, setTurn] = useState(0);
  const [cast, setCast] = useState(0);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host || !window.matchMedia(MOTION_QUERIES.desktop).matches) return;
    const q = gsap.utils.selector(el);
    let timers: number[] = [];
    const clear = () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
    };
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    const enter = () => {
      clear();
      if (isCalm()) return;
      gsap.killTweensOf([el, ...q("*")]);
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 50 },
        { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" },
      );
      setOpen(true);
      at(300, () => setTurn((t) => t + 1));
      at(460, () => setTurn((t) => t + 1));
      at(640, () => {
        setCast((c) => c + 1);
        gsap.fromTo(
          q("[data-light]"),
          { scaleY: 0, opacity: 1 },
          { scaleY: 1, opacity: 0, duration: 0.6, ease: "power2.out" },
        );
      });
      at(SUMMON_MS, () => {
        gsap.fromTo(
          host.querySelectorAll("[data-flash]"),
          { opacity: 0.8 },
          { opacity: 0, duration: 0.5, ease: "power2.out" },
        );
        gsap.to(el, { autoAlpha: 0, y: 30, duration: 0.35, delay: 0.15, ease: "power2.in" });
      });
    };
    const leave = () => {
      clear();
      setOpen(false);
      gsap.to(el, { autoAlpha: 0, y: 40, duration: 0.25, ease: "power2.in" });
    };
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointerleave", leave);
    return () => {
      clear();
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none invisible absolute inset-x-0 bottom-0 z-20 hidden opacity-0 lg:block"
    >
      <div
        data-light
        className="absolute bottom-16 left-1/2 h-[140%] w-40 origin-bottom -translate-x-1/2 bg-[linear-gradient(to_top,rgb(201_162_74/0.9),rgb(226_98_43/0.4)_40%,transparent)] opacity-0 blur-md"
      />
      <Grimoire
        open={open}
        charge={open ? 3 : 0}
        turn={turn}
        cast={cast}
        className="mx-auto h-56 w-64"
      />
    </div>
  );
}
