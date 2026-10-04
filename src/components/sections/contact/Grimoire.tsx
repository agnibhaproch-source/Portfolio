"use client";

import { useEffect, useRef } from "react";
import { FlameMark } from "@/components/ui/FlameMark";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const C = 100;
const ARCS = 3;

/** One third of the summoning ring, as an SVG arc path. */
function arc(i: number) {
  const r = 86;
  const gap = 0.12;
  const a0 = (i / ARCS) * Math.PI * 2 + gap - Math.PI / 2;
  const a1 = ((i + 1) / ARCS) * Math.PI * 2 - gap - Math.PI / 2;
  const p = (a: number) =>
    `${(C + Math.cos(a) * r).toFixed(1)} ${(C + Math.sin(a) * r).toFixed(1)}`;
  return `M${p(a0)} A${r} ${r} 0 0 1 ${p(a1)}`;
}

const RUNES = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2;
  return { x: C + Math.cos(a) * 72, y: C + Math.sin(a) * 72, k: i % 3 };
});

/**
 * An original grimoire floating over a summoning circle. It opens while the
 * form is in use, flips a page as the visitor types, and the circle's three
 * arcs light up as fields become valid. `cast` flares it on send.
 */
export function Grimoire({
  open,
  charge,
  turn,
  cast,
  className,
}: {
  open: boolean;
  /** 0 to 3: valid fields. */
  charge: number;
  /** Increments to flip one page. */
  turn: number;
  /** Increments to play the cast flare. */
  cast: number;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = prefersReducedMotion();
  }, []);

  // Cover opens and closes.
  useEffect(() => {
    const cover = root.current?.querySelector("[data-cover]");
    if (!cover) return;
    gsap.to(cover, {
      rotationY: open ? -158 : 0,
      duration: reduced.current ? 0 : 0.7,
      ease: open ? "snap" : "power2.inOut",
    });
  }, [open]);

  // A page flips with typing.
  useEffect(() => {
    if (!turn || reduced.current) return;
    const page = root.current?.querySelector("[data-flip]");
    if (!page) return;
    gsap.fromTo(
      page,
      { rotationY: 0, opacity: 1 },
      {
        rotationY: -165,
        duration: 0.45,
        ease: "power2.inOut",
        onComplete: () => void gsap.set(page, { rotationY: 0, opacity: 0 }),
      },
    );
  }, [turn]);

  // Cast: the book flares and the ring pulses.
  useEffect(() => {
    if (!cast || reduced.current) return;
    const q = gsap.utils.selector(root);
    gsap
      .timeline()
      .fromTo(
        q("[data-glow]"),
        { opacity: 0.3, scale: 0.8 },
        { opacity: 1, scale: 1.4, duration: 0.25, ease: "power2.out" },
      )
      .to(q("[data-glow]"), { opacity: 0.35, scale: 1, duration: 0.8 })
      .fromTo(
        q("[data-book]"),
        { y: 0 },
        { y: -18, duration: 0.15, ease: "power2.out", yoyo: true, repeat: 1 },
        0,
      )
      .fromTo(
        q("[data-ring-pulse]"),
        { scale: 0.7, opacity: 1 },
        { scale: 1.5, opacity: 0, duration: 0.7, ease: "power2.out" },
        0,
      );
  }, [cast]);

  return (
    <div ref={root} aria-hidden className={cn("relative grid place-items-center", className)}>
      {/* Summoning circle, laid flat under the book */}
      <div className="absolute inset-x-0 bottom-0 [perspective:700px]">
        <svg
          viewBox="0 0 200 200"
          className={cn(
            "mx-auto w-full max-w-[22rem] [transform:rotateX(68deg)] transition-[filter] duration-500",
            charge >= ARCS && "[filter:drop-shadow(0_0_12px_var(--aura))]",
          )}
        >
          <g className="origin-center animate-[rune-spin_24s_linear_infinite] [transform-box:fill-box]">
            <circle
              cx={C}
              cy={C}
              r="96"
              fill="none"
              stroke="var(--aura)"
              strokeOpacity="0.35"
              strokeWidth="1.2"
            />
            <circle
              cx={C}
              cy={C}
              r="60"
              fill="none"
              stroke="var(--aura)"
              strokeOpacity="0.25"
              strokeDasharray="4 6"
            />
            {RUNES.map((r, i) => (
              <g key={i} stroke="var(--aura)" strokeOpacity="0.5" fill="none" strokeWidth="1.2">
                {r.k === 0 && (
                  <path d={`M${r.x - 3} ${r.y + 3} L${r.x} ${r.y - 3} L${r.x + 3} ${r.y + 3}`} />
                )}
                {r.k === 1 && <circle cx={r.x} cy={r.y} r="2.2" />}
                {r.k === 2 && (
                  <path
                    d={`M${r.x - 3} ${r.y} L${r.x + 3} ${r.y} M${r.x} ${r.y - 3} L${r.x} ${r.y + 3}`}
                  />
                )}
              </g>
            ))}
          </g>
          {Array.from({ length: ARCS }, (_, i) => (
            <path
              key={i}
              d={arc(i)}
              fill="none"
              stroke="var(--aura)"
              strokeWidth="4"
              strokeLinecap="round"
              className="transition-[stroke-opacity] duration-500"
              strokeOpacity={i < charge ? 1 : 0.12}
            />
          ))}
          <circle
            data-ring-pulse
            cx={C}
            cy={C}
            r="86"
            fill="none"
            stroke="var(--aura)"
            strokeWidth="2"
            opacity="0"
            className="origin-center [transform-box:fill-box]"
          />
        </svg>
      </div>

      {/* The book */}
      <div
        data-book
        className="relative mb-[18%] animate-[grimoire-float_4s_ease-in-out_infinite] [perspective:900px]"
      >
        <div
          data-glow
          className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgb(201_162_74/0.45),transparent_65%)] opacity-35"
        />
        <div className="relative h-44 w-32 [transform:rotateX(14deg)_rotateY(-14deg)] [transform-style:preserve-3d] md:h-52 md:w-40">
          {/* back cover and page block */}
          <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 border-[3px] border-washi/60 bg-twilight" />
          <div className="absolute inset-1 border-2 border-washi/40 bg-washi/90">
            <div className="absolute inset-3 space-y-2">
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  className="h-[2px] bg-sumi/25"
                  style={{ width: `${60 + ((i * 37) % 40)}%` }}
                />
              ))}
            </div>
          </div>
          {/* page that flips while typing */}
          <div
            data-flip
            className="absolute inset-1 origin-left border-2 border-washi/40 bg-washi opacity-0 [backface-visibility:hidden]"
          />
          {/* front cover */}
          <div
            data-cover
            className="absolute inset-0 origin-left border-[3px] border-washi bg-[linear-gradient(160deg,var(--twilight),var(--sumi))] [backface-visibility:hidden]"
          >
            <div className="absolute inset-2 border border-aura/60" />
            <div className="absolute inset-y-0 left-0 w-3 border-r-2 border-washi/60 hatch opacity-60" />
            <div className="absolute inset-0 grid place-items-center">
              <span className="grid size-16 place-items-center rounded-full border-2 border-aura">
                <FlameMark className="h-9 w-auto animate-[flame-flicker_1.6s_ease-in-out_infinite]" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
