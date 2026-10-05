"use client";

import { useEffect, useRef, useState } from "react";
import {
  projectsUsing,
  projectsUsingSkill,
  skillGroups,
  skillsCopy,
  type SkillGroup,
} from "@/content";
import { ImpactWord, type ImpactWordHandle } from "@/components/motion/ImpactWord";
import { Tilt } from "@/components/motion/Tilt";
import { Panel } from "@/components/ui/Panel";
import { GLYPHS } from "@/components/ui/Rune";
import { useCalm } from "@/lib/calm";
import { gsap } from "@/lib/gsap";
import { haptic } from "@/lib/haptics";
import { prefersReducedMotion } from "@/lib/motion";
import { sound } from "@/lib/sound";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";

const COMBO = 3;

/** Card back: an original rune seal on dark cloth. */
function CardBack({ i }: { i: number }) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 grid [transform:rotateY(180deg)] place-items-center border-[3px] border-aura/70 bg-[radial-gradient(circle,#2c1a20,#140e0d_70%)] [backface-visibility:hidden]"
    >
      <div className="absolute inset-2 border border-aura/40" />
      <svg viewBox="0 0 100 100" className="size-24 text-aura">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
        <path
          d={GLYPHS[i % GLYPHS.length]}
          transform="translate(26 26) scale(2)"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <span
        data-back-flash
        className="absolute inset-0 bg-[radial-gradient(circle,rgb(255_220_160/0.9),transparent_65%)] opacity-0"
      />
    </div>
  );
}

/**
 * Skill groups as grimoire spell cards. They are dealt face-down from a deck
 * as the section scrolls in, then flip over with a rune flash. Hover tilts a
 * card with a holographic foil shine. Each skill is a chip: hover shows which
 * projects use it with a small ink burst; click three in a row to chain a
 * combo spell. Cards appear plainly under reduced motion or calm mode.
 */
export function SkillCards({ onActive }: { onActive: (g: SkillGroup | null) => void }) {
  const ref = useRef<HTMLUListElement>(null);
  const word = useRef<ImpactWordHandle>(null);
  const calm = useCalm();
  const [chain, setChain] = useState<string[]>([]);
  const chainTimer = useRef(0);

  // Spell-cast: runes burst out of the card and its skills light up on the radar.
  const cast = (group: SkillGroup, card: HTMLElement) => {
    onActive(group);
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

  // Holo foil follows the pointer.
  const foil = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const burst = (chip: HTMLElement) => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(
      chip.querySelectorAll("[data-burst] line"),
      { drawSVG: "0% 0%", opacity: 1 },
      {
        keyframes: [
          { drawSVG: "0% 100%", duration: 0.12 },
          { drawSVG: "100% 100%", opacity: 0, duration: 0.25 },
        ],
      },
    );
  };

  const link = (skill: string) => {
    window.clearTimeout(chainTimer.current);
    setChain((c) => (c.includes(skill) ? c : c.length >= COMBO ? [skill] : [...c, skill]));
    chainTimer.current = window.setTimeout(() => setChain([]), 4000);
  };
  useEffect(() => () => window.clearTimeout(chainTimer.current), []);

  // Draw the chain between chips; on the third, cast the combo.
  useEffect(() => {
    const root = ref.current;
    const svg = root?.querySelector<SVGSVGElement>("[data-chain]");
    if (!root || !svg) return;
    const box = root.getBoundingClientRect();
    const centres = chain
      .map((s) => root.querySelector<HTMLElement>(`[data-chip="${CSS.escape(s)}"]`))
      .filter((c): c is HTMLElement => !!c)
      .map((c) => {
        const r = c.getBoundingClientRect();
        return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top] as const;
      });
    const line = svg.querySelector("polyline");
    line?.setAttribute("points", centres.map((p) => p.join(",")).join(" "));
    const counter = root.querySelector<HTMLElement>("[data-chain-count]");
    const last = centres.at(-1);
    if (counter && last) {
      counter.style.left = `${last[0]}px`;
      counter.style.top = `${last[1] - 34}px`;
    }
    if (chain.length < 2 || prefersReducedMotion()) return;
    sound.play("tick");
    if (line) gsap.fromTo(line, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.25 });
    if (counter)
      gsap.fromTo(
        counter,
        { scale: 1.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.18, ease: "steps(3)" },
      );
    if (chain.length === COMBO && last) {
      const circle = root.querySelector<HTMLElement>("[data-combo-circle]");
      if (circle) {
        gsap.set(circle, { left: last[0], top: last[1], xPercent: -50, yPercent: -50 });
        gsap
          .timeline()
          .fromTo(
            circle,
            { scale: 0.2, opacity: 1, rotation: 0 },
            { scale: 1.4, rotation: 120, duration: 0.5, ease: "power2.out" },
          )
          .to(circle, { opacity: 0, duration: 0.3 });
      }
      word.current?.play(
        skillsCopy.comboWord,
        (last[0] / box.width) * 100,
        (last[1] / box.height) * 100 - 8,
      );
      haptic("rune");
      window.clearTimeout(chainTimer.current);
      chainTimer.current = window.setTimeout(() => setChain([]), 1600);
    }
  }, [chain]);

  useMotion(
    (ctx, el) => {
      const q = gsap.utils.selector(el);
      const cards = q("[data-skill-card]");
      const inners = q("[data-card-inner]");
      if (ctx.reduced || calm) {
        gsap.from(cards, {
          opacity: 0,
          duration: 0.2,
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
        });
        return;
      }
      // Deal from the deck (top-left of the grid), face down, then flip.
      const deck = q("[data-deck]")[0] as HTMLElement | undefined;
      const from = (card: Element) => {
        const d = deck?.getBoundingClientRect();
        const c = card.getBoundingClientRect();
        if (!d) return { x: 0, y: 0 };
        return {
          x: d.left + d.width / 2 - (c.left + c.width / 2),
          y: d.top + d.height / 2 - (c.top + c.height / 2),
        };
      };
      gsap.set(inners, { rotationY: 180 });
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 75%", once: true } })
        .fromTo(deck ?? {}, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.2 })
        .from(cards, {
          x: (_i: number, t: Element) => from(t).x,
          y: (_i: number, t: Element) => from(t).y,
          rotation: (i: number) => (i % 2 ? 14 : -12),
          scale: 0.6,
          duration: 0.45,
          stagger: 0.12,
          ease: "power3.out",
          onStart: () => sound.play("page"),
        })
        .to(deck ?? {}, { opacity: 0, scale: 0.8, duration: 0.2 }, "-=0.1")
        .to(inners, {
          rotationY: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.4)",
        })
        .fromTo(
          q("[data-back-flash]"),
          { opacity: 0.9 },
          { opacity: 0, duration: 0.35, stagger: 0.1 },
          "<",
        );
    },
    ref,
    [calm],
  );

  return (
    <ul ref={ref} data-skill-cards className="relative grid gap-gutter sm:grid-cols-2">
      {/* the deck the cards are dealt from */}
      <li
        aria-hidden
        data-deck
        className="pointer-events-none absolute -top-6 -left-4 z-20 h-40 w-32 opacity-0"
      >
        {[2, 1, 0].map((k) => (
          <span
            key={k}
            className="absolute inset-0 border-[3px] border-aura/70 bg-[radial-gradient(circle,#2c1a20,#140e0d_70%)]"
            style={{ translate: `${k * 4}px ${k * 4}px` }}
          />
        ))}
      </li>

      {skillGroups.map((group, i) => (
        <li
          key={group.name}
          data-skill-card
          className={cn(
            "[perspective:1200px]",
            i === skillGroups.length - 1 && skillGroups.length % 2 === 1 && "sm:col-span-2",
          )}
        >
          <div data-card-inner className="relative h-full [transform-style:preserve-3d]">
            <Tilt max={8} className="h-full [backface-visibility:hidden]">
              <Panel
                as="article"
                tabIndex={0}
                aria-label={group.name}
                onPointerEnter={(e) => cast(group, e.currentTarget)}
                onPointerMove={foil}
                onFocus={(e) => {
                  if (e.target === e.currentTarget) cast(group, e.currentTarget);
                }}
                onPointerLeave={() => onActive(null)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onActive(null);
                }}
                fill={false}
                className="group h-full text-washi/70 transition-[color,filter] duration-300 outline-none hover:text-aura hover:[filter:drop-shadow(0_0_10px_color-mix(in_srgb,var(--aura)_35%,transparent))] focus-visible:text-aura focus-visible:[filter:drop-shadow(0_0_10px_color-mix(in_srgb,var(--aura)_35%,transparent))]"
                innerClassName="bg-[linear-gradient(150deg,var(--twilight),var(--sumi)_60%)] p-6 text-washi"
              >
                {/* holographic foil */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,rgb(255_220_150/0.35)_38%,rgb(170_120_220/0.3)_48%,rgb(120_220_200/0.25)_58%,transparent_75%)] bg-[length:260%_260%] [background-position:var(--mx,50%)_var(--my,50%)] opacity-0 mix-blend-color-dodge transition-opacity duration-300 group-hover:opacity-100"
                />
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
                <h3 className="relative text-24">{group.name}</h3>
                <ul className="relative mt-4 flex flex-wrap gap-2">
                  {group.items.map((item) => {
                    const used = projectsUsingSkill(item);
                    const tip = `${item}-tip`.replace(/[^a-zA-Z0-9-]/g, "");
                    return (
                      <li key={item} className="relative">
                        <button
                          type="button"
                          data-chip={item}
                          data-no-cast
                          aria-describedby={tip}
                          aria-pressed={chain.includes(item)}
                          onPointerEnter={(e) => burst(e.currentTarget)}
                          onFocus={(e) => burst(e.currentTarget)}
                          onClick={() => link(item)}
                          className={cn(
                            "peer relative border-2 border-washi/30 px-2 py-0.5 text-18 transition-colors hover:border-aura hover:text-aura focus-visible:border-aura",
                            chain.includes(item) && "border-kiln bg-kiln/20 text-washi",
                          )}
                        >
                          {item}
                          <svg
                            data-burst
                            aria-hidden
                            viewBox="-30 -30 60 60"
                            className="pointer-events-none absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 overflow-visible"
                          >
                            {Array.from({ length: 8 }, (_, k) => {
                              const a = (k / 8) * Math.PI * 2;
                              return (
                                <line
                                  key={k}
                                  x1={Math.cos(a) * 14}
                                  y1={Math.sin(a) * 10}
                                  x2={Math.cos(a) * 26}
                                  y2={Math.sin(a) * 20}
                                  stroke="var(--kiln)"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  opacity="0"
                                />
                              );
                            })}
                          </svg>
                        </button>
                        <span
                          id={tip}
                          role="tooltip"
                          className="pointer-events-none absolute top-full left-0 z-30 mt-1 w-max max-w-[14rem] scale-90 border-2 border-washi bg-sumi px-2 py-1 text-14 text-washi opacity-0 transition-[opacity,scale] duration-150 peer-hover:scale-100 peer-hover:opacity-100 peer-focus-visible:scale-100 peer-focus-visible:opacity-100"
                        >
                          {used.length
                            ? `${skillsCopy.usedIn}: ${used.join(", ")}`
                            : skillsCopy.notInProject}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {projectsUsing(group).length > 0 && (
                  <p className="relative mt-4 text-14 text-muted">
                    {skillsCopy.usedIn}:{" "}
                    <span className="text-washi">{projectsUsing(group).join(", ")}</span>
                  </p>
                )}
              </Panel>
            </Tilt>
            <CardBack i={i} />
          </div>
        </li>
      ))}

      {/* combo chain overlay */}
      <li aria-hidden className="pointer-events-none absolute inset-0 z-30 list-none">
        <svg data-chain className="absolute inset-0 h-full w-full overflow-visible">
          <polyline
            fill="none"
            stroke="var(--kiln)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="1 0"
            className="[filter:drop-shadow(0_0_6px_var(--agni))]"
          />
        </svg>
        {chain.length >= 2 && (
          <span data-chain-count className="absolute -translate-x-1/2 sfx text-24 text-kiln">
            ×{chain.length} {skillsCopy.chain}
          </span>
        )}
        <svg
          data-combo-circle
          viewBox="0 0 100 100"
          className="absolute size-40 text-aura opacity-0"
        >
          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle
            cx="50"
            cy="50"
            r="32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          <polygon points="50,10 84,70 16,70" fill="none" stroke="var(--kiln)" strokeWidth="1.5" />
          <polygon points="50,90 16,30 84,30" fill="none" stroke="var(--kiln)" strokeWidth="1.5" />
        </svg>
        <ImpactWord ref={word} className="text-36" />
      </li>
      <li className="list-none text-14 text-muted sm:col-span-2">{skillsCopy.comboHint}</li>
    </ul>
  );
}
