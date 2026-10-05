"use client";

import { useRef, useState } from "react";
import { contactCopy, profile } from "@/content";
import { GLYPHS } from "@/components/ui/Rune";
import { gsap } from "@/lib/gsap";
import { haptic } from "@/lib/haptics";
import { prefersReducedMotion } from "@/lib/motion";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

/** A rune seal that stamps beside a field once it is valid. */
export function RuneSeal({ i, on }: { i: number; on: boolean }) {
  if (!on) return null;
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="absolute top-0 right-0 size-7 animate-[stamp-in_0.4s_steps(3)_both] text-aura motion-reduce:animate-none"
    >
      <circle
        cx="12"
        cy="12"
        r="10.5"
        fill="rgb(201 162 74 / 0.15)"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d={GLYPHS[i % GLYPHS.length]}
        transform="translate(5 5) scale(0.58)"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Cracks drawn over a field that failed to send (data-crack, animated by the form). */
export function FieldCrack() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-6 w-full overflow-visible"
    >
      <polyline
        data-field-crack
        points="30,20 33,12 29,8 35,2"
        fill="none"
        stroke="var(--kiln)"
        strokeWidth="1.6"
        vectorEffect="non-scaling-stroke"
        opacity="0"
      />
      <polyline
        data-field-crack
        points="62,20 59,13 64,9 60,3"
        fill="none"
        stroke="var(--kiln)"
        strokeWidth="1.6"
        vectorEffect="non-scaling-stroke"
        opacity="0"
      />
    </svg>
  );
}

/** The brush underline repaints itself as the field fills (target: 20 characters, or 10 for the message). */
export function BrushLine({ length, target }: { length: number; target: number }) {
  const t = Math.min(length / target, 1);
  return (
    <svg
      aria-hidden
      viewBox="0 0 300 12"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -bottom-1 left-0 h-3 w-full text-kiln"
    >
      <path
        d="M2 7 C 50 3, 100 10, 150 6 S 250 4, 298 7 L 296 9 C 240 11, 160 12, 100 10 S 30 12, 4 10 Z"
        fill="currentColor"
        style={{
          clipPath: `inset(0 ${100 - t * 100}% 0 0)`,
          transition: "clip-path 0.35s var(--ease-ink)",
        }}
      />
    </svg>
  );
}

/** Spawn an ink droplet flicking off the end of the text in a field. */
export function inkDrop(field: HTMLInputElement | HTMLTextAreaElement, layer: HTMLElement | null) {
  if (!layer || prefersReducedMotion()) return;
  const r = field.getBoundingClientRect();
  const l = layer.getBoundingClientRect();
  let x = r.width * 0.5;
  if (field instanceof HTMLInputElement) {
    const ctx = document.createElement("canvas").getContext("2d");
    if (ctx) {
      const cs = getComputedStyle(field);
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      x = Math.min(ctx.measureText(field.value).width + 4, r.width - 8);
    }
  } else {
    x = 20 + Math.random() * (r.width - 40);
  }
  const drop = document.createElement("span");
  drop.className = "pointer-events-none absolute size-1.5 rounded-full bg-kiln";
  drop.style.left = `${r.left - l.left + x}px`;
  drop.style.top = `${r.bottom - l.top - 14}px`;
  layer.appendChild(drop);
  const dx = (Math.random() - 0.3) * 30;
  gsap
    .timeline({ onComplete: () => drop.remove() })
    .fromTo(
      drop,
      { scale: 1.6, opacity: 1 },
      { x: dx, y: -18 - Math.random() * 14, duration: 0.22, ease: "power2.out" },
    )
    .to(drop, { y: "+=26", opacity: 0, scale: 0.6, duration: 0.35, ease: "power2.in" });
}

/** A gauge under the message that charges to the 10-character minimum, then locks. */
export function PowerMeter({ length }: { length: number }) {
  const done = length >= 10;
  return (
    <div className="mt-3 flex items-center gap-3 text-14">
      <span
        aria-hidden
        className={cn(
          "relative h-2.5 flex-1 overflow-hidden border-2 border-washi/40",
          done && "border-aura shadow-[0_0_10px_var(--aura)]",
        )}
      >
        <span
          className="absolute inset-y-0 left-0 bg-[linear-gradient(90deg,var(--agni),var(--kiln),var(--aura))] transition-[width] duration-300"
          style={{ width: `${Math.min(length / 10, 1) * 100}%` }}
        />
      </span>
      <span className={cn("font-display tabular-nums", done ? "text-aura" : "text-muted")}>
        {done ? contactCopy.meterDone : contactCopy.meter(length)}
      </span>
    </div>
  );
}

/** "Looking for an internship" with a radar that sweeps and pings. */
export function Radar() {
  return (
    <svg aria-hidden viewBox="0 0 40 40" className="size-12 shrink-0 md:size-14">
      <circle
        cx="20"
        cy="20"
        r="18"
        fill="rgb(194 39 45 / 0.12)"
        stroke="var(--kiln)"
        strokeWidth="1.2"
      />
      <circle
        cx="20"
        cy="20"
        r="11"
        fill="none"
        stroke="var(--kiln)"
        strokeOpacity="0.5"
        strokeWidth="0.8"
      />
      <path d="M20 2 V38 M2 20 H38" stroke="var(--kiln)" strokeOpacity="0.3" strokeWidth="0.6" />
      <g className="origin-center animate-[rune-spin_2.4s_linear_infinite] [transform-box:fill-box] motion-reduce:animate-none">
        <path d="M20 20 L20 2 A18 18 0 0 1 35.6 11 Z" fill="url(#radar-sweep)" />
      </g>
      <circle
        cx="28"
        cy="12"
        r="1.8"
        fill="var(--kiln)"
        className="animate-[radar-blip_2.4s_linear_infinite] motion-reduce:animate-none"
      />
      <circle
        cx="13"
        cy="26"
        r="1.5"
        fill="var(--kiln)"
        className="animate-[radar-blip_2.4s_linear_1.2s_infinite] motion-reduce:animate-none"
      />
      <defs>
        <linearGradient id="radar-sweep" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="var(--kiln)" stopOpacity="0.7" />
          <stop offset="1" stopColor="var(--kiln)" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Click the email to copy it: a COPIED! stamp and an ink splash. Falls back to mailto. */
export function EmailCopy() {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      window.location.href = `mailto:${profile.email}`;
      return;
    }
    setCopied(true);
    sound.play("stamp");
    haptic("rune");
    window.setTimeout(() => setCopied(false), 1800);
    if (prefersReducedMotion()) return;
    const q = gsap.utils.selector(ref);
    gsap.fromTo(
      q("[data-copy-stamp]"),
      { scale: 2.4, opacity: 0, rotation: -18 },
      { scale: 1, opacity: 1, rotation: -8, duration: 0.2, ease: "steps(3)" },
    );
    gsap.fromTo(
      q("[data-copy-splash] circle"),
      { scale: 0, opacity: 0.9 },
      {
        scale: 1,
        opacity: 0,
        duration: 0.6,
        stagger: 0.04,
        ease: "power2.out",
        transformOrigin: "50% 50%",
      },
    );
  };
  return (
    <div ref={ref} className="relative flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
      <button
        type="button"
        onClick={() => void copy()}
        aria-label={`${contactCopy.copyEmail}: ${profile.email}`}
        className="group/copy relative flex min-w-0 items-center gap-3 text-left font-display text-18 transition-colors hover:text-kiln sm:gap-4 sm:text-24"
      >
        <span
          aria-hidden
          className="size-3 shrink-0 rotate-45 border-2 border-aura transition-[background-color,rotate] duration-300 group-hover/copy:rotate-[225deg] group-hover/copy:bg-aura"
        />
        {profile.email}
        <svg
          aria-hidden
          data-copy-splash
          viewBox="-50 -50 100 100"
          className="pointer-events-none absolute top-1/2 left-1/2 size-40 -translate-x-1/2 -translate-y-1/2 overflow-visible"
        >
          {[
            [-30, -10, 6],
            [24, -16, 4],
            [32, 12, 7],
            [-20, 18, 5],
            [4, -24, 3],
            [-40, 6, 3],
          ].map(([x, y, r]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="var(--kiln)" opacity="0" />
          ))}
        </svg>
      </button>
      <span
        aria-hidden
        data-copy-stamp
        className={cn(
          "absolute -top-3 right-0 shrink-0 -rotate-6 border-[3px] border-kiln bg-sumi px-2 font-display text-14 text-kiln sm:static sm:rotate-0 sm:bg-transparent",
          !copied && "opacity-0",
        )}
      >
        {contactCopy.copied}
      </span>
      <a
        href={`mailto:${profile.email}`}
        aria-label={contactCopy.mailApp}
        className="shrink-0 ink-link pl-7 text-14 sm:ml-auto sm:pl-0"
      >
        {contactCopy.mailApp}
      </a>
      <span role="status" className="sr-only">
        {copied ? contactCopy.copiedLive : ""}
      </span>
    </div>
  );
}

const strip = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/** A link as a rolled scroll that unrolls on hover or focus to show where it goes. */
export function LinkScroll({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group/scroll flex min-w-0 items-center gap-0 py-3 font-display text-18 sm:text-24"
    >
      <span
        aria-hidden
        className="h-8 w-2.5 shrink-0 rounded-full bg-[linear-gradient(90deg,#3a2414,#8a5a32,#3a2414)]"
      />
      <span className="relative flex min-w-0 items-center bg-[#ebdcb9] px-3 py-1 text-[#1d1614] shadow-[0_2px_6px_rgb(0_0_0/0.4)]">
        <span className="shrink-0">{label}</span>
        <span className="ml-0 grid max-w-0 overflow-hidden text-14 whitespace-nowrap text-[#5e5548] transition-[max-width,margin] duration-500 ease-ink group-hover/scroll:ml-3 group-hover/scroll:max-w-[20rem] group-focus-visible/scroll:ml-3 group-focus-visible/scroll:max-w-[20rem]">
          {strip(href)}
        </span>
      </span>
      <span
        aria-hidden
        className="h-8 w-2.5 shrink-0 rounded-full bg-[linear-gradient(90deg,#3a2414,#8a5a32,#3a2414)]"
      />
    </a>
  );
}

const SOCIAL_ICON: Record<string, string> = {
  GitHub:
    "M12 3 C7 3 3 7 3 12 C3 16 5.5 19 9 20 L9 17.5 C6.5 18 6 16.5 6 16.5 C5.5 15.5 5 15 5 15 C4 14.5 5 14.5 5 14.5 C6 14.6 6.6 15.6 6.6 15.6 C7.5 17 9 16.6 9.5 16.4 C9.6 15.8 9.8 15.4 10 15.2 C8 15 6 14.2 6 10.8 C6 9.8 6.4 9 7 8.4 C6.9 8.2 6.6 7.3 7.1 6 C7.1 6 7.9 5.8 9.6 7 C10.4 6.8 11.2 6.7 12 6.7 C12.8 6.7 13.6 6.8 14.4 7 C16.1 5.8 16.9 6 16.9 6 C17.4 7.3 17.1 8.2 17 8.4 C17.6 9 18 9.8 18 10.8 C18 14.2 16 15 14 15.2 C14.3 15.5 14.6 16 14.6 16.8 L14.6 20 C18.5 19 21 16 21 12 C21 7 17 3 12 3 Z",
  LinkedIn: "M4 4 H20 V20 H4 Z M7 10 V17 M7 7 V7.5 M11 17 V10 M11 13 C11 10 16 10 16 13 V17",
  LeetCode: "M14 4 L7 11 C5.8 12.2 5.8 14 7 15.2 L9.8 18 C11 19.2 12.8 19.2 14 18 L16 16 M9 13 H18",
};

/** The social links orbit a small magic circle; hover or focus pauses the orbit. Decorative duplicate of the list. */
export function OrbitSocials({ links }: { links: { label: string; href: string }[] }) {
  const n = links.length;
  return (
    <div aria-hidden className="group/orbit relative mx-auto size-48 shrink-0">
      <svg viewBox="0 0 100 100" className="absolute inset-0 text-aura/60">
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeDasharray="2 5" />
        <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" />
        <polygon points="50,32 66,59 34,59" fill="none" stroke="currentColor" />
        <polygon points="50,68 34,41 66,41" fill="none" stroke="currentColor" />
      </svg>
      <div className="absolute inset-0 animate-[rune-spin_18s_linear_infinite] group-hover/orbit:[animation-play-state:paused] motion-reduce:animate-none">
        {links.map((l, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          return (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              tabIndex={-1}
              className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
              style={{ left: `${50 + Math.cos(a) * 46}%`, top: `${50 + Math.sin(a) * 46}%` }}
            >
              <span className="grid size-11 animate-[rune-spin_18s_linear_infinite_reverse] place-items-center rounded-full border-2 border-washi bg-sumi transition-transform duration-300 group-hover/orbit:[animation-play-state:paused] hover:scale-125 hover:border-kiln hover:shadow-[0_0_14px_var(--agni)] motion-reduce:animate-none">
                <svg viewBox="0 0 24 24" className="size-5 text-washi">
                  <path
                    d={SOCIAL_ICON[l.label] ?? GLYPHS[i % GLYPHS.length]!}
                    fill={l.label === "GitHub" ? "currentColor" : "none"}
                    stroke={l.label === "GitHub" ? "none" : "currentColor"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
