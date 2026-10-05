"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { Rune } from "@/components/ui/Rune";
import { heroCopy, heroTiltCopy, profile, sections } from "@/content";
import { Flame } from "@/components/gl/Flame";
import { Button, buttonClass } from "@/components/ui/Button";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { Panel } from "@/components/ui/Panel";
import { Portrait } from "@/components/ui/Portrait";
import { antiMagic } from "@/lib/anti-magic";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { onIntroDone } from "@/lib/intro";
import { useMotion } from "@/lib/use-motion";
import { HeroName } from "./hero/HeroName";
import { FloatingPages } from "./hero/FloatingPages";
import { HeroStatus } from "./hero/HeroStatus";
import { RoleRotator } from "./hero/RoleRotator";
import { Signature } from "./hero/Signature";
import { ImpactWord, type ImpactWordHandle } from "@/components/motion/ImpactWord";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { impactFrame } from "@/lib/impact";

// The reveal plays once per page load; client-side returns show the final state.
let played = false;

// Flame area around the portrait panel, as insets of the portrait cell (%).
const FLAME_INSET = { top: 30, side: 14, bottom: 2 };
const flameBox = {
  top: `-${FLAME_INSET.top}%`,
  left: `-${FLAME_INSET.side}%`,
  right: `-${FLAME_INSET.side}%`,
  bottom: `-${FLAME_INSET.bottom}%`,
};

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [interactive, setInteractive] = useState(false);
  const [tiltAsk, setTiltAsk] = useState(false);
  // Set on <html> before paint by the head script; nothing on the server.
  const tod = useSyncExternalStore(
    () => () => {},
    () => (document.documentElement.dataset.tod ?? null) as keyof typeof heroCopy.timeOfDay | null,
    () => null,
  );
  const tiltRequest = useRef<(() => Promise<void>) | null>(null);
  const dropWord = useRef<ImpactWordHandle>(null);
  const { tagline, resume } = profile;

  useMotion((ctx, el) => {
    const q = gsap.utils.selector(el);
    const reveal = () => {
      el.setAttribute("data-revealed", "");
      setInteractive(true);
    };

    // Anti-magic ends once the hero scrolls away.
    ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom 20%",
      onLeave: () => antiMagic.set(false),
    });

    // Depth layers: pointer on desktop, device tilt on phones. Off under reduced motion.
    const parallax = (): (() => void) => {
      if (ctx.reduced) return () => {};
      const layers = q("[data-depth]").map((node) => ({
        x: gsap.quickTo(node, "x", { duration: 0.9, ease: "power3" }),
        y: gsap.quickTo(node, "y", { duration: 0.9, ease: "power3" }),
        d: Number((node as HTMLElement).dataset.depth),
      }));
      const names = q("[data-name-latin] [data-ch]") as HTMLElement[];
      const apply = (px: number, py: number) => {
        if (!el.hasAttribute("data-revealed")) return;
        layers.forEach((l) => {
          l.x(px * l.d);
          l.y(py * l.d);
        });
      };
      if (ctx.desktop) {
        // Heat: letters near the pointer lean away and glow, like hot metal.
        let raf = 0;
        let px = 0;
        let py = 0;
        const heat = () => {
          raf = 0;
          const live = el.hasAttribute("data-revealed") && el.getBoundingClientRect().bottom > 0;
          names.forEach((c) => {
            const r = c.getBoundingClientRect();
            const dx = r.left + r.width / 2 - px;
            const dy = r.top + r.height / 2 - py;
            const d = Math.hypot(dx, dy) || 1;
            const k = live ? Math.max(0, 1 - d / 380) : 0;
            c.style.setProperty("--hx", `${((dx / d) * k * 12).toFixed(1)}px`);
            c.style.setProperty("--hy", `${((dy / d) * k * 9).toFixed(1)}px`);
            c.style.setProperty("--heat", (k ** 1.4).toFixed(2));
          });
        };
        const onMove = (e: PointerEvent) => {
          apply(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
          px = e.clientX;
          py = e.clientY;
          if (!raf) raf = requestAnimationFrame(heat);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => {
          cancelAnimationFrame(raf);
          window.removeEventListener("pointermove", onMove);
        };
      }
      const clamp = gsap.utils.clamp(-0.5, 0.5);
      let heard = false;
      const onTilt = (e: DeviceOrientationEvent) => {
        if (e.gamma == null || e.beta == null) return;
        heard = true;
        const gx = clamp(e.gamma / 60);
        apply(gx, clamp((e.beta - 45) / 60));
        // the name's letters sway gently with the tilt
        names.forEach((c, i) =>
          c.style.setProperty("--hx", `${(gx * 8 * (1 + (i % 3) * 0.35)).toFixed(1)}px`),
        );
      };
      // Listen straight away (Android sends events freely). If nothing arrives and the
      // browser gates motion behind a permission (iOS), offer a button to ask.
      window.addEventListener("deviceorientation", onTilt);
      const DOE = window.DeviceOrientationEvent as unknown as
        { requestPermission?: () => Promise<"granted" | "denied"> } | undefined;
      const askTimer = window.setTimeout(() => {
        if (heard || typeof DOE?.requestPermission !== "function") return;
        tiltRequest.current = async () => {
          await DOE.requestPermission!().catch(() => "denied" as const);
          setTiltAsk(false);
        };
        setTiltAsk(true);
      }, 1200);
      return () => {
        window.clearTimeout(askTimer);
        window.removeEventListener("deviceorientation", onTilt);
        tiltRequest.current = null;
      };
    };

    // Exit shatter: cracks race across the name, the letters break apart and
    // fly off, the flame flares and the portrait tips away. Scrubbed both ways.
    if (!ctx.reduced) {
      const latin = q("[data-name-latin] [data-ch]");
      const off = { immediateRender: false };
      gsap
        .timeline({
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.4 },
        })
        .fromTo(
          q("[data-crack]"),
          { drawSVG: "0%", opacity: 1 },
          { drawSVG: "100%", duration: 0.3, stagger: 0.03, ease: "none" },
          0,
        )
        .fromTo(
          latin,
          { x: 0, y: 0, rotation: 0 },
          {
            x: (i: number) => (((i * 53) % 11) - 5) * 70,
            y: (i: number) => -120 - ((i * 37) % 7) * 45,
            rotation: (i: number) => (((i * 29) % 9) - 4) * 14,
            duration: 0.7,
            ease: "power2.in",
            ...off,
          },
          0.25,
        )
        .fromTo(q("[data-depth='10']"), { opacity: 1 }, { opacity: 0, duration: 0.3, ...off }, 0.7)
        .fromTo(q("[data-depth='34']"), { scale: 1 }, { scale: 1.35, duration: 0.7, ...off }, 0.2)
        .fromTo(
          q("[data-depth='20']"),
          { rotation: 0, yPercent: 0 },
          { rotation: -9, yPercent: -12, duration: 0.7, ...off },
          0.2,
        )
        .fromTo(q("[data-crack]"), { opacity: 1 }, { opacity: 0, duration: 0.2, ...off }, 0.8);
    }

    // Loose pages drift up at their own speeds as the hero scrolls away.
    if (!ctx.reduced) {
      q("[data-page-speed]").forEach((p) =>
        gsap.to(p, {
          yPercent: -Number((p as HTMLElement).dataset.pageSpeed) * 6,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
        }),
      );
    }

    if (ctx.reduced || played) {
      played = true;
      reveal();
      return parallax();
    }

    const chars = q("[data-name-latin] [data-ch]");
    const late = q("[data-hero-late]");
    const nameBox = q("[data-depth='10']")[0];
    const washi = getComputedStyle(el).getPropertyValue("--washi").trim() || "#ebdcb9";

    // Title drop: focus lines snap in, the columns rumble; the sound word and
    // impact frame only on the first visit of the session.
    const titleDrop = () => {
      let seen = false;
      try {
        seen = !!sessionStorage.getItem("agni:titledrop");
        sessionStorage.setItem("agni:titledrop", "1");
      } catch {}
      gsap.fromTo(
        q("[data-drop-lines]"),
        { opacity: 0 },
        { opacity: 1, duration: 0.08, yoyo: true, repeat: 1, repeatDelay: 0.4 },
      );
      gsap
        .timeline()
        .to(q("[data-hero-shake] > *"), {
          x: seen ? 2 : 6,
          y: seen ? -2 : -4,
          duration: 0.04,
          repeat: 7,
          yoyo: true,
          ease: "steps(1)",
        })
        .set(q("[data-hero-shake] > *"), { clearProps: "x,y" });
      if (!seen) {
        dropWord.current?.play(heroCopy.titleDrop, 62, 16);
        impactFrame(0.9);
      }
    };

    // Name forged in fire: letters ignite out of heat shimmer as embers fly,
    // land with the title drop, then cool into ink.
    const ignite = 0.3 + chars.length * 0.045;
    const tl = gsap.timeline({ paused: true, onComplete: reveal });
    tl.set(nameBox ?? {}, { filter: "url(#hero-heat)" })
      .fromTo(
        chars,
        {
          // 0.001, not 0: the letters were already painted under the cover, and
          // Chrome would count a reveal from exactly 0 as a brand-new (late) paint.
          opacity: 0.001,
          filter: "blur(8px)",
          color: "#ffb36b",
          textShadow: "0 0 24px #e2622b, 0 0 60px #c2272d",
          yPercent: 12,
          scale: 1.15,
        },
        {
          opacity: 1,
          filter: "blur(0px)",
          yPercent: 0,
          scale: 1,
          duration: 0.3,
          stagger: 0.045,
          ease: "power2.out",
        },
      )
      .fromTo(
        q("[data-ember]"),
        { x: 0, y: 0, opacity: 1 },
        {
          x: (i: number) => (((i * 37) % 9) - 4) * 12,
          y: (i: number) => -90 - ((i * 53) % 7) * 22,
          opacity: 0,
          duration: 0.9,
          stagger: 0.05,
          ease: "power1.out",
        },
        0.05,
      )
      .call(titleDrop, [], ignite)
      .to(
        chars,
        {
          color: washi,
          textShadow: "0 0 0px rgba(226,98,43,0), 0 0 0px rgba(194,39,45,0)",
          duration: 0.9,
          stagger: 0.03,
          ease: "power1.out",
          clearProps: "color,textShadow,filter",
        },
        ignite + 0.1,
      )
      .set(nameBox ?? {}, { clearProps: "filter" }, ignite + 0.5)
      // the brush signature paints on and the seal stamps
      .fromTo(
        q("[data-sign-ink]"),
        { opacity: 1, clipPath: "inset(-30% 100% -30% 0%)" },
        {
          clipPath: "inset(-30% -30% -30% 0%)",
          duration: 0.5,
          ease: "steps(9)",
          clearProps: "clipPath",
        },
        ignite + 0.15,
      )
      .from(q("[data-sign-stroke]"), { drawSVG: "0%", duration: 0.35, ease: "ink" }, ignite + 0.5)
      .fromTo(
        q("[data-seal]"),
        { opacity: 0.001, scale: 2.2, rotation: -25 },
        { opacity: 1, scale: 1, rotation: -6, duration: 0.22, ease: "steps(3)" },
        ignite + 0.75,
      )
      .fromTo(
        late,
        { opacity: 0.001, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "ink" },
        ignite + 0.35,
      );

    const stop = onIntroDone(() => {
      played = true;
      tl.play();
    });

    const off = parallax();

    return () => {
      stop();
      off();
    };
  }, ref);

  return (
    <section
      ref={ref}
      id="top"
      data-mode="colour"
      aria-label="Introduction"
      className="hero relative isolate flex min-h-svh flex-col overflow-hidden px-4 pt-24 pb-6 md:px-10"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(120%_90%_at_75%_100%,var(--sky-glow),var(--sky-base)_70%)] transition-[background] duration-700"
      />
      <div
        aria-hidden
        className="tod-tone pointer-events-none absolute inset-0 -z-20 tone opacity-0 [--tone-dot:var(--washi)]"
      />
      <FloatingPages />
      <div
        aria-hidden
        data-drop-lines
        className="pointer-events-none absolute inset-0 z-[1] text-washi/25 opacity-0"
      >
        <SpeedLines variant="radial" intensity={1} />
      </div>
      <svg aria-hidden width="0" height="0" className="absolute">
        <filter id="hero-heat">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.06" numOctaves="2" seed="7">
            <animate
              attributeName="baseFrequency"
              dur="0.7s"
              values="0.012 0.06;0.016 0.09;0.012 0.06"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="7" />
        </filter>
      </svg>

      <div data-hero-shake className="grid flex-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div data-hero-copy className="relative">
          <div data-hero-late>
            <HeroStatus className="mb-6" />
          </div>
          <div data-depth="10" className="relative">
            <HeroName enabled={interactive} />
            {Array.from({ length: 12 }, (_, i) => (
              <i
                key={i}
                aria-hidden
                data-ember
                className="pointer-events-none absolute h-3 w-[3px] rounded-full bg-kiln opacity-0 shadow-[0_0_8px_var(--agni)]"
                style={{ left: `${6 + ((i * 41) % 88)}%`, top: `${30 + ((i * 23) % 50)}%` }}
              />
            ))}
          </div>
          <Signature className="mt-4" />
          <div data-hero-late>
            <RoleRotator className="mt-6 text-18 md:text-24" />
          </div>
          {tagline && (
            <p data-hero-late className="mt-2 max-w-prose text-18 text-muted">
              {tagline}
            </p>
          )}
          <div data-hero-late className="mt-10 flex flex-wrap gap-4">
            <Button href={`#${sections.work.id}`}>{heroCopy.viewWork}</Button>
            {resume ? (
              <Button href={resume} variant="ghost" download>
                {heroCopy.downloadResume}
              </Button>
            ) : (
              <TransitionLink href="/resume" className={buttonClass("ghost")}>
                {heroCopy.viewResume}
              </TransitionLink>
            )}
          </div>
        </div>

        <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
          <div data-depth="34" className="absolute" style={flameBox}>
            <Flame className="absolute inset-0" />
          </div>
          <div data-depth="20" className="relative h-full">
            {/* the owner's photo, with a screentone and flame light so it sits in the panel */}
            <Panel shape="cut-left" fill={false} className="h-full text-washi">
              <Portrait
                priority
                sizes="(min-width: 1024px) 28rem, 90vw"
                position="55% 68%"
                zoom={1.7}
              />
              {/* flame light washing up from the bottom of the panel */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgb(194_39_45/0.45),transparent_45%)] mix-blend-screen"
              />
            </Panel>
          </div>
        </div>
      </div>

      <div data-hero-late className="mt-8 flex items-center gap-4 text-14 text-muted">
        <span>
          {heroCopy.chapterLabel}
          {tod && ` · ${heroCopy.timeOfDay[tod]}`}
        </span>
        <Rune index={0} className="-my-2" />
        <span aria-hidden className="h-px flex-1 bg-current" />
        {tiltAsk && (
          <button type="button" onClick={() => void tiltRequest.current?.()} className="ink-link">
            {heroTiltCopy.enable}
          </button>
        )}
        <span>{heroCopy.scrollCue}</span>
      </div>

      {/* ink cracks for the exit shatter */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
      >
        <polyline
          data-crack
          opacity="0"
          points="-2.0,20.0 7.0,24.8 16.0,24.8 26.0,20.0 37.0,12.8 45.0,20.0 57.0,23.6 63.0,17.6 73.0,14.0 83.0,21.2 90.0,18.8"
          fill="none"
          stroke="var(--washi)"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="bevel"
        />
        <polyline
          data-crack
          opacity="0"
          points="-2.0,34.0 8.0,26.8 20.0,25.6 33.0,32.8 46.0,26.8 60.0,34.0 72.0,40.0 84.0,47.2 92.0,50.8 100.0,53.2"
          fill="none"
          stroke="var(--agni)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="bevel"
        />
        <polyline
          data-crack
          opacity="0"
          points="-2.0,48.0 9.0,44.4 15.0,42.0 22.0,44.4 28.0,38.4 39.0,44.4 52.0,40.8 61.0,45.6 75.0,52.8 89.0,46.8 97.0,49.2"
          fill="none"
          stroke="var(--washi)"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="bevel"
        />
        <polyline
          data-crack
          opacity="0"
          points="-2.0,62.0 10.0,63.2 19.0,59.6 28.0,54.8 35.0,60.8 44.0,53.6 57.0,52.4 71.0,51.2 82.0,46.4 93.0,48.8 101.0,44.0"
          fill="none"
          stroke="var(--agni)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="bevel"
        />
        <polyline
          data-crack
          opacity="0"
          points="-2.0,76.0 11.0,80.8 23.0,76.0 35.0,82.0 44.0,88.0 50.0,95.2 64.0,100.0 75.0,96.4 83.0,94.0 91.0,88.0 100.0,95.2"
          fill="none"
          stroke="var(--washi)"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="bevel"
        />
      </svg>

      <ImpactWord ref={dropWord} canvas className="text-96" />
    </section>
  );
}
