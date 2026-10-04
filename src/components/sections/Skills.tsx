"use client";

import { useRef, useState } from "react";
import { Rune } from "@/components/ui/Rune";
import {
  learning,
  projectsUsing,
  radarSkillsFor,
  sections,
  skillGroups,
  skillsCopy,
  topSkills,
  type SkillGroup,
} from "@/content";
import { prefersReducedMotion } from "@/lib/motion";
import { Tilt } from "@/components/motion/Tilt";
import { Panel } from "@/components/ui/Panel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DUR, gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";
import { PowerChart } from "./skills/PowerChart";

/**
 * Colour mode. Power-level radar on the left, skill groups as tilting
 * holographic cards on the right. Hover or keyboard focus charges a card's
 * border with aura gold. No percentage bars.
 */
export function Skills() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<SkillGroup | null>(null);

  // Spell-cast: runes burst out of the card and its skills light up on the radar.
  const cast = (group: SkillGroup, card: HTMLElement) => {
    setActive(group);
    if (prefersReducedMotion()) return;
    const runes = card.querySelectorAll("[data-rune]");
    gsap.killTweensOf(runes);
    gsap.fromTo(
      runes,
      { x: 0, y: 0, scale: 0.4, opacity: 1, rotation: 0 },
      {
        x: (i) => Math.cos((i / runes.length) * Math.PI * 2) * 90,
        y: (i) => Math.sin((i / runes.length) * Math.PI * 2) * 60,
        scale: 1,
        opacity: 0,
        rotation: (i) => (i % 2 ? 90 : -90),
        duration: 0.7,
        ease: "power2.out",
      },
    );
  };

  useMotion((ctx, el) => {
    const cards = el.querySelectorAll("[data-skill-card]");
    gsap.from(cards, {
      opacity: 0,
      y: ctx.reduced ? 0 : 40,
      duration: ctx.reduced ? DUR.micro : DUR.standard,
      stagger: ctx.reduced ? 0 : 0.08,
      ease: "ink",
      scrollTrigger: {
        trigger: el.querySelector("[data-skill-cards]"),
        start: "top 80%",
        once: true,
      },
    });
  }, ref);

  return (
    <section
      ref={ref}
      id={sections.skills.id}
      data-mode="colour"
      aria-labelledby={`${sections.skills.id}-heading`}
      className="px-4 py-24 md:px-10 md:py-32"
    >
      <SectionHeading copy={sections.skills} />

      <div className="grid items-start gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
        <div>
          {topSkills.length > 0 && (
            <>
              <h3 className="sr-only">{skillsCopy.chartTitle}</h3>
              <PowerChart highlight={active ? radarSkillsFor(active) : []} />
            </>
          )}
          {learning && (
            <p className="mt-6 text-center text-18">
              <span className="text-muted">{skillsCopy.learning}: </span>
              {learning}
            </p>
          )}
          <div className="mt-4 flex justify-center">
            <Rune index={2} />
          </div>
        </div>

        <ul data-skill-cards className="grid gap-gutter sm:grid-cols-2">
          {skillGroups.map((group, i) => (
            <li
              key={group.name}
              data-skill-card
              className={cn(
                i === skillGroups.length - 1 && skillGroups.length % 2 === 1 && "sm:col-span-2",
              )}
            >
              <Tilt max={8} className="h-full">
                <Panel
                  as="article"
                  tabIndex={0}
                  aria-label={group.name}
                  onPointerEnter={(e) => cast(group, e.currentTarget)}
                  onFocus={(e) => cast(group, e.currentTarget)}
                  onPointerLeave={() => setActive(null)}
                  onBlur={() => setActive(null)}
                  fill={false}
                  className="group h-full text-washi/70 transition-[color,filter] duration-300 outline-none hover:text-aura hover:[filter:drop-shadow(0_0_10px_color-mix(in_srgb,var(--aura)_35%,transparent))] focus-visible:text-aura focus-visible:[filter:drop-shadow(0_0_10px_color-mix(in_srgb,var(--aura)_35%,transparent))]"
                  innerClassName="bg-[linear-gradient(150deg,var(--twilight),var(--sumi)_60%)] p-6 text-washi"
                >
                  <svg
                    aria-hidden
                    viewBox="-10 -10 20 20"
                    className="pointer-events-none absolute top-1/2 left-1/2 size-0 overflow-visible"
                  >
                    {Array.from({ length: 10 }, (_, r) => (
                      <g
                        key={r}
                        data-rune
                        opacity="0"
                        stroke="var(--aura)"
                        strokeWidth="1.2"
                        fill="none"
                      >
                        {r % 3 === 0 && <path d="M-4 3 L0 -4 L4 3 Z" />}
                        {r % 3 === 1 && <circle r="3" />}
                        {r % 3 === 2 && <path d="M-4 0 L4 0 M0 -4 L0 4" />}
                      </g>
                    ))}
                  </svg>
                  <h3 className="text-24">{group.name}</h3>
                  <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-18">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  {projectsUsing(group).length > 0 && (
                    <p className="mt-4 text-14 text-muted">
                      {skillsCopy.usedIn}:{" "}
                      <span className="text-washi">{projectsUsing(group).join(", ")}</span>
                    </p>
                  )}
                </Panel>
              </Tilt>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
