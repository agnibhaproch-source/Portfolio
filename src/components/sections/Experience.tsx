"use client";

import { useRef, useState } from "react";
import { Rune } from "@/components/ui/Rune";
import { arcs, experienceCopy, sections } from "@/content";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { Panel } from "@/components/ui/Panel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Print-on-night: paper mission cards on the night background. An ink line
 * draws with scroll; each card slides out from it, numbers count up, and the
 * active card gets speed lines behind its heading. Reads as a plain ordered
 * timeline with animations off.
 */
export function Experience() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);

  useMotion((ctx, el) => {
    setReduced(ctx.reduced);
    if (ctx.reduced) return;
    const q = gsap.utils.selector(el);

    gsap.fromTo(
      q("[data-xp-line]"),
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: q("[data-xp]")[0],
          start: "top 70%",
          end: "bottom 60%",
          scrub: 0.4,
        },
      },
    );

    q("[data-arc]").forEach((arc, i) => {
      const a = gsap.utils.selector(arc);
      const counters = a("[data-count]");
      gsap
        .timeline({ scrollTrigger: { trigger: arc, start: "top 80%", once: true } })
        .from(a("[data-node]"), { scale: 0, rotation: 45, duration: 0.35, ease: "heat" })
        .from(a("[data-when]"), { opacity: 0, x: -16, duration: 0.4, ease: "ink" }, 0.05)
        .fromTo(
          a("[data-arc-card]"),
          { clipPath: "inset(0% 100% 0% 0%)", x: -30 },
          { clipPath: "inset(0% 0% 0% 0%)", x: 0, duration: 0.7, ease: "snap" },
          0.1,
        )
        .from(
          counters,
          {
            textContent: 0,
            duration: 1.1,
            ease: "power2.out",
            snap: { textContent: 0.01 },
            onUpdate() {
              counters.forEach((c) => {
                const dec = Number((c as HTMLElement).dataset.decimals ?? 0);
                c.textContent = Number(c.textContent).toFixed(dec);
              });
            },
          },
          0.45,
        );

      ScrollTrigger.create({
        trigger: arc,
        start: "top 55%",
        end: "bottom 45%",
        onToggle: (self) => setActive((cur) => (self.isActive ? i : cur === i ? null : cur)),
      });
    });
  }, ref);

  return (
    <section
      ref={ref}
      id={sections.experience.id}
      data-mode="colour"
      aria-labelledby={`${sections.experience.id}-heading`}
      className="px-4 py-24 md:px-10 md:py-32"
    >
      <SectionHeading copy={sections.experience} />

      <div data-xp className="relative">
        <div
          aria-hidden
          className="absolute top-2 bottom-2 left-[11px] w-[3px] bg-washi/15 md:left-[calc(9rem+1.5rem-1px)]"
        >
          <div data-xp-line className="h-full w-full origin-top bg-washi" />
        </div>

        <ol className="space-y-14 md:space-y-24">
          {arcs.map((arc, i) => {
            const when =
              arc.start === arc.end ? arc.start : `${arc.start} ${experienceCopy.to} ${arc.end}`;
            return (
              <li
                key={`${arc.org}-${arc.start}`}
                data-arc
                className="relative grid gap-3 pl-10 md:grid-cols-[9rem_1fr] md:gap-12 md:pl-0"
              >
                <span
                  data-node
                  aria-hidden
                  className={cn(
                    "absolute top-2 left-[5px] size-[15px] rotate-45 border-[3px] border-washi transition-colors duration-300 md:left-[calc(9rem+1.5rem-7px)]",
                    active === i ? "bg-kiln" : "bg-sumi",
                  )}
                />
                <div data-when className="md:pt-1 md:text-right">
                  <p className="font-display text-14 text-muted">
                    {experienceCopy.mission} {pad(i + 1)}
                  </p>
                  <p className="text-18">{when}</p>
                </div>

                <Panel
                  as="article"
                  data-arc-card
                  data-mode="print"
                  className="max-w-3xl text-sumi"
                  innerClassName="p-6 md:p-8"
                >
                  <div className="relative">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -inset-x-6 -top-6 h-28 text-sumi md:-inset-x-8"
                    >
                      <SpeedLines
                        variant="parallel"
                        intensity={!reduced && active === i ? 0.6 : 0}
                      />
                    </div>
                    <h3 className="relative text-24 md:text-36">{arc.role}</h3>
                  </div>
                  <p className="mt-2 text-18">{arc.org}</p>

                  {arc.stats && arc.stats.length > 0 && (
                    <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                      {arc.stats.map((s) => (
                        <div key={s.label} className="flex flex-col-reverse">
                          <dt className="mt-1 text-14 text-muted">{s.label}</dt>
                          <dd className="font-display text-56 leading-none">
                            <span data-count data-decimals={s.decimals}>
                              {s.value.toFixed(s.decimals)}
                            </span>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {arc.outcomes.length > 0 && (
                    <ul className="mt-6 list-disc space-y-1 pl-5">
                      {arc.outcomes.map((o) => (
                        <li key={o}>{o}</li>
                      ))}
                    </ul>
                  )}

                  {arc.links && arc.links.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 pl-5">
                      {arc.links.map((l) => (
                        <li key={l.href}>
                          <a
                            href={l.href}
                            target="_blank"
                            rel="noreferrer"
                            className="ink-link font-display text-24"
                            data-cursor-label="GitHub"
                          >
                            <ScrambleText text={l.label} />
                            <span className="sr-only"> {experienceCopy.opensInNewTab}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}

                  {arc.stack.length > 0 && (
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {arc.stack.map((t) => (
                        <li key={t} className="border-2 border-sumi px-2 py-0.5 text-14">
                          {t}
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </li>
            );
          })}
        </ol>
        <Rune index={3} className="relative mt-8 -ml-1.5 md:ml-[calc(9rem+1.5rem-18px)]" />
      </div>
    </section>
  );
}
