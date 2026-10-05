"use client";

import { useRef } from "react";
import { sfxCopy } from "@/content";
import { ImpactWord, type ImpactWordHandle } from "@/components/motion/ImpactWord";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { SwordFigure, swingProxy } from "@/components/motion/SwordFigure";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { impactFrame } from "@/lib/impact";
import { useMotion } from "@/lib/use-motion";

/** Spark streaks flying from the clash point, in a 200x200 box. */
const SPARKS = Array.from({ length: 16 }, (_, i) => {
  const a = (i / 16) * Math.PI * 2 + (i % 3) * 0.12;
  const p = (r: number, wob = 0) =>
    `${(100 + Math.cos(a + wob) * r).toFixed(1)},${(100 + Math.sin(a + wob) * r).toFixed(1)}`;
  const len = 50 + (i % 4) * 14;
  return `${p(12)} ${p(12 + len * 0.45, 0.08)} ${p(12 + len, -0.04)}`;
});

/**
 * Two original fighters charge from opposite edges and clash in the middle:
 * sparks, a GIN! sound word and an impact frame, a held freeze, then both
 * skid back. Plays when the footer comes into view; a still clash under
 * reduced motion.
 */
export function Duel() {
  const ref = useRef<HTMLDivElement>(null);
  const word = useRef<ImpactWordHandle>(null);

  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const q = gsap.utils.selector(el);
    const left = swingProxy(q("[data-duel='left']")[0] ?? null, -80);
    const right = swingProxy(q("[data-duel='right']")[0] ?? null, -80);
    const clash = () => {
      word.current?.play(sfxCopy.clash, 50, 26);
      impactFrame(1.2);
      gsap.fromTo(
        el,
        { x: 8, y: -5 },
        { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1.2, 0.25)" },
      );
    };
    const tl = gsap
      .timeline({ paused: true })
      .fromTo(q("[data-duel='left']"), { x: "-55vw" }, { x: 0, duration: 0.55, ease: "power3.in" })
      .fromTo(
        q("[data-duel='right']"),
        { x: "55vw" },
        { x: 0, duration: 0.55, ease: "power3.in" },
        0,
      )
      .fromTo(q("[data-lines]"), { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0)
      .fromTo(
        left.proxy,
        { a: -80 },
        { a: 40, duration: 0.18, ease: "power3.in", onUpdate: left.apply },
        0.38,
      )
      .fromTo(
        right.proxy,
        { a: -80 },
        { a: 40, duration: 0.18, ease: "power3.in", onUpdate: right.apply },
        0.38,
      )
      .call(clash, [], 0.56)
      .fromTo(
        q("[data-spark]"),
        { drawSVG: "0% 0%", opacity: 1 },
        { drawSVG: "0% 100%", duration: 0.16, ease: "power2.out" },
        0.56,
      )
      .fromTo(
        q("[data-flash]"),
        { scale: 0.2, opacity: 1 },
        { scale: 2.4, opacity: 0, duration: 0.5, ease: "power2.out" },
        0.56,
      )
      .to(q("[data-spark]"), { drawSVG: "100% 100%", opacity: 0, duration: 0.4 }, 1.25)
      .to(
        q("[data-duel='left']"),
        { x: "-9vw", rotation: -3, duration: 0.45, ease: "power2.out" },
        1.3,
      )
      .to(
        q("[data-duel='right']"),
        { x: "9vw", rotation: 3, duration: 0.45, ease: "power2.out" },
        1.3,
      )
      .to(q("[data-lines]"), { opacity: 0, duration: 0.4 }, 1.3);
    tl.progress(0);
    ScrollTrigger.create({
      trigger: el,
      start: "top 70%",
      onEnter: () => tl.restart(),
      onLeaveBack: () => tl.pause(0),
    });
  }, ref);

  return (
    <div ref={ref} aria-hidden className="relative h-[40svh] overflow-hidden md:h-[52svh]">
      <div data-lines className="pointer-events-none absolute inset-0 text-washi/20 opacity-0">
        <SpeedLines variant="parallel" intensity={0.9} />
      </div>
      <div className="absolute inset-x-0 bottom-[6%] flex items-end justify-center">
        <div data-duel="left" className="-mr-[6%] w-[min(42vw,22rem)] text-washi">
          <SwordFigure swing={40} className="w-full" />
        </div>
        <div data-duel="right" className="-ml-[6%] w-[min(42vw,22rem)] text-washi">
          <SwordFigure variant="katana" swing={40} className="w-full -scale-x-100" />
        </div>
      </div>
      <div className="pointer-events-none absolute top-[38%] left-1/2 size-[min(50vw,22rem)] -translate-x-1/2 -translate-y-1/2">
        <span
          data-flash
          className="absolute inset-[35%] rounded-full bg-[radial-gradient(circle,var(--washi),var(--kiln)_45%,transparent_70%)] opacity-0"
        />
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full overflow-visible">
          {SPARKS.map((pts, i) => (
            <polyline
              key={i}
              data-spark
              points={pts}
              fill="none"
              stroke={i % 3 ? "var(--kiln)" : "var(--washi)"}
              strokeWidth={i % 2 ? 2 : 3}
              strokeLinecap="round"
              opacity="0"
            />
          ))}
        </svg>
      </div>
      <ImpactWord ref={word} className="text-96" />
    </div>
  );
}
