import { GLYPHS } from "@/components/ui/Rune";

/** Loose grimoire pages behind the hero: [left %, top %, width rem, rotation, depth, opacity]. */
const PAGES = [
  [6, 14, 9, -14, 6, 0.16],
  [38, 6, 6, 9, 14, 0.1],
  [58, 62, 11, -6, 24, 0.12],
  [84, 18, 7, 18, 30, 0.14],
  [22, 70, 7.5, 6, 18, 0.1],
] as const;

const TORN = "polygon(0 2%, 100% 0, 98% 30%, 100% 62%, 97% 100%, 60% 97%, 30% 100%, 0 98%, 2% 60%)";

/**
 * Torn grimoire pages drifting slowly at different depths. Each wrapper is a
 * parallax layer (data-depth) that the hero moves with the pointer; scroll
 * speeds come from data-page-speed. Decorative only; still under reduced motion.
 */
export function FloatingPages() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {PAGES.map(([left, top, w, rot, depth, opacity], i) => (
        <div
          key={i}
          data-depth={depth}
          data-page-speed={depth}
          className="absolute"
          style={{ left: `${left}%`, top: `${top}%`, width: `${w}rem`, opacity }}
        >
          <div
            className="aspect-[3/4] animate-[page-drift_9s_ease-in-out_infinite] border border-washi/60 bg-washi/40 p-3 motion-reduce:animate-none"
            style={{ rotate: `${rot}deg`, clipPath: TORN, animationDelay: `${-i * 1.7}s` }}
          >
            <div className="h-full bg-[repeating-linear-gradient(0deg,transparent_0_9px,rgb(29_22_20/0.5)_9px_10px)]" />
            <svg viewBox="0 0 24 24" className="absolute right-3 bottom-3 size-6 text-sumi">
              <path
                d={GLYPHS[i % GLYPHS.length]}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
