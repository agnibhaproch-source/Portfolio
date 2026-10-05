"use client";

import { useImperativeHandle, useRef, type Ref } from "react";
import { sound } from "@/lib/sound";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

export type ImpactWordHandle = {
  /** Slam a sound-effect word in at (x%, y%) of the parent. */
  play: (text: string, x?: number, y?: number) => void;
};

/** Draw `text` in the host's font and colour onto `cv`, sized to fit. */
function paint(cv: HTMLCanvasElement, host: HTMLElement, text: string) {
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const cs = getComputedStyle(host);
  const font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  ctx.font = font;
  const size = parseFloat(cs.fontSize);
  const w = Math.ceil(ctx.measureText(text).width + size * 0.2);
  const h = Math.ceil(size * 1.3);
  cv.width = w * dpr;
  cv.height = h * dpr;
  cv.style.width = `${w}px`;
  cv.style.height = `${h}px`;
  ctx.scale(dpr, dpr);
  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.fillStyle = cs.color;
  ctx.fillText(text, size * 0.1, h / 2);
}

/** Manga sound-effect lettering that slams in on twos, holds, and fades. */
export function ImpactWord({
  ref,
  className,
  canvas = false,
}: {
  ref?: Ref<ImpactWordHandle>;
  className?: string;
  /**
   * Paint the word on a canvas. Use for big words that land during page load:
   * HTML or SVG text that size would be counted as the page's main content (LCP).
   */
  canvas?: boolean;
}) {
  const el = useRef<HTMLSpanElement>(null);

  useImperativeHandle(ref, () => ({
    play: (text, x = 50, y = 50) => {
      const node = el.current;
      if (!node || prefersReducedMotion()) return;
      const cv = node.querySelector("canvas");
      if (cv) paint(cv, node, text);
      else node.textContent = text;
      sound.play("impact");
      haptic("impact");
      gsap.killTweensOf(node);
      gsap
        .timeline()
        .set(node, { left: `${x}%`, top: `${y}%`, xPercent: -50, yPercent: -50 })
        .fromTo(
          node,
          { scale: 2.6, rotation: -24, opacity: 0 },
          { scale: 1, rotation: -10, opacity: 1, duration: 0.24, ease: "steps(3)" },
        )
        .to(node, { scale: 1.08, duration: 0.5, ease: "none" })
        .to(node, { opacity: 0, scale: 1.3, duration: 0.25, ease: "power2.in" });
    },
  }));

  return (
    <span
      ref={el}
      aria-hidden

      className={cn(
        "pointer-events-none absolute z-30 sfx text-kiln opacity-0 [text-shadow:0_0_18px_var(--agni)]",
        canvas && "[filter:drop-shadow(0_0_14px_var(--agni))] [text-shadow:none]",
        className,
      )}
    >
      {canvas && <canvas className="block" />}
    </span>
  );
}
