"use client";

import { useEffect, useRef } from "react";
import { spellCopy } from "@/content";
import { GLYPHS } from "@/components/ui/Rune";
import { gsap } from "@/lib/gsap";
import { haptic } from "@/lib/haptics";
import { impactFrame } from "@/lib/impact";
import { prefersReducedMotion } from "@/lib/motion";
import { sound } from "@/lib/sound";

const FULL_MS = 1600;
const HOLD_MS = { mouse: 260, touch: 420 };
const SKIP =
  "a,button,input,textarea,select,label,summary,video,iframe,[role=button],[contenteditable],[data-no-cast]";

const RUNES = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2;
  return {
    x: Math.cos(a) * 42,
    y: Math.sin(a) * 42,
    rot: (i / 8) * 360 + 90,
    d: GLYPHS[i % GLYPHS.length]!,
  };
});
const STAR = Array.from({ length: 7 }, (_, i) => {
  const a = ((i * 3) % 7) * ((Math.PI * 2) / 7) - Math.PI / 2;
  return `${(Math.cos(a) * 30).toFixed(1)},${(Math.sin(a) * 30).toFixed(1)}`;
}).join(" ");
const RAYS = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  const p = (r: number, w = 0) =>
    `${(Math.cos(a + w) * r).toFixed(1)},${(Math.sin(a + w) * r).toFixed(1)}`;
  return `${p(18)} ${p(60, 0.06)} ${p(95, -0.05)} ${p(130 + (i % 3) * 18)}`;
});

/**
 * Hold anywhere that isn't a control (long-press on touch) and a magic
 * circle charges under the pointer, runes spinning faster. Let go and a
 * burst of fire and ink fires off; a longer hold casts a bigger spell.
 * Off under reduced motion.
 */
export function SpellCast() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const q = gsap.utils.selector(el);
    const charge = q("[data-charge]")[0] as HTMLElement;
    const burst = q("[data-burst]")[0] as HTMLElement;
    const name = q("[data-spell-name]")[0] as HTMLElement;
    const html = document.documentElement;
    console.info(`%c${spellCopy.consoleHint}`, "color:#c9a24a");

    let timer = 0;
    let charging = false;
    let start = 0;
    let sx = 0;
    let sy = 0;
    let x = 0;
    let y = 0;
    let spin: gsap.core.Tween | null = null;
    let grow: gsap.core.Timeline | null = null;

    const reset = () => {
      window.clearTimeout(timer);
      timer = 0;
      charging = false;
      html.removeAttribute("data-casting");
      spin?.kill();
      grow?.kill();
    };

    const begin = () => {
      timer = 0;
      charging = true;
      start = performance.now();
      html.setAttribute("data-casting", "");
      window.getSelection()?.removeAllRanges();
      sound.play("chime");
      gsap.killTweensOf(charge);
      gsap.set(charge, { x, y, autoAlpha: 1 });
      grow = gsap
        .timeline()
        .fromTo(
          q("[data-charge-svg]"),
          { scale: 0.3, opacity: 0 },
          { scale: 1.7, opacity: 1, duration: FULL_MS / 1000, ease: "power1.out" },
        )
        .fromTo(
          q("[data-ring]"),
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.5, stagger: 0.1 },
          0,
        )
        .fromTo(
          q("[data-glyph]"),
          { opacity: 0, scale: 0 },
          { opacity: 1, scale: 1, duration: 0.2, stagger: 0.05, transformOrigin: "50% 50%" },
          0.2,
        )
        .fromTo(
          q("[data-star]"),
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.7, ease: "steps(10)" },
          0.5,
        )
        .fromTo(
          q("[data-core]"),
          { opacity: 0, scale: 0.3 },
          { opacity: 1, scale: 1.2, duration: 1, ease: "power2.in" },
          0.6,
        );
      spin = gsap.to(q("[data-spin]"), {
        rotation: 360,
        duration: 3,
        repeat: -1,
        ease: "none",
        svgOrigin: "0 0",
      });
      gsap.to(spin, { timeScale: 7, duration: FULL_MS / 1000, ease: "power2.in" });
    };

    const release = () => {
      const power = Math.min(Math.max((performance.now() - start) / FULL_MS, 0.15), 1);
      reset();
      gsap
        .timeline()
        .to(q("[data-charge-svg]"), { scale: "+=0.5", duration: 0.12, ease: "power2.out" })
        .to(charge, { autoAlpha: 0, duration: 0.15 }, 0.05);

      const size = 0.55 + power;
      gsap.killTweensOf([burst, ...q("[data-burst] *")]);
      gsap.set(burst, { x, y, scale: size, autoAlpha: 1 });
      gsap
        .timeline({ onComplete: () => void gsap.set(burst, { autoAlpha: 0 }) })
        .fromTo(
          q("[data-ray]"),
          { drawSVG: "0% 0%", opacity: 1 },
          {
            keyframes: [
              { drawSVG: "0% 100%", duration: 0.18, ease: "power2.out" },
              { drawSVG: "100% 100%", opacity: 0, duration: 0.35, ease: "power2.in" },
            ],
            stagger: 0.008,
          },
        )
        .fromTo(
          q("[data-fire-ring]"),
          { scale: 0.2, opacity: 1 },
          { scale: 2.6, opacity: 0, duration: 0.6, ease: "power2.out", transformOrigin: "50% 50%" },
          0,
        )
        .fromTo(
          q("[data-fire-core]"),
          { scale: 0.4, opacity: 1 },
          {
            scale: 1.6,
            opacity: 0,
            duration: 0.45,
            ease: "power2.out",
            transformOrigin: "50% 50%",
          },
          0,
        );

      if (power > 0.45) {
        name.textContent = power > 0.9 ? spellCopy.max : spellCopy.mid;
        gsap.killTweensOf(name);
        gsap.set(name, { x, y: y - 70 * size, xPercent: -50, yPercent: -50 });
        gsap
          .timeline()
          .fromTo(
            name,
            { scale: 2.2, opacity: 0, rotation: -14 },
            { scale: 1, opacity: 1, rotation: -8, duration: 0.2, ease: "steps(3)" },
          )
          .to(name, { opacity: 0, y: "-=20", duration: 0.4 }, 0.9);
      }
      sound.play(power > 0.5 ? "impact" : "stamp");
      haptic("impact");
      if (power > 0.9) impactFrame(1.3);
    };

    const onDown = (e: PointerEvent) => {
      if (!e.isPrimary || e.button !== 0) return;
      if ((e.target as Element | null)?.closest?.(SKIP)) return;
      sx = x = e.clientX;
      sy = y = e.clientY;
      window.clearTimeout(timer);
      timer = window.setTimeout(begin, e.pointerType === "mouse" ? HOLD_MS.mouse : HOLD_MS.touch);
    };
    const onMove = (e: PointerEvent) => {
      if (!e.isPrimary) return;
      x = e.clientX;
      y = e.clientY;
      if (timer && Math.hypot(x - sx, y - sy) > 8) reset();
      if (charging) gsap.set(charge, { x, y });
    };
    const onUp = () => {
      if (charging) release();
      else reset();
    };
    const onCancel = () => {
      if (!charging) return reset();
      reset();
      gsap.to(charge, { autoAlpha: 0, duration: 0.2 });
    };
    const onMenu = (e: Event) => {
      if (charging || timer) e.preventDefault();
    };

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("blur", onCancel);
    window.addEventListener("contextmenu", onMenu);
    return () => {
      reset();
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("blur", onCancel);
      window.removeEventListener("contextmenu", onMenu);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden data-no-print className="pointer-events-none fixed inset-0 z-[120]">
      <div data-charge className="invisible absolute top-0 left-0 opacity-0">
        <svg
          data-charge-svg
          viewBox="-60 -60 120 120"
          className="absolute -top-20 -left-20 size-40 overflow-visible text-aura [filter:drop-shadow(0_0_6px_var(--aura))]"
        >
          <circle data-core r="22" fill="url(#cast-core)" />
          <defs>
            <radialGradient id="cast-core">
              <stop offset="0" stopColor="var(--washi)" stopOpacity="0.9" />
              <stop offset="0.4" stopColor="var(--kiln)" stopOpacity="0.6" />
              <stop offset="1" stopColor="var(--agni)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle data-ring r="54" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle
            data-ring
            r="32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          <g data-spin>
            <circle data-ring r="48" fill="none" stroke="currentColor" strokeWidth="0.8" />
            {RUNES.map((r, i) => (
              <path
                key={i}
                data-glyph
                d={r.d}
                transform={`translate(${r.x} ${r.y}) rotate(${r.rot}) scale(0.42) translate(-12 -12)`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            ))}
          </g>
          <polygon data-star points={STAR} fill="none" stroke="var(--kiln)" strokeWidth="1.2" />
        </svg>
      </div>

      <div data-burst className="invisible absolute top-0 left-0 opacity-0">
        <svg
          viewBox="-150 -150 300 300"
          className="absolute -top-[150px] -left-[150px] size-[300px] overflow-visible"
        >
          <circle data-fire-core r="40" fill="url(#cast-core)" />
          <circle data-fire-ring r="40" fill="none" stroke="var(--kiln)" strokeWidth="5" />
          {RAYS.map((pts, i) => (
            <polyline
              key={i}
              data-ray
              points={pts}
              fill="none"
              stroke={i % 2 ? "var(--agni)" : "var(--sumi)"}
              strokeWidth={i % 2 ? 4 : 6}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0"
            />
          ))}
        </svg>
      </div>

      <span
        data-spell-name
        className="absolute top-0 left-0 sfx text-36 whitespace-nowrap text-kiln opacity-0 [text-shadow:0_0_14px_var(--agni)] md:text-56"
      />
    </div>
  );
}
