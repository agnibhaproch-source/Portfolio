"use client";

import { useRef, useState } from "react";
import { allSkills, projectSkillLinks, skillsCopy } from "@/content";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";

/*
 * A star map: every skill is a small star, every project a big one, and a
 * line joins a skill to each project whose stack uses it. Lines draw in on
 * scroll; hovering (or tapping) a star lights its paths and dims the rest.
 * The same facts are in a screen-reader table.
 */

function seeded(seed: number) {
  let s = (seed * 2654435761) % 2147483647 || 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

const LINKS = projectSkillLinks();
const PROJECT_POS: [number, number][] = [
  [820, 100],
  [880, 300],
  [640, 380],
  [650, 70],
  [720, 230],
];
const projects = LINKS.map((p, i) => {
  const [x, y] = PROJECT_POS[i % PROJECT_POS.length]!;
  return { ...p, x, y };
});

// Skills on a jittered grid over the left of the map.
const COLS = 5;
const rand = seeded(23);
const skills = allSkills.map((name, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return {
    name,
    x: 60 + col * 105 + (rand() - 0.5) * 50,
    y: 60 + row * 92 + (rand() - 0.5) * 40,
    used: projects.some((p) => p.skills.includes(name)),
  };
});
const EDGES = projects.flatMap((p) =>
  p.skills.map((s) => ({
    skill: s,
    project: p.name,
    from: skills.find((k) => k.name === s)!,
    to: p,
  })),
);

const star = (r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? r * 0.38 : r;
    pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`);
  }
  return pts.join(" ");
};

export function Constellation() {
  const ref = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const on = (name: string) => setFocus(name);
  const off = () => setFocus(null);
  const edgeLit = (e: (typeof EDGES)[number]) => !focus || e.skill === focus || e.project === focus;
  const nodeLit = (name: string) =>
    !focus ||
    name === focus ||
    EDGES.some(
      (e) => (e.skill === focus && e.project === name) || (e.project === focus && e.skill === name),
    );

  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const q = gsap.utils.selector(el);
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: "top 75%", once: true } })
      .from(q("[data-star]"), { opacity: 0, duration: 0.25, stagger: 0.03, ease: "steps(3)" })
      .from(
        q("[data-link]"),
        { drawSVG: "0%", duration: 0.5, stagger: 0.02, ease: "power1.inOut" },
        0.4,
      );
  }, ref);

  return (
    <div ref={ref}>
      <header className="mb-4">
        <h3 className="text-24 md:text-36">{skillsCopy.constellation.title}</h3>
        <p className="text-14 text-muted">{skillsCopy.constellation.sub}</p>
      </header>
      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <svg
          aria-hidden
          viewBox="0 0 960 440"
          className="w-full min-w-[640px] overflow-visible"
          onPointerLeave={off}
        >
          {EDGES.map((e, i) => (
            <line
              key={i}
              data-link
              x1={e.from.x}
              y1={e.from.y}
              x2={e.to.x}
              y2={e.to.y}
              stroke={edgeLit(e) && focus ? "var(--kiln)" : "var(--aura)"}
              strokeOpacity={edgeLit(e) ? (focus ? 0.95 : 0.35) : 0.06}
              strokeWidth={edgeLit(e) && focus ? 2.5 : 1.2}
              className="transition-[stroke-opacity,stroke-width] duration-200"
            />
          ))}
          {skills.map((s, i) => (
            <g
              key={s.name}
              transform={`translate(${s.x} ${s.y})`}
              onPointerEnter={() => on(s.name)}
              onClick={() => on(s.name)}
              className={cn(
                "cursor-pointer transition-opacity duration-200",
                nodeLit(s.name) ? "opacity-100" : "opacity-25",
              )}
            >
              <g data-star>
                <polygon
                  points={star(s.used ? 11 : 8)}
                  fill={s.used ? "var(--washi)" : "var(--tone-light)"}
                  className="animate-[star-twinkle_3s_ease-in-out_infinite] motion-reduce:animate-none"
                  style={{ animationDelay: `${-(i % 7) * 0.4}s` }}
                />
              </g>
              <text y="28" textAnchor="middle" fill="var(--washi)" className="text-[16px]">
                {s.name}
              </text>
            </g>
          ))}
          {projects.map((p) => (
            <g
              key={p.name}
              transform={`translate(${p.x} ${p.y})`}
              onPointerEnter={() => on(p.name)}
              onClick={() => on(p.name)}
              className={cn(
                "cursor-pointer transition-opacity duration-200",
                nodeLit(p.name) ? "opacity-100" : "opacity-25",
              )}
            >
              <g data-star>
                <circle r="30" fill="rgb(201 162 74 / 0.12)" />
                <polygon
                  points={star(22)}
                  fill="var(--aura)"
                  className="[filter:drop-shadow(0_0_8px_var(--aura))]"
                />
              </g>
              <text
                y="48"
                textAnchor="middle"
                fill="var(--aura)"
                className="font-display text-[20px]"
              >
                {p.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <table className="sr-only">
        <caption>{skillsCopy.constellation.tableCaption}</caption>
        <tbody>
          {LINKS.map((p) => (
            <tr key={p.name}>
              <th scope="row">{p.name}</th>
              <td>{p.skills.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
