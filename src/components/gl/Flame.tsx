"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const FlameCanvas = dynamic(() => import("./FlameCanvas"), { ssr: false });

function canUseShader() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.innerWidth < 768) return false;
  try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl2") || !!c.getContext("webgl");
  } catch {
    return false;
  }
}

/**
 * CSS flame is always rendered (SSR, no JS, reduced motion, small screens).
 * On capable devices the shader loads after first paint and fades in over it.
 */
export function Flame({ className }: { className?: string }) {
  const [useShader, setUseShader] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const id = idle(() => setUseShader(canUseShader()));
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id as number);
  }, []);

  return (
    <div aria-hidden className={cn("pointer-events-none", className)}>
      <div className={cn("flame-fallback absolute inset-0", ready && "opacity-0")} />
      {useShader && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            ready ? "opacity-100" : "opacity-0",
          )}
        >
          <FlameCanvas onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
