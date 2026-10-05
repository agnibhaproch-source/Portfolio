"use client";

import { useState, type ReactNode } from "react";
import { Rune } from "@/components/ui/Rune";
import { radarSkillsFor, sections, skillsCopy, topSkills, type SkillGroup } from "@/content";
import { InkReveal } from "@/components/motion/InkReveal";
import { Panel } from "@/components/ui/Panel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { Constellation } from "./skills/Constellation";
import { PowerChart } from "./skills/PowerChart";
import { SkillCards } from "./skills/SkillCards";
import { SkillMarquee } from "./skills/SkillMarquee";
import { SkillTree } from "./skills/SkillTree";
import { TrainingDummy } from "./skills/TrainingDummy";
import { TrainingGauge } from "./skills/TrainingGauge";

function Board({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Panel
      fill={false}
      className={cn("h-full text-washi/70", className)}
      innerClassName="h-full bg-[linear-gradient(150deg,var(--twilight),var(--sumi)_60%)] p-5 text-washi md:p-8"
    >
      {children}
    </Panel>
  );
}

/**
 * Colour mode. Skill marquees frame the section. Power chart (radar or bars,
 * charge-up, level seals, versus mode, orbiting skill ring) and the training
 * gauge on the left; the skill groups as dealt-and-flipped spell cards on the
 * right (holo foil, chip bursts, combo chains). Below: the skill tree, the
 * training dummy and the skill constellation, each revealed by an ink splash.
 */
export function Skills() {
  const [active, setActive] = useState<SkillGroup | null>(null);

  return (
    <section
      id={sections.skills.id}
      data-mode="colour"
      aria-labelledby={`${sections.skills.id}-heading`}
      className="overflow-x-clip px-4 py-24 md:px-10 md:py-32"
    >
      <SkillMarquee className="-mx-6 mb-16 md:-mx-12" />
      <SectionHeading copy={sections.skills} />

      <div className="grid items-start gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
        <div>
          {topSkills.length > 0 && (
            <InkReveal at="50% 45%">
              <h3 className="sr-only">{skillsCopy.chartTitle}</h3>
              <PowerChart highlight={active ? radarSkillsFor(active) : []} />
            </InkReveal>
          )}
          <TrainingGauge className="mx-auto mt-8 max-w-[34rem]" />
          <div className="mt-4 flex justify-center">
            <Rune index={2} />
          </div>
        </div>

        <SkillCards onActive={setActive} />
      </div>

      <div className="mt-20 grid gap-gutter lg:grid-cols-12">
        <InkReveal at="20% 50%" className="lg:col-span-8">
          <Board>
            <SkillTree />
          </Board>
        </InkReveal>
        <InkReveal at="70% 30%" delay={0.15} className="lg:col-span-4">
          <Board>
            <TrainingDummy />
          </Board>
        </InkReveal>
        <InkReveal at="40% 60%" className="lg:col-span-12">
          <Board>
            <Constellation />
          </Board>
        </InkReveal>
      </div>

      <SkillMarquee reverse className="-mx-6 mt-20 md:-mx-12" />
    </section>
  );
}
