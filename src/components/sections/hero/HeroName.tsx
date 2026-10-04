"use client";

import { useEffect, useId, useRef } from "react";
import { heroCopy, profile } from "@/content";
import { antiMagic, useAntiMagic } from "@/lib/anti-magic";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

function Chars({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <span key={i} data-ch className={cn("inline-block", className)}>
          {ch}
        </span>
      ))}
    </>
  );
}

/** One name line: Latin and katakana stacked in the same grid cell. */
function Line({ latin, ja, className }: { latin: string; ja: string; className?: string }) {
  return (
    <span className={cn("grid whitespace-nowrap [grid-template-areas:'s']", className)}>
      <span data-name-latin className="[grid-area:s]">
        <Chars text={latin} />
      </span>
      <span data-name-ja lang="ja" className="[grid-area:s]">
        <Chars text={ja} className="opacity-0" />
      </span>
    </span>
  );
}

/**
 * The h1. Hover (mouse), tap (touch) or Enter/Space (keyboard) toggles
 * anti-magic: the name swaps to katakana and the page drains to black and
 * white. Screen readers always get the plain Latin name.
 */
export function HeroName({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const hintId = useId();
  const { active } = useAntiMagic();
  const first = useRef(true);
  const { name } = profile;

  const origin = () => {
    const r = ref.current?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined;
  };
  const enter = () => enabled && antiMagic.set(true, origin());
  const leave = () => antiMagic.set(false);

  // Escape always exits.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && antiMagic.set(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      antiMagic.set(false);
    };
  }, []);

  useGSAP(
    () => {
      if (first.current) {
        first.current = false;
        return;
      }
      const q = gsap.utils.selector(ref);
      const latin = q("[data-name-latin] [data-ch]");
      const ja = q("[data-name-ja] [data-ch]");
      gsap.killTweensOf([...latin, ...ja]);

      if (prefersReducedMotion()) {
        gsap.to(latin, { opacity: active ? 0 : 1, duration: 0.2 });
        gsap.to(ja, { opacity: active ? 1 : 0, duration: 0.2 });
        return;
      }
      if (active) {
        gsap.to(latin, {
          opacity: 0,
          yPercent: -30,
          skewX: -14,
          duration: 0.2,
          stagger: 0.012,
          ease: "steps(3)",
        });
        gsap.fromTo(
          ja,
          { opacity: 0, scale: 1.7, yPercent: 0 },
          { opacity: 1, scale: 1, duration: 0.3, stagger: 0.045, ease: "steps(4)", delay: 0.08 },
        );
      } else {
        gsap.to(ja, { opacity: 0, yPercent: 30, duration: 0.15, stagger: 0.01, ease: "steps(2)" });
        gsap.to(latin, {
          opacity: 1,
          yPercent: 0,
          skewX: 0,
          duration: 0.25,
          stagger: 0.012,
          ease: "steps(3)",
          delay: 0.06,
        });
      }
    },
    { dependencies: [active] },
  );

  return (
    <>
      <h1 className="text-hero">
        <button
          ref={ref}
          type="button"
          data-hero-name
          data-cursor="link"
          data-cursor-label="Anti-magic"
          aria-pressed={active}
          aria-describedby={hintId}
          onPointerEnter={(e) => e.pointerType === "mouse" && enter()}
          onPointerLeave={(e) => e.pointerType === "mouse" && leave()}
          onClick={(e) => {
            // Mouse users get hover; clicks come from touch or keyboard (detail 0).
            const isMouseClick = e.detail > 0 && window.matchMedia("(hover: hover)").matches;
            if (isMouseClick) return;
            if (active) leave();
            else enter();
          }}
          className="block cursor-[inherit] text-left leading-[inherit]"
        >
          <span className="sr-only">{name.full}</span>
          <span aria-hidden className="block">
            <Line latin={name.first} ja={name.ja.first} />
            <Line latin={name.last} ja={name.ja.last} className="text-[0.62em]" />
          </span>
        </button>
      </h1>
      <span id={hintId} className="sr-only">
        {heroCopy.antiMagicHint}
      </span>
    </>
  );
}
