import { cn } from "@/lib/utils";

/*
 * An original anti-magic greatsword, point down, in a 160x820 box: a black,
 * chipped, notched slab of a blade, a jagged crossguard, a bound grip and a
 * heavy pommel. Shaded with gradients so it reads as metal, not a flat icon.
 */

const BLADE =
  "20,200 140,200 143,298 131,311 145,325 140,470 147,560 135,573 140,700 108,790 80,820 50,800 26,720 18,600 29,587 16,560 20,420 9,404 22,391 18,300";
const RIDGE = "80,214 80,780";
const CHIPS = [
  "131,311 145,325 138,322",
  "29,587 16,560 22,578",
  "9,404 22,391 15,402",
  "135,573 147,560 140,571",
];
const GUARD =
  "0,186 22,172 58,180 80,166 102,180 138,172 160,186 150,206 112,198 80,212 48,198 10,206";

export function Greatsword({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 160 820" className={cn("overflow-visible", className)}>
      <defs>
        <linearGradient id="gs-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#060405" />
          <stop offset="0.38" stopColor="#2b2427" />
          <stop offset="0.5" stopColor="#4a3f43" />
          <stop offset="0.62" stopColor="#1f191b" />
          <stop offset="1" stopColor="#050304" />
        </linearGradient>
        <linearGradient id="gs-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#c2272d" stopOpacity="0.12" />
          <stop offset="1" stopColor="#c2272d" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gs-grip" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a1012" />
          <stop offset="0.5" stopColor="#4a2a22" />
          <stop offset="1" stopColor="#1a1012" />
        </linearGradient>
      </defs>

      {/* pommel and grip */}
      <path
        d="M62 8 L98 8 L108 30 L80 44 L52 30 Z"
        fill="url(#gs-steel)"
        stroke="#000"
        strokeWidth="2"
      />
      <rect
        x="66"
        y="40"
        width="28"
        height="134"
        fill="url(#gs-grip)"
        stroke="#000"
        strokeWidth="2"
      />
      {Array.from({ length: 9 }, (_, i) => (
        <path
          key={i}
          d={`M66 ${50 + i * 14} L94 ${58 + i * 14}`}
          stroke="#0b0607"
          strokeWidth="3"
          strokeOpacity="0.8"
        />
      ))}

      {/* blade */}
      <polygon
        points={BLADE}
        fill="url(#gs-steel)"
        stroke="#000"
        strokeWidth="2.5"
        strokeLinejoin="miter"
      />
      <polygon points={BLADE} fill="url(#gs-sheen)" />
      <polyline points={RIDGE} stroke="#6a5c60" strokeOpacity="0.45" strokeWidth="2" />
      <polyline points="56,230 52,760" stroke="#000" strokeOpacity="0.5" strokeWidth="1.5" />
      <polyline points="104,230 108,740" stroke="#000" strokeOpacity="0.5" strokeWidth="1.5" />
      {/* bright nicked edges */}
      <polyline points="140,210 142,296" stroke="#d9cbb8" strokeOpacity="0.35" strokeWidth="1.2" />
      <polyline points="20,430 18,556" stroke="#d9cbb8" strokeOpacity="0.3" strokeWidth="1.2" />
      {CHIPS.map((pts) => (
        <polygon key={pts} points={pts} fill="#000" />
      ))}
      {/* crimson veins: the anti-magic in the steel */}
      <path
        data-veins
        d="M80 240 L74 300 L86 352 L76 420 M80 470 L88 540 L78 600 L84 690"
        fill="none"
        stroke="#ff3b30"
        strokeWidth="2"
        strokeOpacity="0"
        className="[filter:drop-shadow(0_0_4px_#c2272d)]"
      />

      {/* crossguard */}
      <polygon points={GUARD} fill="url(#gs-steel)" stroke="#000" strokeWidth="2.5" />
      <circle cx="80" cy="190" r="7" fill="#2a0c0e" stroke="#c2272d" strokeWidth="1.5" />
    </svg>
  );
}
