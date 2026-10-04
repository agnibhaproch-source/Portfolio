"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, navCopy, profile } from "@/content";
import { MagicCircle } from "@/components/motion/MagicCircle";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { onIntroDone } from "@/lib/intro";
import { prefersReducedMotion } from "@/lib/motion";
import { printMode, usePrintMode } from "@/lib/print-mode";
import { useLenis } from "@/lib/smooth-scroll";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";
import { FlameMark } from "./FlameMark";
import { JaggedEdge } from "./JaggedEdge";

/**
 * Hides on scroll down, returns on scroll up. The active section gets the
 * flame mark. On small screens a full-screen paper menu with staggered links.
 */
export function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const lenis = useLenis();
  const bar = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const print = usePrintMode();
  const href = (id: string) => (onHome ? `#${id}` : `/#${id}`);

  useMotion(
    (ctx, el) => {
      const yTo = gsap.quickTo(el, "yPercent", {
        duration: ctx.reduced ? 0.01 : 0.35,
        ease: "ink",
      });
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const y = self.scroll();
          el.toggleAttribute("data-solid", y > 40);
          yTo(y > 120 && self.direction === 1 ? -110 : 0);
        },
      });

      // Items ink in once the intro is done (and the hero has started its reveal).
      let stopIntro = () => {};
      if (!ctx.reduced) {
        const items = el.querySelectorAll("[data-nav-item]");
        gsap.set(items, { yPercent: -160, opacity: 0 });
        stopIntro = onIntroDone(() => {
          gsap.to(items, {
            yPercent: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.07,
            ease: "steps(5)",
            delay: onHome ? 1.4 : 0.1,
          });
        });
      }

      if (onHome) {
        nav.forEach((s) => {
          const target = document.getElementById(s.id);
          if (!target) return;
          ScrollTrigger.create({
            trigger: target,
            start: "top 50%",
            end: "bottom 50%",
            onToggle: (self) =>
              setActive((cur) => (self.isActive ? s.id : cur === s.id ? null : cur)),
          });
        });
      }
      return () => stopIntro();
    },
    bar,
    [onHome],
  );

  // Mobile menu: open / close animation, scroll lock, focus handling.
  const firstMenuRun = useRef(true);
  useGSAP(
    () => {
      const el = menu.current;
      if (firstMenuRun.current || !el) {
        firstMenuRun.current = false;
        return;
      }
      const links = el.querySelectorAll("[data-menu-link]");
      gsap.killTweensOf([el, ...links]);
      if (prefersReducedMotion()) {
        gsap.to(el, { autoAlpha: open ? 1 : 0, duration: 0.2 });
        return;
      }
      if (open) {
        gsap
          .timeline()
          .set(el, { autoAlpha: 1 })
          .fromTo(
            el,
            { clipPath: "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)" },
            {
              clipPath: "polygon(0% 0%, 140% 0%, 100% 100%, -40% 100%)",
              duration: 0.5,
              ease: "snap",
            },
          )
          .fromTo(
            links,
            { opacity: 0, x: (i: number) => (i % 2 ? 60 : -60) },
            { opacity: 1, x: 0, duration: 0.45, stagger: 0.06, ease: "ink" },
            0.15,
          );
      } else {
        gsap.to(el, {
          clipPath: "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)",
          duration: 0.3,
          ease: "snap",
          onComplete: () => void gsap.set(el, { autoAlpha: 0 }),
        });
      }
    },
    { dependencies: [open] },
  );

  useEffect(() => {
    if (!open) return;
    const button = menuButton.current;
    lenis?.stop();
    menu.current?.querySelector<HTMLElement>("[data-menu-link]")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      button?.focus();
    };
  }, [open, lenis]);

  const toggle = (next: boolean) => setOpen(next);

  const goFromMenu = (e: React.MouseEvent, id: string) => {
    toggle(false);
    if (!onHome) return;
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    // wait a frame so the lock is released before scrolling
    requestAnimationFrame(() =>
      lenis ? lenis.scrollTo(target) : target.scrollIntoView({ behavior: "auto" }),
    );
  };

  return (
    <>
      <header
        ref={bar}
        data-mode="colour"
        className="group/bar fixed inset-x-0 top-0 z-50 transition-[background-color] duration-300 data-solid:bg-sumi/92 data-solid:backdrop-blur-sm"
      >
        {/* Grimoire spine: a flowing mana line and a jagged anti-magic rim once solid */}
        <div
          aria-hidden
          className="mana-line absolute inset-x-0 bottom-0 h-[2px] opacity-0 transition-opacity duration-300 group-data-solid/bar:opacity-100"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-full opacity-0 transition-opacity duration-300 group-data-solid/bar:opacity-100"
        >
          <JaggedEdge height={10} seed={4} />
        </div>

        <nav aria-label="Main" className="flex h-16 items-center justify-between px-4 md:px-10">
          <Link
            href={onHome ? "#top" : "/"}
            data-nav-item
            className="group/logo flex items-center gap-3 font-display text-24 lowercase"
          >
            <span aria-hidden className="relative grid size-10 place-items-center">
              <svg
                viewBox="0 0 40 40"
                className="absolute inset-0 animate-[rune-spin_14s_linear_infinite] text-aura"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
                {Array.from({ length: 6 }, (_, i) => {
                  const a = (i / 6) * Math.PI * 2;
                  return (
                    <rect
                      key={i}
                      x={20 + Math.cos(a) * 18 - 1.5}
                      y={20 + Math.sin(a) * 18 - 1.5}
                      width="3"
                      height="3"
                      fill="currentColor"
                      transform={`rotate(45 ${20 + Math.cos(a) * 18} ${20 + Math.sin(a) * 18})`}
                    />
                  );
                })}
              </svg>
              <svg
                viewBox="0 0 40 40"
                className="absolute inset-1 animate-[rune-spin-back_9s_linear_infinite] text-agni"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="17"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="10 6 2 6"
                />
              </svg>
              <FlameMark className="relative h-5 w-auto animate-[flame-flicker_1.6s_ease-in-out_infinite]" />
            </span>
            <span className="relative inline-grid overflow-hidden [grid-template-areas:'s']">
              <span className="transition-transform duration-300 ease-[steps(3)] [grid-area:s] group-hover/logo:-translate-y-full">
                {profile.name.alias}
              </span>
              <span
                lang="ja"
                aria-hidden
                className="translate-y-full text-aura transition-transform duration-300 ease-[steps(3)] [grid-area:s] group-hover/logo:translate-y-0"
              >
                {profile.name.aliasJa}
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-9 md:flex">
            {nav.map((s) => {
              const isActive = active === s.id;
              return (
                <li key={s.id} data-nav-item>
                  <a
                    href={href(s.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "group/link relative flex items-center gap-2 py-2 font-display text-18 transition-colors",
                      isActive ? "text-aura" : "hover:text-kiln",
                    )}
                  >
                    <FlameMark
                      className={cn(
                        "h-4 w-auto transition-[opacity,scale] duration-300",
                        isActive ? "scale-100 opacity-100" : "scale-0 opacity-0",
                      )}
                    />
                    <span className="relative group-hover/link:animate-[ink-jitter_0.18s_steps(2)_2]">
                      {s.heading}
                    </span>
                    {/* blade slash streaks through on hover */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 -right-2 -left-2 h-[2px] origin-left scale-x-0 -rotate-[12deg] bg-kiln opacity-0 shadow-[0_0_6px_var(--kiln)] group-hover/link:animate-[slash-through_0.45s_var(--ease-snap)_forwards]"
                    />
                    {isActive && (
                      <span aria-hidden className="absolute inset-x-0 -bottom-1">
                        <JaggedEdge height={6} seed={s.id.length} />
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>

          <div data-nav-item className="flex items-center gap-4">
            <button
              type="button"
              aria-pressed={print}
              aria-label={navCopy.printLabel}
              onClick={() => printMode.toggle()}
              className={cn(
                "border-2 border-current px-2.5 py-0.5 font-display text-14 transition-[color,background-color,box-shadow] duration-200 [clip-path:polygon(6px_0,100%_0,100%_calc(100%-6px),calc(100%-6px)_100%,0_100%,0_6px)] hover:shadow-[inset_0_0_0_30px_rgb(201_162_74/0.25)]",
                print && "bg-fg text-bg",
              )}
            >
              {navCopy.printOff}
            </button>
            <button
              ref={menuButton}
              type="button"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => toggle(!open)}
              className="font-display text-18 md:hidden"
            >
              {open ? navCopy.closeMenu : navCopy.menuLabel}
            </button>
          </div>
        </nav>
      </header>

      <div
        ref={menu}
        id="site-menu"
        data-mode="print"
        role="dialog"
        aria-modal="true"
        aria-label={navCopy.menuLabel}
        className="invisible fixed inset-0 z-[70] flex flex-col overflow-hidden bg-washi px-4 pt-6 pb-10 opacity-0 md:hidden"
      >
        <MagicCircle className="pointer-events-none absolute -right-1/3 bottom-[-15%] size-[120vw] text-sumi opacity-15" />
        <div className="relative flex items-center justify-between">
          <span className="flex items-center gap-2 font-display text-24 lowercase">
            <FlameMark className="h-6 w-auto" />
            {profile.name.alias}
          </span>
          <button type="button" onClick={() => toggle(false)} className="font-display text-18">
            {navCopy.closeMenu}
          </button>
        </div>
        <ul className="relative mt-10 grid flex-1 content-start gap-3">
          {nav.map((s, i) => (
            <li key={s.id}>
              <a
                data-menu-link
                href={href(s.id)}
                onClick={(e) => goFromMenu(e, s.id)}
                className={cn(
                  "group/link relative block overflow-hidden border-[3px] border-sumi bg-washi px-5 py-4 font-display text-56",
                  i % 2 ? "text-right" : "",
                )}
              >
                {s.heading}
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 -right-2 -left-2 h-[3px] origin-left scale-x-0 -rotate-[8deg] bg-agni opacity-0 group-hover/link:animate-[slash-through_0.45s_var(--ease-snap)_forwards] group-active/link:animate-[slash-through_0.45s_var(--ease-snap)_forwards]"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
