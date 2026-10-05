"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { credits, limitBreakCopy, profile, runeCopy, sections } from "@/content";
import { drawRig, makeRig, P, type Pose } from "@/components/sections/about/stickman";
import { Stickman } from "@/components/sections/about/stickman";
import { isCalm } from "@/lib/calm";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { haptic } from "@/lib/haptics";
import { prefersReducedMotion } from "@/lib/motion";
import { useRunes } from "@/lib/runes";
import { useLenis } from "@/lib/smooth-scroll";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

/* ---------- the walk toward the sunset ---------- */

const WALK_A = P(
  [
    [4, 100],
    [6, 116],
    [0, 160],
    [14, 136],
    [22, 154],
    [-8, 136],
    [-14, 154],
    [14, 186],
    [24, 210],
    [-10, 186],
    [-22, 210],
  ],
  0,
);
const WALK_B = P(
  [
    [4, 102],
    [6, 118],
    [0, 162],
    [-6, 138],
    [-12, 156],
    [12, 138],
    [20, 156],
    [-6, 188],
    [-16, 210],
    [12, 188],
    [22, 210],
  ],
  0,
);
const WAVE = P(
  [
    [4, 100],
    [6, 116],
    [0, 160],
    [22, 104],
    [30, 82],
    [-8, 136],
    [-14, 154],
    [14, 186],
    [22, 210],
    [-12, 186],
    [-22, 210],
  ],
  0,
);
const mix = (a: Pose, b: Pose, t: number) => a.map((v, i) => v + (b[i]! - v) * t);
const START = makeRig("idle", 60, 1);
START.pose = [...WALK_A];

/** A silhouette walks toward a setting sun, scrubbed by the credits (setProgress). */
export function SunsetWalk({ progress }: { progress: { current: number } }) {
  const g = useRef<SVGGElement>(null);
  const sun = useRef<SVGCircleElement>(null);
  useEffect(() => {
    const rig = makeRig("idle", 60, 1);
    let raf = 0;
    const tick = () => {
      const p = progress.current;
      const phase = (p * 14) % 1;
      const t = phase < 0.5 ? phase * 2 : 2 - phase * 2;
      rig.pose = mix(WALK_A, WALK_B, gsap.parseEase("sine.inOut")(t));
      rig.x = 60 + p * 260;
      drawRig(g.current, rig);
      sun.current?.setAttribute("cy", String(150 + p * 70));
      raf = requestAnimationFrame(tick);
    };
    if (!prefersReducedMotion()) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress]);
  return (
    <svg aria-hidden viewBox="0 0 400 240" className="w-full overflow-hidden">
      <defs>
        <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1a22" />
          <stop offset="0.7" stopColor="#7a2a1a" />
          <stop offset="1" stopColor="#e2622b" />
        </linearGradient>
        <clipPath id="above-horizon">
          <rect x="0" y="0" width="400" height="212" />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="400" height="212" fill="url(#dusk)" opacity="0.65" />
      <circle
        ref={sun}
        cx="330"
        cy="160"
        r="46"
        fill="#ffb36b"
        clipPath="url(#above-horizon)"
        className="[filter:drop-shadow(0_0_24px_#e2622b)]"
      />
      {[176, 188, 198].map((y) => (
        <rect key={y} x="0" y={y} width="400" height="3" fill="#2a1a22" opacity="0.7" />
      ))}
      <line x1="0" y1="212" x2="400" y2="212" stroke="var(--washi)" strokeWidth="2" />
      <rect x="0" y="212" width="400" height="28" fill="#140e0d" />
      <Stickman ref={g} rig={START} blade="none" className="text-[#140e0d]" />
    </svg>
  );
}

/** The stickman who pops up after the credits if you wait at the bottom. */
export function PostCredits() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const g = el.querySelector<SVGGElement>("[data-pc-rig]");
    const rig = makeRig("idle", 40, 1);
    rig.pose = [...WAVE];
    drawRig(g, rig);
    let timer = 0;
    let played = false;
    const atBottom = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    const onScroll = () => {
      window.clearTimeout(timer);
      if (played || !atBottom() || isCalm()) return;
      timer = window.setTimeout(() => {
        if (!atBottom()) return;
        played = true;
        const arm = { t: 0 };
        gsap
          .timeline()
          .fromTo(
            el,
            { y: 0, yPercent: 100 },
            { y: 0, yPercent: 0, duration: 0.45, ease: "back.out(2)" },
          )
          .to(arm, {
            t: 1,
            duration: 0.25,
            repeat: 5,
            yoyo: true,
            ease: "sine.inOut",
            onUpdate: () => {
              rig.pose = mix(
                WAVE,
                P(
                  [
                    [4, 100],
                    [6, 116],
                    [0, 160],
                    [30, 108],
                    [44, 92],
                    [-8, 136],
                    [-14, 154],
                    [14, 186],
                    [22, 210],
                    [-12, 186],
                    [-22, 210],
                  ],
                  0,
                ),
                arm.t,
              );
              drawRig(g, rig);
            },
          })
          .to(el, { yPercent: 100, duration: 0.35, ease: "power2.in" }, "+=0.2");
      }, 3000);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, []);
  return (
    // The clip box sits on the bottom bar's top edge; the stickman waits below it until it pops up.
    <div
      aria-hidden
      className="pointer-events-none absolute right-[22%] bottom-full h-32 w-24 overflow-hidden"
    >
      <div ref={ref} className="h-full w-full" style={{ transform: "translateY(100%)" }}>
        <svg viewBox="0 0 80 240" className="h-full w-full text-washi">
          <g data-pc-rig>
            <Stickman rig={makeRig("idle", 40, 1)} blade="none" />
          </g>
        </svg>
      </div>
    </div>
  );
}

/* ---------- next episode ---------- */

/** "Next time: The Internship Arc!" anime preview card, from the real availability. */
export function NextEpisode() {
  if (!profile.availability) return null;
  return (
    <div
      data-next-ep
      className="relative mx-auto max-w-2xl overflow-hidden border-[3px] border-washi bg-sumi px-6 py-8 text-center"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[repeating-conic-gradient(from_0deg_at_50%_50%,transparent_0deg_6deg,rgb(235_220_185/0.06)_6deg_8deg)]"
      />
      <p data-next-small className="relative font-display text-18 text-kiln italic">
        {credits.nextTime}
      </p>
      <p data-next-title className="relative mt-1 font-display text-36 md:text-56">
        {credits.nextTitle}
      </p>
      <p className="relative mt-2 text-18 text-muted">{profile.availability}</p>
      <a
        href={`/#${sections.contact.id}`}
        className="relative mt-5 inline-block ink-link font-display text-18"
      >
        {credits.nextCta}
      </a>
    </div>
  );
}

/* ---------- small bottom-bar pieces ---------- */

/** Five slots that light up for the hidden runes this visitor has found. */
export function RuneProgress() {
  const found = useRunes();
  return (
    <div className="flex items-center gap-3 text-14 text-muted" title={credits.runesHint}>
      <span>{credits.runes}</span>
      <span
        className="flex gap-1.5"
        aria-label={runeCopy.found(found.length, runeCopy.total)}
        role="img"
      >
        {Array.from({ length: runeCopy.total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "size-3 rotate-45 border-2 transition-[background-color,box-shadow] duration-500",
              i < found.length
                ? "border-aura bg-aura shadow-[0_0_8px_var(--aura)]"
                : "border-washi/40",
            )}
          />
        ))}
      </span>
      <span className="font-display text-washi">
        {found.length} / {runeCopy.total}
      </span>
    </div>
  );
}

/** A faint hint toward the Konami limit break that glitches in on hover. */
export function Whisper() {
  return (
    <p className="group/whisper text-14 text-muted italic">
      <span className="inline-block group-hover/whisper:animate-[glitch_0.35s_steps(2)_2] group-hover/whisper:[text-shadow:2px_0_var(--agni),-2px_0_#4fb3c9]">
        {limitBreakCopy.consoleHint}
      </span>
    </p>
  );
}

const buildDate = () => {
  const iso = process.env.NEXT_PUBLIC_BUILD_DATE;
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

/** "Last updated" library-card stamp, from the real build date. */
export function UpdatedStamp() {
  const date = buildDate();
  if (!date) return null;
  return (
    <span className="inline-block -rotate-2 border-2 border-dashed border-washi/40 px-2 py-0.5 font-mono text-[12px] text-muted">
      {credits.updated(date)}
    </span>
  );
}

/** A social link as a red hanko stamp that presses down and leaves an ink mark. */
export function Hanko({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group/hanko relative inline-flex items-center border-[3px] border-[#c2272d] px-2 py-0.5 font-display text-14 text-washi transition-transform duration-150 ease-out hover:scale-95 hover:-rotate-3 hover:text-[#ff8a7a] active:scale-90"
    >
      <span aria-hidden className="absolute inset-1 border border-[#c2272d]/50" />
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2 -z-10 scale-50 rounded-full bg-[radial-gradient(circle,rgb(194_39_45/0.45),transparent_65%)] opacity-0 transition-[opacity,scale] duration-300 group-hover/hanko:scale-100 group-hover/hanko:opacity-100"
      />
      <span className="relative">{label}</span>
    </a>
  );
}

/** A slow strip of the tools this site is built with, in ink lettering. */
export function TechMarquee() {
  const run = (k: number) =>
    credits.tech.map((t) => (
      <span key={`${k}-${t}`} className="flex shrink-0 items-center gap-5 pr-5">
        <span className="font-brush text-24 whitespace-nowrap text-washi/80">{t}</span>
        <span className="text-agni">✦</span>
      </span>
    ));
  return (
    <div aria-hidden className="overflow-hidden border-y-2 border-washi/15 py-2">
      <div className="flex w-max animate-[tech-marquee_40s_linear_infinite] motion-reduce:animate-none [html[data-calm]_&]:animate-none">
        {run(0)}
        {run(1)}
      </div>
    </div>
  );
}

/* ---------- back to top ---------- */

const scrolled = {
  subscribe: (fn: () => void) => {
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  },
  get: () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? Math.round((window.scrollY / max) * 100) / 100 : 0;
  },
};

/**
 * Back to top with a ring showing how far down you are. Click to fly up on a
 * flame trail while the page rewinds (sepia tint, speed lines, a ◀◀ counter
 * through the chapters); hold first to charge a summoning circle for a bigger
 * launch. Instant under reduced motion; plain smooth scroll in calm mode.
 */
export function BackToTop() {
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);
  const progress = useSyncExternalStore(scrolled.subscribe, scrolled.get, () => 0);
  const charge = useRef<gsap.core.Tween | null>(null);
  const chargeLevel = useRef(0);
  const circle = useRef<SVGSVGElement>(null);
  const [launching, setLaunching] = useState(false);

  const launch = () => {
    const power = chargeLevel.current;
    chargeLevel.current = 0;
    charge.current?.kill();
    if (circle.current) gsap.to(circle.current, { scale: 0, opacity: 0, duration: 0.2 });
    const reduced = prefersReducedMotion();
    const calm = isCalm();
    const go = (duration: number) => {
      if (lenisRef.current) lenisRef.current.scrollTo(0, { duration, immediate: duration === 0 });
      else window.scrollTo({ top: 0, behavior: duration ? "smooth" : "auto" });
    };
    if (reduced) return go(0);
    if (calm) return go(1);
    const duration = 1.2 + power * 0.4;
    sound.play("slash");
    haptic("impact");
    setLaunching(true);
    const html = document.documentElement;
    html.setAttribute("data-rewind", "");
    // the ◀◀ counter ticks back through the chapters
    const label = document.querySelector<HTMLElement>("[data-rewind-label]");
    const names = [...Object.values(sections)].reverse().map((s) => s.heading);
    names.forEach((n, i) =>
      window.setTimeout(
        () => label && (label.textContent = `◀◀ ${credits.rewind} · ${n}`),
        (i / names.length) * duration * 1000,
      ),
    );
    const trail = document.querySelector<HTMLElement>("[data-flame-trail]");
    if (trail) {
      gsap.fromTo(
        trail,
        { scaleY: 0, opacity: 1, width: 20 + power * 30 },
        {
          scaleY: 1,
          duration: duration * 0.6,
          ease: "power2.in",
          onComplete: () => void gsap.to(trail, { opacity: 0, duration: 0.4 }),
        },
      );
    }
    go(duration);
    window.setTimeout(
      () => {
        html.removeAttribute("data-rewind");
        setLaunching(false);
        ScrollTrigger.update();
      },
      duration * 1000 + 150,
    );
  };

  const startCharge = () => {
    if (prefersReducedMotion() || isCalm() || !circle.current) return;
    chargeLevel.current = 0;
    gsap.set(circle.current, { scale: 0.4, opacity: 1 });
    charge.current = gsap.to(circle.current, {
      scale: 1.3,
      rotation: 360,
      duration: 0.9,
      ease: "power1.in",
      onUpdate() {
        chargeLevel.current = this.progress();
      },
    });
  };

  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <>
      <button
        type="button"
        onPointerDown={startCharge}
        onPointerLeave={() => {
          if (chargeLevel.current > 0 && circle.current)
            gsap.to(circle.current, { scale: 0, opacity: 0, duration: 0.2 });
          charge.current?.kill();
          chargeLevel.current = 0;
        }}
        onClick={launch}
        aria-label={`${credits.backToTop} (${Math.round(progress * 100)}%)`}
        title={credits.holdHint}
        className="group/top relative grid size-14 place-items-center"
      >
        <svg
          ref={circle}
          aria-hidden
          viewBox="0 0 60 60"
          className="pointer-events-none absolute -inset-4 size-[calc(100%+2rem)] scale-0 text-aura opacity-0"
        >
          <circle
            cx="30"
            cy="30"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="3 4"
          />
          <polygon points="30,6 51,42 9,42" fill="none" stroke="var(--kiln)" strokeWidth="1" />
          <polygon points="30,54 9,18 51,18" fill="none" stroke="var(--kiln)" strokeWidth="1" />
        </svg>
        <svg aria-hidden viewBox="0 0 50 50" className="absolute inset-0 -rotate-90">
          <circle
            cx="25"
            cy="25"
            r={r}
            fill="none"
            stroke="var(--washi)"
            strokeOpacity="0.15"
            strokeWidth="3"
          />
          <circle
            cx="25"
            cy="25"
            r={r}
            fill="none"
            stroke="var(--kiln)"
            strokeWidth="3"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - progress)}
            className="transition-[stroke-dashoffset] duration-150"
          />
        </svg>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={cn(
            "relative size-6 text-washi transition-transform group-hover/top:-translate-y-0.5",
            launching && "-translate-y-2",
          )}
        >
          <path d="M12 4 L19 13 H14 V20 H10 V13 H5 Z" fill="currentColor" />
        </svg>
      </button>
      {/* full-screen effects for the flight up (fixed, outside any transformed parent) */}
      <div aria-hidden className="rewind-fx pointer-events-none fixed inset-0 z-[95]">
        <div className="absolute inset-0 bg-[rgb(120_80_40/0.25)] [backdrop-filter:sepia(0.75)]" />
        <div className="absolute inset-0 animate-[rewind-lines_0.25s_linear_infinite] bg-[repeating-linear-gradient(180deg,transparent_0_40px,rgb(235_220_185/0.12)_40px_42px)]" />
        <p
          data-rewind-label
          className="absolute top-20 left-6 border-2 border-washi bg-sumi px-3 py-1 font-display text-18 text-washi"
        />
      </div>
      <div
        aria-hidden
        data-flame-trail
        className="pointer-events-none fixed right-[calc(2.5rem+1.75rem)] bottom-6 z-[96] h-[100svh] origin-bottom translate-x-1/2 scale-y-0 rounded-full bg-[linear-gradient(to_top,#fff4e0,#ffb36b_20%,var(--agni)_55%,transparent)] opacity-0 blur-[2px]"
      />
    </>
  );
}
