"use client";

import { useEffect, useRef, useState } from "react";
import { allSkills, skillsCopy, topSkills } from "@/content";
import { ImpactWord, type ImpactWordHandle } from "@/components/motion/ImpactWord";
import { useCalm } from "@/lib/calm";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion, triggerFor } from "@/lib/motion";
import { sound } from "@/lib/sound";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";

/*
 * "Power level" of the top six skills, as a radar or as gauge bars.
 *
 * Radar: rings draw, a crimson aura charges up from the centre while the
 * shape grows and the values count, a shockwave and a shout land, then a
 * "Lv." seal stamps under each skill and the jagged anti-magic outline
 * flickers on twos. A ring of every skill name orbits behind it, spinning
 * faster while you scroll.
 *
 * Bars: the value dots fly from the radar's corners to the ends of gauge
 * bars that fill behind them. Versus mode: pick two skills (hover, tap or
 * focus) and a VS card compares them.
 */

const C = 200;
const R = 150;
const MAX = 10;
const N = topSkills.length;
const VB = { x: -80, y: -60, w: 560, h: 520 };

const angle = (i: number) => (i / N) * Math.PI * 2 - Math.PI / 2;
const at = (i: number, r: number) =>
  [C + r * Math.cos(angle(i)), C + r * Math.sin(angle(i))] as const;
const pts = (radii: number[]) =>
  radii
    .map((r, i) =>
      at(i, r)
        .map((v) => v.toFixed(1))
        .join(","),
    )
    .join(" ");

const FINAL = topSkills.map((s) => (s.rating / MAX) * R);
const RINGS = [2, 4, 6, 8, 10].map((v) => pts(Array(N).fill((v / MAX) * R)));

// Bars layout, in the same SVG space.
const BAR = { x: 130, w: 300, h: 16, top: 40, gap: 62 };
const barY = (i: number) => BAR.top + i * BAR.gap;
const barEnd = (i: number) => BAR.x + (BAR.w * (topSkills[i]?.rating ?? 0)) / MAX;

function seeded(seed: number) {
  let s = (seed * 2654435761) % 2147483647 || 1;
  const next = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 5; i++) next();
  return next;
}

/** Jagged outline around the final shape: each edge split, pushed outward. */
function jag(seed: number, offset: number) {
  const rand = seeded(seed);
  const out: string[] = [];
  for (let i = 0; i < N; i++) {
    const [x0, y0] = at(i, FINAL[i]!);
    const [x1, y1] = at((i + 1) % N, FINAL[(i + 1) % N]!);
    for (let k = 0; k < 7; k++) {
      const t = k / 7;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      const dx = x - C;
      const dy = y - C;
      const len = Math.hypot(dx, dy) || 1;
      const push = offset + (k % 2 ? rand() * 30 + 10 : rand() * 6);
      out.push(`${(x + (dx / len) * push).toFixed(1)},${(y + (dy / len) * push).toFixed(1)}`);
    }
  }
  return out.join(" ");
}

const AURA = [1, 2, 3].map((seed) => ({ black: jag(seed, 12), red: jag(seed + 10, 16) }));
const ORBIT_R = 238;
const ORBIT = `M ${C},${C} m -${ORBIT_R},0 a ${ORBIT_R},${ORBIT_R} 0 1,1 ${ORBIT_R * 2},0 a ${ORBIT_R},${ORBIT_R} 0 1,1 -${ORBIT_R * 2},0`;

function anchor(i: number) {
  const c = Math.cos(angle(i));
  return Math.abs(c) < 0.2 ? "middle" : c > 0 ? "start" : "end";
}
/** SVG point to % of the figure, for the HTML hit areas laid over it. */
const pct = (x: number, y: number) => ({
  left: `${((x - VB.x) / VB.w) * 100}%`,
  top: `${((y - VB.y) / VB.h) * 100}%`,
});

type Mode = "radar" | "bars";

export function PowerChart({ highlight = [] }: { highlight?: string[] }) {
  const ref = useRef<HTMLElement>(null);
  const word = useRef<ImpactWordHandle>(null);
  const calm = useCalm();
  const [mode, setMode] = useState<Mode>("radar");
  const [vs, setVs] = useState<string[]>([]);
  const vsTimer = useRef(0);
  const lit = (name: string) => highlight.includes(name) || vs.includes(name);
  const dimOthers = highlight.length > 0 || vs.length > 0;

  // Versus: first pick lights one skill, a different second pick shows the card.
  const pick = (name: string) => {
    window.clearTimeout(vsTimer.current);
    setVs((cur) => {
      if (cur.length === 1 && cur[0] !== name) return [cur[0]!, name];
      return [name];
    });
    vsTimer.current = window.setTimeout(() => setVs([]), 3200);
  };
  useEffect(() => () => window.clearTimeout(vsTimer.current), []);

  // Slam the VS card in whenever a pair is complete.
  useEffect(() => {
    if (vs.length !== 2 || prefersReducedMotion()) return;
    const card = ref.current?.querySelector("[data-vs-card]");
    if (!card) return;
    sound.play("impact");
    gsap.fromTo(
      card,
      { scale: 2, rotation: -10, opacity: 0 },
      { scale: 1, rotation: -3, opacity: 1, duration: 0.25, ease: "steps(3)" },
    );
  }, [vs]);

  // Radar <-> bars morph.
  const firstMode = useRef(true);
  useEffect(() => {
    if (firstMode.current) {
      firstMode.current = false;
      return;
    }
    const el = ref.current;
    if (!el) return;
    const q = gsap.utils.selector(el);
    const toBars = mode === "bars";
    const d = prefersReducedMotion() ? 0 : 1;
    const dots = q("[data-dot]");
    gsap.killTweensOf([
      ...q("[data-radar]"),
      ...q("[data-bars]"),
      ...dots,
      ...q("[data-bar-fill]"),
    ]);
    const tl = gsap.timeline();
    if (toBars) {
      tl.to(q("[data-radar]"), {
        autoAlpha: 0,
        scale: 0.85,
        svgOrigin: `${C} ${C}`,
        duration: 0.35 * d,
      })
        .set(q("[data-bars]"), { autoAlpha: 1 })
        .fromTo(
          dots,
          {
            attr: {
              cx: (i: number) => at(i, FINAL[i]!)[0],
              cy: (i: number) => at(i, FINAL[i]!)[1],
            },
          },
          {
            attr: { cx: (i: number) => barEnd(i), cy: (i: number) => barY(i) + BAR.h / 2 },
            duration: 0.55 * d,
            stagger: 0.04 * d,
            ease: "power3.inOut",
          },
          0.1 * d,
        )
        .fromTo(
          q("[data-bar-fill]"),
          { attr: { width: 0 } },
          {
            attr: { width: (i: number) => barEnd(i) - BAR.x },
            duration: 0.55 * d,
            stagger: 0.04 * d,
            ease: "power3.inOut",
          },
          0.1 * d,
        )
        .fromTo(q("[data-bars-text]"), { opacity: 0 }, { opacity: 1, duration: 0.3 * d }, 0.45 * d);
    } else {
      tl.to(q("[data-bars-text]"), { opacity: 0, duration: 0.2 * d })
        .to(
          q("[data-bar-fill]"),
          { attr: { width: 0 }, duration: 0.45 * d, ease: "power3.inOut" },
          0,
        )
        .to(
          dots,
          {
            attr: {
              cx: (i: number) => at(i, FINAL[i]!)[0],
              cy: (i: number) => at(i, FINAL[i]!)[1],
            },
            duration: 0.55 * d,
            stagger: 0.04 * d,
            ease: "power3.inOut",
          },
          0,
        )
        .set(q("[data-bars]"), { autoAlpha: 0 })
        .to(
          q("[data-radar]"),
          { autoAlpha: 1, scale: 1, svgOrigin: `${C} ${C}`, duration: 0.35 * d },
          0.35 * d,
        );
    }
  }, [mode]);

  useMotion(
    (ctx, el) => {
      const q = gsap.utils.selector(el);
      const shape = q("[data-shape]")[0] as SVGPolygonElement | undefined;
      const values = q("[data-value]");
      const variants = q("[data-aura]");
      if (!shape) return;

      if (ctx.reduced) {
        gsap.set(variants.slice(1), { autoAlpha: 0 });
        return;
      }

      // The orbit ring turns slowly, faster while the page scrolls.
      const orbit = gsap.to(q("[data-orbit]"), {
        rotation: 360,
        svgOrigin: `${C} ${C}`,
        duration: 80,
        repeat: -1,
        ease: "none",
        paused: calm,
      });
      const spin = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          if (calm) return;
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 120, 14);
          gsap.to(orbit, { timeScale: self.direction * boost, duration: 0.2, overwrite: true });
          gsap.to(orbit, { timeScale: 1, duration: 1.2, delay: 0.25, overwrite: false });
        },
        onToggle: (self) => (self.isActive && !calm ? orbit.play() : orbit.pause()),
      });

      // One progress value drives the shape (staggered per vertex) and the counts.
      const grow = { p: 0 };
      const ease = gsap.parseEase("ink");
      const dots = q("[data-dot]");
      const paint = () => {
        const radii = FINAL.map(
          (r, i) => r * ease(gsap.utils.clamp(0, 1, grow.p * 1.3 - i * 0.06)),
        );
        shape.setAttribute("points", pts(radii));
        radii.forEach((r, i) => {
          const [x, y] = at(i, r);
          dots[i]?.setAttribute("cx", x.toFixed(1));
          dots[i]?.setAttribute("cy", y.toFixed(1));
        });
        values.forEach((v, i) => {
          const target = topSkills[i]?.rating ?? 0;
          v.textContent = String(Math.round(target * gsap.utils.clamp(0, 1, grow.p)));
        });
      };

      gsap.set(variants, { autoAlpha: 0 });
      gsap.set(q("[data-pulse]"), { autoAlpha: 0 });

      // Flicker on twos (12fps) between three jagged variants, only while on screen.
      const flicker = gsap.timeline({ repeat: -1, paused: true });
      variants.forEach((v, i) => {
        flicker.set(variants, { autoAlpha: 0 }, i / 12).set(v, { autoAlpha: 1 }, i / 12);
      });
      flicker.set({}, {}, variants.length / 12);
      let armed = false;
      const onScreen = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive && armed ? flicker.play() : flicker.pause()),
      });

      const tl = gsap
        .timeline({ scrollTrigger: triggerFor(el, "scroll", "top 75%") })
        .from(q("[data-ring]"), { drawSVG: "50% 50%", duration: 0.6, stagger: 0.06, ease: "ink" })
        .from(q("[data-axis]"), { drawSVG: "0%", duration: 0.4, stagger: 0.04 }, 0.15)
        .from(q("[data-label]"), { opacity: 0, y: 6, duration: 0.3, stagger: 0.05 }, 0.3)
        .from(q("[data-orbit]"), { opacity: 0, duration: 0.8 }, 0.2);

      // Power-up charge: the aura flares while the shape grows.
      if (!calm) {
        tl.fromTo(
          q("[data-flare]"),
          { scale: 0.15, opacity: 0 },
          { scale: 1.1, opacity: 0.85, duration: 1.2, ease: "power2.in", svgOrigin: `${C} ${C}` },
          0.5,
        )
          .to(
            q("[data-flare]"),
            { opacity: 0.22, scale: 1, duration: 0.6, svgOrigin: `${C} ${C}` },
            1.7,
          )
          .fromTo(
            q("[data-shake]"),
            { x: 0 },
            { keyframes: { x: [2, -2, 2, -1, 0] }, duration: 0.5, ease: "none" },
            1.2,
          );
      }
      tl.fromTo(
        grow,
        { p: 0 },
        { p: 1, duration: 1.3, ease: "none", onStart: paint, onUpdate: paint },
        0.55,
      )
        .fromTo(q("[data-fill]"), { fillOpacity: 0 }, { fillOpacity: 1, duration: 0.5 }, 1.2)
        .fromTo(
          q("[data-pulse]"),
          { autoAlpha: 0.9, scale: 0.6 },
          {
            autoAlpha: 0,
            scale: 1.25,
            duration: 0.9,
            stagger: 0.18,
            ease: "power2.out",
            svgOrigin: `${C} ${C}`,
          },
          1.75,
        );
      if (!calm) {
        tl.fromTo(
          q("[data-shock]"),
          { scale: 0.3, opacity: 1 },
          { scale: 1.6, opacity: 0, duration: 0.6, ease: "power2.out", svgOrigin: `${C} ${C}` },
          1.8,
        ).call(() => word.current?.play(skillsCopy.powerWord, 78, 14), [], 1.8);
      }
      // Level seals stamp in one by one.
      tl.fromTo(
        q("[data-stamp]"),
        { opacity: 0, scale: 2.2 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.18,
          stagger: 0.12,
          ease: "steps(3)",
          transformOrigin: "50% 50%",
          onStart: () => sound.play("stamp"),
        },
        2.0,
      ).call(
        () => {
          armed = true;
          flicker.play();
        },
        [],
        2.1,
      );

      return () => {
        flicker.kill();
        onScreen.kill();
        spin.kill();
        orbit.kill();
      };
    },
    ref,
    [calm],
  );

  const vsCard =
    vs.length === 2
      ? vs.map((n) => ({ name: n, rating: topSkills.find((s) => s.name === n)?.rating ?? 0 }))
      : null;

  return (
    <figure ref={ref} className="relative mx-auto w-full max-w-[34rem]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-14 text-muted">{skillsCopy.vsHint}</p>
        <div
          role="group"
          aria-label={skillsCopy.chartStyle}
          className="flex border-2 border-washi/60"
        >
          {(["radar", "bars"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                "px-2.5 py-0.5 font-display text-14 transition-colors",
                mode === m ? "bg-washi text-sumi" : "text-washi hover:text-aura",
              )}
            >
              {m === "radar" ? skillsCopy.radar : skillsCopy.bars}
            </button>
          ))}
        </div>
      </div>

      <div data-shake className="relative">
        <svg
          aria-hidden
          viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
          className="w-full overflow-visible font-display"
          fill="none"
        >
          <defs>
            <radialGradient id="power-flare">
              <stop offset="0" stopColor="#ffb36b" stopOpacity="0.7" />
              <stop offset="0.45" stopColor="var(--agni)" stopOpacity="0.45" />
              <stop offset="1" stopColor="var(--agni)" stopOpacity="0" />
            </radialGradient>
            <path id="power-orbit" d={ORBIT} />
          </defs>

          <g data-radar>
            <circle data-flare cx={C} cy={C} r="190" fill="url(#power-flare)" opacity="0" />
            <g data-orbit opacity="0.45">
              <circle
                cx={C}
                cy={C}
                r={ORBIT_R + 16}
                stroke="var(--aura)"
                strokeOpacity="0.35"
                strokeDasharray="2 8"
              />
              <circle cx={C} cy={C} r={ORBIT_R - 14} stroke="var(--aura)" strokeOpacity="0.25" />
              <text className="text-[13px]" fill="var(--aura)">
                <textPath
                  href="#power-orbit"
                  textLength={2 * Math.PI * ORBIT_R - 8}
                  lengthAdjust="spacing"
                >
                  {allSkills.join(" ✦ ")} ✦
                </textPath>
              </text>
            </g>
            {RINGS.map((p, i) => (
              <polygon
                key={i}
                data-ring
                points={p}
                stroke="var(--tone)"
                strokeOpacity={i === 4 ? 0.8 : 0.35}
              />
            ))}
            {topSkills.map((_, i) => {
              const [x, y] = at(i, R);
              return (
                <line
                  key={i}
                  data-axis
                  x1={C}
                  y1={C}
                  x2={x}
                  y2={y}
                  stroke="var(--tone)"
                  strokeOpacity="0.35"
                />
              );
            })}

            {AURA.map((v, i) => (
              <g
                key={i}
                data-aura
                strokeLinejoin="miter"
                className="[filter:drop-shadow(0_0_5px_var(--agni))]"
              >
                <polygon points={v.black} stroke="var(--sumi)" strokeWidth="11" />
                <polygon points={v.red} stroke="var(--agni)" strokeWidth="3" />
              </g>
            ))}

            <polygon
              data-fill
              data-shape
              points={pts(FINAL)}
              fill="rgb(201 162 74 / 0.18)"
              stroke="var(--aura)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {[0, 1].map((i) => (
              <polygon
                key={i}
                data-pulse
                points={pts(FINAL)}
                stroke="var(--aura)"
                strokeWidth="2"
              />
            ))}
            <circle
              data-shock
              cx={C}
              cy={C}
              r={R}
              stroke="var(--kiln)"
              strokeWidth="4"
              opacity="0"
            />

            {/* Spell-cast / versus highlight: a lit spoke out to each chosen value */}
            {topSkills.map((s, i) => {
              const [x, y] = at(i, FINAL[i]!);
              return (
                <line
                  key={`lit-${s.name}`}
                  x1={C}
                  y1={C}
                  x2={x}
                  y2={y}
                  stroke="var(--aura)"
                  strokeWidth="3"
                  opacity={lit(s.name) ? 1 : 0}
                  className="[filter:drop-shadow(0_0_6px_var(--aura))] transition-opacity duration-300"
                />
              );
            })}

            {topSkills.map((s, i) => {
              const [x, y] = at(i, R + 26);
              return (
                <g key={s.name}>
                  <text
                    data-label
                    x={x}
                    y={y}
                    textAnchor={anchor(i)}
                    dominantBaseline="middle"
                    fill={lit(s.name) ? "var(--aura)" : "var(--washi)"}
                    fillOpacity={dimOthers && !lit(s.name) ? 0.4 : 1}
                    className="text-[15px] transition-[fill-opacity] duration-300 max-sm:text-[20px]"
                  >
                    {s.name}{" "}
                    <tspan data-value fill="var(--aura)">
                      {s.rating}
                    </tspan>
                  </text>
                  <g data-stamp transform={`translate(${x} ${y + 22})`}>
                    <g
                      transform={`translate(${anchor(i) === "start" ? 22 : anchor(i) === "end" ? -22 : 0} 0) rotate(-8)`}
                    >
                      <rect
                        x="-21"
                        y="-10"
                        width="42"
                        height="20"
                        stroke="var(--agni)"
                        strokeWidth="2"
                        fill="rgb(29 22 20 / 0.6)"
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="var(--kiln)"
                        className="text-[11px]"
                      >
                        {skillsCopy.lv}
                        {s.rating}
                      </text>
                    </g>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Gauge bars, hidden until the morph */}
          <g data-bars style={{ visibility: "hidden", opacity: 0 }}>
            {topSkills.map((s, i) => (
              <g key={s.name}>
                <rect
                  x={BAR.x}
                  y={barY(i)}
                  width={BAR.w}
                  height={BAR.h}
                  stroke="var(--washi)"
                  strokeOpacity="0.5"
                  strokeWidth="2"
                />
                <rect
                  data-bar-fill
                  x={BAR.x}
                  y={barY(i)}
                  width={0}
                  height={BAR.h}
                  fill="url(#power-bar)"
                  opacity={dimOthers && !lit(s.name) ? 0.35 : 1}
                  className="transition-opacity duration-300"
                />
                <g data-bars-text>
                  <text
                    x={BAR.x - 14}
                    y={barY(i) + BAR.h / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill={lit(s.name) ? "var(--aura)" : "var(--washi)"}
                    className="text-[16px]"
                  >
                    {s.name}
                  </text>
                  <g transform={`translate(${barEnd(i) + 34} ${barY(i) + BAR.h / 2}) rotate(-8)`}>
                    <rect
                      x="-21"
                      y="-10"
                      width="42"
                      height="20"
                      stroke="var(--agni)"
                      strokeWidth="2"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="var(--kiln)"
                      className="text-[11px]"
                    >
                      {skillsCopy.lv}
                      {s.rating}
                    </text>
                  </g>
                </g>
              </g>
            ))}
            <defs>
              <linearGradient id="power-bar" x1="0" x2="1">
                <stop offset="0" stopColor="var(--agni)" />
                <stop offset="1" stopColor="var(--kiln)" />
              </linearGradient>
            </defs>
          </g>

          {/* Value dots shared by both views: they fly between corners and bar ends */}
          {topSkills.map((s, i) => {
            const [x, y] = at(i, FINAL[i]!);
            return (
              <circle
                key={`dot-${s.name}`}
                data-dot
                cx={x}
                cy={y}
                r={lit(s.name) ? 7 : 5}
                fill="var(--aura)"
                className="transition-[r] duration-200"
              />
            );
          })}
        </svg>

        {/* Hit areas for versus mode, over each label or bar */}
        {topSkills.map((s, i) => {
          const pos =
            mode === "radar" ? pct(...at(i, R + 26)) : pct(BAR.x - 70, barY(i) + BAR.h / 2);
          return (
            <button
              key={s.name}
              type="button"
              aria-label={skillsCopy.compare(s.name)}
              aria-pressed={vs.includes(s.name)}
              onPointerEnter={(e) => e.pointerType === "mouse" && pick(s.name)}
              onFocus={() => pick(s.name)}
              onClick={() => pick(s.name)}
              data-no-cast
              className="absolute h-9 w-28 -translate-x-1/2 -translate-y-1/2 rounded-sm focus-visible:outline-2 focus-visible:outline-aura"
              style={pos}
            />
          );
        })}

        {vsCard && (
          <div
            data-vs-card
            role="status"
            className="pointer-events-none absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 -rotate-3 items-center gap-3 border-[3px] border-washi bg-sumi px-4 py-3 font-display shadow-[6px_6px_0_var(--agni)]"
          >
            <span className="text-right">
              <span className="block text-18">{vsCard[0]!.name}</span>
              <span className="block text-36 text-aura">{vsCard[0]!.rating}</span>
            </span>
            <span className="sfx text-56 text-kiln">{skillsCopy.vs}</span>
            <span>
              <span className="block text-18">{vsCard[1]!.name}</span>
              <span className="block text-36 text-aura">{vsCard[1]!.rating}</span>
            </span>
          </div>
        )}
        <ImpactWord ref={word} className="text-56" />
      </div>

      <figcaption className="mt-2 text-center text-14 text-muted">
        {skillsCopy.chartCaption}
      </figcaption>

      <table className="sr-only">
        <caption>{skillsCopy.chartCaption}</caption>
        <tbody>
          {topSkills.map((s) => (
            <tr key={s.name}>
              <th scope="row">{s.name}</th>
              <td>
                {s.rating} {skillsCopy.outOf}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
