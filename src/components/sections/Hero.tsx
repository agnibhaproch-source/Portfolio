"use client";

import { useRef, useState } from "react";
import { Rune } from "@/components/ui/Rune";
import { heroCopy, heroTiltCopy, profile, sections } from "@/content";
import { Flame } from "@/components/gl/Flame";
import { Button, buttonClass } from "@/components/ui/Button";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { Panel } from "@/components/ui/Panel";
import { Silhouette } from "@/components/ui/Silhouette";
import { antiMagic } from "@/lib/anti-magic";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { onIntroDone } from "@/lib/intro";
import { useMotion } from "@/lib/use-motion";
import { HeroName } from "./hero/HeroName";

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
// The print-state panel inside that flame area, so it lines up with the real one.
const printPanel = {
  top: `${(FLAME_INSET.top / (100 + FLAME_INSET.top + FLAME_INSET.bottom)) * 100}%`,
  left: `${(FLAME_INSET.side / (100 + FLAME_INSET.side * 2)) * 100}%`,
  width: `${(100 / (100 + FLAME_INSET.side * 2)) * 100}%`,
  height: `${(100 / (100 + FLAME_INSET.top + FLAME_INSET.bottom)) * 100}%`,
};

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [interactive, setInteractive] = useState(false);
  const [tiltAsk, setTiltAsk] = useState(false);
  const tiltRequest = useRef<(() => Promise<void>) | null>(null);
  const { tagline, resume, role, name } = profile;

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
      const apply = (px: number, py: number) => {
        if (!el.hasAttribute("data-revealed")) return;
        layers.forEach((l) => {
          l.x(px * l.d);
          l.y(py * l.d);
        });
      };
      if (ctx.desktop) {
        const onMove = (e: PointerEvent) =>
          apply(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      }
      const clamp = gsap.utils.clamp(-0.5, 0.5);
      let heard = false;
      const onTilt = (e: DeviceOrientationEvent) => {
        if (e.gamma == null || e.beta == null) return;
        heard = true;
        apply(clamp(e.gamma / 60), clamp((e.beta - 45) / 60));
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

    if (ctx.reduced || played) {
      played = true;
      reveal();
      return parallax();
    }

    const paper = el.querySelector<HTMLElement>("[data-hero-paper]");
    const printArt = el.querySelector<HTMLElement>("[data-hero-print]");
    const blade = el.querySelector<SVGLineElement>("[data-hero-blade] line");
    if (!paper || !printArt || !blade) return;
    const chars = q("[data-name-latin] [data-ch]");
    const late = q("[data-hero-late]");

    // Diagonal cut sweeping left to right: edge runs from (s+15, 0) to (s-15, 100).
    const cut = { s: -30 };
    let heroBox: DOMRect;
    let artBox: DOMRect;
    const edgeAt = (yRatio: number) => ((cut.s + 15 - 30 * yRatio) / 100) * heroBox.width;
    const drawCut = () => {
      paper.style.clipPath = `polygon(${cut.s + 15}% 0%, 100% 0%, 100% 100%, ${cut.s - 15}% 100%)`;
      const y0 = (artBox.top - heroBox.top) / heroBox.height;
      const y1 = (artBox.bottom - heroBox.top) / heroBox.height;
      const lx = (px: number) => ((px - (artBox.left - heroBox.left)) / artBox.width) * 100;
      printArt.style.clipPath = `polygon(${lx(edgeAt(y0))}% 0%, 100% 0%, 100% 100%, ${lx(edgeAt(y1))}% 100%)`;
      blade.setAttribute("x1", String(cut.s + 15));
      blade.setAttribute("x2", String(cut.s - 15));
    };

    const tl = gsap.timeline({ paused: true, onComplete: reveal });
    tl.fromTo(
      chars,
      { opacity: 0, scale: 1.8, yPercent: -20 },
      { opacity: 1, scale: 1, yPercent: 0, duration: 0.26, stagger: 0.04, ease: "steps(4)" },
    )
      // 2px camera shake as the last character lands. Shake the columns, not
      // their parent: a transformed ancestor would isolate the text's blend.
      .to(q("[data-hero-shake] > *"), {
        x: 2,
        y: -2,
        duration: 0.04,
        repeat: 5,
        yoyo: true,
        ease: "steps(1)",
      })
      .set(q("[data-hero-shake] > *"), { clearProps: "transform" })
      .call(() => {
        heroBox = el.getBoundingClientRect();
        artBox = printArt.getBoundingClientRect();
      })
      .set(blade, { opacity: 1 })
      .to(cut, { s: 130, duration: 0.8, ease: "snap", onUpdate: drawCut })
      .to(blade, { opacity: 0, duration: 0.2 }, "-=0.15")
      .fromTo(
        late,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "ink" },
        "-=0.35",
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
        className="absolute inset-0 -z-20 bg-[radial-gradient(120%_90%_at_75%_100%,var(--twilight),var(--sumi)_70%)]"
      />
      <div aria-hidden data-hero-paper className="hero-paper absolute inset-0 -z-10 bg-washi">
        <div className="absolute inset-x-0 bottom-0 h-1/3 rotate-180 tone-fade [--tone-dot:var(--sumi)]" />
      </div>

      <div data-hero-shake className="grid flex-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div data-hero-copy className="relative">
          <div data-depth="10">
            <HeroName enabled={interactive} />
          </div>
          <p
            data-hero-late
            lang="ja"
            aria-hidden
            className="mt-4 font-display text-36 text-aura md:text-56"
          >
            {name.aliasJa}
          </p>
          <p data-hero-late className="mt-6 text-24">
            {role}
          </p>
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
            {/* TODO: cut-out portrait with halftone once public/me/portrait.jpg arrives */}
            <Panel shape="cut-left" fill={false} className="h-full text-washi">
              <Silhouette className="absolute inset-x-0 bottom-0 mx-auto h-[85%] text-sumi [filter:drop-shadow(-3px_-2px_0_var(--agni))_drop-shadow(0_0_14px_rgb(226_98_43/0.45))]" />
            </Panel>
          </div>
          <div
            aria-hidden
            data-hero-print
            className="hero-print absolute bg-washi text-sumi"
            style={flameBox}
          >
            <div className="absolute" style={printPanel}>
              <Panel shape="cut-left" tone className="h-full">
                <Silhouette className="absolute inset-x-0 bottom-0 mx-auto h-[85%] text-sumi" />
              </Panel>
            </div>
          </div>
        </div>
      </div>

      <div data-hero-late className="mt-8 flex items-center gap-4 text-14 text-muted">
        <span>{heroCopy.chapterLabel}</span>
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

      <svg
        aria-hidden
        data-hero-blade
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <line
          x1="-15"
          y1="0"
          x2="-45"
          y2="100"
          stroke="var(--kiln)"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
          opacity="0"
        />
      </svg>
    </section>
  );
}
