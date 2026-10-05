"use client";

import { useRef } from "react";
import { aboutCopy } from "@/content";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { Panel } from "@/components/ui/Panel";
import { gsap } from "@/lib/gsap";
import { impactFrame } from "@/lib/impact";
import { useCalm } from "@/lib/calm";
import { useMotion } from "@/lib/use-motion";
import { drawRig, makeRig, POSES, Stickman, type Pose } from "./stickman";

const copy = aboutCopy.montage;
const SWINGS = 28;
const X = 150;
const STILL = makeRig("strike", X, 1);

const mix = (a: Pose, b: Pose, t: number) => a.map((v, i) => v + (b[i]! - v) * t);
/** One swing: wind up slowly, cut fast, recover. */
function swing(phase: number): Pose {
  if (phase < 0.55)
    return mix(POSES.idle, POSES.windup, gsap.parseEase("power2.out")(phase / 0.55));
  if (phase < 0.75)
    return mix(POSES.windup, POSES.strike, gsap.parseEase("power3.in")((phase - 0.55) / 0.2));
  return mix(POSES.strike, POSES.idle, (phase - 0.75) / 0.25);
}

/**
 * The training arc: a stickman swings as you scroll while a rep counter
 * races up to 1000 (accelerating, like a montage). Ghost frames trail each
 * swing; at 1000 a sound word stamps in. A still frame under reduced motion.
 */
export function TrainingMontage({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const calm = useCalm();

  useMotion(
    (ctx, el) => {
      if (ctx.reduced || calm) return;
      const q = gsap.utils.selector(el);
      const hero = q("[data-hero]")[0] as unknown as SVGGElement | undefined;
      const ghosts = q("[data-ghost]") as unknown as SVGGElement[];
      const count = q("[data-count]")[0];
      const done = q("[data-done]")[0];
      const lines = q("[data-lines]")[0];
      const rig = makeRig("idle", X, 1);
      const ghostRigs = ghosts.map(() => makeRig("idle", X, 1));
      let finished = false;
      gsap.set(done ?? {}, { opacity: 0, scale: 2 });

      const render = (p: number) => {
        const e = gsap.parseEase("power2.in")(p);
        const phase = (e * SWINGS) % 1;
        rig.pose = swing(phase);
        drawRig(hero ?? null, rig);
        ghostRigs.forEach((g, i) => {
          g.pose = swing((phase - 0.06 * (i + 1) + 1) % 1);
          drawRig(ghosts[i] ?? null, g);
        });
        const reps = Math.round(e * 1000);
        if (count) count.textContent = String(reps);
        if (lines) lines.style.opacity = String(Math.min(e * 1.4, 1));
        if (reps >= 1000 && !finished) {
          finished = true;
          impactFrame(0.8);
          gsap.to(done ?? {}, {
            opacity: 1,
            scale: 1,
            rotation: -8,
            duration: 0.2,
            ease: "steps(3)",
          });
        } else if (reps < 1000 && finished) {
          finished = false;
          gsap.to(done ?? {}, { opacity: 0, scale: 2, duration: 0.2 });
        }
      };
      render(0);
      gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          end: "bottom 20%",
          scrub: 0.3,
          onUpdate: (st) => render(st.progress),
        },
      });
    },
    ref,
    [calm],
  );

  return (
    <div ref={ref} className={className}>
      <Panel
        shape="slant-bottom"
        className="text-fg"
        innerClassName="grid min-h-72 grid-cols-[1.3fr_1fr] items-center md:min-h-80"
      >
        <div aria-hidden className="relative h-full min-h-72 tone md:min-h-80">
          <div data-lines className="pointer-events-none absolute inset-0 text-fg/25 opacity-0">
            <SpeedLines variant="radial" intensity={0.8} />
          </div>
          <svg viewBox="0 0 300 240" className="absolute inset-0 h-full w-full">
            <line
              x1="20"
              y1="212"
              x2="290"
              y2="212"
              stroke="currentColor"
              strokeOpacity="0.4"
              strokeWidth="2"
            />
            <g data-ghost-wrap>
              {[0.22, 0.1].map((o) => (
                <g key={o} data-ghost opacity={o}>
                  <Stickman rig={STILL} className="text-fg" />
                </g>
              ))}
            </g>
            <g data-hero>
              <Stickman rig={STILL} className="text-fg" />
            </g>
          </svg>
        </div>
        <div className="relative pr-6 text-right md:pr-10">
          <p className="font-display text-18 md:text-24">{copy.title}</p>
          <p className="text-14 text-muted">{copy.sub}</p>
          <p className="mt-3 text-14 text-muted">{copy.rep}</p>
          <p data-count className="font-display text-56 leading-none tabular-nums md:text-96">
            1000
          </p>
          <p
            data-done
            aria-hidden
            className="absolute -top-8 left-0 sfx text-36 text-agni md:-top-14 md:text-56"
          >
            {copy.done}
          </p>
        </div>
      </Panel>
    </div>
  );
}
