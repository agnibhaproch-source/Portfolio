"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/*
 * Clash field: crimson flame magic pushing against black anti-magic void,
 * meeting at a crackling clash line that throws sparks. impact() fires a
 * shockwave, a soft flash and camera shake; burst() throws extra sparks.
 * Canvas 2D, DPR capped, paused off screen and in hidden tabs. Under reduced
 * motion it draws one still frame and ignores impacts. Original art only.
 */

export type ClashHandle = {
  /** strength ~0.3 (small) to 1.2 (finisher). `push` > 0 lets the flame side gain ground (-1..1). */
  impact: (strength?: number, push?: number) => void;
  burst: (count?: number) => void;
};

type Spark = { x: number; y: number; vx: number; vy: number; life: number };
type Ring = { x: number; y: number; r: number; life: number; w: number };

const MAX_DPR = 1.5;
const MAX_SPARKS = 140;

function seeded(seed: number) {
  let s = (seed * 2654435761) % 2147483647 || 1;
  const next = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 5; i++) next();
  return next;
}

/** Fixed blob layout per side so the field looks the same every load. */
const BLOBS = (() => {
  const rand = seeded(42);
  return Array.from({ length: 16 }, () => ({
    y: rand(),
    depth: 0.15 + rand() * 0.85,
    r: 0.25 + rand() * 0.45,
    speed: 0.4 + rand() * 0.9,
    phase: rand() * Math.PI * 2,
  }));
})();

export function ClashField({
  ref,
  intensity = 1,
  /** Lightning arcs along the clash line. */
  arcs = 3,
  /** Horizontal = clash line runs top to bottom (default). */
  className,
  shakeTarget,
}: {
  ref?: Ref<ClashHandle>;
  intensity?: number;
  arcs?: number;
  className?: string;
  /** Element to shake on impact (defaults to the canvas wrapper). */
  shakeTarget?: React.RefObject<HTMLElement | null>;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<ClashHandle>({ impact: () => {}, burst: () => {} });

  useImperativeHandle(ref, () => ({
    impact: (s, p) => api.current.impact(s, p),
    burst: (n) => api.current.burst(n),
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const box = wrap.current;
    if (!canvas || !ctx || !box) return;

    const reduced = prefersReducedMotion();
    let w = 0;
    let h = 0;
    let t = Math.random() * 10;
    let visible = false;
    let flash = 0;
    let push = 0;
    let pushTarget = 0;
    const sparks: Spark[] = [];
    const rings: Ring[] = [];
    const colors = {
      agni: "#b8232f",
      kiln: "#e2622b",
      washi: "#e6d9bc",
      aura: "#c9a24a",
      sumi: "#1d1614",
    };

    const readColors = () => {
      const cs = getComputedStyle(box);
      for (const k of Object.keys(colors) as (keyof typeof colors)[]) {
        const v = cs.getPropertyValue(`--${k}`).trim();
        if (v) colors[k] = v;
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      w = box.clientWidth;
      h = box.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readColors();
      draw(0);
    };

    const clashX = () =>
      w * (0.5 + push * 0.25) + Math.sin(t * 1.3) * w * 0.02 + Math.sin(t * 3.1) * w * 0.006;

    const emit = (n: number) => {
      const cx = clashX();
      for (let i = 0; i < n && sparks.length < MAX_SPARKS; i++) {
        const dir = Math.random() < 0.5 ? -1 : 1;
        sparks.push({
          x: cx + (Math.random() - 0.5) * 10,
          y: Math.random() * h,
          vx: dir * (80 + Math.random() * 260),
          vy: (Math.random() - 0.6) * 180,
          life: 0.4 + Math.random() * 0.5,
        });
      }
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, w, h);
      const cx = clashX();

      // Flame side (left): warm blobs drifting upward, additive.
      ctx.globalCompositeOperation = "lighter";
      for (const b of BLOBS) {
        const x = cx - b.depth * cx - Math.sin(t * b.speed + b.phase) * 20;
        const y = ((((b.y - t * 0.04 * b.speed) % 1) + 1) % 1) * h;
        const r = b.r * Math.max(h, 120) * (0.9 + 0.1 * Math.sin(t * 2 + b.phase));
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, colors.kiln);
        g.addColorStop(0.35, colors.agni);
        g.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.22 * intensity * (1 - b.depth * 0.5);
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }

      // Anti-magic side (right): black void eating the light, crimson rim.
      ctx.globalCompositeOperation = "source-over";
      for (const b of BLOBS) {
        const x = cx + b.depth * (w - cx) + Math.sin(t * b.speed * 0.8 + b.phase) * 24;
        const y = ((b.y + t * 0.03 * b.speed) % 1) * h;
        const r = b.r * Math.max(h, 120) * 1.1;
        const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
        g.addColorStop(0, "rgba(0,0,0,0.85)");
        g.addColorStop(0.7, "rgba(0,0,0,0.35)");
        g.addColorStop(0.9, colors.agni);
        g.addColorStop(1, "transparent");
        ctx.globalAlpha = 0.5 * intensity;
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;

      // Clash line: lightning arcs, redrawn on twos for a hand-drawn crackle.
      const crackle = Math.floor(t * 12);
      const rand = seeded(crackle + 1);
      for (let a = 0; a < arcs; a++) {
        ctx.beginPath();
        let y = 0;
        ctx.moveTo(cx + (rand() - 0.5) * 16, 0);
        while (y < h) {
          y += 6 + rand() * Math.max(h / 8, 10);
          ctx.lineTo(cx + (rand() - 0.5) * (18 + a * 10) * intensity, y);
        }
        ctx.lineWidth = 5 - a;
        ctx.strokeStyle = colors.agni;
        ctx.globalAlpha = 0.45;
        ctx.stroke();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = a === 0 ? colors.washi : colors.kiln;
        ctx.globalAlpha = 0.95;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Sparks streak away from the clash.
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]!;
        s.life -= dt;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        s.vy += 220 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        ctx.strokeStyle = s.vx < 0 ? colors.kiln : colors.agni;
        ctx.globalAlpha = Math.min(s.life * 2, 1);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 0.03, s.y - s.vy * 0.03);
        ctx.stroke();
      }

      // Shockwave rings.
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i]!;
        r.life -= dt * 1.6;
        if (r.life <= 0) {
          rings.splice(i, 1);
          continue;
        }
        r.r += dt * Math.max(w, h) * 0.9;
        ctx.globalAlpha = r.life;
        ctx.strokeStyle = colors.aura;
        ctx.lineWidth = r.w * r.life;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Impact flash (soft, decays fast).
      if (flash > 0.01) {
        ctx.globalAlpha = flash;
        ctx.fillStyle = colors.washi;
        ctx.fillRect(0, 0, w, h);
        flash *= 0.82;
      }
      ctx.globalAlpha = 1;
    };

    const tick = (_time: number, deltaMs: number) => {
      if (!visible || document.hidden) return;
      const dt = Math.min(deltaMs, 50) / 1000;
      t += dt;
      push += (pushTarget - push) * Math.min(dt * 3, 1);
      pushTarget *= 0.995;
      if (Math.random() < 0.6 * intensity) emit(1);
      draw(dt);
    };

    const shakeEl = () => shakeTarget?.current ?? box;
    api.current = {
      impact: (strength = 1, p = 0) => {
        if (reduced) return;
        pushTarget = gsap.utils.clamp(-1, 1, pushTarget + p);
        flash = Math.min(0.28 * strength, 0.35);
        rings.push({ x: clashX(), y: h / 2, r: 4, life: 1, w: 6 * strength });
        emit(Math.round(40 * strength));
        const el = shakeEl();
        const amp = 6 * strength;
        gsap.fromTo(
          el,
          { x: amp, y: -amp * 0.6 },
          { x: 0, y: 0, duration: 0.45, ease: "elastic.out(1.2, 0.25)", clearProps: "transform" },
        );
      },
      burst: (n = 6) => {
        if (!reduced) emit(n);
      },
    };

    const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting));
    io.observe(box);
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    // Re-read colours when print mode swaps the tokens.
    const mo = new MutationObserver(readColors);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-print"] });
    resize();

    if (!reduced) gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
    };
  }, [intensity, arcs, shakeTarget]);

  return (
    <div ref={wrap} aria-hidden className={cn("pointer-events-none", className)}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
