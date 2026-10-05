"use client";

import { useRef, useState } from "react";
import { Duel } from "@/components/motion/Duel";
import { MangaBackdrop } from "@/components/motion/MangaBackdrop";
import { ImpactWord, type ImpactWordHandle } from "@/components/motion/ImpactWord";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { Grimoire } from "@/components/sections/contact/Grimoire";
import { JaggedEdge } from "@/components/ui/JaggedEdge";
import { Rune } from "@/components/ui/Rune";
import { credits, profile, sfxCopy } from "@/content";
import { Signature } from "@/components/sections/hero/Signature";
import { impactFrame } from "@/lib/impact";
import { sound } from "@/lib/sound";
import {
  BackToTop,
  Hanko,
  NextEpisode,
  PostCredits,
  RuneProgress,
  SunsetWalk,
  TechMarquee,
  UpdatedStamp,
  Whisper,
} from "./footer/FooterParts";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";

const KATAKANA =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン";

// Ember positions, fixed so server and client render the same markup.
const EMBERS = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 3 + (i % 4),
  duration: 6 + (i % 5),
  delay: -((i * 1.7) % 9),
  drift: ((i % 7) - 3) * 14,
  hot: i % 3 === 0,
}));

/**
 * A duel, then the credits roll under an anti-magic energy horizon, embers rising behind.
 * At the very end the grimoire slams shut. Static list without JS or under
 * reduced motion.
 */
export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const [closed, setClosed] = useState(false);
  const endScene = useRef<HTMLDivElement>(null);
  const [focusLines, setFocusLines] = useState(0.3);
  const word = useRef<ImpactWordHandle>(null);
  const walk = useRef(0);

  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const win = el.querySelector<HTMLElement>("[data-roll-window]");
    const roll = el.querySelector<HTMLElement>("[data-roll]");
    const book = el.querySelector<HTMLElement>("[data-end-book]");
    if (!win || !roll) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-credit]"));
    const q = gsap.utils.selector(el);
    // "Next time" card slams in
    gsap
      .timeline({
        scrollTrigger: { trigger: q("[data-next-ep]")[0], start: "top 80%", once: true },
      })
      .from(q("[data-next-ep]"), { clipPath: "inset(50% 0% 50% 0%)", duration: 0.35, ease: "snap" })
      .from(q("[data-next-small]"), { x: -40, opacity: 0, duration: 0.3 }, 0.2)
      .from(
        q("[data-next-title]"),
        {
          scale: 2,
          opacity: 0,
          duration: 0.25,
          ease: "steps(4)",
          onComplete: () => sound.play("impact"),
        },
        0.3,
      );
    win.setAttribute("data-rolling", "");
    gsap.fromTo(
      roll,
      { y: () => win.clientHeight },
      {
        y: () => -(roll.offsetHeight - win.clientHeight * 0.55),
        ease: "none",
        scrollTrigger: {
          trigger: win,
          start: "top bottom",
          end: "bottom 40%",
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            walk.current = self.progress;
            // each credit scrambles out of katakana into English as it rises into view
            const w = win.getBoundingClientRect();
            rows.forEach((row) => {
              if (row.dataset.done) return;
              if (row.getBoundingClientRect().top < w.bottom - w.height * 0.2) {
                row.dataset.done = "1";
                row.querySelectorAll<HTMLElement>("dt, dd").forEach((n, k) =>
                  gsap.to(n, {
                    duration: 0.9,
                    delay: k * 0.15,
                    scrambleText: {
                      text: n.textContent ?? "",
                      chars: KATAKANA,
                      speed: 0.5,
                      revealDelay: 0.3,
                    },
                  }),
                );
              }
            });
          },
        },
      },
    );

    gsap.from(el.querySelector("[data-final-panel] polygon"), {
      drawSVG: "0%",
      duration: 1.2,
      ease: "ink",
      scrollTrigger: {
        trigger: el.querySelector("[data-final-panel]"),
        start: "top 80%",
        once: true,
      },
    });

    // The book closes when the visitor reaches the very end, with a shudder.
    ScrollTrigger.create({
      trigger: el,
      start: "bottom bottom+=2",
      onEnter: () => {
        setClosed(true);
        // the book slams shut: BAM, shockwave, shake
        window.setTimeout(() => {
          setFocusLines(0.95);
          window.setTimeout(() => setFocusLines(0.3), 500);
          const scene = endScene.current;
          if (scene) {
            gsap.fromTo(
              scene,
              { x: 7, y: -4 },
              {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1.2, 0.25)",
                clearProps: "transform",
              },
            );
          }
          word.current?.play(sfxCopy.hit, 68, 38);
          // embers flare, the end stamp lands, the signature signs off
          gsap.fromTo(
            q("[data-burst-ember]"),
            { y: 0, x: 0, opacity: 1, scale: 1 },
            {
              y: (i: number) => -160 - ((i * 37) % 9) * 30,
              x: (i: number) => (((i * 53) % 11) - 5) * 26,
              opacity: 0,
              scale: 0.4,
              duration: 1.4,
              ease: "power2.out",
              stagger: 0.02,
            },
          );
          gsap.fromTo(
            q("[data-fin]"),
            { scale: 3, opacity: 0, rotation: -25 },
            {
              scale: 1,
              opacity: 1,
              rotation: -8,
              duration: 0.25,
              ease: "steps(3)",
              delay: 0.45,
              onStart: () => {
                sound.play("stamp");
                impactFrame(0.7);
              },
            },
          );
          gsap.fromTo(
            q("[data-fin-splash] circle"),
            { scale: 0, opacity: 0.9 },
            {
              scale: 1,
              opacity: 0,
              duration: 0.7,
              delay: 0.5,
              stagger: 0.03,
              transformOrigin: "50% 50%",
            },
          );
          gsap.fromTo(
            q("[data-sign-ink]"),
            { clipPath: "inset(-30% 100% -30% 0%)" },
            { clipPath: "inset(-30% -30% -30% 0%)", duration: 0.6, delay: 0.8, ease: "steps(9)" },
          );
          gsap.fromTo(
            q("[data-seal]"),
            { scale: 2.2, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.2, delay: 1.4, ease: "steps(3)" },
          );
        }, 380);
        if (book) {
          gsap.fromTo(
            book,
            { x: -4 },
            { x: 0, duration: 0.35, ease: "elastic.out(1, 0.25)", delay: 0.35 },
          );
        }
      },
      onLeaveBack: () => setClosed(false),
    });
    return () => win.removeAttribute("data-rolling");
  }, ref);

  const socials = [
    profile.links.github,
    profile.links.linkedin,
    ...profile.links.others,
    { label: profile.email, href: `mailto:${profile.email}` },
  ];

  return (
    <footer ref={ref} data-mode="colour" className="relative overflow-hidden">
      {/* Anti-magic energy horizon */}
      <div aria-hidden className="relative">
        <div className="mana-line h-[2px]" />
        <JaggedEdge height={16} seed={9} />
      </div>

      {/* Embers drifting up behind the credits */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className="absolute bottom-0 rounded-full"
            style={{
              left: `${e.left}%`,
              width: e.size,
              height: e.size,
              background: e.hot ? "var(--kiln)" : "var(--agni)",
              boxShadow: `0 0 ${e.size * 2}px ${e.hot ? "var(--kiln)" : "var(--agni)"}`,
              animation: `ember-rise ${e.duration}s linear ${e.delay}s infinite`,
              ["--drift" as string]: `${e.drift}px`,
            }}
          />
        ))}
      </div>

      {/* Two fighters clash before the credits roll */}
      <Duel />

      <h2 className="sr-only">{credits.heading}</h2>
      <div className="relative grid items-center gap-8 px-4 md:px-10 lg:grid-cols-[1.1fr_1fr]">
        <div
          data-roll-window
          className="relative py-16 data-rolling:h-[60svh] data-rolling:overflow-hidden data-rolling:[mask-image:linear-gradient(transparent,#000_18%,#000_82%,transparent)] data-rolling:py-0 md:px-10"
        >
          <div data-roll className="mx-auto max-w-2xl text-center">
            <dl className="space-y-10">
              {credits.rows.map((row) => (
                <div key={row.label} data-credit>
                  <dt className="text-14 text-muted">{row.label}</dt>
                  <dd className="mt-1 font-display text-24 md:text-36">{row.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex justify-center">
              <Rune index={4} />
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl border-[3px] border-washi">
          <SunsetWalk progress={walk} />
        </div>
      </div>
      <div className="relative mt-6">
        <TechMarquee />
      </div>
      <div className="relative px-4 py-14 md:px-10">
        <NextEpisode />
      </div>

      {/* The end: the grimoire closes */}
      <div className="relative overflow-hidden px-4 pt-10 pb-4 text-center md:px-10">
        <MangaBackdrop layout="finale" className="absolute inset-0" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/2">
          {Array.from({ length: 22 }, (_, i) => (
            <span
              key={i}
              data-burst-ember
              className="absolute size-1.5 rounded-full bg-kiln opacity-0 shadow-[0_0_8px_var(--agni)]"
            />
          ))}
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0 text-washi/20">
          <SpeedLines variant="radial" intensity={focusLines} />
        </div>
        {/* the final panel: an ink border that draws itself around the ending */}
        <svg
          aria-hidden
          data-final-panel
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-4 inset-y-6 h-[calc(100%-3rem)] w-[calc(100%-2rem)] overflow-visible md:inset-x-10 md:w-[calc(100%-5rem)]"
        >
          <polygon
            points="0,4 100,0 100,100 0,96"
            fill="none"
            stroke="var(--washi)"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div ref={endScene} className="relative [text-shadow:0_2px_16px_var(--sumi)]">
          <ImpactWord ref={word} className="text-96" />
          <p className="font-display text-56 md:text-96">{credits.ending}</p>
          <div data-end-book className="mx-auto mt-2 max-w-sm">
            <Grimoire
              open={!closed}
              charge={closed ? 3 : 1}
              turn={0}
              cast={closed ? 1 : 0}
              className="h-72"
            />
          </div>
          <div className="relative mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Signature />
            <div className="relative">
              <svg
                aria-hidden
                data-fin-splash
                viewBox="-60 -60 120 120"
                className="pointer-events-none absolute top-1/2 left-1/2 size-40 -translate-x-1/2 -translate-y-1/2 overflow-visible"
              >
                {[
                  [-40, -10, 8],
                  [34, -24, 6],
                  [40, 20, 9],
                  [-30, 30, 6],
                  [6, -40, 4],
                  [-50, 6, 4],
                ].map(([x, y, r]) => (
                  <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#c2272d" opacity="0" />
                ))}
              </svg>
              <p
                data-fin
                className="relative grid size-20 place-items-center border-[4px] border-[#c2272d] font-display text-36 text-[#c2272d] sm:size-24 sm:text-56 md:size-28 md:text-[4.5rem]"
              >
                <span aria-hidden>{credits.fin}</span>
                <span className="sr-only">{credits.finLabel}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t-2 border-washi/15 px-4 pt-6 pb-10 text-14 md:px-10">
        <PostCredits />
        <div className="flex flex-wrap items-center justify-between gap-6">
          <ul className="flex flex-wrap gap-3">
            {socials.map((l) => (
              <li key={l.href}>
                <Hanko label={l.label} href={l.href} />
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-6 text-muted">
            <p>
              © {new Date().getFullYear()} {profile.name.full}
            </p>
            <BackToTop />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <RuneProgress />
          <Whisper />
          <UpdatedStamp />
        </div>
      </div>
    </footer>
  );
}
