"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { sound } from "@/lib/sound";
import { usePathname, useRouter } from "next/navigation";
import { DUR, gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/*
 * "Dimension slash": the site's full-screen transition. A blade cuts
 * straight across the middle of the screen and the cut tears open into a
 * purple-black void; the next page comes out as the tear closes again.
 */

const SHUT = "inset(50% 0% 50% 0%)";
const OPEN = "inset(0% 0% 0% 0%)";

type Slash = {
  /** Resolves once the screen is fully covered. */
  cover: () => Promise<void>;
  /** Resolves once the screen is fully visible again. */
  uncover: () => Promise<void>;
  /** Cover then uncover, with an optional callback in between. */
  play: (between?: () => void | Promise<void>) => Promise<void>;
  /**
   * Route transition: cover, navigate, uncover once the new route is in.
   * `page` turns a paper page over the screen instead of the dimension slash.
   */
  navigate: (href: string, opts?: { variant?: "slash" | "page"; label?: string }) => Promise<void>;
};

const SlashContext = createContext<Slash | null>(null);

export function useSlash() {
  const ctx = useContext(SlashContext);
  if (!ctx) throw new Error("useSlash must be used inside <SlashWipeProvider>");
  return ctx;
}

export function SlashWipeProvider({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  // The overlay lives as long as the app; kill anything in flight on unmount.
  useEffect(() => {
    const el = root.current;
    return () => {
      if (el) gsap.killTweensOf(el.querySelectorAll("*"));
    };
  }, []);

  const cover = useCallback(
    () =>
      new Promise<void>((resolve) => {
        const el = root.current;
        if (!el) return resolve();
        const q = gsap.utils.selector(el);
        gsap.killTweensOf(q("*"));
        gsap.set(el, { autoAlpha: 1 });

        if (prefersReducedMotion()) {
          gsap.set(q("[data-void]"), { clipPath: OPEN, opacity: 0 });
          gsap.to(q("[data-void]"), { opacity: 1, duration: DUR.micro, onComplete: resolve });
          return;
        }

        sound.play("slash");
        gsap
          .timeline({ onComplete: () => resolve() })
          .set(q("[data-void]"), { clipPath: SHUT, opacity: 1 })
          .set(q("[data-edge]"), { top: "50%", opacity: 0 })
          .set(q("[data-blade]"), { opacity: 1, drawSVG: "0% 0%" })
          .to(q("[data-blade]"), { drawSVG: "0% 100%", duration: 0.16, ease: "power2.in" })
          .set(q("[data-edge]"), { opacity: 1 })
          .to(q("[data-void]"), { clipPath: OPEN, duration: 0.45, ease: "snap" }, "+=0.02")
          .to(q("[data-edge='top']"), { top: "0%", duration: 0.45, ease: "snap" }, "<")
          .to(q("[data-edge='bottom']"), { top: "100%", duration: 0.45, ease: "snap" }, "<")
          .to(q("[data-blade]"), { opacity: 0, duration: 0.12 }, "<");
      }),
    [],
  );

  const uncover = useCallback(
    () =>
      new Promise<void>((resolve) => {
        const el = root.current;
        if (!el) return resolve();
        const q = gsap.utils.selector(el);
        const done = () => {
          gsap.set(el, { autoAlpha: 0 });
          resolve();
        };

        if (prefersReducedMotion()) {
          gsap.to(q("[data-void]"), { opacity: 0, duration: DUR.micro, onComplete: done });
          return;
        }

        gsap
          .timeline({ onComplete: done })
          .to(q("[data-void]"), { clipPath: SHUT, duration: 0.5, ease: "ink" })
          .to(q("[data-edge]"), { top: "50%", duration: 0.5, ease: "ink" }, 0)
          .to(q("[data-edge]"), { opacity: 0, scaleX: 0.2, duration: 0.18 }, 0.45)
          .set(q("[data-edge]"), { scaleX: 1 });
      }),
    [],
  );

  // Page turn: a paper page hinged on the left swings over the screen, then on and away.
  const turnIn = useCallback(
    (label?: string) =>
      new Promise<void>((resolve) => {
        const el = root.current;
        const page = el?.querySelector<HTMLElement>("[data-turn]");
        if (!el || !page) return resolve();
        const q = gsap.utils.selector(el);
        gsap.killTweensOf([page, ...q("[data-turn] *")]);
        const title = page.querySelector("[data-turn-label]");
        if (title) title.textContent = label ?? "";
        gsap.set(el, { autoAlpha: 1 });
        if (prefersReducedMotion()) {
          gsap.fromTo(
            page,
            { autoAlpha: 0, rotationY: 0 },
            { autoAlpha: 1, duration: DUR.micro, onComplete: resolve },
          );
          return;
        }
        sound.play("page");
        gsap
          .timeline({ onComplete: () => resolve() })
          .set(page, { autoAlpha: 1 })
          .fromTo(
            page,
            { rotationY: -118 },
            { rotationY: 0, duration: 0.6, ease: "power2.inOut", transformPerspective: 1400 },
          )
          .fromTo(
            q("[data-turn-shade]"),
            { opacity: 0.9 },
            { opacity: 0, duration: 0.6, ease: "power1.in" },
            0,
          );
      }),
    [],
  );
  const turnOut = useCallback(
    () =>
      new Promise<void>((resolve) => {
        const el = root.current;
        const page = el?.querySelector<HTMLElement>("[data-turn]");
        if (!el || !page) return resolve();
        const done = () => {
          gsap.set(page, { autoAlpha: 0, rotationY: 0 });
          gsap.set(el, { autoAlpha: 0 });
          resolve();
        };
        if (prefersReducedMotion()) {
          gsap.to(page, { autoAlpha: 0, duration: DUR.micro, onComplete: done });
          return;
        }
        gsap
          .timeline({ onComplete: done })
          .to(page, {
            rotationY: 118,
            duration: 0.65,
            ease: "power2.in",
            transformPerspective: 1400,
          })
          .to(gsap.utils.selector(el)("[data-turn-shade]"), { opacity: 0.8, duration: 0.65 }, 0);
      }),
    [],
  );

  const play = useCallback(
    async (between?: () => void | Promise<void>) => {
      await cover();
      await between?.();
      await uncover();
    },
    [cover, uncover],
  );

  // Route transitions: uncover once the pathname actually changes.
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef<string | null>(null);

  const outRef = useRef<() => Promise<void>>(uncover);
  const navigate = useCallback(
    async (href: string, opts?: { variant?: "slash" | "page"; label?: string }) => {
      const target = new URL(href, window.location.href);
      const samePage = target.pathname === window.location.pathname;
      const page = opts?.variant === "page";
      outRef.current = page ? turnOut : uncover;
      if (page) await turnIn(opts?.label);
      else await cover();
      if (samePage) {
        router.push(href);
        await outRef.current();
        return;
      }
      pending.current = target.pathname;
      router.push(href);
      // Failsafe: never leave the screen covered.
      window.setTimeout(() => {
        if (pending.current) {
          pending.current = null;
          void outRef.current();
        }
      }, 4000);
    },
    [cover, uncover, turnIn, turnOut, router],
  );

  useEffect(() => {
    if (!pending.current || pending.current !== pathname) return;
    pending.current = null;
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      void outRef.current();
    });
  }, [pathname]);

  const value = useMemo(
    () => ({ cover, uncover, play, navigate }),
    [cover, uncover, play, navigate],
  );

  return (
    <SlashContext.Provider value={value}>
      {children}
      <div
        ref={root}
        aria-hidden
        className="pointer-events-none invisible fixed inset-0 z-[150] opacity-0"
      >
        <div
          data-void
          className="absolute inset-0 overflow-hidden bg-[radial-gradient(ellipse_at_50%_50%,var(--void-haze),var(--void)_62%)]"
          style={{ clipPath: SHUT }}
        >
          <div className="absolute -inset-1/4 animate-[void-drift_7s_ease-in-out_infinite] bg-[radial-gradient(circle_at_30%_40%,rgb(120_60_160/0.35),transparent_40%),radial-gradient(circle_at_70%_65%,rgb(194_39_45/0.18),transparent_38%)] blur-2xl" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0_22px,rgb(160_110_210/0.07)_22px_23px)]" />
        </div>
        <div
          data-edge="top"
          className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-[linear-gradient(90deg,transparent,#a070e0_15%,var(--washi)_50%,#a070e0_85%,transparent)] opacity-0 shadow-[0_0_18px_#7a3fc0]"
        />
        <div
          data-edge="bottom"
          className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-[linear-gradient(90deg,transparent,var(--agni)_15%,var(--washi)_50%,var(--agni)_85%,transparent)] opacity-0 shadow-[0_0_18px_var(--agni)]"
        />
        <div
          data-turn
          className="invisible absolute inset-0 origin-left bg-[#ebdcb9] text-[#1d1614] opacity-0 shadow-[0_0_60px_rgb(0_0_0/0.6)] [backface-visibility:hidden]"
        >
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0_31px,rgb(29_22_20/0.06)_31px_32px)]" />
          <div className="absolute inset-y-0 left-0 w-10 bg-[linear-gradient(90deg,rgb(0_0_0/0.25),transparent)]" />
          <p
            data-turn-label
            className="absolute inset-0 grid place-items-center px-6 text-center font-display text-[clamp(3rem,10vw,8rem)] leading-none"
          />
          <div
            data-turn-shade
            className="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/0.55),transparent_70%)]"
          />
        </div>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line
            data-blade
            x1="-2"
            y1="50"
            x2="102"
            y2="50"
            stroke="var(--washi)"
            strokeWidth="3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity="0"
            className="[filter:drop-shadow(0_0_6px_#a070e0)]"
          />
        </svg>
      </div>
    </SlashContext.Provider>
  );
}
