"use client";

import { useEffect, useRef } from "react";
import { limitBreakCopy } from "@/content";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { sound } from "@/lib/sound";

const CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/** Jagged crack from the left edge across the screen, in a 100x100 box. */
function crack(seed: number) {
  let s = (seed * 2654435761) % 2147483647 || 1;
  const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  let x = 0;
  let y = 10 + r() * 80;
  const pts = [`${x},${y.toFixed(1)}`];
  while (x < 100) {
    x += 4 + r() * 7;
    y += (r() - 0.5) * 14;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}
const CRACKS = Array.from({ length: 7 }, (_, i) => crack(i * 11 + 4));

/**
 * Konami code easter egg: black anti-magic floods the screen, crimson cracks
 * tear across, speed lines fire, a sound-effect word slams in, and the palette
 * shifts to gold for three seconds. Calm fade under reduced motion.
 */
export function LimitBreak() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.info(`%c${limitBreakCopy.consoleHint}`, "color:#e2622b;font-weight:bold");
    let pos = 0;
    let busy = false;
    const fire = () => {
      const el = ref.current;
      if (!el || busy) return;
      busy = true;
      const html = document.documentElement;
      const q = gsap.utils.selector(el);
      sound.play("impact");
      html.setAttribute("data-limit", "");
      const done = () => {
        html.removeAttribute("data-limit");
        gsap.set(el, { autoAlpha: 0 });
        busy = false;
      };
      if (prefersReducedMotion()) {
        gsap
          .timeline({ onComplete: done })
          .to(el, { autoAlpha: 1, duration: 0.2 })
          .to(el, { autoAlpha: 0, duration: 0.3 }, "+=2.5");
        return;
      }
      gsap
        .timeline({ onComplete: done })
        .set(el, { autoAlpha: 1 })
        .fromTo(
          q("[data-lb-flood]"),
          { clipPath: "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.35, ease: "snap" },
        )
        .fromTo(q("[data-lb-flash]"), { opacity: 0.5 }, { opacity: 0, duration: 0.4 }, 0.3)
        .fromTo(
          q("[data-lb-crack]"),
          { drawSVG: "0%" },
          { drawSVG: "100%", duration: 0.35, stagger: 0.04, ease: "steps(8)" },
          0.3,
        )
        .fromTo(
          q("[data-lb-word]"),
          { scale: 2.6, rotation: -20, opacity: 0 },
          { scale: 1, rotation: -8, opacity: 1, duration: 0.3, ease: "steps(3)" },
          0.45,
        )
        .to(q("[data-lb-word]"), { scale: 1.08, duration: 2 }, ">")
        .to(el, { autoAlpha: 0, duration: 0.4 }, 2.8);
    };
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = key === CODE[pos] ? pos + 1 : key === CODE[0] ? 1 : 0;
      if (pos === CODE.length) {
        pos = 0;
        fire();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      data-limit-layer
      className="pointer-events-none invisible fixed inset-0 z-[170] opacity-0"
    >
      <div
        data-lb-flood
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgb(0_0_0/0.75),rgb(0_0_0/0.92))]"
      />
      <div className="absolute inset-0 text-washi/35">
        <SpeedLines variant="radial" intensity={0.9} />
      </div>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {CRACKS.map((pts, i) => (
          <polyline
            key={i}
            data-lb-crack
            points={pts}
            fill="none"
            stroke="var(--agni)"
            strokeWidth={i % 2 ? 2 : 3.5}
            vectorEffect="non-scaling-stroke"
            className="[filter:drop-shadow(0_0_6px_var(--agni))]"
          />
        ))}
      </svg>
      <p
        data-lb-word
        className="absolute inset-0 m-auto grid h-fit sfx place-items-center text-center text-[clamp(3rem,12vw,10rem)] text-aura [text-shadow:0_0_30px_var(--aura)]"
      >
        {limitBreakCopy.word}
      </p>
      <div data-lb-flash className="absolute inset-0 bg-washi opacity-0" />
    </div>
  );
}
