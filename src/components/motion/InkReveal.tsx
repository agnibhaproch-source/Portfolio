"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useCalm } from "@/lib/calm";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";

/**
 * Reveals its children through an ink blot that splashes open from `at` and
 * spreads until the whole box shows, then the mask is removed. Fully visible
 * without JS, under reduced motion and in calm mode.
 */
export function InkReveal({
  children,
  at = "30% 40%",
  delay = 0,
  className,
}: {
  children: ReactNode;
  at?: string;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const calm = useCalm();
  useMotion(
    (ctx, el) => {
      if (ctx.reduced || calm) return;
      el.classList.add("ink-reveal");
      el.style.setProperty("--ink-at", at);
      gsap.fromTo(
        el,
        { "--ink": "0%" },
        {
          "--ink": "420%",
          duration: 1.1,
          delay,
          ease: "power2.in",
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
          onComplete: () => el.classList.remove("ink-reveal"),
        },
      );
      return () => el.classList.remove("ink-reveal");
    },
    ref,
    [calm],
  );
  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
