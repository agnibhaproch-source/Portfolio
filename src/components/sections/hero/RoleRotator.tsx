"use client";

import { useEffect, useRef } from "react";
import { heroCopy } from "@/content";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * The role line brush-swipes through the owner's real roles: a crimson
 * stroke paints over the words, they change underneath, the stroke lifts.
 * Pauses off screen; the first role stays put under reduced motion.
 * Screen readers get the whole list once.
 */
export function RoleRotator({ className }: { className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const roles = heroCopy.roles;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || roles.length < 2) return;
    const text = el.querySelector<HTMLElement>("[data-role]");
    const brush = el.querySelector<HTMLElement>("[data-role-brush]");
    if (!text || !brush) return;
    let i = 0;
    let visible = true;
    const swap = () => {
      if (!visible || document.hidden || !el.closest("[data-revealed]")) return;
      i = (i + 1) % roles.length;
      gsap
        .timeline()
        .set(brush, { transformOrigin: "left center" })
        .fromTo(brush, { scaleX: 0 }, { scaleX: 1, duration: 0.28, ease: "power3.in" })
        .call(() => {
          text.textContent = roles[i] ?? "";
        })
        .set(brush, { transformOrigin: "right center" })
        .to(brush, { scaleX: 0, duration: 0.32, ease: "power3.out" });
    };
    const id = window.setInterval(swap, 2800);
    const io = new IntersectionObserver(([e]) => (visible = !!e?.isIntersecting));
    io.observe(el);
    return () => {
      window.clearInterval(id);
      io.disconnect();
    };
  }, [roles]);

  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{roles.join(", ")}</span>
      <span aria-hidden className="relative inline-block whitespace-nowrap">
        <span data-role>{roles[0]}</span>
        <span
          data-role-brush
          className="absolute -inset-x-2 -inset-y-0.5 origin-left scale-x-0 -skew-x-12 bg-agni [clip-path:polygon(0_12%,100%_0,98%_88%,2%_100%)]"
        />
      </span>
    </p>
  );
}
