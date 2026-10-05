"use client";

import { useRef, useState } from "react";
import { Rune } from "@/components/ui/Rune";
import { arcs, experienceCopy, publishedPosts, sections } from "@/content";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { ImpactWord, type ImpactWordHandle } from "@/components/motion/ImpactWord";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { Panel } from "@/components/ui/Panel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useCalm } from "@/lib/calm";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { sound } from "@/lib/sound";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";
import {
  NextMission,
  Objectives,
  Polaroids,
  ResultSlip,
  XpGauges,
} from "./experience/MissionParts";

const pad = (n: number) => String(n).padStart(2, "0");
const SVG_NS = "http://www.w3.org/2000/svg";
const FOOT =
  "M0 -4 C2 -4 2.5 -1 2 2 C1.5 4 -1.5 4 -2 2 C-2.5 -1 -2 -4 0 -4 Z M-1.5 -6.5 a0.9 0.9 0 1 0 0.1 0 M1.5 -6.5 a0.9 0.9 0 1 0 0.1 0";

/** Red ink dripping off the bottom of a mission card toward the next one. */
function Bleed() {
  return (
    <svg
      aria-hidden
      data-bleed
      viewBox="0 0 120 60"
      preserveAspectRatio="none"
      className="pointer-events-none absolute top-full left-6 h-16 w-28 origin-top md:left-10"
    >
      <path
        d="M0 0 H120 C110 6 104 4 100 10 C98 20 96 34 92 34 C88 34 88 20 84 12 C78 6 70 8 64 14 C60 24 60 50 54 50 C48 50 50 24 44 14 C36 6 26 8 20 12 C16 18 16 28 12 28 C8 28 8 14 4 8 Z"
        fill="var(--agni)"
        opacity="0.9"
      />
    </svg>
  );
}

/**
 * Missions on a quest map. On wide screens each mission's number, title and
 * a big flipping year stay pinned on the left while its card scrolls by on
 * the right. A winding map route links the missions: it burns like a fuse as
 * you scroll, a spark leads, ink footprints appear behind it and each node
 * ignites as the spark arrives. Each mission opens with a title card, its
 * card drops onto the board pinned with tacks, a dossier stamp lands, the
 * objectives tick off, stats fill (merge icons, grade gauges, a result slip),
 * project polaroids pin up, and red ink bleeds down toward the next mission.
 * Hovering a card replays it. Speed lines build with every mission. The last
 * slot is the open one: the internship being looked for.
 */
export function Experience() {
  const ref = useRef<HTMLElement>(null);
  const word = useRef<ImpactWordHandle>(null);
  const calm = useCalm();
  const [replay, setReplay] = useState<number | null>(null);
  const replayTimer = useRef(0);

  const onReplay = (i: number, card: HTMLElement) => {
    if (calm || prefersReducedMotion()) return;
    window.clearTimeout(replayTimer.current);
    setReplay(i);
    replayTimer.current = window.setTimeout(() => setReplay(null), 650);
    gsap.fromTo(card, { x: -4 }, { x: 0, duration: 0.45, ease: "elastic.out(1.2, 0.3)" });
    const box = ref.current?.getBoundingClientRect();
    const r = card.getBoundingClientRect();
    if (box) {
      word.current?.play(
        experienceCopy.words[i % experienceCopy.words.length] ?? "",
        ((r.right - 60 - box.left) / box.width) * 100,
        ((r.top + 30 - box.top) / box.height) * 100,
      );
    }
  };

  useMotion(
    (ctx, el) => {
      const q = gsap.utils.selector(el);
      const box = q("[data-route-box]")[0] as HTMLElement | undefined;
      const base = q("[data-route-base]")[0] as SVGPathElement | undefined;
      const burn = q("[data-route-burn]")[0] as SVGPathElement | undefined;
      const spark = q("[data-spark]")[0] as SVGGElement | undefined;
      const feet = q("[data-feet]")[0] as SVGGElement | undefined;
      const nodes = q("[data-node]") as HTMLElement[];
      if (!box || !base || !burn || !spark || !feet) return;
      const still = ctx.reduced || calm;

      // Build the winding route through every node (re-measured on resize).
      let total = 1;
      let nodeAt: number[] = [];
      let prints: { el: SVGGElement; at: number }[] = [];
      let progress = still ? 1 : 0;
      const build = () => {
        const b = box.getBoundingClientRect();
        const pts = nodes.map((n) => {
          const r = n.getBoundingClientRect();
          return { x: r.left + r.width / 2 - b.left, y: r.top + r.height / 2 - b.top };
        });
        if (!pts.length) return;
        let d = `M${pts[0]!.x} 0 L${pts[0]!.x} ${pts[0]!.y}`;
        pts.slice(1).forEach((p, k) => {
          const o = pts[k]!;
          const w = k % 2 ? -46 : 46;
          const dy = p.y - o.y;
          d += ` C${o.x + w} ${o.y + dy * 0.3}, ${p.x - w} ${o.y + dy * 0.7}, ${p.x} ${p.y}`;
        });
        base.setAttribute("d", d);
        burn.setAttribute("d", d);
        total = base.getTotalLength() || 1;
        // where along the route each node sits
        nodeAt = pts.map((p) => {
          let best = 0;
          let bestD = Infinity;
          for (let l = 0; l <= total; l += 6) {
            const q2 = base.getPointAtLength(l);
            const dd = Math.hypot(q2.x - p.x, q2.y - p.y);
            if (dd < bestD) {
              bestD = dd;
              best = l;
            }
          }
          return best;
        });
        // ink footprints every so often, alternating sides
        feet.replaceChildren();
        prints = [];
        for (let l = 40, k = 0; l < total - 20; l += 58, k++) {
          const p0 = base.getPointAtLength(l);
          const p1 = base.getPointAtLength(Math.min(l + 2, total));
          const ang = (Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI + 90;
          const side = k % 2 ? 7 : -7;
          const rad = ((ang - 90) * Math.PI) / 180;
          const g = document.createElementNS(SVG_NS, "g");
          g.setAttribute(
            "transform",
            `translate(${p0.x + Math.cos(rad + Math.PI / 2) * side} ${p0.y + Math.sin(rad + Math.PI / 2) * side}) rotate(${ang})`,
          );
          const path = document.createElementNS(SVG_NS, "path");
          path.setAttribute("d", FOOT);
          path.setAttribute("fill", "var(--washi)");
          g.appendChild(path);
          feet.appendChild(g);
          prints.push({ el: g, at: l });
        }
        paint();
      };
      const paint = () => {
        const len = progress * total;
        burn.style.strokeDasharray = `${len} ${total}`;
        const head = base.getPointAtLength(len);
        spark.setAttribute("transform", `translate(${head.x} ${head.y})`);
        spark.style.opacity = !still && progress > 0.001 && progress < 0.999 ? "1" : "0";
        prints.forEach((p) => (p.el.style.opacity = p.at <= len ? "0.55" : "0"));
        nodes.forEach((n, k) => {
          const lit = (nodeAt[k] ?? Infinity) <= len + 4;
          if (lit && !n.hasAttribute("data-lit")) {
            n.setAttribute("data-lit", "");
            if (!still) {
              gsap.fromTo(
                n.querySelector("[data-node-burst]"),
                { scale: 0.3, opacity: 1 },
                { scale: 2.4, opacity: 0, duration: 0.5, ease: "power2.out" },
              );
            }
          } else if (!lit) n.removeAttribute("data-lit");
        });
      };
      build();
      const ro = new ResizeObserver(() => build());
      ro.observe(box);

      if (!still) {
        ScrollTrigger.create({
          trigger: box,
          start: "top 65%",
          end: "bottom 65%",
          scrub: 0.3,
          onUpdate: (self) => {
            progress = self.progress;
            paint();
          },
        });
        // Speed lines build with every mission passed.
        gsap.fromTo(
          q("[data-xp-lines]"),
          { opacity: 0.04 },
          {
            opacity: 0.5,
            ease: "none",
            scrollTrigger: { trigger: box, start: "top 70%", end: "bottom 30%", scrub: true },
          },
        );
      }

      if (ctx.reduced) return () => ro.disconnect();

      q("[data-arc]").forEach((arc, i) => {
        const a = gsap.utils.selector(arc);
        const year = a("[data-year]")[0] as HTMLElement | undefined;
        const tl = gsap.timeline({ scrollTrigger: { trigger: arc, start: "top 72%", once: true } });

        if (!calm) {
          // Title card slams in, then splits open.
          tl.set(a("[data-titlecard]"), { autoAlpha: 1 })
            .fromTo(
              a("[data-tc='top']"),
              { xPercent: -100 },
              { xPercent: 0, duration: 0.22, ease: "power4.out" },
            )
            .fromTo(
              a("[data-tc='bottom']"),
              { xPercent: 100 },
              { xPercent: 0, duration: 0.22, ease: "power4.out" },
              "<",
            )
            .call(() => sound.play("impact"))
            .to(
              a("[data-tc='top']"),
              { yPercent: -110, duration: 0.35, ease: "power3.in" },
              "+=0.35",
            )
            .to(a("[data-tc='bottom']"), { yPercent: 110, duration: 0.35, ease: "power3.in" }, "<")
            .set(a("[data-titlecard]"), { autoAlpha: 0 });
        }
        const at = calm ? 0 : 0.7;
        // The year flips like a calendar from the previous mission's year.
        if (year) {
          const final = year.textContent ?? "";
          const prev = year.dataset.prev;
          if (prev && prev !== final) {
            tl.call(() => void (year.textContent = prev), [], at)
              .fromTo(
                year,
                { rotationX: 0 },
                { rotationX: 90, duration: 0.18, ease: "power2.in", transformPerspective: 600 },
                at + 0.1,
              )
              .call(() => void (year.textContent = final), [], at + 0.28)
              .fromTo(
                year,
                { rotationX: -90 },
                { rotationX: 0, duration: 0.3, ease: "back.out(2)", transformPerspective: 600 },
                at + 0.28,
              );
          }
          gsap.fromTo(
            year,
            { yPercent: 25 },
            {
              yPercent: -25,
              ease: "none",
              scrollTrigger: { trigger: arc, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        }
        // The card drops onto the board and gets pinned.
        tl.fromTo(
          a("[data-card]"),
          { y: -140, rotation: i % 2 ? 6 : -6, opacity: 0 },
          { y: 0, rotation: 0, opacity: 1, duration: 0.8, ease: "bounce.out" },
          at,
        )
          .fromTo(
            a("[data-tack]"),
            { y: -30, scale: 2.4, opacity: 0 },
            { y: 0, scale: 1, opacity: 1, duration: 0.2, stagger: 0.1, ease: "back.out(3)" },
            at + 0.65,
          )
          .fromTo(
            a("[data-dossier]"),
            { scale: 2.6, opacity: 0, rotation: -24 },
            {
              scale: 1,
              opacity: 1,
              rotation: -10,
              duration: 0.2,
              ease: "steps(3)",
              onStart: () => sound.play("stamp"),
            },
            at + 0.95,
          )
          .from(
            a("[data-tick]"),
            { drawSVG: "0%", duration: 0.25, stagger: 0.2, ease: "power2.out" },
            at + 1.1,
          )
          .from(
            a("[data-merge]"),
            { scale: 0, rotation: -30, duration: 0.25, stagger: 0.08, ease: "back.out(3)" },
            at + 1.1,
          )
          .from(
            a("[data-gauge]"),
            { scaleX: 0, duration: 0.9, stagger: 0.15, ease: "power3.out" },
            at + 1.1,
          )
          .fromTo(
            a("[data-slip-row]"),
            { clipPath: "inset(0% 100% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, stagger: 0.3, ease: "steps(12)" },
            at + 1.2,
          )
          .from(
            a("[data-slip-up]"),
            { y: 10, opacity: 0, scale: 1.6, duration: 0.25, ease: "back.out(3)" },
            at + 1.7,
          )
          .from(
            a("[data-slip-stamp]"),
            { scale: 2.4, opacity: 0, duration: 0.2, ease: "steps(3)" },
            at + 2,
          )
          .from(
            a("[data-polaroid]"),
            {
              y: -50,
              rotation: (k: number) => (k % 2 ? 18 : -16),
              opacity: 0,
              duration: 0.6,
              stagger: 0.15,
              ease: "bounce.out",
            },
            at + 1.4,
          );

        if (!calm) {
          // Red ink bleeds off the card toward the next mission.
          gsap.fromTo(
            a("[data-bleed]"),
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: { trigger: arc, start: "bottom 80%", end: "bottom 35%", scrub: 0.4 },
            },
          );
        }
      });

      const next = q("[data-next]")[0];
      if (next)
        gsap.from(next, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          ease: "ink",
          scrollTrigger: { trigger: next, start: "top 85%", once: true },
        });

      return () => ro.disconnect();
    },
    ref,
    [calm],
  );

  return (
    <section
      ref={ref}
      id={sections.experience.id}
      data-mode="colour"
      aria-labelledby={`${sections.experience.id}-heading`}
      className="relative isolate overflow-x-clip px-4 py-24 md:px-10 md:py-32"
    >
      <div
        aria-hidden
        data-xp-lines
        className="calm-hide pointer-events-none absolute inset-0 -z-10 text-washi/30 opacity-0"
      >
        <SpeedLines variant="parallel" intensity={0.7} />
      </div>
      <SectionHeading copy={sections.experience} />

      <div data-route-box className="relative">
        {/* The quest route: base trail, burning fuse, footprints, spark */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
        >
          <path
            data-route-base
            fill="none"
            stroke="var(--washi)"
            strokeOpacity="0.25"
            strokeWidth="3"
            strokeDasharray="2 9"
            strokeLinecap="round"
          />
          <g data-feet />
          <path
            data-route-burn
            fill="none"
            stroke="var(--kiln)"
            strokeWidth="4"
            strokeLinecap="round"
            className="[filter:drop-shadow(0_0_6px_var(--agni))]"
            style={{ strokeDasharray: "0 1" }}
          />
          <g data-spark opacity="0">
            <circle r="10" fill="rgb(255 190 120 / 0.35)" />
            <circle r="4" fill="#fff4e0" />
            <path
              d="M0 -12 L2 -3 L10 -6 L3 0 L9 7 L1 3 L-2 11 L-2 2 L-10 5 L-3 -1 L-9 -8 L-1 -4 Z"
              fill="var(--kiln)"
              className="animate-[rune-spin_0.6s_linear_infinite]"
            />
          </g>
        </svg>

        <ol className="relative space-y-24 md:space-y-32">
          {arcs.map((arc, i) => {
            const when =
              arc.start === arc.end ? arc.start : `${arc.start} ${experienceCopy.to} ${arc.end}`;
            const prevYear = i > 0 ? arcs[i - 1]!.start : undefined;
            return (
              <li
                key={`${arc.org}-${arc.start}`}
                data-arc
                className="relative grid gap-8 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-14"
              >
                {/* Title card for this mission */}
                <div
                  aria-hidden
                  data-titlecard
                  className="pointer-events-none invisible absolute inset-x-0 -top-6 z-30 h-40 overflow-hidden"
                >
                  <div
                    data-tc="top"
                    className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-washi"
                  >
                    <p className="absolute inset-x-0 top-full -translate-y-1/2 text-center font-display text-36 whitespace-nowrap text-sumi md:text-56">
                      {experienceCopy.mission} {pad(i + 1)} · {arc.role}
                    </p>
                  </div>
                  <div
                    data-tc="bottom"
                    className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-washi"
                  >
                    <p className="absolute inset-x-0 top-0 -translate-y-1/2 text-center font-display text-36 whitespace-nowrap text-sumi md:text-56">
                      {experienceCopy.mission} {pad(i + 1)} · {arc.role}
                    </p>
                  </div>
                  <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-agni" />
                </div>

                {/* Pinned left column: mission number, title, flipping year */}
                <div className="lg:sticky lg:top-28 lg:self-start">
                  <p className="font-display text-14 text-muted">
                    {experienceCopy.mission} {pad(i + 1)}
                  </p>
                  <p className="mt-1 text-24 md:text-36">{arc.role}</p>
                  <p className="mt-1 text-18 text-muted">{when}</p>
                  <p
                    aria-hidden
                    data-year
                    data-prev={prevYear}
                    className="mt-4 inline-block font-display text-[clamp(3.5rem,6.5vw,5.5rem)] leading-none text-transparent [-webkit-text-stroke:2px_color-mix(in_srgb,var(--washi)_45%,transparent)]"
                  >
                    {arc.start}
                  </p>
                </div>

                {/* Right column: route node and the mission card */}
                <div className="relative pl-12 md:pl-16">
                  <span
                    data-node
                    aria-hidden
                    className="group/node absolute top-8 left-1 grid size-6 place-items-center md:left-3"
                  >
                    <span
                      data-node-burst
                      className="absolute inset-0 rounded-full bg-kiln opacity-0"
                    />
                    <span className="size-4 rotate-45 border-[3px] border-washi bg-sumi transition-colors duration-300 group-data-lit/node:bg-kiln group-data-lit/node:shadow-[0_0_14px_var(--agni)]" />
                  </span>

                  <div data-card className="relative max-w-3xl">
                    {[12, 88].map((x) => (
                      <span
                        key={x}
                        data-tack
                        aria-hidden
                        className="absolute -top-2 z-20 size-5 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_35%,#ff7a6a,var(--agni)_60%,#6a1014)] shadow-[0_3px_3px_rgb(0_0_0/0.45)]"
                        style={{ left: `${x}%` }}
                      />
                    ))}
                    <Panel
                      as="article"
                      shape="torn-bottom"
                      page={i + 9}
                      data-mode="print"
                      onPointerEnter={(e) =>
                        e.pointerType === "mouse" && onReplay(i, e.currentTarget)
                      }
                      className="text-sumi"
                      innerClassName="p-6 pb-10 pl-10 md:p-8 md:pb-12 md:pl-12"
                    >
                      {/* notebook perforations */}
                      <span
                        aria-hidden
                        className="absolute inset-y-6 left-3 flex flex-col justify-between"
                      >
                        {Array.from({ length: 8 }, (_, k) => (
                          <span
                            key={k}
                            className="size-2.5 rounded-full bg-sumi/80 shadow-[inset_0_1px_1px_rgb(0_0_0/0.6)]"
                          />
                        ))}
                      </span>
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -inset-x-6 top-0 h-28 text-sumi"
                      >
                        <SpeedLines variant="parallel" intensity={replay === i ? 0.8 : 0} />
                      </div>
                      {arc.status && (
                        <span
                          data-dossier
                          className="relative mb-3 inline-block -rotate-6 border-[3px] border-agni px-2 py-0.5 font-display text-14 text-agni sm:absolute sm:top-4 sm:right-4 sm:mb-0 sm:-rotate-10 md:text-18"
                        >
                          {experienceCopy.status[arc.status]}
                        </span>
                      )}
                      <h3 className="relative text-24 sm:pr-32 md:text-36">{arc.role}</h3>
                      <p className="mt-2 text-18">{arc.org}</p>

                      <Objectives arc={arc} />
                      <XpGauges arc={arc} />
                      <ResultSlip arc={arc} />
                      <Polaroids arc={arc} />
                      {arc.grades && publishedPosts[0] && (
                        <TransitionLink
                          href={`/log/${publishedPosts[0].slug}`}
                          transition="page"
                          turnLabel={publishedPosts[0].title}
                          className="mt-6 inline-block ink-link font-display text-18"
                        >
                          {experienceCopy.devLog}: {publishedPosts[0].title} →
                        </TransitionLink>
                      )}

                      {arc.stack.length > 0 && (
                        <ul className="mt-6 flex flex-wrap gap-2">
                          {arc.stack.map((t) => (
                            <li key={t} className={cn("border-2 border-sumi px-2 py-0.5 text-14")}>
                              {t}
                            </li>
                          ))}
                        </ul>
                      )}
                    </Panel>
                    <Bleed />
                  </div>
                </div>
              </li>
            );
          })}

          {/* The open slot */}
          <li className="relative grid gap-8 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-14">
            <div className="hidden lg:block" />
            <div className="relative pl-12 md:pl-16">
              <span
                data-node
                aria-hidden
                className="group/node absolute top-8 left-1 grid size-6 place-items-center md:left-3"
              >
                <span data-node-burst className="absolute inset-0 rounded-full bg-kiln opacity-0" />
                <span className="size-4 rotate-45 border-[3px] border-dashed border-washi bg-sumi group-data-lit/node:border-kiln" />
              </span>
              <NextMission n={arcs.length + 1} />
            </div>
          </li>
        </ol>
        <Rune index={3} className="relative mt-8 ml-0 lg:ml-[calc(20rem+3.5rem)]" />
      </div>
      <ImpactWord ref={word} className="text-56" />
    </section>
  );
}
