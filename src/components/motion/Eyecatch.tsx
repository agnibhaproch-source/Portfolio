"use client";

import { useRef } from "react";
import { sound } from "@/lib/sound";
import type { SectionCopy } from "@/content";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";

/**
 * Anime segment card: as a section begins, a band slams across the middle of
 * the screen with its name, holds, and slashes away. Once per section, skipped
 * when the visitor is scrolling fast or jumping. Never blocks input.
 */
export function Eyecatch({ items }: { items: SectionCopy[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const q = gsap.utils.selector(el);
    const title = q("[data-ec-title]")[0] as HTMLElement;
    const sub = q("[data-ec-sub]")[0] as HTMLElement;
    let tl: gsap.core.Timeline | null = null;

    const play = (it: SectionCopy) => {
      title.textContent = it.heading;
      sound.play("slash");
      sub.textContent = it.subtitle;
      tl?.kill();
      tl = gsap
        .timeline()
        .set(el, { autoAlpha: 1 })
        .fromTo(
          q("[data-ec-band]"),
          { clipPath: "inset(50% 0% 50% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.25, ease: "snap" },
        )
        .fromTo(
          title,
          { scale: 1.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "steps(4)" },
          0.08,
        )
        .fromTo(q("[data-ec-line]"), { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "ink" }, 0.18)
        .fromTo(sub, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 }, 0.25)
        .to(
          q("[data-ec-band]"),
          {
            clipPath: "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)",
            duration: 0.3,
            ease: "snap",
          },
          "+=0.5",
        )
        .set(el, { autoAlpha: 0 })
        .set(q("[data-ec-band]"), { clearProps: "clipPath" });
    };

    items.forEach((it) => {
      const target = document.getElementById(it.id);
      if (!target) return;
      ScrollTrigger.create({
        trigger: target,
        start: "top 62%",
        once: true,
        onEnter: (self) => {
          if (Math.abs(self.getVelocity()) < 2500) play(it);
        },
      });
    });
    return () => tl?.kill();
  }, ref);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none invisible fixed inset-x-0 top-1/2 z-40 -translate-y-1/2 opacity-0"
    >
      <div
        data-ec-band
        data-mode="colour"
        className="relative grid h-[34svh] place-items-center overflow-hidden border-y-[3px] border-washi bg-sumi text-center"
      >
        <div className="absolute inset-0 text-washi/25">
          <SpeedLines variant="radial" intensity={0.55} />
        </div>
        <div className="relative">
          <p
            data-ec-title
            className="misprint font-display text-[clamp(3.5rem,11vw,9rem)] leading-none"
          />
          <div
            data-ec-line
            className="mx-auto mt-4 h-[3px] w-48 bg-[linear-gradient(90deg,var(--agni),var(--kiln))]"
          />
          <p data-ec-sub className="mt-3 text-18 text-muted md:text-24" />
        </div>
      </div>
    </div>
  );
}
