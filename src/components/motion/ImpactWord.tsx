"use client";

import { useImperativeHandle, useRef, type Ref } from "react";
import { sound } from "@/lib/sound";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type ImpactWordHandle = {
  /** Slam a sound-effect word in at (x%, y%) of the parent. */
  play: (text: string, x?: number, y?: number) => void;
};

/** Manga sound-effect lettering that slams in on twos, holds, and fades. */
export function ImpactWord({
  ref,
  className,
}: {
  ref?: Ref<ImpactWordHandle>;
  className?: string;
}) {
  const el = useRef<HTMLSpanElement>(null);

  useImperativeHandle(ref, () => ({
    play: (text, x = 50, y = 50) => {
      const node = el.current;
      if (!node || prefersReducedMotion()) return;
      node.textContent = text;
      sound.play("impact");
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
        className,
      )}
    />
  );
}
