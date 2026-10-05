import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const DIGITS = "0123456789";

/**
 * A number as rolling digit columns. Server-rendered at the final value;
 * rollOdometers() spins the columns up from zero. Screen readers get the
 * plain number.
 */
export function Odometer({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("inline-flex", className)}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="inline-flex">
        {Array.from(value).map((ch, i) =>
          /\d/.test(ch) ? (
            // The invisible final digit sizes the column, so "17" isn't spaced like "00".
            <span key={i} className="relative inline-block h-[1em] overflow-hidden leading-none">
              <span className="invisible">{ch}</span>
              <span
                data-odo
                data-d={ch}
                className="absolute inset-x-0 top-0 flex flex-col items-center"
                style={{ transform: `translateY(-${Number(ch) * 10}%)` }}
              >
                {Array.from(DIGITS).map((d) => (
                  <span key={d} className="block h-[1em] leading-none">
                    {d}
                  </span>
                ))}
              </span>
            </span>
          ) : (
            <span key={i} className="leading-none">
              {ch}
            </span>
          ),
        )}
      </span>
    </span>
  );
}

/** Spin every digit column in `targets` up from 0 to its digit. */
export function rollOdometers(targets: Element[], duration = 1.2, tl?: gsap.core.Timeline, at = 0) {
  const tween = gsap.fromTo(
    targets,
    // y: 0 drops the server-rendered translateY (GSAP would read it as pixels
    // and add yPercent on top, doubling every offset).
    { y: 0, yPercent: 0 },
    {
      y: 0,
      yPercent: (_i: number, t: Element) => -Number((t as HTMLElement).dataset.d ?? 0) * 10,
      duration,
      ease: "power3.out",
      stagger: 0.04,
      immediateRender: !tl,
    },
  );
  // GSAP's yPercent replaces the server-rendered inline transform.
  if (tl) tl.add(tween, at);
  return tween;
}
