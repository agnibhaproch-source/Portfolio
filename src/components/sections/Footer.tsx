"use client";

import { useRef } from "react";
import { credits, profile } from "@/content";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";

/**
 * Credits roll: the visitor's scroll drives the credits up through a fading
 * window, ending on "To be continued". Static list without JS or under
 * reduced motion.
 */
export function Footer() {
  const ref = useRef<HTMLElement>(null);

  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const win = el.querySelector<HTMLElement>("[data-roll-window]");
    const roll = el.querySelector<HTMLElement>("[data-roll]");
    if (!win || !roll) return;
    win.setAttribute("data-rolling", "");
    gsap.fromTo(
      roll,
      { y: () => win.clientHeight },
      {
        y: () => -(roll.offsetHeight - win.clientHeight * 0.55),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom bottom",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      },
    );
    return () => win.removeAttribute("data-rolling");
  }, ref);

  return (
    <footer ref={ref} data-mode="colour" className="border-t-[3px] border-washi">
      <h2 className="sr-only">{credits.heading}</h2>
      <div
        data-roll-window
        className="relative px-4 py-16 data-rolling:h-[85svh] data-rolling:overflow-hidden data-rolling:[mask-image:linear-gradient(transparent,#000_18%,#000_82%,transparent)] data-rolling:py-0 md:px-10"
      >
        <div data-roll className="mx-auto max-w-2xl text-center">
          <dl className="space-y-10">
            {credits.rows.map((row) => (
              <div key={row.label}>
                <dt className="text-14 text-muted">{row.label}</dt>
                <dd className="mt-1 font-display text-24 md:text-36">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-20 font-display text-56 md:text-96">{credits.ending}</p>
          <div
            aria-hidden
            className="mx-auto mt-5 h-[3px] w-40 bg-[linear-gradient(90deg,var(--agni),var(--kiln))]"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 pt-6 pb-10 text-14 text-muted md:px-10">
        <p>
          © {new Date().getFullYear()} {profile.name.full}
        </p>
        <a href="#top" className="ink-link">
          {credits.backToTop}
        </a>
      </div>
    </footer>
  );
}
