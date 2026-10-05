"use client";

import { useRef } from "react";
import { SwordFigure, swingProxy } from "@/components/motion/SwordFigure";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { gsap } from "@/lib/gsap";
import { haptic } from "@/lib/haptics";
import { impactFrame } from "@/lib/impact";
import { sound } from "@/lib/sound";
import { useMotion } from "@/lib/use-motion";

// The cut runs from (0, 64) up to (100, 36) in a 100x100 box.
const CUT_A = "polygon(0% 0%, 100% 0%, 100% 36%, 0% 64%)";
const CUT_B = "polygon(0% 64%, 100% 36%, 100% 100%, 0% 100%)";

/** Jagged lightning along the cut, seeded so server and client agree. */
const BOLTS = [3, 17, 29].map((seed) => {
  let s = seed * 7919;
  const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const pts: string[] = [];
  for (let x = -2; x <= 102; x += 3 + r() * 4) {
    pts.push(`${x.toFixed(1)},${(64 - 0.28 * x + (r() - 0.5) * 9).toFixed(1)}`);
  }
  return pts.join(" ");
});

/**
 * A hooded swordsman dashes across a page printed with the next section's
 * name and cuts it in two with a huge black blade. Black lightning crackles
 * along the cut and the colour drains out of the page, like anti-magic.
 * Scrubbed to scroll; a still frame of the aftermath under reduced motion.
 */
export function SwordsmanDivider({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const q = gsap.utils.selector(el);
    const { proxy, apply } = swingProxy(el, -80);
    const fire = () => {
      if (tl.scrollTrigger?.direction !== 1) return;
      sound.play("slash");
      haptic("impact");
      impactFrame(1.1);
    };
    const tl = gsap
      .timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 15%", scrub: 0.4 },
      })
      .fromTo(q("[data-fighter]"), { x: "-45vw" }, { x: "30vw", duration: 0.34, ease: "power1.in" })
      .fromTo(q("[data-lines]"), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.06)
      .fromTo(proxy, { a: -80 }, { a: 115, duration: 0.1, ease: "power3.in", onUpdate: apply }, 0.3)
      .fromTo(
        q("[data-arc]"),
        { drawSVG: "0%", opacity: 1 },
        { drawSVG: "100%", duration: 0.1 },
        0.3,
      )
      .fromTo(q("[data-cut]"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.05 }, 0.4)
      .call(fire, [], 0.42)
      .to(q("[data-arc]"), { opacity: 0, duration: 0.08 }, 0.44)
      .fromTo(q("[data-bolts]"), { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0.42)
      .fromTo(
        q("[data-page]"),
        { filter: "grayscale(0)" },
        { filter: "grayscale(1)", duration: 0.08 },
        0.42,
      )
      .fromTo(
        q("[data-half='a']"),
        { xPercent: 0, yPercent: 0, rotation: 0 },
        { xPercent: -3, yPercent: -9, rotation: -2.5, duration: 0.3, ease: "power2.out" },
        0.44,
      )
      .fromTo(
        q("[data-half='b']"),
        { xPercent: 0, yPercent: 0, rotation: 0 },
        { xPercent: 3, yPercent: 9, rotation: 2.5, duration: 0.3, ease: "power2.out" },
        0.44,
      )
      .to(q("[data-fighter]"), { x: "115vw", duration: 0.3, ease: "power2.in" }, 0.6)
      .to(q("[data-lines]"), { opacity: 0, duration: 0.15 }, 0.75)
      .to(q("[data-bolts]"), { opacity: 0, duration: 0.1 }, 0.9);
  }, ref);

  const half = (which: "a" | "b") => (
    <div
      data-half={which}
      className="absolute inset-0"
      style={{ clipPath: which === "a" ? CUT_A : CUT_B }}
    >
      <div className="absolute inset-0 bg-washi" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgb(226_98_43/0.45),transparent_65%)]" />
      <div className="absolute inset-0 tone opacity-25 [--tone-dot:var(--sumi)]" />
      <p className="misprint absolute inset-0 grid place-items-center font-display text-[clamp(3rem,12vw,10rem)] leading-none text-sumi">
        {label}
      </p>
    </div>
  );

  return (
    <div ref={ref} aria-hidden data-mode="colour" className="relative h-[80svh] overflow-hidden">
      <div
        data-page
        className="absolute inset-x-4 inset-y-[10%] [filter:grayscale(1)] md:inset-x-10"
      >
        {half("a")}
        {half("b")}
      </div>

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-4 inset-y-[10%] h-[80%] w-[calc(100%-2rem)] overflow-visible md:inset-x-10 md:w-[calc(100%-5rem)]"
      >
        <path
          data-arc
          d="M 30 4 Q 88 6 82 78"
          fill="none"
          stroke="var(--washi)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0"
          vectorEffect="non-scaling-stroke"
        />
        <line
          data-cut
          x1="-2"
          y1="64.6"
          x2="102"
          y2="35.4"
          stroke="var(--washi)"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
          className="[filter:drop-shadow(0_0_6px_var(--agni))]"
        />
        <g data-bolts className="animate-[bolt-flicker_0.14s_steps(2)_infinite]">
          {BOLTS.map((pts, i) => (
            <g key={i}>
              <polyline
                points={pts}
                fill="none"
                stroke="var(--agni)"
                strokeWidth={i === 0 ? 6 : 4}
                strokeOpacity="0.55"
                vectorEffect="non-scaling-stroke"
              />
              <polyline
                points={pts}
                fill="none"
                stroke="#000"
                strokeWidth={i === 0 ? 3 : 1.6}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
        </g>
      </svg>

      <div data-lines className="pointer-events-none absolute inset-0 text-washi/30 opacity-0">
        <SpeedLines variant="parallel" intensity={0.8} />
      </div>

      <div
        data-fighter
        style={{ transform: "translateX(30vw)" }}
        className="pointer-events-none absolute bottom-[8%] left-0 w-[min(70vw,30rem)] text-sumi [filter:drop-shadow(0_0_2px_var(--washi))_drop-shadow(0_0_14px_rgb(0_0_0/0.6))]"
      >
        <SwordFigure swing={115} className="w-full" />
      </div>
    </div>
  );
}
