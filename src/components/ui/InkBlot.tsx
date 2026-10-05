import { cn } from "@/lib/utils";

/** Round to 2 decimals so server and browser render identical SVG numbers. */
const r2 = (n: number) => Math.round(n * 100) / 100;

function seeded(seed: number) {
  let s = (seed * 2654435761) % 2147483647 || 1;
  const next = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 5; i++) next();
  return next;
}

/** A small decorative ink blot with droplets, deterministic per seed. */
export function InkBlot({ seed = 1, className }: { seed?: number; className?: string }) {
  const rand = seeded(seed);
  const pts = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    const r = 16 + rand() * 10 + (i % 5 === 0 ? 8 : 0);
    return `${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");
  const drops = Array.from({ length: 5 }, () => {
    const a = rand() * Math.PI * 2;
    const d = 34 + rand() * 12;
    return { x: r2(50 + Math.cos(a) * d), y: r2(50 + Math.sin(a) * d), r: r2(1.5 + rand() * 3) };
  });
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className={cn("pointer-events-none text-sumi", className)}
    >
      <polygon
        points={pts}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {drops.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="currentColor" />
      ))}
    </svg>
  );
}
