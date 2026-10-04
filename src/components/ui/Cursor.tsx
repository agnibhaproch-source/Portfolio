"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/lib/use-motion";

type Mode = "default" | "link" | "charge" | "drag" | "text";

const SLASHES = 4;

function modeFor(target: EventTarget | null): { mode: Mode; label: string } {
  const el = (target as Element | null)?.closest?.(
    "[data-cursor], a, button, input, textarea, select, [role='button']",
  ) as HTMLElement | null;
  if (!el) return { mode: "default", label: "" };
  const label = el.dataset.cursorLabel ?? "";
  if (el.dataset.cursor) return { mode: el.dataset.cursor as Mode, label };
  if (el.matches("input, textarea, select")) return { mode: "text", label };
  if (el.matches("button, [role='button']")) return { mode: "charge", label };
  return { mode: "link", label };
}

/**
 * Ink dot plus a trailing ring carrying a small blade that points along the
 * direction of travel. States: default, link, charge (buttons), drag, text.
 * Clicks leave a short slash streak. Desktop with a fine pointer only.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useMotion((ctx, el) => {
    if (!ctx.desktop) return;
    const html = document.documentElement;
    const q = gsap.utils.selector(el);
    const dot = q("[data-dot]")[0] as HTMLElement;
    const ring = q("[data-ring]")[0] as HTMLElement;
    const circle = q("[data-ring-circle]")[0] as HTMLElement;
    const blade = q("[data-blade]")[0] as HTMLElement;
    const label = q("[data-label]")[0] as HTMLElement;
    const slashes = Array.from(el.querySelectorAll<SVGLineElement>("[data-slash]"));

    html.classList.add("has-cursor");
    gsap.set(el, { autoAlpha: 1 });

    const dx = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.38, ease: "power3" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.38, ease: "power3" });
    const rot = gsap.quickTo(blade, "rotation", { duration: 0.3, ease: "power2" });

    let lastX = 0;
    let lastY = 0;
    let angle = 0;
    let shown = false;
    let mode: Mode = "default";

    const setMode = (next: Mode, text: string) => {
      label.textContent = text;
      gsap.to(label, { autoAlpha: text ? 1 : 0, duration: 0.2 });
      if (next === mode) return;
      mode = next;
      const charge = next === "charge";
      gsap.to(circle, {
        scale: { default: 1, link: 1.7, charge: 1.35, drag: 2.3, text: 0.4 }[next],
        borderColor: charge ? "var(--aura)" : "var(--washi)",
        duration: 0.35,
        ease: "heat",
      });
      gsap.to(blade, { autoAlpha: next === "default" ? 1 : 0, duration: 0.2 });
      gsap.to(dot, {
        scaleX: next === "text" ? 0.35 : 1,
        scaleY: next === "text" ? 3 : 1,
        duration: 0.2,
      });
      gsap.killTweensOf(circle, "boxShadow");
      if (charge) {
        gsap.fromTo(
          circle,
          { boxShadow: "0 0 0 0 rgb(201 162 74 / 0.6)" },
          {
            boxShadow: "0 0 0 10px rgb(201 162 74 / 0)",
            duration: 0.9,
            repeat: -1,
            ease: "power1.out",
          },
        );
      } else {
        gsap.set(circle, { boxShadow: "none" });
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!shown) {
        shown = true;
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
        gsap.to([dot, ring], { autoAlpha: 1, duration: 0.2 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      const vx = e.clientX - lastX;
      const vy = e.clientY - lastY;
      if (Math.hypot(vx, vy) > 3) {
        const next = (Math.atan2(vy, vx) * 180) / Math.PI + 90;
        // unwrap so the blade turns the short way round
        angle += ((((next - angle) % 360) + 540) % 360) - 180;
        rot(angle);
      }
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onOver = (e: PointerEvent) => {
      const m = modeFor(e.target);
      setMode(m.mode, m.label);
    };

    let slashIndex = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const line = slashes[slashIndex++ % SLASHES];
      if (!line) return;
      const a = ((-30 + (Math.random() - 0.5) * 40) * Math.PI) / 180;
      const len = 46;
      gsap.killTweensOf(line);
      gsap.set(line, {
        attr: {
          x1: e.clientX - Math.cos(a) * len,
          y1: e.clientY - Math.sin(a) * len,
          x2: e.clientX + Math.cos(a) * len,
          y2: e.clientY + Math.sin(a) * len,
        },
        opacity: 1,
        drawSVG: "0% 0%",
      });
      gsap
        .timeline()
        .to(line, { drawSVG: "0% 100%", duration: 0.1, ease: "power2.in" })
        .to(line, { drawSVG: "100% 100%", opacity: 0, duration: 0.25, ease: "power2.out" });
      gsap.fromTo(circle, { scale: "-=0.25" }, { scale: "+=0.25", duration: 0.3, ease: "heat" });
    };

    const onLeave = () => {
      shown = false;
      gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2 });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, ref);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none invisible fixed inset-0 z-[200] opacity-0"
    >
      <svg className="absolute inset-0 h-full w-full overflow-visible">
        {Array.from({ length: SLASHES }, (_, i) => (
          <line
            key={i}
            data-slash
            stroke="var(--kiln)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0"
          />
        ))}
      </svg>
      <div data-ring className="invisible absolute top-0 left-0 opacity-0">
        <div
          data-ring-circle
          className="absolute -top-5 -left-5 size-10 rounded-full border-[1.5px] border-washi shadow-none [outline:1px_solid_rgb(29_22_20/0.5)]"
        />
        <div data-blade className="absolute top-0 left-0">
          <span className="absolute -top-[27px] -left-[3px] block h-[10px] w-[6px] bg-washi [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
        </div>
        <span
          data-label
          className="invisible absolute top-7 left-7 bg-sumi px-2 py-0.5 font-display text-14 whitespace-nowrap text-washi opacity-0"
        />
      </div>
      <div
        data-dot
        className="invisible absolute -top-[3px] -left-[3px] size-[6px] rounded-full bg-washi opacity-0 [box-shadow:0_0_0_1.5px_var(--sumi)]"
      />
    </div>
  );
}
