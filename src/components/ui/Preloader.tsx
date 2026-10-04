"use client";

import { useEffect, useRef } from "react";
import { profile } from "@/content";
import { gsap, useGSAP } from "@/lib/gsap";
import { markIntroDone, PRELOADED_KEY } from "@/lib/intro";
import { useLenis } from "@/lib/smooth-scroll";
import { FLAME_INNER, FLAME_OUTER } from "./flame-paths";

/**
 * "Cold open": a pencil panel line draws, an original grimoire inks its cover
 * and flame emblem while a counter runs 000 to 100, the cover bursts open,
 * the panel slams out to full screen and cuts to the hero. Under 2.5s, once
 * per session, never under reduced motion. Hidden by CSS unless the head
 * script set html[data-preload]; a CSS failsafe hides it after 2.5s anyway.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  const active = useRef(false);

  // Lenis mounts after this component; keep the live instance in a ref and
  // hold scroll while the preloader is on screen.
  useEffect(() => {
    lenisRef.current = lenis;
    if (active.current) lenis?.stop();
  }, [lenis]);

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

      const q = gsap.utils.selector(el);
      const frame = q("[data-frame]")[0] as SVGRectElement | undefined;
      const book = q("[data-book]")[0] as HTMLElement | undefined;
      const digits = q("[data-digit]") as HTMLElement[];
      if (!frame || !book) return;

      // Fit the pencil panel around the book, in the 0-100 viewBox space.
      const r = book.getBoundingClientRect();
      const pad = 28;
      const vw = window.innerWidth / 100;
      const vh = window.innerHeight / 100;
      gsap.set(frame, {
        attr: {
          x: (r.left - pad) / vw,
          y: (r.top - pad) / vh,
          width: (r.width + pad * 2) / vw,
          height: (r.height + pad * 2 + 120) / vh,
        },
      });

      const count = { v: 0 };
      const paint = () => {
        const s = String(Math.round(count.v)).padStart(3, "0");
        digits.forEach((d, i) => (d.textContent = s[i] ?? "0"));
      };

      const finish = () => {
        try {
          sessionStorage.setItem(PRELOADED_KEY, "1");
        } catch {}
        html.removeAttribute("data-preload");
        active.current = false;
        lenisRef.current?.start();
      };

      el.setAttribute("data-started", "");
      gsap
        .timeline({ onComplete: finish })
        .from(frame, { drawSVG: "0%", duration: 0.55, ease: "ink" })
        .fromTo(
          q("[data-cover]"),
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "snap" },
          0.1,
        )
        .from(
          q("[data-stroke]"),
          { drawSVG: "0%", duration: 0.5, stagger: 0.12, ease: "steps(10)" },
          0.35,
        )
        .to(q("[data-fill]"), { opacity: 1, duration: 0.2, ease: "steps(3)" }, 1.0)
        .to(count, { v: 100, duration: 1.5, ease: "power1.inOut", onUpdate: paint }, 0)
        .to(q("[data-cover]"), { rotationY: -165, duration: 0.45, ease: "snap" }, 1.55)
        .to(
          q("[data-page]"),
          { rotationY: -150, duration: 0.4, stagger: 0.06, ease: "power2.in" },
          1.62,
        )
        .to(q("[data-fade]"), { opacity: 0, scale: 0.96, duration: 0.2 }, 1.95)
        .to(
          frame,
          { attr: { x: -1, y: -1, width: 102, height: 102 }, duration: 0.28, ease: "snap" },
          1.95,
        )
        .add(markIntroDone, 2.12)
        .to(el, { autoAlpha: 0, duration: 0.18 }, 2.12);
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden
      data-mode="print"
      className="preloader fixed inset-0 z-[180] flex-col items-center justify-center bg-washi text-sumi"
    >
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <rect
          data-frame
          x="30"
          y="20"
          width="40"
          height="60"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div data-fade className="flex flex-col items-center">
        <div data-book className="relative aspect-[3/4] w-[min(46vw,200px)] [perspective:1200px]">
          {[3, 2, 1].map((i) => (
            <div
              key={i}
              data-page
              className="absolute inset-0 origin-left border-[3px] border-sumi bg-washi"
              style={{ translate: `${i * 4}px ${i * 3}px` }}
            />
          ))}
          <div
            data-cover
            className="absolute inset-0 origin-left border-[3px] border-sumi bg-washi [backface-visibility:hidden]"
          >
            <div className="absolute inset-y-0 left-0 w-4 border-r-[3px] border-sumi hatch" />
            <div className="absolute inset-3 left-7 border border-sumi" />
            <svg viewBox="0 0 100 100" className="absolute inset-0 m-auto w-3/5 translate-x-2">
              <circle
                data-stroke
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <g transform="translate(14.8 12) scale(2.2)">
                <path data-fill d={FLAME_OUTER} fill="var(--agni)" opacity="0" />
                <path data-fill d={FLAME_INNER} fill="var(--kiln)" opacity="0" />
                <path
                  data-stroke
                  d={FLAME_OUTER}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  data-stroke
                  d={FLAME_INNER}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            </svg>
          </div>
        </div>

        <p className="mt-10 font-display text-56 leading-none">
          {[0, 1, 2].map((i) => (
            <span key={i} data-digit className="inline-block w-[0.72em] text-center">
              0
            </span>
          ))}
        </p>
        {profile.tagline && <p className="mt-3 px-4 text-center text-14">{profile.tagline}</p>}
      </div>
    </div>
  );
}
