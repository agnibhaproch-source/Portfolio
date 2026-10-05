"use client";

import { useRef, useState } from "react";
import { statsCopy } from "@/content";
import { useCalm } from "@/lib/calm";
import { gsap } from "@/lib/gsap";
import type { GithubStats } from "@/lib/stats";
import { useMotion } from "@/lib/use-motion";

/*
 * A year of contributions. Flat: screentone dots (busier days, bigger ink),
 * filled by the stats timeline as an ink wave (data-dot, data-col). Hover or
 * tap a day for its date and activity level. Scrolling on tilts it into an
 * isometric skyline where every active day rises into a column by level
 * (scrubbed, so scrolling back flattens it again).
 */

const CELL = 10;
// Oblique skyline: weeks run left to right (u), weekdays recede down-right (v).
const ISO = { u: 5, vx: 2.4, vy: 2.6, h: 7 };

const dateLabel = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

export function Heatmap({ gh }: { gh: GithubStats }) {
  const ref = useRef<HTMLDivElement>(null);
  const calm = useCalm();
  const [tip, setTip] = useState<{ i: number; x: number; y: number } | null>(null);
  const cols = Math.ceil(gh.days.length / 7);

  // Oblique layout, drawn back row first so nearer columns paint over farther ones.
  const iso = gh.days
    .map((d, i) => {
      const col = Math.floor(i / 7);
      const row = i % 7;
      return { ...d, i, row, X: col * ISO.u + row * ISO.vx, Y: row * ISO.vy };
    })
    .sort((p, q) => p.row - q.row || p.X - q.X);
  const width = cols * ISO.u + 7 * ISO.vx + 4;
  const height = 7 * ISO.vy + ISO.h * 4 + 6;
  const base = `0,0 ${cols * ISO.u},0 ${cols * ISO.u + 7 * ISO.vx},${7 * ISO.vy} ${7 * ISO.vx},${7 * ISO.vy}`;

  const prism = (X: number, Y: number, h: number) => {
    const { u, vx, vy } = ISO;
    return {
      top: `${X},${Y - h} ${X + u},${Y - h} ${X + u + vx},${Y + vy - h} ${X + vx},${Y + vy - h}`,
      left: `${X + vx},${Y + vy - h} ${X + u + vx},${Y + vy - h} ${X + u + vx},${Y + vy} ${X + vx},${Y + vy}`,
      right: `${X + u},${Y - h} ${X + u + vx},${Y + vy - h} ${X + u + vx},${Y + vy} ${X + u},${Y}`,
    };
  };

  useMotion(
    (ctx, el) => {
      if (ctx.reduced || calm) return;
      const q = gsap.utils.selector(el);
      const flat = q("[data-flat]")[0];
      const sky = q("[data-sky]")[0];
      const groups = q("[data-prism]") as unknown as SVGGElement[];
      const lift = { p: 0 };
      const draw = () => {
        groups.forEach((g, k) => {
          const level = Number(g.dataset.level);
          const X = Number(g.dataset.x);
          const Y = Number(g.dataset.y);
          const t = gsap.utils.clamp(0, 1, lift.p * 1.6 - (k / groups.length) * 0.6);
          const pr = prism(X, Y, level * ISO.h * gsap.parseEase("back.out(2)")(t));
          const [top, left, right] = g.querySelectorAll("polygon");
          top?.setAttribute("points", pr.top);
          left?.setAttribute("points", pr.left);
          right?.setAttribute("points", pr.right);
        });
      };
      gsap.set(sky ?? {}, { autoAlpha: 0 });
      gsap
        .timeline({
          scrollTrigger: { trigger: el, start: "top 35%", end: "top -5%", scrub: 0.5 },
        })
        .to(flat ?? {}, {
          rotationX: 62,
          scaleY: 0.8,
          opacity: 0,
          duration: 0.35,
          transformPerspective: 600,
        })
        .to(sky ?? {}, { autoAlpha: 1, duration: 0.15 }, 0.2)
        .fromTo(lift, { p: 0 }, { p: 1, duration: 0.65, onUpdate: draw }, 0.3);
      draw();
    },
    ref,
    [calm],
  );

  const showTip = (i: number, e: React.PointerEvent) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    setTip({ i, x: e.clientX - box.left, y: e.clientY - box.top });
  };
  const onFlat = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()?.inverse());
    const i = Math.floor(pt.x / CELL) * 7 + Math.floor(pt.y / CELL);
    if (gh.days[i]) showTip(i, e);
  };
  const day = tip ? gh.days[tip.i] : null;

  return (
    <div ref={ref} className="relative py-8" onPointerLeave={() => setTip(null)}>
      <svg
        data-flat
        role="img"
        aria-label={statsCopy.heatmapLabel(gh.total)}
        viewBox={`0 0 ${cols * CELL} ${7 * CELL}`}
        className="w-full origin-bottom"
        onPointerMove={onFlat}
        onPointerDown={onFlat}
      >
        <rect
          data-scan
          x="0"
          y="0"
          width="3"
          height={7 * CELL}
          fill="var(--kiln)"
          opacity="0"
          className="[filter:drop-shadow(0_0_4px_var(--agni))]"
        />
        {gh.days.map((d, i) => (
          <circle
            key={d.date}
            data-dot
            data-col={Math.floor(i / 7)}
            data-level={d.level}
            cx={Math.floor(i / 7) * CELL + CELL / 2}
            cy={(i % 7) * CELL + CELL / 2}
            r={d.level === 0 ? 1 : 1.6 + d.level * 0.8}
            fill={d.level === 0 ? "var(--tone)" : "var(--washi)"}
            fillOpacity={d.level === 0 ? 0.35 : 1}
          />
        ))}
      </svg>

      <svg
        data-sky
        aria-hidden
        viewBox={`-2 ${-ISO.h * 4 - 4} ${width} ${height}`}
        className="invisible absolute inset-0 h-full w-full"
        onPointerLeave={() => setTip(null)}
      >
        <polygon
          points={base}
          fill="rgb(235 220 185 / 0.05)"
          stroke="var(--washi)"
          strokeOpacity="0.3"
        />
        {iso.map((p) => {
          const pr = prism(p.X, p.Y, p.level * ISO.h);
          return p.level === 0 ? null : (
            <g
              key={p.date}
              data-prism
              data-level={p.level}
              data-x={p.X}
              data-y={p.Y}
              onPointerMove={(e) => showTip(p.i, e)}
            >
              <polygon points={pr.left} fill="#5b2c1a" />
              <polygon points={pr.right} fill="#8a3a1e" />
              <polygon points={pr.top} fill={p.level >= 3 ? "var(--kiln)" : "var(--washi)"} />
            </g>
          );
        })}
      </svg>

      {day && tip && (
        <span
          role="status"
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full border-2 border-washi bg-sumi px-2 py-1 text-14 whitespace-nowrap text-washi"
          style={{ left: tip.x, top: tip.y - 10 }}
        >
          <span className="font-display">{dateLabel(day.date)}</span> ·{" "}
          {statsCopy.levels[day.level]}
        </span>
      )}
      <p className="sr-only">{statsCopy.skyline}</p>
    </div>
  );
}
