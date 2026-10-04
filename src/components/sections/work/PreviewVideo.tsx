"use client";

import { useEffect, useRef } from "react";
import { workCopy } from "@/content";
import { MOTION_QUERIES } from "@/lib/motion";

/**
 * Plays a silent loop over a chapter's screenshots while the pointer is over
 * them (desktop, fine pointer, motion allowed). Nothing downloads until the
 * first hover; touch and reduced-motion visitors keep the stills.
 */
export function PreviewVideo({
  src,
  poster,
  label,
}: {
  src: string;
  poster: string;
  label: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const host = wrap.current?.parentElement;
    const v = video.current;
    if (!host || !v || !window.matchMedia(MOTION_QUERIES.desktop).matches) return;
    const show = () => {
      if (!v.src) v.src = src;
      wrap.current?.setAttribute("data-on", "");
      void v.play().catch(() => {});
    };
    const hide = () => {
      wrap.current?.removeAttribute("data-on");
      v.pause();
    };
    host.addEventListener("pointerenter", show);
    host.addEventListener("pointerleave", hide);
    return () => {
      host.removeEventListener("pointerenter", show);
      host.removeEventListener("pointerleave", hide);
    };
  }, [src]);

  return (
    <div
      ref={wrap}
      className="pointer-events-none absolute inset-0 z-10 hidden opacity-0 transition-opacity duration-300 data-on:opacity-100 lg:block"
    >
      <video
        ref={video}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        className="h-full w-full border-[3px] border-washi bg-sumi object-cover object-top"
      />
      <span className="absolute top-3 left-3 flex items-center gap-2 bg-sumi px-2 py-0.5 font-display text-14 text-washi">
        <span aria-hidden className="size-2 animate-pulse rounded-full bg-agni" />
        {workCopy.preview}
      </span>
    </div>
  );
}
