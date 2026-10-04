"use client";

import { useRef } from "react";
import { handles, profile, sections, statsCopy } from "@/content";
import { Panel } from "@/components/ui/Panel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { gsap } from "@/lib/gsap";
import type { GithubStats, LeetcodeStats } from "@/lib/stats";
import { useMotion } from "@/lib/use-motion";

const fmt = (n: number) => n.toLocaleString("en-US");

/** LeetCode ring: three arcs sized by difficulty share. */
function Ring({ lc }: { lc: LeetcodeStats }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const parts = [
    { n: lc.easy, color: "var(--washi)" },
    { n: lc.medium, color: "var(--kiln)" },
    { n: lc.hard, color: "var(--agni)" },
  ];
  const total = Math.max(lc.easy + lc.medium + lc.hard, 1);
  let offset = 0;
  return (
    <svg aria-hidden viewBox="0 0 180 180" className="size-44 shrink-0 -rotate-90 md:size-52">
      <circle
        cx="90"
        cy="90"
        r={r}
        fill="none"
        stroke="var(--tone)"
        strokeOpacity="0.25"
        strokeWidth="12"
      />
      {parts.map((p, i) => {
        const len = (p.n / total) * c;
        const el = (
          <circle
            key={i}
            data-arc
            cx="90"
            cy="90"
            r={r}
            fill="none"
            stroke={p.color}
            strokeWidth="12"
            strokeDasharray={`${Math.max(len - 3, 0)} ${c}`}
            strokeDashoffset={-offset}
          />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}

/** A year of contributions as screentone: busier days get bigger ink dots. */
function Heatmap({ gh }: { gh: GithubStats }) {
  const cols = Math.ceil(gh.days.length / 7);
  const cell = 10;
  return (
    <svg
      role="img"
      aria-label={statsCopy.heatmapLabel(gh.total)}
      viewBox={`0 0 ${cols * cell} ${7 * cell}`}
      className="w-full"
    >
      {gh.days.map((d, i) => (
        <circle
          key={d.date}
          data-dot
          cx={Math.floor(i / 7) * cell + cell / 2}
          cy={(i % 7) * cell + cell / 2}
          r={d.level === 0 ? 1 : 1.6 + d.level * 0.8}
          fill={d.level === 0 ? "var(--tone)" : "var(--washi)"}
          fillOpacity={d.level === 0 ? 0.35 : 1}
        />
      ))}
    </svg>
  );
}

export function TrainingLog({
  github,
  leetcode,
}: {
  github: GithubStats | null;
  leetcode: LeetcodeStats | null;
}) {
  const ref = useRef<HTMLElement>(null);

  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const q = gsap.utils.selector(el);
    const counters = q("[data-count]");
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 70%", once: true } });
    tl.from(q("[data-arc]"), { drawSVG: "0%", duration: 0.9, stagger: 0.15, ease: "ink" })
      .from(
        q("[data-dot]"),
        {
          scale: 0,
          transformOrigin: "50% 50%",
          duration: 0.3,
          ease: "steps(3)",
          stagger: { amount: 1.2, from: "start" },
        },
        0.1,
      )
      .from(
        counters,
        {
          textContent: 0,
          duration: 1.2,
          ease: "power2.out",
          snap: { textContent: 1 },
          onUpdate() {
            counters.forEach(
              (c) => (c.textContent = fmt(Number(String(c.textContent).replace(/\D/g, "")))),
            );
          },
        },
        0.1,
      );
  }, ref);

  if (!github && !leetcode) return null;

  return (
    <section
      ref={ref}
      id={sections.stats.id}
      data-mode="colour"
      aria-labelledby={`${sections.stats.id}-heading`}
      className="px-4 py-24 md:px-10 md:py-32"
    >
      <SectionHeading copy={sections.stats} />
      <p className="-mt-6 mb-10 text-14 text-muted md:-mt-8">
        {statsCopy.asOf}{" "}
        {new Date((github ?? leetcode)!.fetchedAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <div className="grid gap-gutter lg:grid-cols-[1fr_1.6fr]">
        {leetcode && (
          <Panel
            fill={false}
            className="text-washi"
            innerClassName="h-full bg-twilight/60 p-6 md:p-8"
          >
            <p className="font-display text-24">{statsCopy.leetcode}</p>
            <div className="mt-6 flex flex-wrap items-center gap-8">
              <div className="relative">
                <Ring lc={leetcode} />
                <p className="absolute inset-0 grid place-content-center text-center">
                  <span data-count className="font-display text-56 leading-none">
                    {fmt(leetcode.solved)}
                  </span>
                  <span className="text-14 text-muted">{statsCopy.solved}</span>
                </p>
              </div>
              <dl className="space-y-2 text-18">
                {(
                  [
                    [statsCopy.easy, leetcode.easy, "bg-washi"],
                    [statsCopy.medium, leetcode.medium, "bg-kiln"],
                    [statsCopy.hard, leetcode.hard, "bg-agni"],
                  ] as const
                ).map(([label, n, dot]) => (
                  <div key={label} className="flex items-center gap-3">
                    <span aria-hidden className={`size-3 rotate-45 ${dot}`} />
                    <dt className="w-20 text-muted">{label}</dt>
                    <dd data-count className="font-display">
                      {n}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            {leetcode.ranking && (
              <p className="mt-6 text-14 text-muted">
                <span data-count className="font-display text-18 text-washi">
                  {fmt(leetcode.ranking)}
                </span>{" "}
                {statsCopy.ranking}
              </p>
            )}
            <a
              href={`https://leetcode.com/u/${handles.leetcode}/`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block ink-link text-18"
            >
              {statsCopy.profile}
            </a>
          </Panel>
        )}

        {github && (
          <Panel
            fill={false}
            className="text-washi"
            innerClassName="h-full bg-twilight/60 p-6 md:p-8"
          >
            <p className="font-display text-24">{statsCopy.github}</p>
            <div className="mt-6">
              <Heatmap gh={github} />
            </div>
            <dl className="mt-8 grid grid-cols-3 gap-4">
              {(
                [
                  [statsCopy.contributions, github.total],
                  [statsCopy.activeDays, github.activeDays],
                  [statsCopy.repos, github.repos],
                ] as const
              ).map(([label, n]) => (
                <div key={label} className="flex flex-col-reverse">
                  <dt className="mt-1 text-14 text-muted">{label}</dt>
                  <dd data-count className="font-display text-36 leading-none md:text-56">
                    {fmt(n)}
                  </dd>
                </div>
              ))}
            </dl>
            {github.languages.length > 0 && (
              <div className="mt-6">
                <p className="text-14 text-muted">{statsCopy.languages}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {github.languages.map((l) => (
                    <li key={l.name} className="border-2 border-washi/40 px-2 py-0.5 text-14">
                      {l.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <a
              href={profile.links.github.href}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block ink-link text-18"
            >
              {statsCopy.profile}
            </a>
          </Panel>
        )}
      </div>
    </section>
  );
}
