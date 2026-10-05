import type { ReactNode } from "react";

/** A panel mounted on scroll rods; the stats timeline unrolls it (data-unroll). */
export function Unroll({ children, className }: { children: ReactNode; className?: string }) {
  const rod =
    "relative z-10 h-4 rounded-full bg-[linear-gradient(180deg,#8a5a32,#3a2414)] shadow-[0_3px_6px_rgb(0_0_0/0.5)] before:absolute before:-left-2 before:top-1/2 before:size-5 before:-translate-y-1/2 before:rounded-full before:bg-aura after:absolute after:-right-2 after:top-1/2 after:size-5 after:-translate-y-1/2 after:rounded-full after:bg-aura";
  return (
    <div data-unroll className={className}>
      <div aria-hidden data-rod="top" className={rod} />
      <div data-sheet className="relative -my-2">
        {children}
      </div>
      <div aria-hidden data-rod="bottom" className={rod} />
    </div>
  );
}

/** A manga cut-in strip that slides across a panel with a sound word. */
export function CutIn({ word }: { word: string }) {
  return (
    <div
      aria-hidden
      data-cutin
      className="pointer-events-none absolute inset-x-0 top-[30%] z-20 flex h-24 -skew-y-3 items-center justify-center overflow-hidden border-y-[3px] border-washi bg-sumi opacity-0"
    >
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_18px,rgb(235_220_185/0.12)_18px_20px)]" />
      <span className="relative sfx text-56 text-kiln [text-shadow:0_0_14px_var(--agni)]">
        {word}
      </span>
    </div>
  );
}
