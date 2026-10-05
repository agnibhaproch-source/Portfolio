import { cn } from "@/lib/utils";

/*
 * An original summoned devil, drawn as a silhouette in a 400x420 box:
 * long curved horns, clawed arms raised, tattered wings, the body trailing
 * off into smoke at the bottom. Not any show's character.
 */

const W = 400;
/** Mirror a path of absolute "x y" pairs across the vertical centre. */
const mirror = (d: string) =>
  d.replace(
    /(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g,
    (_, x: string, y: string) => `${W - Number(x)} ${y}`,
  );

const HORN = "M188 162 C160 150 134 118 146 62 C154 100 170 128 198 150 Z";
const ARM =
  "M140 226 C116 238 92 236 72 214 L58 196 L74 205 L62 182 L80 199 L78 174 L92 200 C106 214 122 214 138 206 Z";
const WING =
  "M150 222 C120 166 78 104 2 74 C24 116 28 148 14 186 C42 168 62 176 64 204 C84 188 102 196 108 222 C122 210 138 214 150 238 Z";
const WING_BONES = "M150 222 L2 74 M118 194 L14 186 M132 208 L64 204 M144 220 L108 222";
const BODY =
  "M150 420 L168 300 C150 290 126 262 126 236 C126 214 150 204 170 200 L186 198 C190 204 210 204 214 198 L230 200 C250 204 274 214 274 236 C274 262 250 290 232 300 L250 420 Z";
const HEAD =
  "M184 196 L179 170 C181 156 190 147 200 145 C210 147 219 156 221 170 L216 196 L200 208 Z";

export function Devil({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox={`0 0 ${W} 420`} className={cn("overflow-visible", className)}>
      <defs>
        <linearGradient id="devil-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.62" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="devil-mask">
          <rect x="-200" y="-50" width="800" height="520" fill="url(#devil-fade)" />
        </mask>
        <radialGradient id="devil-core" cx="0.5" cy="0.55" r="0.5">
          <stop offset="0" stopColor="#2a0d10" />
          <stop offset="1" stopColor="#050304" />
        </radialGradient>
      </defs>
      <g mask="url(#devil-mask)">
        <g data-wing="l" style={{ transformOrigin: "150px 226px" }}>
          <path
            d={WING}
            fill="#050304"
            stroke="var(--agni)"
            strokeWidth="1.5"
            strokeOpacity="0.7"
          />
          <path
            d={WING_BONES}
            fill="none"
            stroke="var(--agni)"
            strokeWidth="1"
            strokeOpacity="0.35"
          />
        </g>
        <g data-wing="r" style={{ transformOrigin: "250px 226px" }}>
          <path
            d={mirror(WING)}
            fill="#050304"
            stroke="var(--agni)"
            strokeWidth="1.5"
            strokeOpacity="0.7"
          />
          <path
            d={mirror(WING_BONES)}
            fill="none"
            stroke="var(--agni)"
            strokeWidth="1"
            strokeOpacity="0.35"
          />
        </g>
        <g fill="url(#devil-core)" stroke="var(--agni)" strokeWidth="1.2" strokeOpacity="0.55">
          <path d={ARM} />
          <path d={mirror(ARM)} />
          <path d={BODY} />
          <path d={HORN} />
          <path d={mirror(HORN)} />
          <path d={HEAD} />
        </g>
        <path
          d="M170 214 L200 256 L230 214 M184 262 C192 268 208 268 216 262 M180 280 C192 286 208 286 220 280"
          fill="none"
          stroke="var(--agni)"
          strokeWidth="1.2"
          strokeOpacity="0.4"
        />
        <g
          data-eyes
          fill="var(--kiln)"
          className="[filter:drop-shadow(0_0_4px_var(--agni))_drop-shadow(0_0_10px_var(--agni))]"
        >
          <polygon points="186,174 198,179 188,182" />
          <polygon points="214,174 202,179 212,182" />
        </g>
      </g>
    </svg>
  );
}
