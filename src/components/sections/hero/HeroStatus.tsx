"use client";

import { useSyncExternalStore } from "react";
import { heroCopy } from "@/content";

const { clock } = heroCopy;
const fmt = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: clock.timeZone,
});

const subscribe = (fn: () => void) => {
  const id = window.setInterval(fn, 15_000);
  return () => window.clearInterval(id);
};

/** Availability badge with a live pulse, and the owner's local time in Kolkata. */
export function HeroStatus({ className }: { className?: string }) {
  // Client-only: the server has no idea what time the visitor reads this.
  const time = useSyncExternalStore(
    subscribe,
    () => fmt.format(new Date()),
    () => null,
  );
  return (
    <div className={`flex flex-wrap items-center gap-3 text-14 ${className ?? ""}`}>
      {heroCopy.status && (
        <span className="inline-flex items-center gap-2 border-2 border-washi/50 bg-sumi/60 px-2.5 py-1">
          <span aria-hidden className="relative flex size-2.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-agni opacity-75 motion-reduce:animate-none" />
            <span className="relative size-2.5 rounded-full bg-kiln" />
          </span>
          {heroCopy.status}
        </span>
      )}
      <span className="inline-flex items-center gap-1.5 text-muted">
        <span>{clock.city}</span>
        <span aria-hidden>·</span>
        <time aria-label={clock.label} className="min-w-[5ch] font-display text-washi tabular-nums">
          {time ?? "--:--"}
        </time>
        <span>IST</span>
      </span>
    </div>
  );
}
