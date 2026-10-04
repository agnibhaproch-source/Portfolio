"use client";

import { useRef, type ReactNode } from "react";
import { DUR, gsap, SplitText, STAGGER } from "@/lib/gsap";
import { triggerFor, type Trigger } from "@/lib/motion";
import { useMotion } from "@/lib/use-motion";

type TextTag = "p" | "span" | "div" | "h2" | "h3" | "blockquote";

type Props = {
  as?: TextTag;
  by?: "lines" | "words" | "chars";
  /** Animate "on twos": stepped motion that reads as hand-drawn. */
  stepped?: boolean;
  trigger?: Trigger;
  delay?: number;
  className?: string;
  children: ReactNode;
};

/**
 * Text rises out of a mask, line by line (or word/char). Text is visible
 * without JS; SplitText keeps an aria-label of the full string.
 */
export function SplitReveal({
  as: Tag = "p",
  by = "lines",
  stepped = false,
  trigger = "scroll",
  delay = 0,
  className,
  children,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const El = Tag as "p";

  useMotion((ctx, el) => {
    if (ctx.reduced) {
      gsap.from(el, { opacity: 0, duration: DUR.micro, scrollTrigger: triggerFor(el, trigger) });
      return;
    }
    const split = SplitText.create(el, {
      type: by === "chars" ? "chars,lines" : by === "words" ? "words,lines" : "lines",
      mask: by === "chars" ? "lines" : by,
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self[by], {
          yPercent: 110,
          rotate: by === "chars" ? 6 : 0,
          duration: stepped ? 0.5 : DUR.standard,
          ease: stepped ? "steps(6)" : "ink",
          stagger: by === "lines" ? STAGGER.loose : STAGGER.tight,
          delay,
          scrollTrigger: triggerFor(el, trigger),
        }),
    });
    return () => split.revert();
  }, ref);

  return (
    <El ref={ref as React.RefObject<HTMLParagraphElement>} className={className}>
      {children}
    </El>
  );
}
