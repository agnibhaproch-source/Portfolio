"use client";

import { useSyncExternalStore } from "react";
import { statsCopy } from "@/content";

const subscribe = (fn: () => void) => {
  const id = window.setInterval(fn, 60_000);
  return () => window.clearInterval(id);
};

/** A heartbeat "LIVE" badge and how long ago the numbers were fetched. */
export function LivePulse({ fetchedAt, fallback }: { fetchedAt: string; fallback: string }) {
  const hours = useSyncExternalStore(
    subscribe,
    () => Math.floor((Date.now() - new Date(fetchedAt).getTime()) / 3_600_000),
    () => null,
  );
  return (
    <p className="flex flex-wrap items-center gap-3 text-14 text-muted">
      <span className="inline-flex items-center gap-2 border-2 border-agni px-2 py-0.5 font-display text-kiln">
        <svg aria-hidden viewBox="0 0 40 12" className="h-3 w-10">
          <polyline
            points="0,6 10,6 13,1 17,11 20,6 40,6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            pathLength={100}
            className="animate-[ecg_1.4s_linear_infinite] [stroke-dasharray:100] motion-reduce:animate-none"
          />
        </svg>
        {statsCopy.live}
      </span>
      <span>{hours === null ? fallback : statsCopy.updated(hours)}</span>
    </p>
  );
}
