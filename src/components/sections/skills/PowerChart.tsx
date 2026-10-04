"use client";

import { useRef } from "react";
import { skillsCopy, topSkills } from "@/content";
import { gsap } from "@/lib/gsap";
import { triggerFor } from "@/lib/motion";
import { useMotion } from "@/lib/use-motion";

/*
 * Radar "power level" of the top six skills. Rings draw, the gold shape grows
 * from the centre while values count up, an aura pulse rings out, then a
 * jagged black-and-crimson anti-magic outline flickers on twos while on
 * screen. A black band keeps gold and crimson from touching.
 */

const C = 200;
const R = 150;
const MAX = 10;
const N = topSkills.length;

const angle = (i: number) => (i / N) * Math.PI * 2 - Math.PI / 2;
const at = (i: number, r: number) =>
  [C + r * Math.cos(angle(i)), C + r * Math.sin(angle(i))] as const;
const pts = (radii: number[]) =>
  radii
    .map((r, i) =>
      at(i, r)
        .map((v) => v.toFixed(1))
        .join(","),
    )
    .join(" ");

const FINAL = topSkills.map((s) => (s.rating / MAX) * R);
const RINGS = [2, 4, 6, 8, 10].map((v) => pts(Array(N).fill((v / MAX) * R)));

function seeded(seed: number) {
  let s = (seed * 2654435761) % 2147483647 || 1;
  const next = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 5; i++) next();
  return next;
}

/** Jagged outline around the final shape: each edge split, pushed outward. */
function jag(seed: number, offset: number) {
  const rand = seeded(seed);
  const out: string[] = [];
  for (let i = 0; i < N; i++) {
    const [x0, y0] = at(i, FINAL[i]!);
    const [x1, y1] = at((i + 1) % N, FINAL[(i + 1) % N]!);
    for (let k = 0; k < 7; k++) {
      const t = k / 7;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      const dx = x - C;
      const dy = y - C;
      const len = Math.hypot(dx, dy) || 1;
      const push = offset + (k % 2 ? rand() * 30 + 10 : rand() * 6);
      out.push(`${(x + (dx / len) * push).toFixed(1)},${(y + (dy / len) * push).toFixed(1)}`);
    }
  }
  return out.join(" ");
}

const AURA = [1, 2, 3].map((seed) => ({ black: jag(seed, 12), red: jag(seed + 10, 16) }));

function anchor(i: number) {
  const c = Math.cos(angle(i));
  return Math.abs(c) < 0.2 ? "middle" : c > 0 ? "start" : "end";
}

export function PowerChart({ highlight = [] }: { highlight?: string[] }) {
  const lit = (name: string) => highlight.includes(name);
  const dimOthers = highlight.length > 0;
  const ref = useRef<HTMLElement>(null);

  useMotion((ctx, el) => {
    const q = gsap.utils.selector(el);
    const shape = q("[data-shape]")[0] as SVGPolygonElement | undefined;
    const values = q("[data-value]");
    const variants = q("[data-aura]");
    if (!shape) return;

    if (ctx.reduced) {
      gsap.set(variants.slice(1), { autoAlpha: 0 });
      return;
    }

    // One progress value drives the shape (staggered per vertex) and the counts.
    const grow = { p: 0 };
    const ease = gsap.parseEase("ink");
    const paint = () => {
      const radii = FINAL.map((r, i) => r * ease(gsap.utils.clamp(0, 1, grow.p * 1.3 - i * 0.06)));
      shape.setAttribute("points", pts(radii));
      values.forEach((v, i) => {
        const target = topSkills[i]?.rating ?? 0;
        v.textContent = String(Math.round(target * gsap.utils.clamp(0, 1, grow.p)));
      });
    };

    gsap.set(variants, { autoAlpha: 0 });
    gsap.set(q("[data-pulse]"), { autoAlpha: 0 });

    // Flicker on twos (12fps) between three jagged variants, only while on screen.
    const flicker = gsap.timeline({ repeat: -1, paused: true });
    variants.forEach((v, i) => {
      flicker.set(variants, { autoAlpha: 0 }, i / 12).set(v, { autoAlpha: 1 }, i / 12);
    });
    flicker.set({}, {}, variants.length / 12);
    let armed = false;
    const onScreen = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive && armed ? flicker.play() : flicker.pause()),
      },
    });

    gsap
      .timeline({ scrollTrigger: triggerFor(el, "scroll", "top 75%") })
      .from(q("[data-ring]"), { drawSVG: "50% 50%", duration: 0.6, stagger: 0.06, ease: "ink" })
      .from(q("[data-axis]"), { drawSVG: "0%", duration: 0.4, stagger: 0.04 }, 0.15)
      .from(q("[data-label]"), { opacity: 0, y: 6, duration: 0.3, stagger: 0.05 }, 0.3)
      .fromTo(
        grow,
        { p: 0 },
        { p: 1, duration: 1.3, ease: "none", onStart: paint, onUpdate: paint },
        0.55,
      )
      .fromTo(q("[data-fill]"), { fillOpacity: 0 }, { fillOpacity: 1, duration: 0.5 }, 1.2)
      .fromTo(
        q("[data-pulse]"),
        { autoAlpha: 0.9, scale: 0.6 },
        {
          autoAlpha: 0,
          scale: 1.25,
          duration: 0.9,
          stagger: 0.18,
          ease: "power2.out",
          svgOrigin: `${C} ${C}`,
        },
        1.75,
      )
      .call(
        () => {
          armed = true;
          flicker.play();
        },
        [],
        1.95,
      );

    return () => {
      flicker.kill();
      onScreen.kill();
    };
  }, ref);

  return (
    <figure ref={ref} className="mx-auto w-full max-w-[34rem]">
      <svg
        aria-hidden
        viewBox="-80 -30 560 460"
        className="w-full overflow-visible font-display"
        fill="none"
      >
        {RINGS.map((p, i) => (
          <polygon
            key={i}
            data-ring
            points={p}
            stroke="var(--tone)"
            strokeOpacity={i === 4 ? 0.8 : 0.35}
          />
        ))}
        {topSkills.map((_, i) => {
          const [x, y] = at(i, R);
          return (
            <line
              key={i}
              data-axis
              x1={C}
              y1={C}
              x2={x}
              y2={y}
              stroke="var(--tone)"
              strokeOpacity="0.35"
            />
          );
        })}

        {AURA.map((v, i) => (
          <g
            key={i}
            data-aura
            strokeLinejoin="miter"
            className="[filter:drop-shadow(0_0_5px_var(--agni))]"
          >
            <polygon points={v.black} stroke="var(--sumi)" strokeWidth="11" />
            <polygon points={v.red} stroke="var(--agni)" strokeWidth="3" />
          </g>
        ))}

        <polygon
          data-fill
          data-shape
          points={pts(FINAL)}
          fill="rgb(201 162 74 / 0.18)"
          stroke="var(--aura)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {[0, 1].map((i) => (
          <polygon key={i} data-pulse points={pts(FINAL)} stroke="var(--aura)" strokeWidth="2" />
        ))}

        {/* Spell-cast highlight: a lit spoke out to each highlighted value */}
        {topSkills.map((s, i) => {
          const [x, y] = at(i, FINAL[i]!);
          return (
            <g
              key={`lit-${s.name}`}
              aria-hidden
              className="transition-opacity duration-300"
              opacity={lit(s.name) ? 1 : 0}
            >
              <line
                x1={C}
                y1={C}
                x2={x}
                y2={y}
                stroke="var(--aura)"
                strokeWidth="3"
                className="[filter:drop-shadow(0_0_6px_var(--aura))]"
              />
              <circle cx={x} cy={y} r="5" fill="var(--aura)" />
            </g>
          );
        })}

        {topSkills.map((s, i) => {
          const [x, y] = at(i, R + 26);
          return (
            <text
              key={s.name}
              data-label
              x={x}
              y={y}
              textAnchor={anchor(i)}
              dominantBaseline="middle"
              fill={lit(s.name) ? "var(--aura)" : "var(--washi)"}
              fillOpacity={dimOthers && !lit(s.name) ? 0.4 : 1}
              className="text-[15px] transition-[fill-opacity] duration-300 max-sm:text-[20px]"
            >
              {s.name}{" "}
              <tspan data-value fill="var(--aura)">
                {s.rating}
              </tspan>
            </text>
          );
        })}
      </svg>

      <figcaption className="mt-2 text-center text-14 text-muted">
        {skillsCopy.chartCaption}
      </figcaption>

      <table className="sr-only">
        <caption>{skillsCopy.chartCaption}</caption>
        <tbody>
          {topSkills.map((s) => (
            <tr key={s.name}>
              <th scope="row">{s.name}</th>
              <td>
                {s.rating} {skillsCopy.outOf}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
