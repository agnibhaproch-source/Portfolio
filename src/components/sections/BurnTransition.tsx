"use client";

import { useRef } from "react";
import { Devil } from "@/components/motion/Devil";
import { MagicCircle } from "@/components/motion/MagicCircle";
import { transitionCopy } from "@/content";
import { gsap, SplitText } from "@/lib/gsap";
import { haptic } from "@/lib/haptics";
import { impactFrame } from "@/lib/impact";
import { sound } from "@/lib/sound";
import { useMotion } from "@/lib/use-motion";

/*
 * Mode switch between About (paper) and Skills (night). The paper slides up
 * with a burnt, ember-rimmed bottom edge while shadow tendrils climb ahead
 * of it. Scrubbed both ways; only transforms animate. Shapes come from a
 * seeded generator so server and client render the same paths.
 *
 * Then the summoning: the circle turns crimson, its core opens into an
 * anti-magic void, shadow wisps burst outward and an original devil rises
 * out of the circle, wings unfurling, eyes igniting.
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

/** Anti-magic shadow wisp curling outward from the void (800, 640) of a 1600x1000 box. */
function wisp(i: number, count: number) {
  const rand = seeded(i * 17 + 3);
  const a = (i / count) * Math.PI * 2 + (rand() - 0.5) * 0.3;
  const len = 300 + rand() * 340;
  const curl = (rand() - 0.5) * 1.1;
  const steps = 18;
  const left: string[] = [];
  const right: string[] = [];
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    const ang = a + curl * t * t;
    const r = 40 + t * len;
    const cx = 800 + Math.cos(ang) * r;
    const cy = 640 + Math.sin(ang) * r * 0.55 - t * t * 140;
    const w = (1 - t) ** 1.1 * (46 + rand() * 6) + Math.sin(t * 9 + i) * 3;
    const nx = -Math.sin(ang) * w;
    const ny = Math.cos(ang) * w * 0.55;
    left.push(`${(cx + nx).toFixed(1)} ${(cy + ny).toFixed(1)}`);
    right.unshift(`${(cx - nx).toFixed(1)} ${(cy - ny).toFixed(1)}`);
  }
  return `M${left.join(" L")} L${right.join(" L")} Z`;
}

const WISPS = Array.from({ length: 14 }, (_, i) => wisp(i, 14));

export function BurnTransition() {
  const ref = useRef<HTMLDivElement>(null);

  useMotion((ctx, el) => {
    const q = gsap.utils.selector(el);
    if (ctx.reduced) {
      // Static: fully burnt, the grimoire reveal shown as a still frame.
      gsap.set(q("[data-burn-paper], [data-tendrils], [data-summoning]"), { autoAlpha: 0 });
      return;
    }

    const summon = () => {
      if (tl.scrollTrigger?.direction !== 1) return;
      sound.play("impact");
      haptic("impact");
      impactFrame(1.2);
    };

    gsap.set(q("[data-summoning]"), { autoAlpha: 1 });
    const chars = SplitText.create(q("[data-burn-line]"), { type: "words,chars" }).chars;

    // One scrubbed timeline: burn (0 to 0.55), grimoire reveal (to 1), summoning (to 1.9).
    const tl = gsap
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
      // the summoning
      .to(q("[data-burn-title]"), { y: -60, opacity: 0, duration: 0.12, ease: "power1.in" }, 1.02)
      .to(q("[data-circle] > div"), { color: "#c2272d", duration: 0.12 }, 1.04)
      .fromTo(
        q("[data-circle]"),
        { rotationX: 0, scale: 1 },
        { rotationX: 62, scale: 1.25, yPercent: 26, duration: 0.25, ease: "power2.inOut" },
        1.06,
      )
      .to(q("[data-burn-glow]"), { opacity: 0, duration: 0.1 }, 1.06)
      .fromTo(
        q("[data-void]"),
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.2, ease: "power2.out" },
        1.14,
      )
      .call(summon, [], 1.24)
      .fromTo(
        q("[data-wisp]"),
        { scale: 0 },
        { scale: 1, duration: 0.25, stagger: 0.01, ease: "power3.out", svgOrigin: "800 640" },
        1.24,
      )
      .fromTo(
        q("[data-devil]"),
        { yPercent: 55, scale: 0.7, clipPath: "inset(0% 0% 100% 0%)" },
        {
          yPercent: 0,
          scale: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.32,
          ease: "power2.out",
        },
        1.26,
      )
      .fromTo(
        q("[data-wing='l']"),
        { rotation: 55, scaleX: 0.2 },
        { rotation: 0, scaleX: 1, duration: 0.2, ease: "back.out(1.6)" },
        1.46,
      )
      .fromTo(
        q("[data-wing='r']"),
        { rotation: -55, scaleX: 0.2 },
        { rotation: 0, scaleX: 1, duration: 0.2, ease: "back.out(1.6)" },
        1.46,
      )
      .fromTo(
        q("[data-eyes]"),
        { opacity: 0 },
        { opacity: 1, duration: 0.03, ease: "steps(2)" },
        1.62,
      )
      .fromTo(q("[data-summon-bolts]"), { opacity: 0 }, { opacity: 1, duration: 0.02 }, 1.62)
      .fromTo(
        q("[data-summon-word]"),
        { scale: 2.4, opacity: 0, rotation: -18 },
        { scale: 1, opacity: 1, rotation: -8, duration: 0.06, ease: "steps(3)" },
        1.64,
      )
      .to(
        q("[data-wisps]"),
        { rotation: 8, duration: 0.3, ease: "none", transformOrigin: "50% 50%" },
        1.5,
      )
      .to({}, { duration: 0.12 }, 1.8);
  }, ref);

  return (
    <div
      ref={ref}
      aria-hidden
      data-mode="colour"
      className="relative h-[360svh] motion-reduce:h-svh"
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-[linear-gradient(to_bottom,var(--twilight),var(--sumi)_60%)]">
        {/* Revealed as the paper burns away: an original magic circle and a title line */}
        <div className="absolute inset-0 grid place-items-center">
          <div
            data-burn-glow
            className="absolute size-[min(95vw,85svh)] rounded-full bg-[radial-gradient(circle,rgb(201_162_74/0.2),transparent_65%)]"
          />
          <div data-circle className="absolute inset-0 grid place-items-center [perspective:900px]">
            <MagicCircle draw="external" className="absolute size-[min(86vw,72svh)] opacity-80" />
          </div>

          {/* The summoning: void, shadow wisps, the devil */}
          <div data-summoning className="pointer-events-none invisible absolute inset-0">
            <div
              data-dark
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,transparent_25%,#000_95%)] opacity-0"
            />
            <div
              data-void
              className="absolute top-[64%] left-1/2 h-[16svh] w-[min(70vw,56svh)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(ellipse,#000_40%,rgb(194_39_45/0.5)_62%,transparent_72%)] opacity-0"
            />
            <svg
              data-wisps
              viewBox="0 0 1600 1000"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 h-full w-full [filter:blur(2px)_drop-shadow(0_0_10px_rgb(194_39_45/0.35))]"
            >
              {WISPS.map((d, i) => (
                <path
                  key={i}
                  data-wisp
                  d={d}
                  fill="#050304"
                  stroke="var(--agni)"
                  strokeWidth="1.5"
                  strokeOpacity="0.6"
                />
              ))}
            </svg>
            <div
              data-devil
              className="absolute bottom-[30%] left-1/2 w-[min(100vw,70svh)] -translate-x-1/2 [filter:drop-shadow(0_0_18px_rgb(194_39_45/0.45))] [clip-path:inset(0%_0%_100%_0%)]"
            >
              <Devil className="w-full" />
            </div>
            <svg
              data-summon-bolts
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full animate-[bolt-flicker_0.14s_steps(2)_infinite] opacity-0"
            >
              {[
                "8,20 14,34 10,38 18,56",
                "92,18 86,30 90,36 80,52",
                "20,80 30,70 28,64 40,60",
                "80,82 70,72 73,66 60,60",
              ].map((pts) => (
                <g key={pts}>
                  <polyline
                    points={pts}
                    fill="none"
                    stroke="var(--agni)"
                    strokeWidth="5"
                    strokeOpacity="0.5"
                    vectorEffect="non-scaling-stroke"
                  />
                  <polyline
                    points={pts}
                    fill="none"
                    stroke="#000"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              ))}
            </svg>
            <p
              data-summon-word
              className="absolute top-[14%] right-[8%] sfx text-56 text-kiln opacity-0 [text-shadow:0_0_18px_var(--agni)] md:text-96"
            >
              {transitionCopy.summonWord}
            </p>
          </div>

          <div data-burn-title className="relative px-4 text-center">
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
