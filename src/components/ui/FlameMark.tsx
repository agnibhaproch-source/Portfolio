import { FLAME_INNER, FLAME_OUTER } from "./flame-paths";

/** The site's original flame mark (logo, active nav, favicon). */
export function FlameMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="3 2 26 28" className={className}>
      <path d={FLAME_OUTER} fill="var(--agni)" />
      <path d={FLAME_INNER} fill="var(--kiln)" />
    </svg>
  );
}
