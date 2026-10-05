"use client";

import { useEffect, useRef, useState } from "react";
import { introCopy } from "@/content";
import { gsap, useGSAP } from "@/lib/gsap";
import { haptic } from "@/lib/haptics";
import { markIntroDone } from "@/lib/intro";
import { useLenis } from "@/lib/smooth-scroll";
import { sound, useSoundOn } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { FLAME_INNER, FLAME_OUTER } from "./flame-paths";

/** Floating grimoires in the hall: [left %, top %, width rem, cover colour, rotation, depth]. */
const BOOKS: [number, number, number, string, number, number][] = [
  [8, 18, 3.2, "#3b2a4a", -12, 0.6],
  [20, 52, 2.6, "#2c4033", 8, 0.4],
  [30, 10, 2.2, "#4a2a22", 16, 0.3],
  [70, 14, 3, "#26324a", -6, 0.55],
  [82, 46, 3.4, "#4a3a1e", 10, 0.7],
  [62, 62, 2.4, "#3a1e2c", -14, 0.35],
  [12, 74, 2.8, "#1e3a3a", 6, 0.5],
  [88, 76, 2.2, "#40281a", -10, 0.3],
  [46, 80, 2, "#2a2a40", 12, 0.25],
];

/** Shards the final frame breaks into, as polygons in a 100x100 box. */
const SHARDS = [
  "0,0 34,0 28,38 0,44",
  "34,0 70,0 62,30 28,38",
  "70,0 100,0 100,40 62,30",
  "0,44 28,38 36,70 0,76",
  "28,38 62,30 66,62 36,70",
  "62,30 100,40 100,66 66,62",
  "0,76 36,70 30,100 0,100",
  "36,70 66,62 70,100 30,100",
  "66,62 100,66 100,100 70,100",
];
const FLY: [number, number, number][] = [
  [-40, -50, -24],
  [0, -70, 12],
  [40, -50, 22],
  [-60, 10, -16],
  [-6, 30, 30],
  [60, 0, -20],
  [-40, 70, 18],
  [10, 80, -26],
  [50, 70, 14],
];

function Book({
  color,
  className,
  flame = false,
}: {
  color: string;
  className?: string;
  flame?: boolean;
}) {
  return (
    <div className={cn("relative aspect-[3/4] [perspective:600px]", className)}>
      {/* pages */}
      <div className="absolute inset-y-[4%] right-[2%] left-[6%] rounded-r-sm bg-[#e8d9b4] bg-[repeating-linear-gradient(0deg,transparent_0_9%,rgb(29_22_20/0.18)_9%_10%)]" />
      {/* covers: they swing open on the flame grimoire */}
      <div
        data-cover-l={flame || undefined}
        className="border-black/50 absolute inset-0 origin-left rounded-sm border-2 shadow-[0_6px_14px_rgb(0_0_0/0.5)] [backface-visibility:hidden]"
        style={{ background: `linear-gradient(135deg, ${color}, #0e0a09)` }}
      >
        <div className="bg-black/30 absolute inset-y-0 left-0 w-[14%]" />
        <div className="absolute inset-[16%] grid place-items-center rounded-full border border-[#c9a24a]/60">
          {flame ? (
            <svg viewBox="0 0 40 50" className="w-1/2">
              <path d={FLAME_OUTER} fill="var(--agni)" />
              <path d={FLAME_INNER} fill="var(--kiln)" />
            </svg>
          ) : (
            <span className="size-1/3 rotate-45 border border-[#c9a24a]/60" />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The opening ceremony, on every fresh load of the home page (not under
 * reduced motion or calm mode). A gate in an original magic tower: grimoires
 * drift in the dark while a mana bar fills with real loading progress; the
 * visitor taps to open (sound can be switched on here, since the tap is a
 * gesture), or skips at any moment (button or Esc). The ceremony: narration
 * in the owner's own lines, grimoires descend, one scorched book flies to the
 * viewer, bursts into flame and opens; the light freezes and shatters away
 * onto the hero. Hidden by CSS unless the head script set html[data-preload];
 * a CSS failsafe removes it if the script never starts.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const openBtn = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  const active = useRef(false);
  const play = useRef<() => void>(() => {});
  const skip = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"gate" | "ceremony">("gate");
  const soundOn = useSoundOn();

  useEffect(() => {
    lenisRef.current = lenis;
    if (active.current) lenis?.stop();
  }, [lenis]);

  // Real loading progress: images present at load, the web fonts, and window load.
  useEffect(() => {
    if (!document.documentElement.hasAttribute("data-preload")) return;
    const imgs = Array.from(document.images);
    let done = 0;
    const total = imgs.length + 2;
    const bump = () => setProgress(Math.min(++done / total, 1));
    imgs.forEach((img) =>
      img.complete ? bump() : img.addEventListener("load", bump, { once: true }),
    );
    imgs.forEach((img) => !img.complete && img.addEventListener("error", bump, { once: true }));
    void document.fonts.ready.then(bump);
    if (document.readyState === "complete") bump();
    else window.addEventListener("load", bump, { once: true });
    // never hold the gate on a stalled request
    const t = window.setTimeout(() => setProgress(1), 6000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (progress < 1 || ready) return;
    const t = window.setTimeout(() => setReady(true), 350);
    return () => window.clearTimeout(t);
  }, [progress, ready]);

  useEffect(() => {
    if (ready) openBtn.current?.focus();
  }, [ready]);

  useGSAP(
    () => {
      const html = document.documentElement;
      const el = root.current;
      if (!el || !html.hasAttribute("data-preload")) {
        markIntroDone();
        return;
      }
      active.current = true;
      lenisRef.current?.stop();
      el.setAttribute("data-started", "");
      const q = gsap.utils.selector(el);

      const finish = () => {
        html.removeAttribute("data-preload");
        active.current = false;
        lenisRef.current?.start();
        window.removeEventListener("keydown", onKey);
      };

      // idle: the hall's grimoires bob in the dark
      const idle = gsap.to(q("[data-float]"), {
        y: (i: number) => (i % 2 ? -14 : 12),
        rotation: (i: number) => (i % 2 ? 4 : -4),
        duration: (i: number) => 2.4 + (i % 3) * 0.6,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      const shatter = (tl: gsap.core.Timeline, at: number | string) =>
        tl
          .call(
            () => {
              markIntroDone();
              sound.play("impact");
              haptic("impact");
            },
            [],
            at,
          )
          .set(q("[data-scene]"), { autoAlpha: 0 }, at)
          .set(q("[data-shard]"), { autoAlpha: 1 }, at)
          .to(
            q("[data-shard]"),
            {
              xPercent: (i: number) => FLY[i]![0],
              yPercent: (i: number) => FLY[i]![1] + 40,
              rotation: (i: number) => FLY[i]![2],
              opacity: 0,
              duration: 0.9,
              ease: "power2.in",
              stagger: 0.025,
            },
            at,
          )
          .set(el, { autoAlpha: 0 })
          .call(finish);

      skip.current = () => {
        gsap.killTweensOf(q("*"));
        idle.kill();
        shatter(gsap.timeline(), 0);
      };
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") skip.current();
      };
      window.addEventListener("keydown", onKey);

      play.current = () => {
        setPhase("ceremony");
        sound.play("page");
        const lines = q("[data-line]");
        const say = (tl: gsap.core.Timeline, i: number, at: number) =>
          tl
            .fromTo(
              lines[i] ?? {},
              { clipPath: "inset(0% 100% 0% 0%)", opacity: 1 },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "steps(18)" },
              at,
            )
            .to(lines[i] ?? {}, { opacity: 0, duration: 0.3 }, at + 1.3);
        const tl = gsap.timeline();
        tl.to(q("[data-gate-ui]"), { autoAlpha: 0, duration: 0.3 }, 0)
          .call(() => idle.kill(), [], 0.2)
          // the grimoires descend through the hall
          .to(
            q("[data-float]"),
            {
              y: "+=60vh",
              rotation: "+=20",
              opacity: 0.25,
              duration: 2.6,
              ease: "power1.in",
              stagger: 0.08,
            },
            0.2,
          );
        say(tl, 0, 0.3);
        say(tl, 1, 1.7);
        // one scorched book flies out of the dark to the viewer...
        tl.fromTo(
          q("[data-chosen]"),
          { scale: 0.15, y: "-30vh", rotation: -40, opacity: 0 },
          { scale: 1, y: 0, rotation: 0, opacity: 1, duration: 1.3, ease: "power3.out" },
          1.8,
        )
          .call(() => sound.play("slash"), [], 2.4)
          // ...bursts into flame...
          .fromTo(
            q("[data-burst]"),
            { scale: 0.2, opacity: 0 },
            { scale: 1.4, opacity: 1, duration: 0.5, ease: "power2.out" },
            3.1,
          )
          .fromTo(
            q("[data-chosen]"),
            { x: 0 },
            { keyframes: { x: [4, -4, 3, -2, 0] }, duration: 0.4 },
            3.1,
          )
          // ...and opens; light floods out of its pages
          .to(
            q("[data-chosen] [data-cover-l]"),
            { rotationY: -165, duration: 0.6, ease: "power2.inOut" },
            3.5,
          )
          .fromTo(
            q("[data-light]"),
            { scale: 0.2, opacity: 0 },
            { scale: 3.2, opacity: 1, duration: 0.9, ease: "power2.in" },
            3.6,
          );
        say(tl, 2, 3.4);
        shatter(tl, 4.6);
      };
      return () => {
        idle.kill();
        window.removeEventListener("keydown", onKey);
      };
    },
    { scope: root },
  );

  const pct = Math.round(progress * 100);

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={introCopy.dialog}
      data-mode="colour"
      className="preloader fixed inset-0 z-[180] overflow-hidden text-washi"
    >
      <div
        data-scene
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#2a1a22,#0b0807_70%)]"
      >
        {/* the tower hall: tall moonlit arched windows between dark pillars (original) */}
        <svg
          aria-hidden
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="hall-window" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3a3360" stopOpacity="0.55" />
              <stop offset="0.6" stopColor="#241c34" stopOpacity="0.35" />
              <stop offset="1" stopColor="#120c12" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[120, 460, 800, 1140, 1480].map((x) => (
            <g key={x}>
              <path
                d={`M${x - 90} 900 V380 Q${x} 160 ${x + 90} 380 V900 Z`}
                fill="url(#hall-window)"
              />
              <path
                d={`M${x} 180 V900 M${x - 90} 520 H${x + 90}`}
                stroke="#0b0807"
                strokeOpacity="0.8"
                strokeWidth="8"
              />
            </g>
          ))}
          {[290, 630, 970, 1310].map((x) => (
            <path
              key={x}
              d={`M${x - 26} 300 V180 Q${x} 120 ${x + 26} 180 V300 Z`}
              fill="#c9a24a"
              fillOpacity="0.1"
            />
          ))}
          <rect x="0" y="820" width="1600" height="80" fill="#050303" />
        </svg>
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgb(201_162_74/0.08),transparent)]"
        />

        {BOOKS.map(([left, top, w, color, rot], i) => (
          <div
            key={i}
            aria-hidden
            data-float
            className="absolute"
            style={{ left: `${left}%`, top: `${top}%`, width: `${w}rem`, rotate: `${rot}deg` }}
          >
            <Book color={color} />
          </div>
        ))}

        {/* the chosen grimoire, and the light that pours out of it */}
        <div
          aria-hidden
          data-light
          className="absolute top-1/2 left-1/2 size-[40vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#fff8e6,rgb(255_200_130/0.8)_35%,transparent_70%)] opacity-0"
        />
        <div
          aria-hidden
          data-burst
          className="absolute top-1/2 left-1/2 size-[46vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_160_80/0.85),rgb(194_39_45/0.5)_45%,transparent_70%)] opacity-0 blur-md"
        />
        <div
          aria-hidden
          data-chosen
          className="absolute top-1/2 left-1/2 w-[min(34vw,13rem)] -translate-x-1/2 -translate-y-1/2 opacity-0"
        >
          <Book color="#4a1a14" flame />
        </div>

        {/* narration */}
        <div aria-live="polite" className="absolute inset-x-0 bottom-[16%] px-6 text-center">
          {introCopy.lines.map((l) => (
            <p
              key={l}
              data-line
              className="absolute inset-x-0 font-display text-24 opacity-0 [text-shadow:0_2px_12px_#000] md:text-36"
            >
              {phase === "ceremony" ? l : ""}
            </p>
          ))}
        </div>

        {/* the gate */}
        <div
          data-gate-ui
          className="pointer-events-none absolute inset-0 z-20 flex [transform:translateZ(1px)] flex-col items-center justify-end gap-5 bg-[linear-gradient(to_top,#0b0807_22%,rgb(11_8_7/0.85)_34%,transparent_52%)] px-6 pb-[12svh] text-center [&>*]:pointer-events-auto"
        >
          <div className="w-[min(80vw,24rem)]">
            <p className="mb-2 font-display text-14 tracking-[0.25em] text-[#c9a24a] uppercase">
              {ready ? introCopy.ready : introCopy.loading}
            </p>
            <div
              role="progressbar"
              aria-label={introCopy.loading}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pct}
              className="bg-black/50 relative h-3 overflow-hidden rounded-full border-2 border-[#c9a24a]/70"
            >
              <div
                className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,#3b6fd0,#8fd3ff,#c9a24a)] shadow-[0_0_12px_#8fd3ff] transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <button
            ref={openBtn}
            type="button"
            disabled={!ready}
            onClick={() => play.current()}
            className="bg-black/40 border-[3px] border-washi px-6 py-3 font-display text-18 transition-[opacity,box-shadow] duration-300 enabled:animate-pulse enabled:hover:shadow-[0_0_24px_#c9a24a] disabled:opacity-30 md:text-24"
          >
            {introCopy.tap}
          </button>
          <button
            type="button"
            aria-pressed={soundOn}
            onClick={() => sound.toggle()}
            className="text-14 text-[var(--tone-light)] underline-offset-4 hover:underline"
          >
            {introCopy.sound}: {soundOn ? "On" : "Off"}
          </button>
        </div>
      </div>

      {/* the frozen final frame, broken into shards for the hand-over */}
      {SHARDS.map((pts, i) => (
        <div
          key={i}
          aria-hidden
          data-shard
          className="invisible absolute inset-0 opacity-0"
          style={{
            clipPath: `polygon(${pts
              .split(" ")
              .map((p) =>
                p
                  .split(",")
                  .map((v) => `${v}%`)
                  .join(" "),
              )
              .join(", ")})`,
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#fff8e6,#ffc882_22%,#7a2a1a_55%,#0b0807_85%)]" />
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <polygon
              points={pts}
              fill="none"
              stroke="#1d1614"
              strokeWidth="0.6"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      ))}

      <button
        type="button"
        onClick={() => skip.current()}
        className="absolute top-4 right-4 z-40 border-2 border-washi/60 bg-[#0b0807] px-3 py-1 font-display text-14 hover:border-washi"
      >
        {introCopy.skip} <span className="text-[var(--tone-light)]">({introCopy.escHint})</span>
      </button>
    </div>
  );
}
