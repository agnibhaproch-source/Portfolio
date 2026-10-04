"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useAntiMagic } from "@/lib/anti-magic";
import { prefersReducedMotion } from "@/lib/motion";

/*
 * Anti-magic projection: page drains to black and white (backdrop-filter, so
 * crimson drawn above it survives), crimson cracks tear outward from the
 * name, and an original jagged sigil projects behind it. Screen blending
 * keeps the name readable where lines cross it.
 */

const C = 200;
const CRACKS = 14;
const DRAIN = "grayscale(1) contrast(1.3) brightness(0.9)";

function polar(r: number, i: number, n: number) {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  return `${(C + r * Math.cos(a)).toFixed(1)},${(C + r * Math.sin(a)).toFixed(1)}`;
}

const TEETH = Array.from({ length: 48 }, (_, i) =>
  polar(i % 2 ? 172 : i % 6 === 0 ? 206 : 192, i, 48),
).join(" ");
const INNER_TEETH = Array.from({ length: 16 }, (_, i) => polar(i % 2 ? 44 : 56, i, 16)).join(" ");
// {9/4} enneagram
const STAR = Array.from({ length: 10 }, (_, i) => polar(138, (i * 4) % 9, 9)).join(" ");

/** Jagged crack from (x, y) outward until it leaves the screen. */
function crackPath(x: number, y: number, angle: number, w: number, h: number, start = 70) {
  let a = angle;
  let px = x + Math.cos(a) * start;
  let py = y + Math.sin(a) * start;
  let d = `M${px.toFixed(0)} ${py.toFixed(0)}`;
  for (let i = 0; i < 40; i++) {
    a += (Math.random() - 0.5) * 0.9;
    const len = 40 + Math.random() * 90;
    px += Math.cos(a) * len;
    py += Math.sin(a) * len;
    d += ` L${px.toFixed(0)} ${py.toFixed(0)}`;
    if (px < -50 || py < -50 || px > w + 50 || py > h + 50) break;
  }
  return d;
}

export function AntiMagicLayer() {
  const root = useRef<HTMLDivElement>(null);
  const { active, x, y } = useAntiMagic();
  const tl = useRef<gsap.core.Timeline | null>(null);
  const spin = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const sigil = q("[data-am-sigil]")[0] as HTMLElement | undefined;
      const layers = q("[data-am-layer]");

      if (active) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const size = Math.min(w, h) * 0.95;
        if (sigil) {
          gsap.set(sigil, {
            left: x,
            top: y,
            width: size,
            height: size,
            xPercent: -50,
            yPercent: -50,
          });
        }
        el.querySelectorAll<SVGPathElement>("[data-crack]").forEach((p, i) => {
          const angle = (i / CRACKS) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
          p.setAttribute("d", crackPath(x, y, angle, w, h, size * 0.42));
        });

        tl.current?.kill();
        const reduced = prefersReducedMotion();
        const t = gsap.timeline();
        if (reduced) {
          t.fromTo(layers, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
        } else {
          t.set(layers, { autoAlpha: 1 })
            .fromTo(
              q("[data-am-flash]"),
              { opacity: 0 },
              { opacity: 0.35, duration: 0.06, yoyo: true, repeat: 1 },
            )
            .fromTo(
              q("[data-am-drain], [data-am-vignette]"),
              { opacity: 0 },
              { opacity: 1, duration: 0.3, ease: "steps(3)" },
              0,
            )
            .fromTo(
              sigil ?? [],
              { opacity: 0, scale: 1.5 },
              { opacity: 1, scale: 1, duration: 0.4, ease: "snap" },
              0.04,
            )
            .fromTo(
              q("[data-am-sigil] [data-s]"),
              { drawSVG: "0%" },
              { drawSVG: "100%", duration: 0.55, stagger: 0.03, ease: "steps(12)" },
              0.06,
            )
            .fromTo(
              q("[data-crack]"),
              { drawSVG: "0%", opacity: 1 },
              { drawSVG: "100%", duration: 0.45, stagger: 0.015, ease: "steps(8)" },
              0.12,
            );
          spin.current?.kill();
          spin.current = gsap.to(q("[data-am-rot]"), {
            rotation: -360,
            svgOrigin: `${C} ${C}`,
            duration: 40,
            repeat: -1,
            ease: "none",
          });
        }
        tl.current = t;
      } else if (tl.current) {
        const t = tl.current;
        t.eventCallback("onReverseComplete", () => {
          gsap.set(layers, { autoAlpha: 0 });
          spin.current?.kill();
        });
        t.timeScale(2).reverse();
      }
    },
    { scope: root, dependencies: [active, x, y] },
  );

  /*
   * Two separate fixed layers on purpose. A blending element inside the
   * drain's layer makes Chrome isolate it, and the backdrop-filter then sees
   * nothing. So: layer 1 drains the page; layer 2 screens the projection
   * over it as a whole.
   */
  return (
    <div ref={root} aria-hidden className="contents">
      <div data-am-layer className="pointer-events-none invisible fixed inset-0 z-[60] opacity-0">
        <div
          data-am-drain
          className="absolute inset-0"
          style={{ backdropFilter: DRAIN, WebkitBackdropFilter: DRAIN }}
        />
        <div
          data-am-vignette
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgb(0_0_0/0.6))]"
        />
        <div data-am-flash className="absolute inset-0 bg-washi opacity-0" />
      </div>

      <div
        data-am-layer
        className="pointer-events-none invisible fixed inset-0 z-[61] opacity-0 mix-blend-screen"
      >
        <svg className="absolute inset-0 h-full w-full" fill="none">
          {Array.from({ length: CRACKS }, (_, i) => (
            <path
              key={i}
              data-crack
              stroke="var(--agni)"
              strokeWidth={i % 3 === 0 ? 3 : 1.5}
              strokeLinejoin="bevel"
            />
          ))}
        </svg>
        <div
          data-am-sigil
          className="absolute [filter:drop-shadow(0_0_6px_var(--agni))_drop-shadow(0_0_22px_rgb(184_35_47/0.55))] will-change-transform"
        >
          <svg viewBox="0 0 400 400" className="h-full w-full" fill="none" stroke="var(--agni)">
            <g data-am-rot>
              <polygon data-s points={TEETH} strokeWidth="2.5" strokeLinejoin="miter" />
              <circle data-s cx={C} cy={C} r="160" strokeWidth="2" />
              <circle data-s cx={C} cy={C} r="148" strokeWidth="1.2" strokeDasharray="34 10 6 10" />
            </g>
            <polygon data-s points={STAR} strokeWidth="1.6" />
            <circle data-s cx={C} cy={C} r="66" strokeWidth="2" />
            <polygon data-s points={INNER_TEETH} strokeWidth="1.6" />
            <path data-s d="M38 318 L362 86" strokeWidth="3" />
            <path data-s d="M70 70 L338 338" strokeWidth="1.4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
