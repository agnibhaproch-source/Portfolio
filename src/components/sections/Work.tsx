"use client";

import { Fragment, useEffect, useRef } from "react";
import { mentions, profile, projects, sections, sideQuests, workCopy } from "@/content";
import { MagicCircle } from "@/components/motion/MagicCircle";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { Button } from "@/components/ui/Button";
import { InkBlot } from "@/components/ui/InkBlot";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useCalm } from "@/lib/calm";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { useLenis } from "@/lib/smooth-scroll";
import { sound } from "@/lib/sound";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";
import { Chapter, chapterLabel } from "./work/Chapter";

const pad = (n: number) => String(n).padStart(2, "0");

/** Ink splatter that bursts across the gap between two pages of the track. */
function Splat({ seed }: { seed: number }) {
  return (
    <div aria-hidden className="work-splat pointer-events-none">
      <div
        data-splat
        className="pointer-events-none absolute top-1/2 left-1/2 size-[26rem] -translate-x-1/2 -translate-y-1/2 scale-0 text-agni"
      >
        <InkBlot seed={seed} className="size-full" />
      </div>
    </div>
  );
}

/** Curl shading for the plain pages of the track. */
const Shade = () => (
  <span
    aria-hidden
    data-curl-shade
    className="pointer-events-none absolute inset-0 z-[30] bg-[linear-gradient(90deg,transparent_35%,rgb(0_0_0/0.7))] opacity-0"
  />
);

/**
 * The grimoire. Desktop: a pinned horizontal track. Pages curl away as they
 * leave, a bookmark ribbon tracks the chapter (click a tick to jump), fast
 * scrolling skews the track and smears its edges, and ink splashes across
 * the gaps between pages. A contents card flies you to any chapter. Covers
 * flip open with gold-foil titles that catch the cursor; screenshots sit at
 * different depths (NightOwl's in a drawn laptop and phone) with a loupe on
 * hover; chips pulse the same skill everywhere on the page. Side quests are
 * bounty posters, and the track ends on a "to be continued" card. Touch,
 * reduced motion and no JS: a vertical stack.
 */
export function Work() {
  const ref = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);
  const calm = useCalm();
  const jumpRef = useRef<(i: number) => void>(() => {});

  useMotion(
    (ctx, el) => {
      const q = gsap.utils.selector(el);
      const pin = q("[data-work-pin]")[0] as HTMLElement | undefined;
      const track = q("[data-work-track]")[0] as HTMLElement | undefined;
      const chapters = q("[data-chapter]");
      const targets = q("[data-jump-target]") as HTMLElement[];

      // Contents card: stacked layouts simply scroll to the target.
      jumpRef.current = (i) =>
        targets[i]?.scrollIntoView({ behavior: ctx.reduced ? "auto" : "smooth", block: "start" });

      // Chips pulse the same skill wherever it appears on the page.
      const onChip = (e: PointerEvent) => {
        const chip = (e.target as Element | null)?.closest<HTMLElement>("[data-skill-text]");
        const name = chip?.dataset.skillText;
        if (!name) return;
        document.querySelectorAll<HTMLElement>("[data-chip], [data-skill-text]").forEach((n) => {
          const text =
            n.dataset.skillText ??
            (n.dataset.chip && n.dataset.chip !== "true" ? n.dataset.chip : n.textContent) ??
            "";
          if (!text || !(mentions(text, name) || mentions(name, text))) return;
          n.classList.remove("skill-pulse");
          void n.offsetWidth;
          n.classList.add("skill-pulse");
          window.setTimeout(() => n.classList.remove("skill-pulse"), 1150);
        });
      };
      el.addEventListener("pointerover", onChip);
      const offChip = () => el.removeEventListener("pointerover", onChip);

      if (!pin || !track || ctx.reduced) return offChip;

      // Chapter reveal: title slams in by letter, pitch rises, chips pop,
      // screenshots slam into their panels with an ink flash, devices rotate in.
      const reveal = (ch: Element, tl: gsap.core.Timeline, at: number) => {
        const c = gsap.utils.selector(ch);
        const title = c("[data-title]")[0];
        const chars = title ? SplitText.create(title, { type: "words,chars" }).chars : [];
        tl.from(
          chars,
          { yPercent: 90, scale: 1.6, opacity: 0, duration: 0.3, stagger: 0.04, ease: "steps(4)" },
          at,
        )
          .from(c("[data-pitch]"), { y: 24, opacity: 0, duration: 0.5, ease: "ink" }, at + 0.2)
          .from(
            c("[data-chip]"),
            { scale: 0, rotation: -12, duration: 0.3, stagger: 0.05, ease: "heat" },
            at + 0.3,
          )
          .from(
            c("[data-shot]"),
            { scale: 1.25, opacity: 0, duration: 0.3, stagger: 0.12, ease: "steps(4)" },
            at,
          )
          .from(
            c("[data-device='laptop']"),
            {
              rotationY: -28,
              rotationX: 8,
              transformPerspective: 1200,
              duration: 0.8,
              ease: "power3.out",
            },
            at,
          )
          .from(
            c("[data-device='phone']"),
            { rotationY: 34, x: 60, transformPerspective: 1200, duration: 0.8, ease: "power3.out" },
            at + 0.15,
          )
          .fromTo(
            c("[data-flash]"),
            { opacity: 0.85 },
            { opacity: 0, duration: 0.45, stagger: 0.12, ease: "power2.out" },
            at + 0.12,
          );
      };

      if (!ctx.desktop) {
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
          reveal(
            ch,
            gsap.timeline({
              scrollTrigger: { trigger: c(".chapter-body")[0], start: "top 80%", once: true },
            }),
            0,
          );
        });
        gsap.from(q("[data-poster]"), {
          y: -40,
          rotation: (i: number) => (i % 2 ? 10 : -8),
          opacity: 0,
          duration: 0.7,
          stagger: 0.15,
          ease: "bounce.out",
          scrollTrigger: { trigger: q("[data-poster]")[0], start: "top 85%", once: true },
        });
        gsap.from(q("[data-continue]"), {
          drawSVG: "0%",
          duration: 0.6,
          stagger: 0.25,
          scrollTrigger: { trigger: q("[data-continue]")[0], start: "top 85%", once: true },
        });
        return offChip;
      }

      track.setAttribute("data-horizontal", "");
      const distance = () => track.scrollWidth - window.innerWidth;
      const skewTo = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3" });
      const smears = q("[data-smear]");
      const smearTo = smears.map((s) => gsap.quickTo(s, "opacity", { duration: 0.3 }));
      const fill = q("[data-ribbon-fill]")[0];
      const label = q("[data-ribbon-text]")[0];
      let current = -1;
      let completed = false;

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
          onUpdate: (self) => {
            // Velocity skew and edge smears (calm mode keeps it straight).
            const v = calm ? 0 : -self.getVelocity() / 380;
            skewTo(gsap.utils.clamp(-7, 7, v));
            smearTo.forEach((s) => s(Math.min(Math.abs(v) / 7, 0.9)));
            if (fill) gsap.set(fill, { scaleX: self.progress });
            // Which chapter is under the centre of the screen.
            const mid = window.innerWidth / 2;
            let idx = 0;
            chapters.forEach((ch, i) => {
              if (ch.getBoundingClientRect().left < mid) idx = i;
            });
            if (idx !== current && label) {
              current = idx;
              label.textContent = workCopy.ribbon(idx + 1, chapters.length);
            }
            if (!completed && self.progress > 0.97) {
              completed = true;
              gsap.fromTo(
                q("[data-complete]"),
                { scale: 2.4, opacity: 0, rotation: -20 },
                {
                  scale: 1,
                  opacity: 1,
                  rotation: -8,
                  duration: 0.22,
                  ease: "steps(3)",
                  onStart: () => sound.play("stamp"),
                },
              );
            }
          },
          onEnter: () => {
            // The intro card counts its chapters up.
            const count = q("[data-chapter-count]")[0];
            if (count)
              gsap.fromTo(
                count,
                { textContent: 0 },
                {
                  textContent: chapters.length,
                  duration: 0.9,
                  snap: { textContent: 1 },
                  ease: "power2.out",
                },
              );
          },
          onLeave: () => {
            skewTo(0);
            smearTo.forEach((s) => s(0));
          },
          onLeaveBack: () => {
            skewTo(0);
            smearTo.forEach((s) => s(0));
          },
        },
      });

      // Bookmark ticks sit at each chapter's place along the track; click to jump.
      const st = slide.scrollTrigger!;
      const scrollFor = (node: HTMLElement) => {
        const p = gsap.utils.clamp(0, 1, (node.offsetLeft - window.innerWidth * 0.08) / distance());
        return st.start + p * (st.end - st.start);
      };
      const placeTicks = () =>
        q("[data-tick-for]").forEach((t) => {
          const node = targets[Number((t as HTMLElement).dataset.tickFor)];
          if (!node) return;
          (t as HTMLElement).style.left =
            `${gsap.utils.clamp(0, 1, node.offsetLeft / distance()) * 100}%`;
        });
      placeTicks();
      ScrollTrigger.addEventListener("refresh", placeTicks);
      jumpRef.current = (i) => {
        const node = targets[i];
        if (!node) return;
        const y = scrollFor(node);
        if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 1.4 });
        else window.scrollTo({ top: y, behavior: "smooth" });
      };

      const pages = q("[data-work-track] > :not(.work-splat)");
      pages.forEach((page) => {
        const p = gsap.utils.selector(page);
        if (calm) return;
        // Page curl: the page swings off on its left edge as it leaves, shadowed.
        gsap
          .timeline({
            scrollTrigger: {
              containerAnimation: slide,
              trigger: page,
              start: "right 70%",
              end: "right 0%",
              scrub: true,
            },
          })
          .fromTo(
            page,
            { rotationY: 0 },
            {
              rotationY: -50,
              transformOrigin: "0% 50%",
              transformPerspective: 1800,
              ease: "power1.in",
            },
            0,
          )
          .fromTo(
            p(":scope > [data-curl-shade]"),
            { opacity: 0 },
            { opacity: 0.85, ease: "power1.in" },
            0,
          );
      });

      if (!calm) {
        q("[data-splat]").forEach((s) => {
          gsap.fromTo(
            s,
            { scale: 0, opacity: 0, rotation: -20 },
            {
              keyframes: { scale: [0, 1.25, 1.5], opacity: [0, 1, 0], rotation: [-20, 0, 12] },
              ease: "none",
              scrollTrigger: {
                containerAnimation: slide,
                trigger: s.parentElement,
                start: "left 90%",
                end: "left 10%",
                scrub: true,
              },
            },
          );
        });
      }

      // "To be continued": the arrow draws itself as the last page arrives.
      const endPage = q("[data-continue]")[0]?.closest(".work-page");
      if (endPage) {
        gsap.from(q("[data-continue]"), {
          drawSVG: "0%",
          duration: 0.6,
          stagger: 0.25,
          ease: "power2.out",
          scrollTrigger: {
            containerAnimation: slide,
            trigger: endPage,
            start: "left 60%",
            once: true,
          },
        });
      }

      chapters.forEach((ch) => {
        const c = gsap.utils.selector(ch);
        gsap.fromTo(
          c("[data-chapter-num]"),
          { xPercent: 40 },
          {
            xPercent: -40,
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
        gsap.fromTo(
          c("[data-flip-shade]"),
          { opacity: 0.85 },
          {
            opacity: 0,
            ease: "power1.in",
            scrollTrigger: {
              containerAnimation: slide,
              trigger: ch,
              start: "left 60%",
              end: "left 10%",
              scrub: true,
            },
          },
        );
        reveal(
          ch,
          gsap.timeline({
            scrollTrigger: {
              containerAnimation: slide,
              trigger: ch,
              start: "left 30%",
              once: true,
            },
          }),
          0,
        );
        // The title lands: it scales in under a dark veil that lifts (the text
        // itself stays fully opaque, so it never reads as low-contrast).
        gsap.fromTo(
          c("[data-cover-veil]"),
          { opacity: 1 },
          {
            opacity: 0,
            ease: "steps(5)",
            scrollTrigger: {
              containerAnimation: slide,
              trigger: ch,
              start: "left 100%",
              end: "left 70%",
              scrub: true,
            },
          },
        );
        gsap.from(c("[data-cover-inner]"), {
          scale: 1.35,
          ease: "steps(5)",
          scrollTrigger: {
            containerAnimation: slide,
            trigger: ch,
            start: "left 100%",
            end: "left 70%",
            scrub: true,
          },
        });
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

        // Gold foil catches a highlight that follows the pointer across the cover.
        const cover = c("[data-cover]")[0] as HTMLElement | undefined;
        const foil = c(".foil-title")[0] as HTMLElement | undefined;
        if (cover && foil) {
          cover.style.pointerEvents = "auto";
          cover.addEventListener("pointermove", (e) => {
            const r = cover.getBoundingClientRect();
            foil.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
          });
        }

        // Depth-split screenshots drift against each other with the pointer.
        const media = c(".chapter-media")[0] as HTMLElement | undefined;
        const layers = c("[data-depth-shot]").map((n) => ({
          x: gsap.quickTo(n, "x", { duration: 0.8, ease: "power3" }),
          y: gsap.quickTo(n, "y", { duration: 0.8, ease: "power3" }),
          d: Number((n as HTMLElement).dataset.depthShot),
        }));
        if (media && layers.length && !calm) {
          media.addEventListener("pointermove", (e) => {
            const r = media.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            layers.forEach((l) => {
              l.x(px * l.d * 22);
              l.y(py * l.d * 16);
            });
          });
          media.addEventListener("pointerleave", () => layers.forEach((l) => (l.x(0), l.y(0))));
        }
      });

      // Loupe: a magnifying glass over screenshots (hidden while a preview loop plays).
      const lens = q("[data-lens]")[0] as HTMLElement | undefined;
      const onLens = (e: PointerEvent) => {
        if (!lens) return;
        const img = (e.target as Element | null)?.closest<HTMLImageElement>("img[data-loupe]");
        const playing = img?.closest(".chapter-media")?.querySelector("[data-on]");
        if (!img || playing) {
          lens.style.opacity = "0";
          return;
        }
        const r = img.getBoundingClientRect();
        const zoom = 2.4;
        lens.style.opacity = "1";
        lens.style.transform = `translate(${e.clientX - 80}px, ${e.clientY - 80}px)`;
        lens.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
        lens.style.backgroundSize = `${r.width * zoom}px auto`;
        lens.style.backgroundPosition = `${-(e.clientX - r.left) * zoom + 80}px ${-(e.clientY - r.top) * zoom + 80}px`;
      };
      const offLens = () => lens && (lens.style.opacity = "0");
      track.addEventListener("pointermove", onLens);
      track.addEventListener("pointerleave", offLens);

      return () => {
        offChip();
        track.removeEventListener("pointermove", onLens);
        track.removeEventListener("pointerleave", offLens);
        ScrollTrigger.removeEventListener("refresh", placeTicks);
        track.removeAttribute("data-horizontal");
      };
    },
    ref,
    [calm],
  );

  // Contents entries map onto [data-jump-target] in order.
  const contents = [
    ...projects.map((p, i) => ({ label: `${chapterLabel(i)} · ${p.name}`, page: pad(i + 1) })),
    ...(sideQuests.length ? [{ label: workCopy.sideQuests, page: pad(projects.length + 1) }] : []),
    { label: workCopy.closingTitle, page: pad(projects.length + (sideQuests.length ? 2 : 1)) },
  ];

  return (
    <section
      ref={ref}
      id={sections.work.id}
      // Its pin adds page height: set up at once so restored scroll lands right.
      data-motion-now
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
        {/* motion smears on the screen edges while scrolling fast */}
        {[
          "left-0 bg-[linear-gradient(90deg,var(--sumi),transparent)]",
          "right-0 bg-[linear-gradient(-90deg,var(--sumi),transparent)]",
        ].map((c) => (
          <div
            key={c}
            aria-hidden
            data-smear
            className={cn(
              "pointer-events-none absolute inset-y-0 z-20 hidden w-[12vw] opacity-0 blur-md lg:block",
              c,
            )}
          />
        ))}

        <div data-work-track className="work-track relative px-4 pb-24 md:px-10">
          <div className="work-intro work-page relative grid place-items-center overflow-hidden border-[3px] border-washi p-10 text-center">
            <Shade />
            <MagicCircle className="absolute size-[86%] opacity-40" />
            <div className="relative">
              <p className="font-display text-96">{workCopy.introTitle}</p>
              <p className="mt-4 text-18 text-muted">{workCopy.introLine}</p>
              <p className="mt-8 font-display text-24 text-aura">
                <span data-chapter-count>{projects.length}</span> {workCopy.chaptersSoFar}
              </p>
              <p
                aria-hidden
                data-complete
                className="mx-auto mt-4 w-fit sfx -rotate-8 border-[3px] border-kiln px-3 py-1 text-24 text-kiln opacity-0"
              >
                {workCopy.complete}
              </p>
            </div>
          </div>

          {/* Contents: a table of contents that flies you to a chapter */}
          <nav
            aria-label={workCopy.contents}
            className="work-page relative flex flex-col overflow-hidden border-[3px] border-washi bg-[#ebdcb9] p-6 text-[#1d1614] md:p-10"
          >
            <Shade />
            <p className="font-display text-36 md:text-56">{workCopy.contents}</p>
            <p className="mt-1 text-14 text-[#5e5548]">{workCopy.contentsSub}</p>
            <ol className="mt-8 space-y-4">
              {contents.map((c, i) => (
                <li key={c.label}>
                  <button
                    type="button"
                    onClick={() => jumpRef.current(i)}
                    className="group/toc flex w-full items-end gap-3 text-left text-18 md:text-24"
                  >
                    <span className="font-display transition-colors group-hover/toc:text-[#c2272d]">
                      {c.label}
                    </span>
                    <span
                      aria-hidden
                      className="mb-1.5 flex-1 border-b-2 border-dotted border-[#1d1614]/50"
                    />
                    <span className="font-display">p.{c.page}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          {projects.map((p, i) => (
            <Fragment key={p.slug}>
              <Splat seed={i * 7 + 3} />
              <Chapter project={p} index={i} />
            </Fragment>
          ))}

          {sideQuests.length > 0 && (
            <>
              <Splat seed={41} />
              <div
                data-jump-target
                className="work-page work-page-wide relative flex flex-col gap-5 overflow-hidden border-[3px] border-washi bg-[repeating-linear-gradient(90deg,#3a2414_0_40px,#432a18_40px_80px)] p-6 md:p-8"
              >
                <Shade />
                <div>
                  <h3 className="text-36 text-[#ebdcb9]">{workCopy.sideQuests}</h3>
                  <p className="mt-1 text-14 text-[#ebdcb9]/90">{workCopy.sideQuestsLine}</p>
                </div>
                <ul className="grid flex-1 gap-6 sm:grid-cols-2">
                  {sideQuests.map((q, i) => (
                    <li
                      key={q.name}
                      data-quest
                      data-poster
                      className={cn(
                        "relative origin-top bg-[#ebdcb9] p-5 pt-8 text-[#1d1614] shadow-[4px_6px_0_rgb(0_0_0/0.45)] [clip-path:polygon(0_2%,4%_0,96%_1%,100%_0,99%_96%,100%_100%,3%_99%,0_100%)] hover:animate-[polaroid-swing_0.9s_ease-in-out]",
                        i % 2 ? "rotate-2" : "-rotate-2",
                      )}
                    >
                      <span
                        aria-hidden
                        className="absolute top-2 left-1/2 size-3 -translate-x-1/2 rounded-full bg-[#2a201d] shadow-[0_2px_2px_rgb(0_0_0/0.5)]"
                      />
                      <p className="text-center font-display text-14 tracking-[0.3em]">
                        {workCopy.sideQuestStamp}
                      </p>
                      <p className="mt-2 border-y-[3px] border-[#1d1614] py-2 text-center font-display text-36">
                        {q.name}
                      </p>
                      <p className="mt-3 text-14">{q.pitch}</p>
                      <p className="mt-3 text-14">
                        <span className="font-display">{workCopy.reward}: </span>
                        {q.stack.join(", ")}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-5">
                        <a
                          href={q.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="ink-link text-14"
                        >
                          {workCopy.sourceCode}
                        </a>
                        {q.liveUrl && (
                          <a
                            href={q.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ink-link text-14"
                          >
                            {workCopy.liveSite}
                          </a>
                        )}
                      </div>
                      <span
                        aria-hidden
                        className="absolute right-3 bottom-3 -rotate-12 border-2 border-[#9e1b20] px-1 font-display text-[11px] text-[#9e1b20]"
                      >
                        {workCopy.sideQuestStamp}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <Splat seed={57} />
          {/* The end of the volume, anime style */}
          <div
            data-jump-target
            className="work-page relative flex flex-col justify-center gap-6 overflow-hidden border-[3px] border-washi bg-sumi p-8 md:p-10"
          >
            <Shade />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/2 rotate-180 tone-fade opacity-40 [--tone-dot:var(--washi)]"
            />
            <p className="relative font-display text-56 italic">{workCopy.toBeContinued}</p>
            <svg aria-hidden viewBox="0 0 200 40" className="relative -mt-4 h-10 w-48 text-kiln">
              <path
                data-continue
                d="M4 22 C60 18 120 26 176 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                data-continue
                d="M160 8 L184 20 L160 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="relative max-w-prose text-18 text-muted">{workCopy.closingLine}</p>
            <div className="relative">
              <Button
                href={profile.links.github.href}
                variant="ghost"
                target="_blank"
                rel="noreferrer"
              >
                {workCopy.allWork}
              </Button>
            </div>
            <span aria-hidden className="absolute right-4 bottom-3 font-display text-14 text-muted">
              p.{contents.at(-1)?.page}
            </span>
          </div>
        </div>

        {/* Bookmark ribbon: progress, the current chapter, and ticks to jump */}
        <div className="work-ribbon pointer-events-none absolute inset-x-10 bottom-6 z-30">
          <div className="pointer-events-auto relative h-2 bg-washi/15">
            <div
              data-ribbon-fill
              className="absolute inset-0 origin-left scale-x-0 bg-[linear-gradient(90deg,var(--agni),var(--kiln))]"
            />
            {projects.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                data-tick-for={i}
                aria-label={workCopy.jumpTo(`${chapterLabel(i)} · ${p.name}`)}
                onClick={() => jumpRef.current(i)}
                className="absolute top-1/2 grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center"
              >
                <span className="size-3 rotate-45 border-2 border-washi bg-sumi transition-colors hover:bg-kiln" />
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              aria-hidden
              className="block h-6 w-4 bg-agni [clip-path:polygon(0_0,100%_0,100%_100%,50%_75%,0_100%)]"
            />
            <p data-ribbon-text aria-live="polite" className="font-display text-14 text-washi">
              {workCopy.ribbon(1, projects.length)}
            </p>
            <span className="sr-only">{workCopy.ribbonLabel}</span>
          </div>
        </div>
      </div>

      {/* the loupe */}
      <div
        aria-hidden
        data-lens
        className="pointer-events-none fixed top-0 left-0 z-[60] size-40 rounded-full border-[3px] border-washi bg-sumi bg-no-repeat opacity-0 shadow-[0_0_0_3px_var(--sumi),0_10px_30px_rgb(0_0_0/0.5)] transition-opacity duration-150"
      />
    </section>
  );
}
