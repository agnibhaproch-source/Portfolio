"use client";

import { useRef, useState } from "react";
import { Grimoire } from "@/components/sections/contact/Grimoire";
import { JaggedEdge } from "@/components/ui/JaggedEdge";
import { Rune } from "@/components/ui/Rune";
import { credits, profile } from "@/content";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";

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
 * Credits roll under an anti-magic energy horizon, embers rising behind.
 * At the very end the grimoire slams shut. Static list without JS or under
 * reduced motion.
 */
export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const [closed, setClosed] = useState(false);

  useMotion((ctx, el) => {
    if (ctx.reduced) return;
    const win = el.querySelector<HTMLElement>("[data-roll-window]");
    const roll = el.querySelector<HTMLElement>("[data-roll]");
    const book = el.querySelector<HTMLElement>("[data-end-book]");
    if (!win || !roll) return;
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
        },
      },
    );

    // The book closes when the visitor reaches the very end, with a shudder.
    ScrollTrigger.create({
      trigger: el,
      start: "bottom bottom+=2",
      onEnter: () => {
        setClosed(true);
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

      <h2 className="sr-only">{credits.heading}</h2>
      <div
        data-roll-window
        className="relative px-4 py-16 data-rolling:h-[60svh] data-rolling:overflow-hidden data-rolling:[mask-image:linear-gradient(transparent,#000_18%,#000_82%,transparent)] data-rolling:py-0 md:px-10"
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
          <div className="mt-6 flex justify-center">
            <Rune index={4} />
          </div>
        </div>
      </div>

      {/* The end: the grimoire closes */}
      <div className="relative px-4 pt-6 pb-4 text-center md:px-10">
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
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-6 border-t-2 border-washi/15 px-4 pt-6 pb-10 text-14 md:px-10">
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {socials.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group/link inline-flex items-center gap-2 transition-colors hover:text-kiln"
                {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                <span
                  aria-hidden
                  className="size-2 rotate-45 border border-aura transition-[background-color,rotate] duration-300 group-hover/link:rotate-[225deg] group-hover/link:bg-aura"
                />
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-6 text-muted">
          <p>
            © {new Date().getFullYear()} {profile.name.full}
          </p>
          <a
            href="#top"
            className="border-2 border-washi/60 px-3 py-1 font-display text-washi transition-[box-shadow,color] duration-300 [clip-path:polygon(6px_0,100%_0,100%_calc(100%-6px),calc(100%-6px)_100%,0_100%,0_6px)] hover:text-kiln hover:shadow-[inset_0_0_0_40px_rgb(226_98_43/0.15)]"
          >
            {credits.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}
