"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { triggerFor, type Trigger } from "@/lib/motion";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";

/*
 * Original rune circle (no symbols from any show): two rings, a band of
 * made-up geometric runes, a seven-point star and an inner ring.
 */
const C = 100;
const RUNES = 21;

function polar(r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
}

const round = (n: number) => Math.round(n * 100) / 100;

// {7/3} heptagram
const STAR = Array.from({ length: 8 }, (_, i) => polar(78, ((i * 3) % 7) * (360 / 7)))
  .map(([x, y]) => `${round(x)},${round(y)}`)
  .join(" ");

// Three alternating rune shapes, drawn tangent to the band.
function rune(i: number) {
  const deg = (i * 360) / RUNES;
  const [x, y] = polar(89, deg);
  const rx = round(x);
  const ry = round(y);
  const t = `rotate(${round(deg)} ${rx} ${ry})`;
  if (i % 3 === 0)
    return (
      <path
        key={i}
        d={`M${rx - 3} ${ry + 3} L${rx} ${ry - 3} L${rx + 3} ${ry + 3}`}
        transform={t}
      />
    );
  if (i % 3 === 1) return <circle key={i} cx={rx} cy={ry} r={2.2} />;
  return (
    <path
      key={i}
      d={`M${rx - 3} ${ry} L${rx + 3} ${ry} M${rx} ${ry - 3} L${rx} ${ry + 3}`}
      transform={t}
    />
  );
}

type Props = {
  trigger?: Trigger;
  spin?: boolean;
  /** "external": skip the built-in draw so a parent timeline can scrub it. */
  draw?: "self" | "external";
  className?: string;
};

/** Draws itself stroke by stroke, then turns slowly while on screen. */
export function MagicCircle({ trigger = "scroll", spin = true, draw = "self", className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion(
    (ctx, el) => {
      const q = gsap.utils.selector(el);
      if (ctx.reduced) {
        if (draw === "self") {
          gsap.from(el, { opacity: 0, duration: 0.2, scrollTrigger: triggerFor(el, trigger) });
        }
        return;
      }
      if (draw === "self")
        gsap
          .timeline({ scrollTrigger: triggerFor(el, trigger) })
          .from(q("[data-ring]"), { drawSVG: "0%", duration: 0.9, ease: "ink", stagger: 0.12 })
          .from(
            q("[data-runes] > *"),
            {
              opacity: 0,
              scale: 0,
              transformOrigin: "50% 50%",
              duration: 0.25,
              ease: "heat",
              stagger: 0.02,
            },
            "-=0.5",
          )
          .from(q("[data-star]"), { drawSVG: "0%", duration: 1, ease: "steps(14)" }, "-=0.4")
          .from(q("[data-core]"), { drawSVG: "50% 50%", duration: 0.5 }, "-=0.2");

      if (!spin) return;
      gsap.to(q("[data-runes]"), {
        rotation: 360,
        svgOrigin: `${C} ${C}`,
        duration: 60,
        repeat: -1,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          toggleActions: "play pause resume pause",
        },
      });
    },
    ref,
    [draw],
  );

  return (
    <div ref={ref} aria-hidden className={cn("text-aura", className)}>
      <svg
        viewBox="0 0 200 200"
        className="h-full w-full"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <circle data-ring cx={C} cy={C} r={97} strokeWidth="2" />
        <circle data-ring cx={C} cy={C} r={81} />
        <g data-runes>{Array.from({ length: RUNES }, (_, i) => rune(i))}</g>
        <polyline data-star points={STAR} strokeLinejoin="round" />
        <circle data-core cx={C} cy={C} r={30} strokeWidth="1.6" />
        <circle data-ring cx={C} cy={C} r={24} strokeDasharray="2 4" />
      </svg>
    </div>
  );
}
