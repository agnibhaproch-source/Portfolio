"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, navCopy, profile } from "@/content";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { useLenis } from "@/lib/smooth-scroll";
import { useMotion } from "@/lib/use-motion";
import { cn } from "@/lib/utils";
import { FlameMark } from "./FlameMark";

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

      if (!onHome) return;
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
            { clipPath: "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.45, ease: "snap" },
          )
          .fromTo(
            links,
            { opacity: 0, x: (i: number) => (i % 2 ? 60 : -60) },
            { opacity: 1, x: 0, duration: 0.45, stagger: 0.06, ease: "ink" },
            0.15,
          );
      } else {
        gsap.to(el, {
          clipPath: "inset(0% 0% 100% 0%)",
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
        className="fixed inset-x-0 top-0 z-50 bg-transparent transition-[background-color,box-shadow] duration-300 data-solid:bg-sumi data-solid:shadow-[0_3px_0_0_var(--washi)]"
      >
        <nav
          aria-label="Main"
          className="flex h-16 items-center justify-between bg-transparent px-4 md:px-10"
        >
          <Link
            href={onHome ? "#top" : "/"}
            className="flex items-center gap-2 font-display text-24 lowercase"
          >
            <FlameMark className="h-6 w-auto" />
            {profile.name.alias}
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {nav.map((s) => {
              const isActive = active === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={href(s.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "flex items-center gap-2 font-display text-18",
                      isActive
                        ? "text-aura"
                        : "ink-link bg-[length:0%_2px] hover:bg-[length:100%_2px]",
                    )}
                  >
                    <FlameMark
                      className={cn(
                        "h-4 w-auto transition-opacity",
                        isActive ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {s.heading}
                  </a>
                </li>
              );
            })}
          </ul>

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
        </nav>
      </header>

      <div
        ref={menu}
        id="site-menu"
        data-mode="print"
        role="dialog"
        aria-modal="true"
        aria-label={navCopy.menuLabel}
        className="invisible fixed inset-0 z-[70] flex flex-col bg-washi px-4 pt-6 pb-10 opacity-0 md:hidden"
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-display text-24 lowercase">
            <FlameMark className="h-6 w-auto" />
            {profile.name.alias}
          </span>
          <button type="button" onClick={() => toggle(false)} className="font-display text-18">
            {navCopy.closeMenu}
          </button>
        </div>
        <ul className="mt-10 grid flex-1 content-start gap-3">
          {nav.map((s, i) => (
            <li key={s.id}>
              <a
                data-menu-link
                href={href(s.id)}
                onClick={(e) => goFromMenu(e, s.id)}
                className={cn(
                  "block border-[3px] border-sumi px-5 py-4 font-display text-56",
                  i % 2 ? "text-right" : "",
                )}
              >
                {s.heading}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
