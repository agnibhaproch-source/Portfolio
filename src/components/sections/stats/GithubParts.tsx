import { statsCopy } from "@/content";
import { FLAME_INNER, FLAME_OUTER } from "@/components/ui/flame-paths";
import type { GithubStats } from "@/lib/stats";
import { streaks } from "@/lib/stats-derived";

/** Current and longest streak from the real calendar; the flame grows with the current one. */
export function StreakFlame({ gh }: { gh: GithubStats }) {
  const { current, longest } = streaks(gh.days);
  const size = 1.6 + Math.min(current / 21, 1) * 1.6;
  return (
    <div className="mt-6 flex items-center gap-4">
      <svg
        aria-hidden
        data-flame
        viewBox="0 0 40 50"
        className="origin-bottom animate-[flame-flicker_0.9s_ease-in-out_infinite] motion-reduce:animate-none [html[data-calm]_&]:animate-none"
        style={{ height: `${size}rem`, opacity: current ? 1 : 0.35 }}
      >
        <path d={FLAME_OUTER} fill="var(--agni)" />
        <path d={FLAME_INNER} fill="var(--kiln)" />
      </svg>
      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-14">
        <div>
          <dt className="text-muted">{statsCopy.streak}</dt>
          <dd className="font-display text-24">{statsCopy.days(current)}</dd>
        </div>
        <div>
          <dt className="text-muted">{statsCopy.longest}</dt>
          <dd className="font-display text-24">{statsCopy.days(longest)}</dd>
        </div>
      </dl>
    </div>
  );
}

const LIQUID = ["var(--kiln)", "var(--aura)", "var(--agni)", "#8f6fd0", "var(--washi)"];

/** Most-used languages as potion vials filled to their real share of repos. */
export function PotionVials({ gh }: { gh: GithubStats }) {
  const total = gh.languages.reduce((n, l) => n + l.count, 0) || 1;
  return (
    <ul className="mt-2 flex flex-wrap gap-5">
      {gh.languages.map((l, i) => {
        const share = Math.round((l.count / total) * 100);
        const clip = `vial-${i}`;
        const fillTop = 14 + 46 * (1 - share / 100);
        return (
          <li key={l.name} className="flex flex-col items-center gap-1 text-center">
            <svg aria-hidden viewBox="0 0 40 64" className="h-16 w-10 overflow-visible">
              <defs>
                <clipPath id={clip}>
                  <path d="M15 4 H25 V18 C33 22 36 30 36 40 C36 52 29 60 20 60 C11 60 4 52 4 40 C4 30 7 22 15 18 Z" />
                </clipPath>
              </defs>
              <g clipPath={`url(#${clip})`}>
                <rect
                  data-liquid
                  data-top={fillTop}
                  x="0"
                  y={fillTop}
                  width="40"
                  height={64 - fillTop}
                  fill={LIQUID[i % LIQUID.length]}
                  opacity="0.85"
                />
                {[10, 20, 28].map((x, k) => (
                  <circle
                    key={x}
                    cx={x}
                    cy="56"
                    r="1.6"
                    fill="var(--washi)"
                    className="animate-[bubble-rise_2.4s_ease-in_infinite] motion-reduce:hidden [html[data-calm]_&]:hidden"
                    style={{ animationDelay: `${-k * 0.8 - i * 0.3}s` }}
                  />
                ))}
              </g>
              <path
                d="M15 4 H25 V18 C33 22 36 30 36 40 C36 52 29 60 20 60 C11 60 4 52 4 40 C4 30 7 22 15 18 Z"
                fill="none"
                stroke="var(--washi)"
                strokeWidth="2"
              />
              <rect x="13" y="0" width="14" height="5" rx="1" fill="#8a5a32" />
            </svg>
            <span className="text-14">{l.name}</span>
            <span className="font-display text-14 text-aura">
              {share}%<span className="sr-only"> {statsCopy.ofRepos}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
