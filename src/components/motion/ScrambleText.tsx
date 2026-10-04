"use client";

import { useRef, type ElementType } from "react";
import { gsap } from "@/lib/gsap";
import { triggerFor, type Trigger } from "@/lib/motion";
import { useMotion } from "@/lib/use-motion";

const KATAKANA =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン";

type Props = {
  as?: ElementType;
  text: string;
  trigger?: Trigger;
  duration?: number;
  className?: string;
};

/**
 * Text resolves from katakana noise into Latin. Screen readers get the
 * plain text; the scrambling copy is hidden from them.
 */
export function ScrambleText({
  as: Tag = "span",
  text,
  trigger = "scroll",
  duration = 1.2,
  className,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useMotion(
    (ctx, el) => {
      if (ctx.reduced) return;
      const target = el.querySelector("[data-scramble]");
      if (!target) return;
      gsap.to(target, {
        duration,
        ease: "none",
        scrambleText: { text, chars: KATAKANA, speed: 0.6, revealDelay: 0.15 },
        scrollTrigger: triggerFor(el, trigger),
      });
    },
    ref,
    [text, duration],
  );

  return (
    <Tag ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      {/* The invisible copy reserves the final size; katakana are wider than
          Latin, so the scrambling layer is clipped to it to avoid reflow. */}
      <span aria-hidden className="relative inline-block max-w-full align-top">
        <span className="invisible">{text}</span>
        <span data-scramble className="absolute inset-0 overflow-hidden whitespace-nowrap">
          {text}
        </span>
      </span>
    </Tag>
  );
}
