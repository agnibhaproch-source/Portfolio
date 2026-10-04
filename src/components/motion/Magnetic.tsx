"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";

type Props = {
  /** Pull radius in px around the element's edge. */
  radius?: number;
  /** 0 to 1: how far toward the pointer the element travels. */
  strength?: number;
  className?: string;
  children: ReactNode;
};

/** Pulls its child toward the cursor when it comes close. Desktop only. */
export function Magnetic({ radius = 80, strength = 0.35, className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion(
    (ctx, el) => {
      if (!ctx.desktop) return;
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "heat" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "heat" });

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const reach = Math.max(r.width, r.height) / 2 + radius;
        if (Math.hypot(dx, dy) < reach) {
          xTo(dx * strength);
          yTo(dy * strength);
        } else {
          xTo(0);
          yTo(0);
        }
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      return () => {
        window.removeEventListener("pointermove", onMove);
        gsap.set(el, { x: 0, y: 0 });
      };
    },
    ref,
    [radius, strength],
  );

  return (
    <div ref={ref} className={cn("inline-block", className)}>
      {children}
    </div>
  );
}
