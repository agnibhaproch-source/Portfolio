"use client";

import { useRef } from "react";
import { learning, sections, skillGroups, skillsCopy, topSkills } from "@/content";
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
              <PowerChart />
            </>
          )}
          {learning && (
            <p className="mt-6 text-center text-18">
              <span className="text-muted">{skillsCopy.learning}: </span>
              {learning}
            </p>
          )}
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
                  fill={false}
                  className="group h-full text-washi/70 transition-[color,filter] duration-300 outline-none hover:text-aura hover:[filter:drop-shadow(0_0_10px_rgb(201_162_74/0.35))] focus-visible:text-aura focus-visible:[filter:drop-shadow(0_0_10px_rgb(201_162_74/0.35))]"
                  innerClassName="bg-[linear-gradient(150deg,rgb(42_26_34/0.95),rgb(29_22_20/0.95)_60%)] p-6 text-washi"
                >
                  <h3 className="text-24">{group.name}</h3>
                  <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-18">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </Panel>
              </Tilt>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
