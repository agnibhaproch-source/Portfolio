"use client";

import { useRef } from "react";
import { MagicCircle } from "@/components/motion/MagicCircle";
import { transitionCopy } from "@/content";
import { gsap, SplitText } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";

/*
 * Mode switch between About (paper) and Skills (night). The paper slides up
 * with a burnt, ember-rimmed bottom edge while shadow tendrils climb ahead
 * of it. Scrubbed both ways; only transforms animate. Shapes come from a
 * seeded generator so server and client render the same paths.
 */

function seeded(seed: number) {
  // Spread small seeds out and discard the first draws: a Lehmer generator
  // returns near-zero values for its first few calls with small seeds.
  let s = (seed * 2654435761) % 2147483647 || 1;
  const next = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  for (let i = 0; i < 5; i++) next();
  return next;
}

const EDGE_W = 1600;
const EDGE_H = 220;

/** Irregular burn line across the width, with occasional flame tongues. */
function burnEdge() {
  const rand = seeded(7);
  const pts: [number, number][] = [];
  for (let x = 0; x <= EDGE_W; x += 16) {
    const wave = Math.sin(x / 170) * 18 + Math.sin(x / 61 + 1.3) * 9;
    const tongue = rand() > 0.88 ? -40 - rand() * 50 : 0;
    pts.push([x, 120 + wave + tongue + (rand() - 0.5) * 16]);
  }
  return pts;
}

const EDGE = burnEdge();
const EDGE_LINE = EDGE.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y.toFixed(1)}`).join(" ");
// Paper above the line (top of the SVG down to the edge).
const PAPER = `M0 0 L${EDGE_W} 0 L${EDGE_W} ${EDGE.at(-1)![1].toFixed(1)} ${EDGE.slice()
  .reverse()
  .map(([x, y]) => `L${x} ${y.toFixed(1)}`)
  .join(" ")} Z`;

/** Tapered, wavering tendril rising from the bottom of a 1600x1000 box. */
function tendril(seed: number) {
  const rand = seeded(seed);
  const baseX = 80 + rand() * 1440;
  const height = 380 + rand() * 420;
  const steps = 14;
  const left: string[] = [];
  const right: string[] = [];
  let x = baseX;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    x += (rand() - 0.5) * 60 + Math.sin(t * 6 + seed) * 10;
    const y = 1000 - t * height;
    const w = (1 - t) ** 1.4 * (34 + rand() * 18);
    left.push(`${(x - w).toFixed(1)} ${y.toFixed(1)}`);
    right.unshift(`${(x + w).toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M${left.join(" L")} L${right.join(" L")} Z`;
}

const TENDRILS = Array.from({ length: 9 }, (_, i) => tendril(i * 31 + 5));

export function BurnTransition() {
  const ref = useRef<HTMLDivElement>(null);

  useMotion((ctx, el) => {
    const q = gsap.utils.selector(el);
    if (ctx.reduced) {
      // Static: fully burnt, the grimoire reveal shown as a still frame.
      gsap.set(q("[data-burn-paper], [data-tendrils]"), { autoAlpha: 0 });
      return;
    }

    const chars = SplitText.create(q("[data-burn-line]"), { type: "words,chars" }).chars;

    // One scrubbed timeline, 0 to 1 across the block: burn, then reveal, then hold.
    gsap
      .timeline({
        scrollTrigger: { trigger: el, start: "top 55%", end: "bottom bottom", scrub: 0.4 },
      })
      .fromTo(
        q("[data-burn-paper]"),
        { yPercent: 0 },
        { yPercent: -100, ease: "none", duration: 0.55 },
        0,
      )
      // the rim glow lags the paper a little so the edge looks alive
      .fromTo(q("[data-burn-rim]"), { y: 0 }, { y: 24, ease: "sine.inOut", duration: 0.55 }, 0)
      .fromTo(
        q("[data-tendril]"),
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "power2.out",
          duration: 0.35,
          stagger: 0.015,
          transformOrigin: "50% 100%",
        },
        0.03,
      )
      .to(
        q("[data-tendrils]"),
        { yPercent: -30, opacity: 0, ease: "power1.in", duration: 0.15 },
        0.4,
      )
      // the grimoire reveal underneath
      .fromTo(
        q("[data-burn-glow]"),
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 0.3 },
        0.3,
      )
      .from(q("[data-ring]"), { drawSVG: "0%", duration: 0.25, stagger: 0.04, ease: "none" }, 0.3)
      .from(
        q("[data-runes] > *"),
        { opacity: 0, scale: 0, transformOrigin: "50% 50%", duration: 0.1, stagger: 0.005 },
        0.45,
      )
      .from(q("[data-star]"), { drawSVG: "0%", duration: 0.25, ease: "steps(14)" }, 0.5)
      .from(q("[data-core]"), { drawSVG: "50% 50%", duration: 0.1 }, 0.7)
      .from(
        chars,
        { yPercent: 120, scale: 1.5, opacity: 0, duration: 0.12, stagger: 0.008, ease: "steps(4)" },
        0.68,
      )
      .from(q("[data-burn-underline]"), { scaleX: 0, duration: 0.1, ease: "ink" }, 0.86)
      .to({}, { duration: 0.04 }, 0.96);
  }, ref);

  return (
    <div
      ref={ref}
      aria-hidden
      data-mode="colour"
      className="relative h-[220svh] motion-reduce:h-svh"
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-[linear-gradient(to_bottom,var(--twilight),var(--sumi)_60%)]">
        {/* Revealed as the paper burns away: an original magic circle and a title line */}
        <div className="absolute inset-0 grid place-items-center">
          <div
            data-burn-glow
            className="absolute size-[min(95vw,85svh)] rounded-full bg-[radial-gradient(circle,rgb(201_162_74/0.2),transparent_65%)]"
          />
          <MagicCircle draw="external" className="absolute size-[min(86vw,72svh)] opacity-80" />
          <div className="relative px-4 text-center">
            <p
              data-burn-line
              className="font-display text-56 text-washi [text-shadow:0_0_40px_rgb(201_162_74/0.4)] md:text-96"
            >
              {transitionCopy.burnLine}
            </p>
            <div data-burn-underline className="mx-auto mt-4 h-[3px] w-1/2 bg-aura" />
          </div>
        </div>

        <svg
          data-tendrils
          viewBox="0 0 1600 1000"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 z-20 h-full w-full text-sumi"
        >
          {TENDRILS.map((d, i) => (
            <path key={i} data-tendril d={d} fill="currentColor" />
          ))}
        </svg>

        <div
          data-burn-paper
          className="absolute inset-x-0 top-0 z-10 flex h-[calc(100%+18svh)] flex-col"
        >
          <div className="flex-1 bg-washi">
            <div className="h-full rotate-180 tone-fade opacity-40 [--tone-dot:var(--tone)]" />
          </div>
          <svg
            viewBox={`0 0 ${EDGE_W} ${EDGE_H}`}
            preserveAspectRatio="none"
            className="-mt-px h-[18svh] w-full overflow-visible"
          >
            <defs>
              <linearGradient id="scorch" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--washi)" />
                <stop offset="0.45" stopColor="#c8a77a" />
                <stop offset="0.75" stopColor="#5b2c1a" />
                <stop offset="1" stopColor="#2a130c" />
              </linearGradient>
              <linearGradient id="rim" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="var(--agni)" />
                <stop offset="0.5" stopColor="var(--kiln)" />
                <stop offset="1" stopColor="var(--agni)" />
              </linearGradient>
            </defs>
            <g data-burn-rim className="[filter:blur(6px)]">
              <path d={EDGE_LINE} fill="none" stroke="url(#rim)" strokeWidth="22" />
            </g>
            <path d={PAPER} fill="url(#scorch)" />
            <path d={EDGE_LINE} fill="none" stroke="var(--kiln)" strokeWidth="3" />
          </svg>
        </div>
      </div>
    </div>
  );
}
