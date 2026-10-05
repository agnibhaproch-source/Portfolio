"use client";

import Image from "next/image";
import { useRef } from "react";
import type { Project } from "@/content";
import { sections, workCopy } from "@/content";
import { MagicCircle } from "@/components/motion/MagicCircle";
import { Magnetic } from "@/components/motion/Magnetic";
import { RipDivider } from "@/components/motion/PageTransitions";
import { PanelFrame } from "@/components/motion/PanelFrame";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Tilt } from "@/components/motion/Tilt";
import { TitleCard } from "@/components/motion/TitleCard";
import { buttonClass } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { GLYPHS } from "@/components/ui/Rune";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";
import { chapterLabel } from "./Chapter";

const pad = (n: number) => String(n).padStart(2, "0");
const CUTS = [
  "polygon(0 0, 100% 0, 100% 94%, 0 100%)",
  "polygon(0 4%, 100% 0, 96% 100%, 0 100%)",
  "polygon(4% 0, 100% 3%, 100% 100%, 0 100%)",
];

function Kicker({ title, sub }: { title: string; sub: string }) {
  return (
    <header className="mb-8">
      <h2 className="misprint text-36 md:text-56">{title}</h2>
      <p className="mt-1 text-18 text-muted">{sub}</p>
    </header>
  );
}

/**
 * A project told as a manga chapter: title card over a turning magic circle,
 * the story in paper panels, a pinned gallery (desktop) where screenshots slam
 * in, the stack as spell cards, and a book cover that opens the next chapter.
 */
export function ProjectDetail({
  project,
  index,
  next,
}: {
  project: Project;
  index: number;
  next: Project | null;
}) {
  const ref = useRef<HTMLElement>(null);

  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const q = gsap.utils.selector(el);
    const gallery = q("[data-gallery]")[0] as HTMLElement | undefined;
    const track = q("[data-gallery-track]")[0] as HTMLElement | undefined;
    const shots = q("[data-gallery-shot]");

    if (gallery && track && ctx.desktop && shots.length > 1) {
      track.setAttribute("data-horizontal", "");
      const distance = () => track.scrollWidth - window.innerWidth;
      const slide = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: gallery,
          pin: true,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      shots.forEach((shot) => {
        const s = gsap.utils.selector(shot);
        gsap
          .timeline({
            scrollTrigger: {
              containerAnimation: slide,
              trigger: shot,
              start: "left 85%",
              once: true,
            },
          })
          .from(shot, { scale: 1.2, opacity: 0, duration: 0.3, ease: "steps(4)" })
          .fromTo(s("[data-flash]"), { opacity: 0.85 }, { opacity: 0, duration: 0.45 }, 0.1);
      });
      return () => track.removeAttribute("data-horizontal");
    }

    shots.forEach((shot) => {
      const s = gsap.utils.selector(shot);
      gsap
        .timeline({ scrollTrigger: { trigger: shot, start: "top 80%", once: true } })
        .from(shot, { scale: 1.15, opacity: 0, duration: 0.3, ease: "steps(4)" })
        .fromTo(s("[data-flash]"), { opacity: 0.85 }, { opacity: 0, duration: 0.45 }, 0.1);
    });
  }, ref);

  return (
    <main ref={ref} id="main" className="min-h-svh">
      {/* Opening: chapter title card over a turning magic circle */}
      <section
        data-mode="colour"
        className="relative overflow-hidden border-b-[3px] border-washi pt-16"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 text-washi/15">
          <SpeedLines variant="radial" intensity={0.4} />
        </div>
        <MagicCircle
          trigger="mount"
          className="pointer-events-none absolute top-1/2 left-1/2 size-[min(90vw,70svh)] -translate-x-1/2 -translate-y-1/2 text-aura opacity-35"
        />
        <TitleCard
          trigger="mount"
          level="h1"
          label={chapterLabel(index)}
          title={project.name}
          className="relative z-10 min-h-[70svh] bg-transparent!"
        />
      </section>

      {/* The story, on paper */}
      <section data-mode="print" className="relative px-4 py-20 md:px-10 md:py-28">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <SplitReveal as="p" className="misprint max-w-4xl font-display text-36 md:text-56">
            {project.pitch}
          </SplitReveal>
          <p className="shrink-0 rotate-[-8deg] border-[3px] border-agni px-3 py-1 font-display text-18 text-agni uppercase">
            {workCopy.status[project.status]}
          </p>
        </div>

        <div className="mt-14 grid gap-gutter lg:grid-cols-12">
          <Panel tape page={1} className="lg:col-span-7" innerClassName="p-6 md:p-10">
            <h2 className="text-24">{workCopy.problem}</h2>
            <p className="mt-3 max-w-prose text-18">{project.problem}</p>
          </Panel>
          <Panel
            shape="cut-left"
            page={2}
            className="lg:col-span-5"
            innerClassName="p-6 pl-12 md:p-10 md:pl-16"
          >
            <h2 className="text-24">{workCopy.role}</h2>
            <p className="mt-3 text-18">{project.role}</p>
          </Panel>
        </div>

        <div className="mt-16">
          <Kicker title={workCopy.built} sub={workCopy.storySub} />
          <ol className="grid gap-gutter md:grid-cols-2">
            {project.highlights.map((h, i) => (
              <li key={h}>
                <PanelFrame
                  shape={i % 3 === 1 ? "slant-top" : i % 3 === 2 ? "cut-right" : "rect"}
                  from={i % 2 ? "right" : "left"}
                  delay={i * 0.08}
                  className="h-full"
                  innerClassName="flex gap-5 p-6 md:p-8"
                >
                  <span
                    aria-hidden
                    className="font-display text-56 leading-none text-transparent [-webkit-text-stroke:2px_var(--sumi)]"
                  >
                    {pad(i + 1)}
                  </span>
                  <p className="text-18">
                    <span className="sr-only">
                      {workCopy.step} {i + 1}:{" "}
                    </span>
                    {h}
                  </p>
                </PanelFrame>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Gallery: pinned horizontal strip on desktop */}
      {project.media.length > 0 && (
        <>
          <RipDivider label={workCopy.gallery} />
          <section data-mode="colour" data-gallery className="relative overflow-hidden">
            <div className="px-4 pt-16 md:px-10">
              <Kicker title={workCopy.gallery} sub={workCopy.gallerySub} />
            </div>
            <div
              data-gallery-track
              className="flex flex-col gap-gutter px-4 pb-20 data-horizontal:h-[78svh] data-horizontal:w-max data-horizontal:flex-row data-horizontal:items-center data-horizontal:pr-[20vw] md:px-10"
            >
              {project.media.map((m, i) => (
                <figure
                  key={m.src}
                  data-gallery-shot
                  className={cn(
                    "relative overflow-hidden border-[3px] border-washi bg-sumi",
                    m.height > m.width ? "w-[min(70vw,22rem)] self-center" : "w-full lg:w-[62vw]",
                    "[[data-horizontal]_&]:h-[64svh] [[data-horizontal]_&]:w-auto",
                  )}
                  style={{ clipPath: CUTS[i % CUTS.length] }}
                >
                  <Image
                    src={m.src}
                    alt={m.alt}
                    width={m.width}
                    height={m.height}
                    sizes="(min-width: 1024px) 62vw, 100vw"
                    className="h-full w-full object-cover object-top"
                  />
                  <span
                    aria-hidden
                    data-flash
                    className="pointer-events-none absolute inset-0 bg-washi opacity-0"
                  />
                </figure>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Stack as spell cards, then the links */}
      <section data-mode="colour" className="px-4 py-20 md:px-10 md:py-28">
        <Kicker title={workCopy.stack} sub={workCopy.stackSub} />
        <ul className="grid grid-cols-2 gap-gutter sm:grid-cols-3 lg:grid-cols-5">
          {project.stack.map((t, i) => (
            <li key={t}>
              <Tilt max={10} className="h-full">
                <div className="relative flex h-full flex-col items-start gap-4 border-[3px] border-washi/70 bg-[linear-gradient(150deg,var(--twilight),var(--sumi)_70%)] p-4 transition-colors hover:border-aura">
                  <svg aria-hidden viewBox="0 0 24 24" className="size-7 text-aura">
                    <path
                      d={GLYPHS[i % GLYPHS.length]}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="font-display text-18">{t}</span>
                </div>
              </Tilt>
            </li>
          ))}
        </ul>

        <div className="mt-14 flex flex-wrap items-center gap-4">
          <h2 className="sr-only">{workCopy.links}</h2>
          {project.liveUrl && (
            <Magnetic>
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonClass("primary")}
                data-cursor="charge"
              >
                {workCopy.liveSite}
              </a>
            </Magnetic>
          )}
          {project.repoUrl && (
            <Magnetic>
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonClass("ghost")}
                data-cursor="charge"
              >
                {workCopy.sourceCode}
              </a>
            </Magnetic>
          )}
          <TransitionLink href={`/#${sections.work.id}`} className="ink-link text-18">
            {workCopy.backToGrimoire}
          </TransitionLink>
        </div>
      </section>

      {/* Next chapter: a book cover that swings open on hover */}
      {next && next.slug !== project.slug && (
        <section data-mode="colour" className="px-4 pb-24 [perspective:1800px] md:px-10">
          <TransitionLink
            href={`/work/${next.slug}`}
            aria-label={`${workCopy.openChapter}: ${next.name}`}
            className="group/next relative block"
          >
            <span className="absolute inset-0 grid place-items-center border-[3px] border-aura bg-[radial-gradient(circle,rgb(201_162_74/0.25),transparent_70%)] font-display text-24 text-aura">
              {workCopy.openChapter}
            </span>
            <span className="relative grid min-h-[42svh] origin-left place-items-center border-[3px] border-washi bg-sumi text-center transition-transform duration-500 ease-snap [backface-visibility:hidden] group-hover/next:[transform:rotateY(-28deg)] group-focus-visible/next:[transform:rotateY(-28deg)]">
              <span className="absolute inset-3 border border-washi/40" />
              {["top-5 left-5", "top-5 right-5", "bottom-5 left-5", "bottom-5 right-5"].map(
                (pos) => (
                  <span
                    key={pos}
                    className={cn("absolute size-3 rotate-45 border-2 border-aura", pos)}
                  />
                ),
              )}
              <span>
                <span className="block font-display text-18 text-muted">
                  {workCopy.nextChapter}
                </span>
                <span className="mt-2 block font-display text-56 md:text-[clamp(3rem,9vw,8rem)] md:leading-none">
                  {next.name}
                </span>
                <span className="mx-auto mt-5 block h-[3px] w-40 bg-[linear-gradient(90deg,var(--agni),var(--kiln))]" />
              </span>
            </span>
          </TransitionLink>
        </section>
      )}
    </main>
  );
}
