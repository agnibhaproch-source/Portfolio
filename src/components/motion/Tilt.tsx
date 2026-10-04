"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";

type Props = {
  /** Max rotation in degrees. */
  max?: number;
  /** Highlight colour; gold for "power" cards. */
  glow?: string;
  className?: string;
  children: ReactNode;
};

/**
 * 3D card tilt toward the pointer with a moving highlight. Desktop only;
 * on touch and reduced motion the card stays flat.
 */
export function Tilt({ max = 10, glow = "var(--aura)", className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion(
    (ctx, el) => {
      if (!ctx.desktop) return;
      const card = el.querySelector<HTMLElement>("[data-tilt-card]");
      const shine = el.querySelector<HTMLElement>("[data-tilt-shine]");
      if (!card || !shine) return;

      const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "heat" });
      const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "heat" });
      const setGlow = gsap.quickSetter(shine, "css") as (v: Record<string, string>) => void;

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry((px - 0.5) * 2 * max);
        rx((0.5 - py) * 2 * max);
        setGlow({ "--mx": `${px * 100}%`, "--my": `${py * 100}%` });
      };
      const onEnter = () => {
        gsap.set(card, { willChange: "transform" });
        gsap.to(shine, { opacity: 1, duration: 0.2 });
      };
      const onLeave = () => {
        rx(0);
        ry(0);
        gsap.to(shine, { opacity: 0, duration: 0.4 });
        gsap.set(card, { willChange: "auto", delay: 0.6 });
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    ref,
    [max],
  );

  return (
    <div ref={ref} className={cn("[perspective:900px]", className)}>
      <div data-tilt-card className="relative h-full [transform-style:preserve-3d]">
        {children}
        <div
          data-tilt-shine
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen"
          style={{
            background: `radial-gradient(circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, ${glow} 45%, transparent), transparent 55%)`,
          }}
        />
      </div>
    </div>
  );
}
