"use client";

import { useEffect } from "react";

/**
 * Pauses looping CSS animations (marquees, rune rain, orbits, drifting
 * letters...) in sections that are off screen, so they don't burn CPU
 * where nobody can see them. Marks each section with data-offscreen.
 */
export function OffscreenPause() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => e.target.toggleAttribute("data-offscreen", !e.isIntersecting)),
      { rootMargin: "200px 0px" },
    );
    const watch = () => document.querySelectorAll("main > *, footer").forEach((n) => io.observe(n));
    watch();
    // sections are code-split and may mount after this runs
    const mo = new MutationObserver(watch);
    const main = document.querySelector("main");
    if (main) mo.observe(main, { childList: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
