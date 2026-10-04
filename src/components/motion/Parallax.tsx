"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";

type Props = {
  /** Scroll depth: % of own height travelled across the viewport. Negative = moves up faster. */
  speed?: number;
  /** Pointer depth in px (desktop only). 0 disables. */
  pointer?: number;
  className?: string;
  children: ReactNode;
};

/** A depth layer driven by scroll (scrubbed) and, on desktop, the pointer. */
export function Parallax({ speed = 15, pointer = 0, className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion(
    (ctx, el) => {
      if (ctx.reduced) return;
      const inner = el.firstElementChild as HTMLElement | null;
      if (!inner) return;

      gsap.fromTo(
        el,
        { yPercent: -speed / 2 },
        {
          yPercent: speed / 2,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );

      if (!ctx.desktop || pointer === 0) return;
      const xTo = gsap.quickTo(inner, "x", { duration: 0.8, ease: "power3" });
      const yTo = gsap.quickTo(inner, "y", { duration: 0.8, ease: "power3" });
      const onMove = (e: PointerEvent) => {
        xTo((e.clientX / window.innerWidth - 0.5) * pointer);
        yTo((e.clientY / window.innerHeight - 0.5) * pointer);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    ref,
    [speed, pointer],
  );

  return (
    <div ref={ref} className={className}>
      <div>{children}</div>
    </div>
  );
}
