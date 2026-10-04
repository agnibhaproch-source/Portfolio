"use client";

import { useRef } from "react";
import { runeCopy } from "@/content";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { runes, toasts, useRunes } from "@/lib/runes";
import { cn } from "@/lib/utils";

/** Five original rune glyphs, one per hiding spot. */
const GLYPHS = [
  "M12 2 L12 22 M5 8 L12 2 L19 8 M7 16 L17 16",
  "M4 4 L20 20 M20 4 L4 20 M12 2 L12 6 M12 18 L12 22",
  "M12 3 L21 19 L3 19 Z M12 9 L12 15",
  "M6 3 L6 21 M6 12 L18 4 M6 12 L18 20",
  "M12 2 A10 10 0 1 0 12.01 2 M12 7 L12 17 M7 12 L17 12",
];

/**
 * A hidden rune. Faint until noticed; clicking collects it, pops it, and
 * announces progress. Finding all five opens the sealed page.
 */
export function Rune({ index, className }: { index: number; className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const id = `rune-${index}`;
  const found = useRunes().includes(id);

  const collect = () => {
    const n = runes.collect(id);
    if (n === null) return;
    const total = runeCopy.total;
    toasts.show(
      n >= total
        ? { text: runeCopy.allFound, link: { href: runeCopy.secretPath, label: runeCopy.open } }
        : { text: runeCopy.found(n, total) },
    );
    if (!prefersReducedMotion() && ref.current) {
      gsap.fromTo(
        ref.current,
        { scale: 1 },
        {
          scale: 2.4,
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => void gsap.set(ref.current, { clearProps: "all" }),
        },
      );
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={collect}
      disabled={found}
      aria-label={found ? `${runeCopy.label} (found)` : runeCopy.label}
      data-cursor="link"
      data-cursor-label={found ? undefined : "?"}
      className={cn(
        "group inline-grid size-9 place-items-center text-aura transition-opacity duration-300",
        found ? "opacity-0" : "opacity-30 hover:opacity-100 focus-visible:opacity-100",
        className,
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-6 group-hover:[filter:drop-shadow(0_0_6px_var(--aura))]"
      >
        <path
          d={GLYPHS[index % GLYPHS.length]}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
