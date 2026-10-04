import { cn } from "@/lib/utils";

function seeded(seed: number) {
  let s = (seed * 2654435761) % 2147483647 || 1;
  const next = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 5; i++) next();
  return next;
}

const W = 1600;

/** Jagged energy line across a W x h box; spikes point up when `up`. */
function line(seed: number, h: number, up: boolean) {
  const rand = seeded(seed);
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 18 + Math.floor(rand() * 22)) {
    const spike = rand() > 0.82 ? 0.15 : 0.55 + rand() * 0.35;
    const y = up ? h * spike : h * (1 - spike);
    pts.push(`${x},${y.toFixed(1)}`);
  }
  pts.push(`${W},${up ? h * 0.7 : h * 0.3}`);
  return pts.join(" ");
}

/**
 * Anti-magic energy edge: a black band with a crimson jagged rim that
 * flickers between three variants on twos (CSS, frozen under reduced motion).
 */
export function JaggedEdge({
  height = 18,
  up = false,
  seed = 1,
  className,
}: {
  height?: number;
  up?: boolean;
  seed?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      className={cn("jag pointer-events-none block w-full", className)}
      style={{ height }}
    >
      {[0, 1, 2].map((v) => (
        <polyline
          key={v}
          points={line(seed * 7 + v * 13, height, up)}
          fill="none"
          stroke="var(--agni)"
          strokeWidth="2"
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
          className="[filter:drop-shadow(0_0_3px_var(--agni))]"
        />
      ))}
    </svg>
  );
}
