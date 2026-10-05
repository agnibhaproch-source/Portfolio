import { statsCopy } from "@/content";
import type { LeetcodeStats } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { Odometer } from "./Odometer";

export const fmt = (n: number) => n.toLocaleString("en-US");

const R = 70;
const CIRC = 2 * Math.PI * R;

function parts(lc: LeetcodeStats) {
  const list = [
    { n: lc.easy, color: "var(--washi)" },
    { n: lc.medium, color: "var(--kiln)" },
    { n: lc.hard, color: "var(--agni)" },
  ];
  const total = Math.max(lc.easy + lc.medium + lc.hard, 1);
  let offset = 0;
  return list.map((p) => {
    const len = (p.n / total) * CIRC;
    const mid = (offset + len / 2) / CIRC; // 0..1 around from 12 o'clock
    const out = { ...p, len, offset, mid };
    offset += len;
    return out;
  });
}

/**
 * The difficulty ring: three arcs sized by difficulty share. The timeline
 * charges them one by one (data-arc), each with a flare and a "+N" pop
 * (data-arc-pop) at its middle.
 */
export function Ring({ lc }: { lc: LeetcodeStats }) {
  const ps = parts(lc);
  return (
    <div className="relative size-44 shrink-0 md:size-52">
      <svg aria-hidden viewBox="0 0 180 180" className="size-full -rotate-90">
        <circle
          cx="90"
          cy="90"
          r={R}
          fill="none"
          stroke="var(--tone)"
          strokeOpacity="0.25"
          strokeWidth="12"
        />
        {ps.map((p, i) =>
          p.n > 0 ? (
            <circle
              key={i}
              data-arc
              cx="90"
              cy="90"
              r={R}
              fill="none"
              stroke={p.color}
              strokeWidth="12"
              strokeDasharray={`${Math.max(p.len - 3, 0)} ${CIRC}`}
              strokeDashoffset={-p.offset}
              className="[filter:drop-shadow(0_0_0_transparent)]"
            />
          ) : null,
        )}
      </svg>
      {ps.map((p, i) => {
        if (p.n <= 0) return null;
        const a = p.mid * Math.PI * 2 - Math.PI / 2;
        return (
          <span
            key={i}
            aria-hidden
            data-arc-pop
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 font-display text-18 opacity-0"
            style={{
              left: `${(50 + Math.cos(a) * 54).toFixed(2)}%`,
              top: `${(50 + Math.sin(a) * 52).toFixed(2)}%`,
              color: p.color,
              textShadow: "0 0 10px var(--agni)",
            }}
          >
            +{p.n}
          </span>
        );
      })}
    </div>
  );
}

const SILHOUETTES = {
  // a round little blob
  easy: (
    <>
      <path d="M8 50 C8 30 18 16 30 16 C42 16 52 30 52 50 C44 54 16 54 8 50 Z" />
      <circle cx="23" cy="34" r="3" fill="var(--sumi)" />
      <circle cx="37" cy="34" r="3" fill="var(--sumi)" />
    </>
  ),
  // a knight's helm with a visor slit
  medium: (
    <>
      <path d="M12 54 L12 28 C12 14 20 6 30 6 C40 6 48 14 48 28 L48 54 Z" />
      <path d="M30 2 L34 10 L26 10 Z" />
      <rect x="16" y="26" width="28" height="4" fill="var(--sumi)" />
      <path d="M30 32 L30 48" stroke="var(--sumi)" strokeWidth="2" />
    </>
  ),
  // a horned, fanged head
  hard: (
    <>
      <path d="M6 10 C14 16 18 20 20 26 L40 26 C42 20 46 16 54 10 C52 22 50 28 46 32 L46 46 L38 54 L22 54 L14 46 L14 32 C10 28 8 22 6 10 Z" />
      <path d="M20 34 L27 38 L20 40 Z M40 34 L33 38 L40 40 Z" fill="var(--kiln)" />
      <path
        d="M24 50 L26 45 L28 50 M32 50 L34 45 L36 50"
        stroke="var(--sumi)"
        strokeWidth="1.6"
        fill="none"
      />
    </>
  ),
};

/** Easy/Medium/Hard as three enemy tiers, each stamped with its real count. */
export function BossTiers({ lc }: { lc: LeetcodeStats }) {
  const tiers = [
    { key: "easy" as const, n: lc.easy, color: "text-washi" },
    { key: "medium" as const, n: lc.medium, color: "text-kiln" },
    { key: "hard" as const, n: lc.hard, color: "text-agni" },
  ];
  return (
    <ul className="grid grid-cols-3 gap-3">
      {tiers.map((t, i) => (
        <li
          key={t.key}
          data-tier
          className="relative border-2 border-washi/30 bg-sumi/50 p-3 text-center"
        >
          <svg
            aria-hidden
            viewBox="0 0 60 60"
            className={cn("mx-auto fill-current", t.color, t.n === 0 && "opacity-30")}
            style={{ width: `${2.4 + i * 0.6}rem` }}
          >
            {SILHOUETTES[t.key]}
          </svg>
          <p className="mt-1 text-14 text-muted">{statsCopy.tiers[t.key]}</p>
          <p className="font-display text-24">
            <Odometer value={fmt(t.n)} />
          </p>
          {t.n > 0 ? (
            <span
              data-defeat
              aria-hidden
              className="mt-1 inline-block -rotate-6 border-2 border-agni bg-sumi px-1 font-display text-[10px] whitespace-nowrap text-kiln sm:absolute sm:-top-2 sm:-right-2 sm:mt-0 sm:-rotate-12 sm:text-[11px]"
            >
              ×{fmt(t.n)} {statsCopy.defeated}
            </span>
          ) : (
            <span className="mt-1 block text-[11px] text-muted">{statsCopy.notFaced}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

/** The global rank behind a scouter reticle that sweeps in and locks on. */
export function RankScouter({ rank }: { rank: number }) {
  return (
    <p className="mt-6 flex items-center gap-3 text-14 text-muted">
      <span className="relative inline-block px-3 py-1">
        <svg
          aria-hidden
          data-reticle
          viewBox="0 0 60 60"
          className="pointer-events-none absolute top-1/2 left-1/2 size-14 -translate-x-1/2 -translate-y-1/2 overflow-visible text-kiln"
        >
          <circle
            cx="30"
            cy="30"
            r="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <path
            d="M30 2 V14 M30 46 V58 M2 30 H14 M46 30 H58"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="30" cy="30" r="2" fill="currentColor" />
        </svg>
        <span data-rank data-final={fmt(rank)} className="relative font-display text-24 text-washi">
          {fmt(rank)}
        </span>
      </span>
      {statsCopy.ranking}
    </p>
  );
}
