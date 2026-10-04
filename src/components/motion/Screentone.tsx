"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { triggerFor, type Trigger } from "@/lib/motion";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";

type Props = {
  /** Final dot radius in px. */
  dot?: number;
  /** Grid cell in px. */
  cell?: number;
  /** Dots fade out toward the bottom (gradient tone). */
  fade?: boolean;
  trigger?: Trigger;
  className?: string;
  children?: ReactNode;
};

/**
 * Screentone dots that "develop" like a print: dot radius grows from zero.
 * Without JS the tone is simply there at full size.
 */
export function Screentone({
  dot = 1.2,
  cell = 6,
  fade = false,
  trigger = "scroll",
  className,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion(
    (ctx, el) => {
      gsap.fromTo(
        el,
        { "--dot": "0px" },
        {
          "--dot": `${dot}px`,
          duration: ctx.reduced ? 0.2 : 1.2,
          ease: ctx.reduced ? "none" : "steps(10)",
          scrollTrigger: triggerFor(el, trigger),
        },
      );
    },
    ref,
    [dot],
  );

  return (
    <div
      ref={ref}
      className={cn(fade ? "tone-fade" : "tone", className)}
      style={{ "--dot": `${dot}px`, backgroundSize: `${cell}px ${cell}px` } as CSSProperties}
    >
      {children}
    </div>
  );
}
