"use client";

import { useRef } from "react";
import { aboutCopy, profile, sheetGauges, sheetQuest, sheetRows, sheetTally } from "@/content";
import { Panel } from "@/components/ui/Panel";
import { Silhouette } from "@/components/ui/Silhouette";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";

const copy = aboutCopy.sheet;

/**
 * A character profile page, manga-databook style, built only from real
 * facts. Rows ink in, the power gauges fill, the tally marks are struck one
 * by one and the current-quest stamp slams on. Static without motion.
 */
export function ProfileSheet({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const q = gsap.utils.selector(el);
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: "top 75%", once: true } })
      .from(q("[data-row]"), { x: -16, opacity: 0, duration: 0.3, stagger: 0.05, ease: "ink" })
      .from(q("[data-fill]"), { scaleX: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" }, 0.3)
      .from(
        q("[data-num]"),
        {
          textContent: 0,
          duration: 0.8,
          stagger: 0.12,
          snap: { textContent: 0.01 },
          ease: "power3.out",
          onUpdate() {
            // keep the configured decimals while counting
            for (const t of this.targets() as HTMLElement[]) {
              const d = Number(t.dataset.decimals ?? 0);
              t.textContent = Number(t.textContent).toFixed(d);
            }
          },
        },
        0.3,
      )
      .from(q("[data-tick]"), { drawSVG: "0%", duration: 0.08, stagger: 0.07 }, 0.6)
      .fromTo(
        q("[data-stamp]"),
        { scale: 2.2, opacity: 0, rotation: -18 },
        { scale: 1, opacity: 1, rotation: -7, duration: 0.25, ease: "steps(3)" },
        1.1,
      );
  }, ref);

  return (
    <div ref={ref} className={className}>
      <Panel tape breakout className="h-full" innerClassName="h-full p-5 md:p-7">
        <header className="flex items-start gap-4 border-b-[3px] border-fg pb-3">
          <div className="relative size-16 shrink-0 overflow-hidden border-[3px] border-fg tone">
            <Silhouette className="absolute inset-x-0 bottom-0 mx-auto h-[85%] text-sumi" />
          </div>
          <div className="min-w-0">
            <p className="text-14 text-muted">{copy.title}</p>
            <h3 className="text-24 leading-tight md:text-36">{profile.name.alias}</h3>
            <p lang="ja" className="font-display text-14 text-muted">
              {profile.name.ja.first} {profile.name.ja.last}
            </p>
          </div>
        </header>

        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-14 md:text-[15px]">
          {sheetRows.map((r) => (
            <div key={r.label} data-row className="contents">
              <dt className="text-muted">{r.label}</dt>
              <dd className="font-bold">
                {r.value}
                {r.note && <span className="ml-2 font-normal text-muted">({r.note})</span>}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 text-14 text-muted">{copy.gauges}</p>
        <ul className="mt-2 space-y-2">
          {sheetGauges.map((g) => (
            <li
              key={g.label}
              className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3 text-14"
            >
              <span className="truncate font-bold">{g.label}</span>
              <span className="relative h-3 border-2 border-fg">
                <span
                  data-fill
                  className="absolute inset-0 origin-left bg-[linear-gradient(90deg,var(--agni),var(--kiln))]"
                  style={{ transform: `scaleX(${g.value / g.max})` }}
                />
              </span>
              <span className="font-display tabular-nums">
                <span data-num data-decimals={g.decimals}>
                  {g.value.toFixed(g.decimals)}
                </span>
                <span className="sr-only"> {copy.outOf}</span>
              </span>
            </li>
          ))}
        </ul>

        {sheetTally && (
          <div className="mt-4 flex items-center gap-3 text-14">
            <span className="font-bold">{sheetTally.label}</span>
            <svg
              viewBox={`0 0 ${sheetTally.count * 9 + 6} 22`}
              className="h-5"
              style={{ width: `${((sheetTally.count * 9 + 6) / 22) * 1.25}rem` }}
              aria-hidden
            >
              {Array.from({ length: sheetTally.count }, (_, i) =>
                i % 5 === 4 ? (
                  <line
                    key={i}
                    data-tick
                    x1={i * 9 - 34}
                    y1="16"
                    x2={i * 9 + 4}
                    y2="6"
                    stroke="var(--agni)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                ) : (
                  <line
                    key={i}
                    data-tick
                    x1={i * 9 + 4}
                    y1="2"
                    x2={i * 9 + 2}
                    y2="20"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                ),
              )}
            </svg>
            <span className="font-display">{sheetTally.count}</span>
          </div>
        )}

        {sheetQuest && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-14 text-muted">{copy.quest}</span>
            <span
              data-stamp
              className={cn(
                "inline-block -rotate-[7deg] border-[3px] border-agni px-2 py-0.5 font-display text-14 text-agni uppercase md:text-18",
              )}
            >
              {sheetQuest}
            </span>
          </div>
        )}
      </Panel>
    </div>
  );
}
