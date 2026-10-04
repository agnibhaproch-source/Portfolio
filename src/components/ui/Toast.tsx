"use client";

import { useEffect } from "react";
import { runeCopy } from "@/content";
import { toasts, useToast } from "@/lib/runes";
import { TransitionLink } from "./TransitionLink";

/** One polite live region for small notices (rune progress, unlocks). */
export function Toast() {
  const toast = useToast();

  useEffect(() => {
    if (!toast || toast.link) return;
    const t = window.setTimeout(() => toasts.show(null), 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <div
      data-no-print
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-[190] max-w-sm"
    >
      {toast && (
        <div
          data-mode="print"
          className="flex items-center gap-4 border-[3px] border-sumi bg-washi px-4 py-3 text-sumi shadow-[5px_5px_0_0_var(--agni)]"
        >
          <span aria-hidden className="size-3 shrink-0 rotate-45 bg-aura" />
          <p className="text-14 font-bold">{toast.text}</p>
          {toast.link && (
            <TransitionLink
              href={toast.link.href}
              className="shrink-0 ink-link font-display text-14"
              onClick={() => toasts.show(null)}
            >
              {toast.link.label}
            </TransitionLink>
          )}
          {toast.link && (
            <button
              type="button"
              onClick={() => toasts.show(null)}
              className="text-14 text-muted"
              aria-label={runeCopy.close}
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
}
