"use client";

import { useRef } from "react";
import { learning, skillGroups, skillsCopy } from "@/content";
import { GLYPHS } from "@/components/ui/Rune";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";

/*
 * The skill groups as a game skill tree. Languages is the root; it branches
 * to frontend and backend, which lead on to mobile and tools; the skill
 * being learned hangs off the end as a node still in training. Edges draw
 * and nodes unlock (scrubbed) as you scroll. Horizontal on wide screens,
 * vertical on phones.
 */

type Node = { name: string; count: number; x: number; y: number; training?: boolean };

const byName = (n: string) => skillGroups.find((g) => g.name === n);
const pick = (n: string, x: number, y: number): Node | null => {
  const g = byName(n);
  return g ? { name: g.name, count: g.items.length, x, y } : null;
};

const H = [
  pick("Languages", 110, 180),
  pick("Frontend", 370, 90),
  pick("Backend and databases", 370, 270),
  pick("Mobile", 630, 90),
  pick("Tools and cloud", 630, 270),
];
const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
];

function Tree({ vertical }: { vertical: boolean }) {
  const pos = (x: number, y: number) => (vertical ? { x: y, y: x } : { x, y });
  const nodes = H.map((n) => (n ? { ...n, ...pos(n.x, n.y) } : null));
  const train = learning ? { name: learning, count: 0, ...pos(890, 90), training: true } : null;
  const edges = EDGES.filter(([a, b]) => nodes[a] && nodes[b]).map(
    ([a, b]) => [nodes[a]!, nodes[b]!] as const,
  );
  if (train && nodes[3]) edges.push([nodes[3], train]);
  const all = [...nodes.filter((n): n is Node => !!n), ...(train ? [train] : [])];
  const vb = vertical ? "0 0 360 1000" : "0 0 1000 360";
  const path = (a: Node, b: Node) =>
    vertical
      ? `M${a.x} ${a.y} C${a.x} ${(a.y + b.y) / 2}, ${b.x} ${(a.y + b.y) / 2}, ${b.x} ${b.y}`
      : `M${a.x} ${a.y} C${(a.x + b.x) / 2} ${a.y}, ${(a.x + b.x) / 2} ${b.y}, ${b.x} ${b.y}`;

  return (
    <svg viewBox={vb} className="w-full overflow-visible" aria-hidden>
      {edges.map(([a, b], i) => (
        <g key={i}>
          <path
            d={path(a, b)}
            fill="none"
            stroke="var(--washi)"
            strokeOpacity="0.15"
            strokeWidth="6"
          />
          <path
            data-edge
            d={path(a, b)}
            fill="none"
            stroke={b.training ? "var(--kiln)" : "var(--aura)"}
            strokeWidth="3"
            strokeDasharray={b.training ? "8 8" : undefined}
            className="[filter:drop-shadow(0_0_6px_var(--aura))]"
          />
        </g>
      ))}
      {all.map((n, i) => (
        <g key={n.name} data-node transform={`translate(${n.x} ${n.y})`}>
          <g className={n.training ? "animate-pulse" : undefined}>
            <circle
              data-node-ring
              r="52"
              fill="none"
              stroke="var(--aura)"
              strokeWidth="2"
              opacity="0"
            />
            <polygon
              points="0,-42 36,-21 36,21 0,42 -36,21 -36,-21"
              fill={n.training ? "rgb(226 98 43 / 0.15)" : "rgb(201 162 74 / 0.12)"}
              stroke={n.training ? "var(--kiln)" : "var(--aura)"}
              strokeWidth="3"
              strokeDasharray={n.training ? "6 5" : undefined}
            />
            <path
              d={GLYPHS[i % GLYPHS.length]}
              transform="translate(-16 -16) scale(1.33)"
              fill="none"
              stroke={n.training ? "var(--kiln)" : "var(--washi)"}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
          <text y="66" textAnchor="middle" fill="var(--washi)" className="font-display text-[17px]">
            {n.name}
          </text>
          <text
            y="88"
            textAnchor="middle"
            fill={n.training ? "var(--kiln)" : "var(--tone-light)"}
            className="text-[14px]"
          >
            {n.training ? skillsCopy.inTraining : `${n.count} skills`}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function SkillTree() {
  const ref = useRef<HTMLDivElement>(null);
  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const q = gsap.utils.selector(el);
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: "top 80%", end: "center 45%", scrub: 0.5 },
    });
    // Per layout (only one is displayed), unlock in tree order.
    q("svg").forEach((svg) => {
      const s = gsap.utils.selector(svg);
      const nodes = s("[data-node]");
      const edges = s("[data-edge]");
      tl.fromTo(
        nodes,
        { opacity: 0.25, scale: 0.8 },
        { opacity: 1, scale: 1, stagger: 0.18, duration: 0.25, transformOrigin: "50% 50%" },
        0,
      )
        .fromTo(edges, { drawSVG: "0%" }, { drawSVG: "100%", stagger: 0.18, duration: 0.3 }, 0.1)
        .fromTo(
          s("[data-node-ring]"),
          { opacity: 0.9, scale: 0.7 },
          { opacity: 0, scale: 1.4, stagger: 0.18, duration: 0.25, transformOrigin: "50% 50%" },
          0.05,
        );
    });
  }, ref);

  return (
    <div ref={ref}>
      <header className="mb-4">
        <h3 className="text-24 md:text-36">{skillsCopy.tree.title}</h3>
        <p className="text-14 text-muted">{skillsCopy.tree.sub}</p>
      </header>
      <div className="hidden md:block">
        <Tree vertical={false} />
      </div>
      <div className="mx-auto max-w-xs md:hidden">
        <Tree vertical />
      </div>
      <ul className="sr-only">
        {skillGroups.map((g) => (
          <li key={g.name}>
            {g.name}: {g.items.join(", ")}
          </li>
        ))}
        {learning && (
          <li>
            {skillsCopy.inTraining}: {learning}
          </li>
        )}
      </ul>
    </div>
  );
}
