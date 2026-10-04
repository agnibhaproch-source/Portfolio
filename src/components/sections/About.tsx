"use client";

import { useRef, useState } from "react";
import { Rune } from "@/components/ui/Rune";
import { aboutCopy, education, profile, sections } from "@/content";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { Panel } from "@/components/ui/Panel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InkBlot } from "@/components/ui/InkBlot";
import { Silhouette } from "@/components/ui/Silhouette";
import { DUR, gsap, ScrollTrigger, SplitText, STAGGER } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";

// Where each of the five panels flies in from on desktop (fractions of the viewport).
const FROM = [
  { x: -0.45, y: -0.15, r: -12 },
  { x: 0.45, y: -0.2, r: 8 },
  { x: -0.4, y: 0.3, r: 10 },
  { x: 0, y: 0.45, r: -6 },
  { x: 0.45, y: 0.25, r: 12 },
];

/** Manga speech bubble that pops over a panel's top edge on hover, focus or tap. */
function Bubble({ id, text, open }: { id: string; text: string; open: boolean }) {
  return (
    <span
      id={id}
      data-open={open || undefined}
      className="pointer-events-none absolute -top-12 right-4 z-20 max-w-[15rem] origin-bottom-left scale-50 -rotate-3 opacity-0 transition-[opacity,scale] duration-300 ease-heat group-hover/panel:scale-100 group-hover/panel:opacity-100 group-focus-visible/panel:scale-100 group-focus-visible/panel:opacity-100 data-open:scale-100 data-open:opacity-100"
    >
      <span className="relative block rounded-[50%] border-[3px] border-sumi bg-washi px-6 py-3 text-center text-14 font-bold text-sumi">
        {text}
      </span>
      <svg aria-hidden viewBox="0 0 20 18" className="absolute -bottom-[13px] left-10 w-5">
        <path d="M1 0 L19 0 L5 17 Z" fill="var(--washi)" />
        <path d="M1 1 L5 17 L19 1" fill="none" stroke="var(--sumi)" strokeWidth="3" />
      </svg>
    </span>
  );
}

function Label({ children }: { children: string }) {
  return <p className="text-14 text-muted">{children}</p>;
}

/**
 * Print mode. Five panels fly in and lock into a manga page (scrubbed while
 * the stage pins on desktop), borders draw, screentone develops, a sound
 * effect pops across a gutter, then the text rises line by line.
 * Content is fully visible without JS; only transforms are animated.
 */
export function About() {
  const ref = useRef<HTMLElement>(null);
  const { bio, origin, bigLine, location, interests } = profile;
  const [open, setOpen] = useState<number | null>(null);
  const bubble = (i: number) => {
    const text = aboutCopy.bubbles[i];
    if (!text) return {};
    const id = `about-bubble-${i}`;
    return {
      tabIndex: 0,
      "aria-describedby": id,
      onClick: () => setOpen((o) => (o === i ? null : i)),
      overlay: <Bubble id={id} text={text} open={open === i} />,
    };
  };

  useMotion((ctx, el) => {
    const q = gsap.utils.selector(el);
    const stage = q("[data-about-stage]")[0] as HTMLElement | undefined;
    const panels = q("[data-about-panel]");
    const text = q("[data-about-lines]");
    if (!stage) return;

    if (ctx.reduced) {
      gsap.from(panels, {
        opacity: 0,
        duration: DUR.micro,
        scrollTrigger: { trigger: stage, start: "top 85%", once: true },
      });
      return;
    }

    // Already scrolled to or past this section (restored scroll, or a resize
    // that switched motion context): keep the final state, hide nothing.
    const seen = stage.getBoundingClientRect().top < window.innerHeight * 0.8;
    if (seen && !ctx.desktop) return;

    // Text waits for the panels, then rises by line. autoSplit re-splits on
    // resize/font load, so lines never clip at a new width.
    if (!seen) gsap.set(text, { autoAlpha: 0 });
    let splits: SplitText[] = [];
    let revealed = seen;
    const revealText = () => {
      if (revealed) return;
      revealed = true;
      gsap.set(text, { autoAlpha: 1 });
      splits = text.map((node) =>
        SplitText.create(node, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) => {
            // Masks get breathing room for ascenders/descenders; the negative
            // margin cancels it so layout does not move.
            gsap.set(self.masks, { paddingBlock: "0.22em", marginBlock: "-0.22em" });
            return gsap.from(self.lines, {
              yPercent: 130,
              duration: DUR.standard,
              stagger: STAGGER.loose,
              ease: "ink",
            });
          },
        }),
      );
    };

    const borders = q("[data-about-panel] [data-panel-border] polygon");
    const tones = q("[data-about-panel] .tone");
    const sfx = q("[data-about-sfx]");

    if (ctx.desktop) {
      // The stage pins briefly once centred; the assembly scrub starts earlier,
      // as the stage scrolls into view, and finishes when the pin releases.
      const pin = ScrollTrigger.create({
        trigger: stage,
        start: () => `top ${Math.max((window.innerHeight - stage.offsetHeight) / 2, 72)}px`,
        end: "+=55%",
        pin: true,
        invalidateOnRefresh: true,
      });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top 90%",
          end: () => pin.end,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      tl.from(panels, {
        x: (i: number) => (FROM[i]?.x ?? 0) * window.innerWidth,
        y: (i: number) => (FROM[i]?.y ?? 0) * window.innerHeight,
        rotation: (i: number) => FROM[i]?.r ?? 0,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "snap",
      })
        .from(borders, { drawSVG: "0%", duration: 0.8, stagger: 0.1, ease: "ink" }, 0.35)
        .fromTo(
          tones,
          { "--dot": "0px" },
          { "--dot": "1.2px", duration: 0.8, ease: "steps(8)" },
          0.7,
        )
        .fromTo(
          sfx,
          { scale: 0, rotation: -30, opacity: 0 },
          { scale: 1, rotation: -8, opacity: 1, duration: 0.4, ease: "heat" },
          1.35,
        )
        .call(revealText, [], 1.1);
    } else {
      // Touch: no pin, two directions, plays once on entry.
      gsap
        .timeline({ scrollTrigger: { trigger: stage, start: "top 80%", once: true } })
        .from(panels, {
          xPercent: (i: number) => (i % 2 ? 110 : -110),
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "snap",
        })
        .from(borders, { drawSVG: "0%", duration: 0.6, stagger: 0.06 }, 0.2)
        .fromTo(
          tones,
          { "--dot": "0px" },
          { "--dot": "1.2px", duration: 0.6, ease: "steps(6)" },
          0.4,
        )
        .call(revealText, [], 0.5);
    }

    return () => splits.forEach((s) => s.revert());
  }, ref);

  return (
    <section
      ref={ref}
      id={sections.about.id}
      data-mode="print"
      aria-labelledby={`${sections.about.id}-heading`}
      className="relative overflow-x-clip px-4 pt-24 pb-24 md:px-10 md:pt-32 md:pb-32"
    >
      <SectionHeading copy={sections.about} />
      <Rune index={1} className="absolute top-28 right-4 md:top-36 md:right-10" />

      <div data-about-stage className="relative grid gap-gutter md:grid-cols-2 lg:grid-cols-12">
        <InkBlot
          seed={3}
          className="absolute -top-8 left-[31%] z-10 hidden size-16 opacity-80 lg:block"
        />
        <InkBlot
          seed={8}
          className="absolute right-[8%] -bottom-6 z-10 hidden size-10 opacity-70 lg:block"
        />
        {/* 1: photo (silhouette until the owner's photo arrives) */}
        <Panel
          data-about-panel
          {...bubble(0)}
          page={2}
          tape
          tone
          className="min-h-72 md:min-h-[22rem] lg:col-span-4"
          innerClassName="overflow-hidden"
        >
          {/* TODO: public/me/pose.jpg or cropped portrait once it arrives */}
          <Silhouette className="absolute inset-x-0 bottom-0 mx-auto h-[82%] text-sumi" />
          <p
            lang="ja"
            aria-hidden
            className="absolute top-4 right-4 bg-washi px-1 py-2 font-display text-36 [writing-mode:vertical-rl]"
          >
            {profile.name.aliasJa}
          </p>
        </Panel>

        {/* 2: bio + origin */}
        <Panel
          data-about-panel
          {...bubble(1)}
          page={3}
          className="md:min-h-[22rem] lg:col-span-8"
          innerClassName="flex flex-col justify-center gap-5 p-6 md:p-10"
        >
          {bio && (
            <p data-about-lines className="max-w-prose text-18 font-medium lg:text-24">
              {bio}
            </p>
          )}
          {origin && (
            <p data-about-lines className="max-w-prose text-muted">
              {origin}
            </p>
          )}
        </Panel>

        {/* 3: where from, off the clock */}
        <Panel
          data-about-panel
          {...bubble(2)}
          page={4}
          className="md:min-h-[18rem] lg:col-span-3"
          innerClassName="flex flex-col justify-between gap-6 p-6"
        >
          <div>
            <Label>{aboutCopy.from}</Label>
            <p className="mt-1 font-display text-36">{location}</p>
          </div>
          {interests.length > 0 && (
            <div>
              <Label>{aboutCopy.offline}</Label>
              <p className="mt-1 text-18">{interests.join(", ")}</p>
            </div>
          )}
        </Panel>

        {/* 4: the big line, ink panel */}
        {bigLine && (
          <Panel
            data-about-panel
            {...bubble(3)}
            page={5}
            shape="cut-right"
            fill={false}
            className="min-h-64 text-sumi md:order-last md:col-span-2 md:min-h-[18rem] lg:order-none lg:col-span-6"
            innerClassName="flex items-end overflow-hidden bg-sumi p-6 pr-14 text-washi md:p-10 md:pr-20"
          >
            <SpeedLines variant="radial" intensity={0.35} className="absolute inset-0 opacity-50" />
            <blockquote data-about-lines className="relative font-display text-36 lg:text-56">
              {bigLine}
            </blockquote>
          </Panel>
        )}

        {/* 5: studying */}
        <Panel
          data-about-panel
          {...bubble(4)}
          page={6}
          shape="cut-left"
          className="md:min-h-[18rem] lg:col-span-3"
          innerClassName="flex flex-col justify-between gap-6 p-6 pl-10 md:pl-12"
        >
          <div>
            <Label>{aboutCopy.studying}</Label>
            <p className="mt-1 text-18 font-bold">{education.degree}</p>
            <p className="mt-1 text-18">
              {education.institution} × {education.partner}
            </p>
          </div>
          <div>
            <Label>{aboutCopy.classOf}</Label>
            <p className="font-display text-36">{education.end}</p>
          </div>
        </Panel>

        <p
          data-about-sfx
          aria-hidden
          className="pointer-events-none absolute top-[52%] left-[58%] z-10 hidden sfx text-96 text-washi lg:block"
        >
          {aboutCopy.sfx}
        </p>
      </div>
    </section>
  );
}
