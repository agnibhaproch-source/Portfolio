"use client";

import { useRef } from "react";
import { skillsCopy, topSkills } from "@/content";
import { gsap } from "@/lib/gsap";
import { haptic } from "@/lib/haptics";
import { prefersReducedMotion } from "@/lib/motion";
import { sound } from "@/lib/sound";

/**
 * A wooden training dummy (original drawing). Pick a skill and a slash cuts
 * across it, the dummy rocks on its post and the damage pops up: the skill's
 * real rating. Purely playful.
 */
export function TrainingDummy() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useRef<HTMLParagraphElement>(null);

  const strike = (name: string, rating: number, i: number) => {
    const el = ref.current;
    if (!el) return;
    if (live.current) live.current.textContent = `${name}: ${rating}`;
    sound.play("slash");
    haptic("impact");
    if (prefersReducedMotion()) return;
    const q = gsap.utils.selector(el);
    const angle = i % 2 ? 1 : -1;
    const slash = q("[data-slash]")[0];
    slash?.setAttribute("transform", `rotate(${angle * (20 + (i % 3) * 15)} 100 120)`);
    gsap.fromTo(
      slash ?? {},
      { drawSVG: "0% 0%", opacity: 1 },
      {
        keyframes: [
          { drawSVG: "0% 100%", duration: 0.1, ease: "power2.in" },
          { drawSVG: "100% 100%", opacity: 0, duration: 0.25 },
        ],
      },
    );
    gsap.fromTo(
      q("[data-dummy]"),
      { rotation: 0 },
      {
        keyframes: { rotation: [angle * 14, -angle * 9, angle * 5, -angle * 2, 0] },
        duration: 0.9,
        ease: "none",
        svgOrigin: "100 230",
      },
    );
    const num = q("[data-dmg]")[0] as HTMLElement | undefined;
    if (num) {
      num.textContent = `${rating}!`;
      gsap
        .timeline()
        .fromTo(
          num,
          { y: 0, scale: 2, opacity: 0, rotation: angle * -12 },
          { scale: 1, opacity: 1, duration: 0.15, ease: "steps(3)" },
        )
        .to(num, { y: -50, opacity: 0, duration: 0.7, ease: "power1.in" }, 0.35);
    }
  };

  return (
    <div ref={ref}>
      <header className="mb-4">
        <h3 className="text-24 md:text-36">{skillsCopy.dummy.title}</h3>
        <p className="text-14 text-muted">{skillsCopy.dummy.hint}</p>
      </header>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="relative">
          <svg
            viewBox="0 0 200 260"
            className="mx-auto h-56 w-auto overflow-visible md:h-64"
            aria-hidden
          >
            <rect
              x="94"
              y="200"
              width="12"
              height="52"
              fill="#5a3a22"
              stroke="var(--sumi)"
              strokeWidth="2"
            />
            <ellipse cx="100" cy="252" rx="46" ry="7" fill="rgb(0 0 0 / 0.35)" />
            <g data-dummy>
              <rect
                x="92"
                y="60"
                width="16"
                height="150"
                fill="#7a5230"
                stroke="var(--sumi)"
                strokeWidth="2"
              />
              <rect
                x="34"
                y="104"
                width="132"
                height="14"
                rx="3"
                fill="#7a5230"
                stroke="var(--sumi)"
                strokeWidth="2"
              />
              <path
                d="M70 98 L130 98 L136 188 L64 188 Z"
                fill="#c8a77a"
                stroke="var(--sumi)"
                strokeWidth="3"
              />
              <path
                d="M70 120 L130 124 M66 150 L134 146 M68 172 L132 176"
                stroke="#8a6a44"
                strokeWidth="3"
              />
              <circle cx="100" cy="62" r="28" fill="#c8a77a" stroke="var(--sumi)" strokeWidth="3" />
              <path
                d="M84 56 L94 64 M94 56 L84 64 M106 56 L116 64 M116 56 L106 64"
                stroke="var(--sumi)"
                strokeWidth="3"
              />
              <path d="M74 40 Q100 24 126 40" fill="none" stroke="#8a6a44" strokeWidth="4" />
            </g>
            <line
              data-slash
              x1="20"
              y1="120"
              x2="180"
              y2="120"
              stroke="var(--washi)"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0"
              className="[filter:drop-shadow(0_0_6px_var(--kiln))]"
            />
          </svg>
          <span
            data-dmg
            aria-hidden
            className="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 sfx text-56 text-kiln opacity-0 [text-shadow:0_0_14px_var(--agni)]"
          />
        </div>
        <ul className="grid gap-2">
          {topSkills.map((s, i) => (
            <li key={s.name}>
              <button
                type="button"
                data-no-cast
                aria-label={skillsCopy.dummy.strike(s.name, s.rating)}
                onClick={() => strike(s.name, s.rating, i)}
                className="w-full border-2 border-washi/50 px-3 py-1 text-left text-14 transition-colors hover:border-kiln hover:text-kiln focus-visible:border-kiln md:text-18"
              >
                {s.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p ref={live} aria-live="polite" className="sr-only" />
    </div>
  );
}
