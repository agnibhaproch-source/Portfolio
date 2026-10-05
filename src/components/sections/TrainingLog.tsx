"use client";

import { useRef } from "react";
import { handles, profile, sections, statsCopy } from "@/content";
import { Panel } from "@/components/ui/Panel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useCalm } from "@/lib/calm";
import { gsap } from "@/lib/gsap";
import { sound } from "@/lib/sound";
import type { GithubStats, LeetcodeStats } from "@/lib/stats";
import { milestones } from "@/lib/stats-derived";
import { useMotion } from "@/lib/use-motion";
import { PotionVials, StreakFlame } from "./stats/GithubParts";
import { Heatmap } from "./stats/Heatmap";
import { BossTiers, fmt, RankScouter, Ring } from "./stats/LeetcodeParts";
import { LivePulse } from "./stats/LivePulse";
import { Odometer, rollOdometers } from "./stats/Odometer";
import { RuneRain } from "./stats/RuneRain";
import { Surge } from "./stats/Surge";
import { CutIn, Unroll } from "./stats/Unroll";

/** Corner bracket of the STATUS screen frame. */
function Bracket({ className, flip }: { className: string; flip: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 40 40"
      className={`pointer-events-none absolute size-10 text-aura ${className}`}
      style={{ transform: flip }}
    >
      <path data-bracket d="M2 38 V2 H38" fill="none" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}

/**
 * Live GitHub and LeetCode numbers as a game STATUS screen. Brackets draw,
 * scan lines sweep and a STATUS stamp lands; milestone badges (only the real
 * ones) stamp in. Each panel unrolls on scroll rods, a manga cut-in slides
 * across, then the numbers land: odometer digits, the difficulty ring charges
 * arc by arc, boss tiers get DEFEATED stamps, the rank scouter locks on, the
 * heatmap fills as an ink wave (and later tilts into a skyline), the streak
 * flame and language vials fill. Every number re-counts on hover. Plain and
 * static under reduced motion; calm mode keeps it short.
 */
export function TrainingLog({
  github,
  leetcode,
}: {
  github: GithubStats | null;
  leetcode: LeetcodeStats | null;
}) {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const earned = milestones(github, leetcode);

  useMotion(
    (ctx, el) => {
      if (ctx.reduced) return;
      const q = gsap.utils.selector(el);

      // The STATUS screen boots.
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 70%", once: true } })
        .from(q("[data-bracket]"), { drawSVG: "0%", duration: 0.5, stagger: 0.08, ease: "ink" })
        .fromTo(
          q("[data-scanline]"),
          { yPercent: -100, opacity: 1 },
          { yPercent: 100, opacity: 0, duration: 1.1, ease: "power1.in" },
          0,
        )
        .fromTo(
          q("[data-status]"),
          { scale: 2.4, opacity: 0, rotation: -18 },
          {
            scale: 1,
            opacity: 1,
            rotation: -8,
            duration: 0.22,
            ease: "steps(3)",
            onStart: () => sound.play("stamp"),
          },
          0.35,
        )
        .fromTo(
          q("[data-milestone]"),
          { scale: 2, opacity: 0, rotation: -14 },
          {
            scale: 1,
            opacity: 1,
            rotation: (i: number) => (i % 2 ? 3 : -4),
            duration: 0.18,
            stagger: 0.12,
            ease: "steps(3)",
          },
          0.6,
        );

      q("[data-stat-panel]").forEach((panel) => {
        const p = gsap.utils.selector(panel);
        // The scroll rods wrap the panel, so look outward for them.
        const unroll = panel.closest("[data-unroll]");
        const sheet = unroll?.querySelector<HTMLElement>("[data-sheet]") ?? undefined;
        const bottom = unroll?.querySelector<HTMLElement>("[data-rod='bottom']") ?? undefined;
        const has = (sel: string) => p(sel).length > 0;
        const tl = gsap.timeline({
          scrollTrigger: { trigger: panel, start: "top 75%", once: true },
        });
        if (!calm && sheet && bottom) {
          // Unroll: the sheet reveals top-down while the bottom rod travels with it.
          tl.fromTo(
            sheet,
            { clipPath: "inset(0% 0% 100% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.7,
              ease: "power2.inOut",
              clearProps: "clipPath",
            },
          )
            .fromTo(
              bottom,
              { y: () => -sheet.offsetHeight },
              { y: 0, duration: 0.7, ease: "power2.inOut" },
              0,
            )
            .fromTo(
              p("[data-cutin]"),
              { xPercent: -110, opacity: 1 },
              { xPercent: 0, duration: 0.22, ease: "power3.out" },
              0.6,
            )
            .to(p("[data-cutin]"), { xPercent: 110, duration: 0.22, ease: "power3.in" }, 1.05)
            .set(p("[data-cutin]"), { opacity: 0 });
        }
        const at = calm ? 0 : 1.1;
        rollOdometers(p("[data-odo]"), 1.2, tl, at);
        // LeetCode: arcs charge one by one, each with a flare and a +N pop.
        p("[data-arc]").forEach((arc, i) => {
          tl.from(arc, { drawSVG: "0%", duration: 0.45, ease: "power2.inOut" }, at + i * 0.45)
            .fromTo(
              arc,
              { filter: "drop-shadow(0 0 0px var(--agni))" },
              {
                filter: "drop-shadow(0 0 10px var(--kiln))",
                duration: 0.15,
                yoyo: true,
                repeat: 1,
              },
              at + i * 0.45 + 0.3,
            )
            .fromTo(
              p("[data-arc-pop]")[i] ?? {},
              { y: 10, opacity: 0, scale: 0.6 },
              { y: 0, opacity: 1, scale: 1, duration: 0.2, ease: "back.out(3)" },
              at + i * 0.45 + 0.35,
            );
        });
        if (has("[data-defeat]"))
          tl.fromTo(
            p("[data-defeat]"),
            { scale: 2.2, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.18, stagger: 0.15, ease: "steps(3)" },
            at + 1.3,
          );
        // Rank scouter: the reticle sweeps in and locks; digits scramble to the real rank.
        const rank = p("[data-rank]")[0] as HTMLElement | undefined;
        if (rank) {
          tl.fromTo(
            p("[data-reticle]"),
            { x: -140, rotation: -120, scale: 1.8, opacity: 0 },
            { x: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.6, ease: "power3.out" },
            at + 0.8,
          )
            .to(p("[data-reticle]"), { scale: 0.85, duration: 0.08, yoyo: true, repeat: 1 }, ">")
            .to(
              rank,
              {
                duration: 0.9,
                scrambleText: { text: rank.dataset.final ?? "", chars: "0123456789", speed: 0.6 },
              },
              at + 0.8,
            );
        }
        // GitHub: the heatmap fills as an ink wave behind a scan line; peak days flash.
        const dots = p("[data-dot]");
        if (dots.length) {
          const cols = Number((dots.at(-1) as unknown as SVGElement).dataset.col) + 1;
          tl.fromTo(
            p("[data-scan]"),
            { attr: { x: 0 }, opacity: 1 },
            { attr: { x: cols * 10 }, duration: 1.4, ease: "none" },
            at,
          )
            .set(p("[data-scan]"), { opacity: 0 })
            // Radius, not scale: scaling 365 SVG dots around their centres means
            // measuring each one, which stalls WebKit.
            .from(
              dots,
              {
                attr: { r: 0 },
                duration: 0.25,
                ease: "back.out(3)",
                stagger: (i: number, t: Element) =>
                  Number((t as SVGElement).dataset.col) * (1.4 / cols) + (i % 7) * 0.004,
              },
              at,
            )
            .fromTo(
              dots.filter((d) => (d as unknown as SVGElement).dataset.level === "4"),
              { fill: "var(--kiln)", attr: { r: 9 } },
              {
                fill: "var(--washi)",
                attr: { r: 4.8 },
                duration: 0.4,
                stagger: 0.05,
              },
              at + 1.2,
            );
        }
        if (has("[data-liquid]"))
          tl.from(
            p("[data-liquid]"),
            { attr: { y: 64 }, duration: 0.9, stagger: 0.1, ease: "power2.out" },
            at + 0.6,
          );
        if (has("[data-flame]"))
          tl.from(
            p("[data-flame]"),
            { scale: 0, transformOrigin: "50% 100%", duration: 0.5, ease: "back.out(2)" },
            at + 0.4,
          );
        // A shine sweeps across the numbers: they came straight from the source.
        tl.fromTo(
          p("[data-shine]"),
          { xPercent: -120 },
          { xPercent: 220, duration: 0.9, ease: "power2.inOut" },
          at + 1.6,
        );
      });
    },
    ref,
    [calm],
  );

  if (!github && !leetcode) return null;
  const fetchedAt = (github ?? leetcode)!.fetchedAt;

  const shine = (
    <span
      aria-hidden
      data-shine
      className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] -skew-x-12 bg-[linear-gradient(90deg,transparent,rgb(255_235_200/0.18),transparent)]"
    />
  );

  return (
    <section
      ref={ref}
      id={sections.stats.id}
      data-mode="colour"
      aria-labelledby={`${sections.stats.id}-heading`}
      className="relative isolate overflow-hidden px-4 py-24 md:px-10 md:py-32"
    >
      <RuneRain />
      <div className="relative">
        <Bracket className="-top-6 -left-2 md:-left-4" flip="none" />
        <Bracket className="-top-6 -right-2 md:-right-4" flip="scaleX(-1)" />
        <Bracket className="-bottom-6 -left-2 md:-left-4" flip="scaleY(-1)" />
        <Bracket className="-right-2 -bottom-6 md:-right-4" flip="scale(-1,-1)" />
        <div
          aria-hidden
          data-scanline
          className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,transparent,rgb(226_98_43/0.12)_48%,rgb(255_200_150/0.35)_50%,transparent_52%)] opacity-0"
        />
        <div
          aria-hidden
          data-status
          className="pointer-events-none absolute top-0 right-0 sfx text-36 text-kiln md:text-56"
        >
          {statsCopy.status}
        </div>

        <SectionHeading copy={sections.stats} />
        <div className="-mt-6 mb-6 md:-mt-8">
          <LivePulse
            fetchedAt={fetchedAt}
            fallback={`${statsCopy.asOf} ${new Date(fetchedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
          />
        </div>
        {earned.length > 0 && (
          <div className="mb-10">
            <h3 className="sr-only">{statsCopy.milestones}</h3>
            <ul className="flex flex-wrap gap-3">
              {earned.map((m) => (
                <li
                  key={m}
                  data-milestone
                  className="border-[3px] border-aura bg-sumi/70 px-2 py-0.5 font-display text-14 text-aura uppercase"
                >
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid items-start gap-gutter lg:grid-cols-[1fr_1.6fr]">
          {leetcode && (
            <Unroll>
              <Panel
                fill={false}
                data-stat-panel
                className="text-washi"
                innerClassName="relative h-full overflow-hidden bg-twilight/60 p-6 md:p-8"
              >
                <CutIn word={statsCopy.cutIn.leetcode} />
                {shine}
                <p className="font-display text-24">{statsCopy.leetcode}</p>
                <div className="mt-6 flex flex-wrap items-center gap-8">
                  <Surge>
                    <Ring lc={leetcode} />
                    <p className="absolute inset-0 grid place-content-center text-center">
                      <span className="font-display text-56 leading-none">
                        <Odometer value={fmt(leetcode.solved)} />
                      </span>
                      <span className="text-14 text-muted">{statsCopy.solved}</span>
                    </p>
                  </Surge>
                </div>
                <div className="mt-6">
                  <BossTiers lc={leetcode} />
                </div>
                {leetcode.ranking && <RankScouter rank={leetcode.ranking} />}
                <a
                  href={`https://leetcode.com/u/${handles.leetcode}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-block ink-link text-18"
                >
                  {statsCopy.profile}
                </a>
              </Panel>
            </Unroll>
          )}

          {github && (
            <Unroll>
              <Panel
                fill={false}
                data-stat-panel
                className="text-washi"
                innerClassName="relative h-full overflow-hidden bg-twilight/60 p-6 md:p-8"
              >
                <CutIn word={statsCopy.cutIn.github} />
                {shine}
                <p className="font-display text-24">{statsCopy.github}</p>
                <Heatmap gh={github} />
                <dl className="mt-2 grid grid-cols-3 gap-4">
                  {(
                    [
                      [statsCopy.contributions, github.total],
                      [statsCopy.activeDays, github.activeDays],
                      [statsCopy.repos, github.repos],
                    ] as const
                  ).map(([label, n]) => (
                    <Surge key={label} className="flex flex-col-reverse">
                      <dt className="mt-1 text-14 text-muted">{label}</dt>
                      <dd className="font-display text-36 leading-none md:text-56">
                        <Odometer value={fmt(n)} />
                      </dd>
                    </Surge>
                  ))}
                </dl>
                <StreakFlame gh={github} />
                {github.languages.length > 0 && (
                  <div className="mt-6">
                    <p className="text-14 text-muted">{statsCopy.languages}</p>
                    <PotionVials gh={github} />
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
            </Unroll>
          )}
        </div>
      </div>
    </section>
  );
}
