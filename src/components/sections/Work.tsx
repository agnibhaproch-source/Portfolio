"use client";

import { useRef } from "react";
import { profile, projects, sections, workCopy } from "@/content";
import { MagicCircle } from "@/components/motion/MagicCircle";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";
import { Chapter } from "./work/Chapter";

/**
 * The grimoire. Desktop: a pinned horizontal track where each chapter's cover
 * flips open as it reaches you, screenshots drift with parallax, and scroll
 * speed drives speed lines and a slight skew. Touch, reduced motion and no
 * JS: a vertical stack with swipeable screenshot strips.
 */
export function Work() {
  const ref = useRef<HTMLElement>(null);

  useMotion((ctx, el) => {
    const q = gsap.utils.selector(el);
    const pin = q("[data-work-pin]")[0] as HTMLElement | undefined;
    const track = q("[data-work-track]")[0] as HTMLElement | undefined;
    const chapters = q("[data-chapter]");
    if (!pin || !track || ctx.reduced) return;

    if (!ctx.desktop) {
      // Stacked: each cover slams in like a title card, then its body rises.
      chapters.forEach((ch) => {
        const c = gsap.utils.selector(ch);
        gsap
          .timeline({ scrollTrigger: { trigger: ch, start: "top 80%", once: true } })
          .fromTo(
            c("[data-cover]"),
            { clipPath: "inset(50% 0% 50% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.35, ease: "snap" },
          )
          .from(
            c("[data-cover-inner]"),
            { scale: 1.4, opacity: 0, duration: 0.35, ease: "steps(5)" },
            0.12,
          )
          .from(c(".chapter-body"), { y: 40, opacity: 0, duration: 0.6, ease: "ink" }, 0.3);
      });
      return;
    }

    track.setAttribute("data-horizontal", "");
    const distance = () => track.scrollWidth - window.innerWidth;
    const skewTo = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3" });

    const slide = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: pin,
        pin: true,
        start: "top top",
        end: () => `+=${distance()}`,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => skewTo(gsap.utils.clamp(-4, 4, -self.getVelocity() / 500)),
        onLeave: () => skewTo(0),
        onLeaveBack: () => skewTo(0),
      },
    });

    chapters.forEach((ch) => {
      const c = gsap.utils.selector(ch);
      // Title card lands as the chapter enters...
      gsap.from(c("[data-cover-inner]"), {
        scale: 1.35,
        opacity: 0,
        ease: "steps(5)",
        scrollTrigger: {
          containerAnimation: slide,
          trigger: ch,
          start: "left 100%",
          end: "left 70%",
          scrub: true,
        },
      });
      // ...then the page flips open on its spine.
      gsap.to(c("[data-cover]"), {
        rotationY: -100,
        ease: "power2.in",
        scrollTrigger: {
          containerAnimation: slide,
          trigger: ch,
          start: "left 60%",
          end: "left 15%",
          scrub: true,
        },
      });
      gsap.fromTo(
        c("[data-parallax]"),
        { xPercent: -6 },
        {
          xPercent: 6,
          ease: "none",
          scrollTrigger: {
            containerAnimation: slide,
            trigger: ch,
            start: "left right",
            end: "right left",
            scrub: true,
          },
        },
      );
    });

    return () => track.removeAttribute("data-horizontal");
  }, ref);

  return (
    <section
      ref={ref}
      id={sections.work.id}
      data-mode="colour"
      aria-labelledby={`${sections.work.id}-heading`}
      className="relative overflow-x-clip"
    >
      <div className="px-4 pt-24 md:px-10 md:pt-32">
        <SectionHeading copy={sections.work} className="mb-6 md:mb-8" />
      </div>

      <div data-work-pin className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden text-washi/50 lg:block"
        >
          <SpeedLines variant="parallel" followScroll />
        </div>

        <div data-work-track className="work-track relative px-4 pb-24 md:px-10">
          <div className="work-intro work-page relative grid place-items-center overflow-hidden border-[3px] border-washi p-10 text-center">
            <MagicCircle className="absolute size-[86%] opacity-40" />
            <div className="relative">
              <p className="font-display text-96">{workCopy.introTitle}</p>
              <p className="mt-4 text-18 text-muted">{workCopy.introLine}</p>
              <p className="mt-8 font-display text-24 text-aura">
                {projects.length} {workCopy.chaptersSoFar}
              </p>
            </div>
          </div>

          {projects.map((p, i) => (
            <Chapter key={p.slug} project={p} index={i} />
          ))}

          <div className="work-page flex flex-col justify-center gap-6 border-[3px] border-dashed border-washi/50 p-8 md:p-10">
            <p className="font-display text-56">{workCopy.closingTitle}</p>
            <p className="max-w-prose text-18 text-muted">{workCopy.closingLine}</p>
            <div>
              <Button
                href={profile.links.github.href}
                variant="ghost"
                target="_blank"
                rel="noreferrer"
              >
                {workCopy.allWork}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
