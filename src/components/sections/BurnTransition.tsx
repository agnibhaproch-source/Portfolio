"use client";

import { useRef } from "react";
import { SummonSmoke, type SummonSmokeHandle } from "@/components/gl/SummonSmoke";
import { Greatsword } from "@/components/motion/Greatsword";
import { MagicCircle } from "@/components/motion/MagicCircle";
import { sfxCopy, transitionCopy } from "@/content";
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
 * Then the summoning: the circle turns crimson and tips flat, its core opens
 * into an anti-magic void, black smoke pours out (WebGL shader) and an
 * original greatsword rises hilt-first, hangs, then slams back down into
 * the circle: impact frame, shockwave, cracks across the screen, debris.
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

/** Cracks splitting out from the impact point (50, 64) of a 100x100 box. */
const CRACKS = Array.from({ length: 9 }, (_, i) => {
  const rand = seeded(i * 13 + 2);
  const a = (i / 9) * Math.PI * 2 + (rand() - 0.5) * 0.4;
  let x = 50;
  let y = 64;
  const pts = [`${x},${y}`];
  const len = 30 + rand() * 40;
  for (let r = 0; r < len; r += 3 + rand() * 4) {
    const wob = (rand() - 0.5) * 0.9;
    x += Math.cos(a + wob) * 5;
    y += Math.sin(a + wob) * 5 * (Math.abs(Math.sin(a)) > 0.5 ? 0.9 : 0.4);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
});

/** Debris flung up by the slam: [x, y, rotation] targets in px. */
const DEBRIS = Array.from({ length: 10 }, (_, i) => {
  const rand = seeded(i * 7 + 40);
  return [(rand() - 0.5) * 900, -120 - rand() * 320, (rand() - 0.5) * 540] as const;
});

export function BurnTransition() {
  const ref = useRef<HTMLDivElement>(null);
  const smoke = useRef<SummonSmokeHandle>(null);

  useMotion((ctx, el) => {
    const q = gsap.utils.selector(el);
    if (ctx.reduced) {
      // Static: fully burnt, the grimoire reveal shown as a still frame.
      gsap.set(q("[data-burn-paper], [data-tendrils], [data-summoning]"), { autoAlpha: 0 });
      return;
    }

    const slam = () => {
      if (tl.scrollTrigger?.direction !== 1) return;
      sound.play("impact");
      haptic("impact");
      impactFrame(1.4);
    };
    const fumes = { v: 0 };
    const setFumes = () => smoke.current?.setAmount(fumes.v);

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
      .fromTo(q("[data-dark]"), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 1.08)
      .fromTo(
        fumes,
        { v: 0 },
        { v: 0.55, duration: 0.26, ease: "power1.in", onUpdate: setFumes },
        1.14,
      )
      // the greatsword rises hilt-first out of the void...
      .fromTo(
        q("[data-sword]"),
        { yPercent: 100, rotation: -4 },
        { yPercent: 2, rotation: 2, duration: 0.3, ease: "power2.out" },
        1.22,
      )
      .fromTo(q("[data-veins]"), { strokeOpacity: 0 }, { strokeOpacity: 0.9, duration: 0.1 }, 1.4)
      .fromTo(
        q("[data-summon-word]"),
        { scale: 2.2, opacity: 0, rotation: -16 },
        { scale: 1, opacity: 1, rotation: -8, duration: 0.05, ease: "steps(3)" },
        1.3,
      )
      .to(q("[data-summon-word]"), { opacity: 0, duration: 0.06 }, 1.56)
      // ...hangs in the smoke...
      .to(
        q("[data-sword]"),
        { yPercent: -3, rotation: 0, duration: 0.08, ease: "sine.inOut" },
        1.52,
      )
      .to(fumes, { v: 0.8, duration: 0.1, onUpdate: setFumes }, 1.5)
      // ...and slams back down into the circle
      .to(q("[data-sword]"), { yPercent: 34, duration: 0.05, ease: "power4.in" }, 1.6)
      .call(slam, [], 1.65)
      .fromTo(
        q("[data-stage]"),
        { x: 0, y: 0 },
        { keyframes: { x: [14, -12, 9, -5, 0], y: [-8, 6, -4, 2, 0] }, duration: 0.08 },
        1.65,
      )
      .fromTo(
        q("[data-shock]"),
        { scale: 0.2, opacity: 1 },
        { scale: 5, opacity: 0, duration: 0.14, ease: "power2.out" },
        1.65,
      )
      .fromTo(
        q("[data-crack]"),
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 0.08, stagger: 0.004 },
        1.65,
      )
      .fromTo(
        q("[data-debris]"),
        { x: 0, y: 0, rotation: 0, opacity: 1 },
        {
          x: (i: number) => DEBRIS[i]![0],
          y: (i: number) => DEBRIS[i]![1],
          rotation: (i: number) => DEBRIS[i]![2],
          opacity: 0,
          duration: 0.18,
          ease: "power2.out",
        },
        1.65,
      )
      .fromTo(q("[data-summon-bolts]"), { opacity: 0 }, { opacity: 1, duration: 0.02 }, 1.65)
      .fromTo(
        q("[data-slam-word]"),
        { scale: 2.6, opacity: 0, rotation: -20 },
        { scale: 1, opacity: 1, rotation: -8, duration: 0.05, ease: "steps(3)" },
        1.66,
      )
      .to(fumes, { v: 1, duration: 0.04, onUpdate: setFumes }, 1.65)
      .to(fumes, { v: 0.65, duration: 0.15, onUpdate: setFumes }, 1.72)
      .to({}, { duration: 0.12 }, 1.8);
  }, ref);

  return (
    <div
      ref={ref}
      aria-hidden
      data-mode="colour"
      className="relative h-[360svh] motion-reduce:h-svh"
    >
      <div
        data-stage
        className="sticky top-0 h-svh overflow-hidden bg-[linear-gradient(to_bottom,var(--twilight),var(--sumi)_60%)]"
      >
        {/* Revealed as the paper burns away: an original magic circle and a title line */}
        <div className="absolute inset-0 grid place-items-center">
          <div
            data-burn-glow
            className="absolute size-[min(95vw,85svh)] rounded-full bg-[radial-gradient(circle,rgb(201_162_74/0.2),transparent_65%)]"
          />
          <div data-circle className="absolute inset-0 grid place-items-center [perspective:900px]">
            <MagicCircle draw="external" className="absolute size-[min(86vw,72svh)] opacity-80" />
          </div>

          {/* The summoning: void, smoke, the greatsword */}
          <div data-summoning className="pointer-events-none invisible absolute inset-0">
            <div
              data-dark
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,transparent_25%,#000_95%)] opacity-0"
            />
            <div
              data-void
              className="absolute top-[64%] left-1/2 h-[16svh] w-[min(70vw,56svh)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(ellipse,#000_40%,rgb(194_39_45/0.5)_62%,transparent_72%)] opacity-0"
            />
            <SummonSmoke ref={smoke} originY={0.36} className="absolute inset-0 h-full w-full" />
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full [filter:drop-shadow(0_0_5px_rgb(194_39_45/0.8))]"
            >
              {CRACKS.map((pts) => (
                <polyline
                  key={pts}
                  data-crack
                  points={pts}
                  fill="none"
                  stroke="#000"
                  strokeWidth="3"
                  strokeLinejoin="bevel"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            {/* the sword only exists above the void line: it rises out of it and sinks into it */}
            <div className="absolute inset-x-0 top-0 h-[64%] overflow-hidden">
              <div
                data-sword
                className="absolute bottom-0 left-1/2 h-[min(60svh,34rem)] -translate-x-1/2"
              >
                <div className="bg-black/60 absolute -inset-x-6 inset-y-0 blur-2xl" />
                <Greatsword className="relative h-full w-auto [filter:drop-shadow(0_0_10px_rgb(194_39_45/0.7))_drop-shadow(0_0_30px_#000)]" />
              </div>
            </div>
            <div
              data-shock
              className="absolute top-[64%] left-1/2 h-[4svh] w-[16svh] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[3px] border-washi opacity-0 shadow-[0_0_20px_var(--agni)]"
            />
            <div className="absolute top-[64%] left-1/2">
              {DEBRIS.map((_, i) => (
                <span
                  key={i}
                  data-debris
                  className="absolute size-3 bg-[#0b0708] opacity-0 [clip-path:polygon(50%_0,100%_70%,30%_100%,0_40%)]"
                  style={{ width: 8 + (i % 4) * 5, height: 8 + (i % 3) * 5 }}
                />
              ))}
            </div>
            <svg
              data-summon-bolts
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full animate-[bolt-flicker_0.14s_steps(2)_infinite] opacity-0"
            >
              {[
                "44,62 40,48 46,40 42,24",
                "56,62 60,50 55,42 59,26",
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
              className="absolute top-[16%] left-[8%] sfx text-36 text-kiln opacity-0 [text-shadow:0_0_14px_var(--agni)] md:text-56"
            >
              {transitionCopy.summonWord}
            </p>
            <p
              data-slam-word
              className="absolute top-[10%] right-[6%] sfx text-56 text-washi opacity-0 [text-shadow:0_0_24px_var(--agni)] md:text-[9rem] md:leading-none"
            >
              {sfxCopy.slam}
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
