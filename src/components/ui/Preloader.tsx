"use client";

import { useEffect, useRef } from "react";
import { heroCopy, profile } from "@/content";
import { gsap, useGSAP } from "@/lib/gsap";
import { markIntroDone, PRELOADED_KEY } from "@/lib/intro";
import { useLenis } from "@/lib/smooth-scroll";
import { sound } from "@/lib/sound";
import { FLAME_INNER, FLAME_OUTER } from "./flame-paths";

/** Cracks spreading from the seam, in a 100x100 box. */
const CRACKS = [
  "50,50 46,44 47,38 42,31 44,24",
  "50,50 55,45 53,39 58,33 57,26",
  "50,50 45,56 47,62 41,69",
  "50,50 54,57 52,63 57,70 56,76",
  "50,50 43,50 37,48 31,51",
  "50,50 57,50 63,52 69,49",
];

/** The cover emblem: a ruled ring, rune ticks and the flame, centred on (100, 100). */
function Emblem() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" fill="none" stroke="currentColor">
      <circle data-stroke cx="100" cy="100" r="92" strokeWidth="2.5" />
      <circle data-stroke cx="100" cy="100" r="80" strokeWidth="1" strokeDasharray="3 6" />
      <circle data-stroke cx="100" cy="100" r="58" strokeWidth="1.5" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const p = (r: number) =>
          `${(100 + Math.cos(a) * r).toFixed(1)} ${(100 + Math.sin(a) * r).toFixed(1)}`;
        return <path key={i} data-stroke d={`M${p(62)} L${p(78)}`} strokeWidth="1.5" />;
      })}
      <g transform="translate(64.8 62) scale(2.2)">
        <path data-fill d={FLAME_OUTER} fill="var(--agni)" stroke="none" opacity="0" />
        <path data-fill d={FLAME_INNER} fill="var(--kiln)" stroke="none" opacity="0" />
        <path data-stroke d={FLAME_OUTER} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <path data-stroke d={FLAME_INNER} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

/** One board of the cover. Both carry the whole emblem, clipped at the seam. */
function Board({ side }: { side: "l" | "r" }) {
  const left = side === "l";
  return (
    <div
      data-board={side}
      className={`absolute inset-y-0 w-1/2 overflow-hidden bg-[linear-gradient(160deg,#2c1a20,#140e0d_70%)] [backface-visibility:hidden] ${left ? "left-0 origin-left" : "right-0 origin-right"}`}
    >
      <div className="absolute inset-0 tone opacity-10 [--tone-dot:var(--washi)]" />
      {/* tooled border and corner fittings */}
      <div
        className={`absolute inset-y-4 border-[3px] border-aura/60 ${left ? "right-0 left-4 border-r-0" : "right-4 left-0 border-l-0"}`}
      />
      <div
        className={`absolute inset-y-7 border border-aura/30 ${left ? "right-0 left-7 border-r-0" : "right-7 left-0 border-l-0"}`}
      />
      {["top-3", "bottom-3"].map((v) => (
        <span
          key={v}
          className={`absolute ${v} ${left ? "left-3" : "right-3"} size-8 rotate-45 border-[3px] border-aura bg-[#140e0d]`}
        />
      ))}
      {/* spine bands on the outer edge */}
      <div
        className={`absolute inset-y-0 w-3 bg-[repeating-linear-gradient(0deg,rgb(201_162_74/0.5)_0_6px,transparent_6px_40px)] ${left ? "left-0" : "right-0"}`}
      />
      <div
        className={`absolute top-1/2 size-[min(64vw,56svh)] -translate-y-1/2 text-aura ${left ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"}`}
      >
        <Emblem />
      </div>
      <div
        className={`absolute inset-y-0 w-6 ${left ? "right-0 bg-[linear-gradient(90deg,transparent,rgb(0_0_0/0.6))]" : "left-0 bg-[linear-gradient(-90deg,transparent,rgb(0_0_0/0.6))]"}`}
      />
    </div>
  );
}

/**
 * Cold open: the screen is the closed cover of an original grimoire. Its
 * emblem inks itself while a counter runs to 100, light leaks through the
 * seam, cracks split out, the clasp snaps and the two boards swing open onto
 * the hero. Under 2.5s, once per session, never under reduced or calm mode.
 * Hidden by CSS unless the head script set html[data-preload]; a CSS
 * failsafe hides it after 2.6s anyway.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  const active = useRef(false);

  useEffect(() => {
    lenisRef.current = lenis;
    if (active.current) lenis?.stop();
  }, [lenis]);

  useGSAP(
    () => {
      const html = document.documentElement;
      const el = root.current;
      if (!el || !html.hasAttribute("data-preload")) {
        markIntroDone();
        return;
      }
      active.current = true;
      lenisRef.current?.stop();

      const q = gsap.utils.selector(el);
      const digits = q("[data-digit]") as HTMLElement[];
      const count = { v: 0 };
      const paint = () => {
        const s = String(Math.round(count.v)).padStart(3, "0");
        digits.forEach((d, i) => (d.textContent = s[i] ?? "0"));
      };
      const finish = () => {
        try {
          sessionStorage.setItem(PRELOADED_KEY, "1");
        } catch {}
        html.removeAttribute("data-preload");
        active.current = false;
        lenisRef.current?.start();
      };

      el.setAttribute("data-started", "");
      gsap
        .timeline({ onComplete: finish })
        .from(
          q("[data-stroke]"),
          { drawSVG: "0%", duration: 0.55, stagger: 0.03, ease: "steps(10)" },
          0.05,
        )
        .to(q("[data-fill]"), { opacity: 1, duration: 0.2, ease: "steps(3)" }, 0.85)
        .to(count, { v: 100, duration: 1.35, ease: "power1.inOut", onUpdate: paint }, 0)
        .fromTo(
          q("[data-seam]"),
          { scaleY: 0, opacity: 0 },
          { scaleY: 1, opacity: 1, duration: 0.3, ease: "power2.in" },
          1.05,
        )
        .fromTo(
          q("[data-crack]"),
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.18, stagger: 0.02, ease: "none" },
          1.3,
        )
        .to(
          q("[data-board]"),
          { x: 3, duration: 0.04, repeat: 5, yoyo: true, ease: "steps(1)" },
          1.3,
        )
        .call(() => sound.play("impact"), [], 1.5)
        .to(
          q("[data-clasp='l']"),
          { x: -30, y: 60, rotation: -40, opacity: 0, duration: 0.35, ease: "power2.in" },
          1.5,
        )
        .to(
          q("[data-clasp='r']"),
          { x: 30, y: 70, rotation: 35, opacity: 0, duration: 0.35, ease: "power2.in" },
          1.5,
        )
        .to(q("[data-count]"), { opacity: 0, duration: 0.15 }, 1.5)
        .to(q("[data-crack], [data-seam]"), { opacity: 0, duration: 0.15 }, 1.6)
        .fromTo(q("[data-burst]"), { opacity: 0 }, { opacity: 1, duration: 0.12 }, 1.58)
        .to(q("[data-board='l']"), { rotationY: -105, duration: 0.6, ease: "power3.in" }, 1.58)
        .to(q("[data-board='r']"), { rotationY: 105, duration: 0.6, ease: "power3.in" }, 1.58)
        .to(q("[data-burst]"), { opacity: 0, duration: 0.4 }, 1.75)
        .add(markIntroDone, 1.85)
        .to(el, { autoAlpha: 0, duration: 0.15 }, 2.15);
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden
      data-mode="colour"
      className="preloader fixed inset-0 z-[180] [perspective:1800px]"
    >
      <div
        data-burst
        className="absolute inset-0 bg-[radial-gradient(circle,rgb(255_170_90/0.75),rgb(226_98_43/0.25)_35%,transparent_70%)] opacity-0"
      />
      <Board side="l" />
      <Board side="r" />

      <div
        data-seam
        className="absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-[#ffd9a8] opacity-0 shadow-[0_0_18px_6px_rgb(226_98_43/0.8)]"
      />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {CRACKS.map((pts) => (
          <polyline
            key={pts}
            data-crack
            points={pts}
            fill="none"
            stroke="#ffb36b"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className="[filter:drop-shadow(0_0_4px_var(--agni))]"
          />
        ))}
      </svg>

      {/* the clasp across the seam, which snaps in two */}
      <div className="absolute bottom-[16%] left-1/2 flex -translate-x-1/2">
        <span
          data-clasp="l"
          className="block h-10 w-12 rounded-l-md border-[3px] border-r-0 border-aura bg-[#2a1d14]"
        />
        <span
          data-clasp="r"
          className="block h-10 w-12 rounded-r-md border-[3px] border-l-0 border-aura bg-[#2a1d14]"
        >
          <span className="mt-2.5 -ml-2 block size-3 rotate-45 border-2 border-aura bg-agni" />
        </span>
      </div>

      <div data-count className="absolute inset-x-0 bottom-[6%] text-center text-washi">
        <p className="font-display text-36 leading-none">
          {[0, 1, 2].map((i) => (
            <span key={i} data-digit className="inline-block w-[0.72em] text-center">
              0
            </span>
          ))}
        </p>
        <p className="mt-2 text-14 text-[var(--tone-light)]">
          {profile.tagline ?? heroCopy.coverLabel}
        </p>
      </div>
    </div>
  );
}
