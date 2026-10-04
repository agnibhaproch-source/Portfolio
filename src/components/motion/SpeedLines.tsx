"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "radial" | "parallel";
  /** 0 to 1. Ignored while `followScroll` drives it. */
  intensity?: number;
  /** Bind intensity to scroll velocity. */
  followScroll?: boolean;
  /** Any CSS colour; defaults to the current text colour. */
  color?: string;
  className?: string;
};

type Line = { a: number; len: number; w: number; off: number; speed: number };

const MAX_DPR = 1.5;
const COUNT = { radial: 140, parallel: 70 };

function makeLines(n: number): Line[] {
  return Array.from({ length: n }, () => ({
    a: Math.random(),
    len: 0.25 + Math.random() * 0.55,
    w: 0.6 + Math.random() * 2.4,
    off: Math.random(),
    speed: 0.4 + Math.random() * 1.2,
  }));
}

/**
 * Manga speed lines on a canvas. Radial lines converge on the centre and
 * leave it clear; parallel lines streak horizontally. Stops drawing when
 * off-screen or the tab is hidden; draws one still frame under reduced motion.
 */
export function SpeedLines({
  variant = "radial",
  intensity = 0.6,
  followScroll = false,
  color,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef(intensity);

  useEffect(() => {
    target.current = intensity;
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const lines = makeLines(COUNT[variant]);
    let w = 0;
    let h = 0;
    let current = followScroll ? 0 : target.current;
    let t = 0;
    let visible = false;
    let lastY = window.scrollY;
    const reduced = prefersReducedMotion();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      if (current < 0.01) return;
      ctx.fillStyle = color ?? getComputedStyle(canvas).color;
      const shown = Math.ceil(lines.length * current);

      if (variant === "radial") {
        const cx = w / 2;
        const cy = h / 2;
        const outer = Math.hypot(cx, cy);
        const clear = outer * (0.62 - current * 0.3);
        for (let i = 0; i < shown; i++) {
          const l = lines[i]!;
          const flicker = 0.75 + 0.25 * Math.sin(t * 9 * l.speed + l.off * 20);
          const angle = l.a * Math.PI * 2;
          const r0 = clear + (outer - clear) * (1 - l.len * flicker);
          const half = (l.w * 0.004 + 0.002) * (0.6 + current);
          const cos0 = Math.cos(angle - half);
          const sin0 = Math.sin(angle - half);
          const cos1 = Math.cos(angle + half);
          const sin1 = Math.sin(angle + half);
          // Tapered wedge: sharp at the inner end, wide at the edge.
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * r0, cy + Math.sin(angle) * r0);
          ctx.lineTo(cx + cos0 * outer * 1.05, cy + sin0 * outer * 1.05);
          ctx.lineTo(cx + cos1 * outer * 1.05, cy + sin1 * outer * 1.05);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        for (let i = 0; i < shown; i++) {
          const l = lines[i]!;
          const y = l.a * h;
          const len = w * l.len * (0.4 + current);
          const x = ((l.off + t * l.speed * (0.3 + current)) % 1.4) * (w + len) - len;
          ctx.globalAlpha = 0.35 + 0.65 * l.len;
          ctx.fillRect(x, y, len, l.w * 0.8);
        }
        ctx.globalAlpha = 1;
      }
    };

    const tick = (_time: number, delta: number) => {
      if (!visible || document.hidden) return;
      const dt = Math.min(delta, 50) / 1000;
      if (followScroll) {
        const y = window.scrollY;
        const v = Math.abs(y - lastY) / Math.max(dt, 0.001);
        lastY = y;
        target.current = Math.min(v / 2500, 1);
      }
      current += (target.current - current) * Math.min(dt * 6, 1);
      t += dt;
      draw();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      lastY = window.scrollY;
    });
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    if (reduced) {
      current = followScroll ? 0 : Math.min(target.current, 0.4);
      draw();
    } else {
      gsap.ticker.add(tick);
    }

    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
      ro.disconnect();
    };
  }, [variant, followScroll, color]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none block h-full w-full", className)}
    />
  );
}
