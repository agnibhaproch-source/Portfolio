import { cn } from "@/lib/utils";

/*
 * Original fighter silhouettes in a running stance, facing right. Not any
 * show's character: a hooded swordsman with a broad notched blade, and a
 * spiky-haired duellist with a long thin blade. The sword hangs from the
 * hand at (163, 92); rotate it with setSwing().
 */

export const HAND = { x: 163, y: 92 };

const BODY = {
  torso: "98,72 128,60 136,112 106,122",
  arm: "124,62 134,60 168,88 160,97",
  frontLeg: "112,112 130,116 160,150 172,186 156,190 146,158",
  backLeg: "104,114 122,122 94,152 58,174 50,163 84,140",
};

const HEAD = {
  broad: "M126 46 C128 32 146 28 154 40 C160 52 152 64 140 64 C134 64 128 60 126 56 L104 36 Z",
  katana:
    "M128 44 L110 30 L128 36 L120 18 L136 32 L140 12 L148 32 L162 26 L154 42 C158 54 150 64 140 64 C132 64 126 56 128 44 Z",
};

const CLOAK = {
  broad: "M100 68 L128 60 L112 122 L70 142 L78 124 L44 130 L62 112 L26 108 L56 96 L38 82 Z",
  katana: "M100 68 L128 60 L114 124 L40 136 L66 120 L30 112 L70 98 Z",
};

const BLADE = {
  broad: (
    <>
      <rect x="-4" y="-2" width="8" height="20" />
      <circle cx="0" cy="21" r="5" />
      <polygon points="-19,-2 19,-2 15,-11 -15,-11" />
      <polygon points="-13,-11 13,-11 16,-60 11,-65 17,-71 14,-130 0,-160 -12,-142 -16,-92 -10,-85 -16,-78" />
    </>
  ),
  katana: (
    <>
      <rect x="-3" y="-2" width="6" height="24" />
      <ellipse cx="0" cy="-3" rx="9" ry="3.5" />
      <path d="M-3 -6 L3 -6 C6 -60 4 -120 -6 -176 L-9 -166 C-3 -116 -1 -60 -3 -6 Z" />
    </>
  ),
};

export function SwordFigure({
  variant = "broad",
  swing = -70,
  className,
}: {
  variant?: "broad" | "katana";
  /** Initial sword angle in degrees (0 = straight up). */
  swing?: number;
  className?: string;
}) {
  return (
    <svg aria-hidden viewBox="0 0 240 200" className={cn("overflow-visible", className)}>
      <g fill="currentColor">
        <path d={CLOAK[variant]} />
        <polygon points={BODY.backLeg} />
        <polygon points={BODY.torso} />
        <path d={HEAD[variant]} />
        <polygon points={BODY.frontLeg} />
        <g transform={`translate(${HAND.x} ${HAND.y})`}>
          <g data-sword transform={`rotate(${swing})`}>
            {BLADE[variant]}
          </g>
        </g>
        <polygon points={BODY.arm} />
      </g>
    </svg>
  );
}

/** A tween target that rotates every [data-sword] inside `scope`. */
export function swingProxy(scope: Element | null, from: number) {
  const swords = Array.from(scope?.querySelectorAll("[data-sword]") ?? []);
  const proxy = { a: from };
  const apply = () => swords.forEach((s) => s.setAttribute("transform", `rotate(${proxy.a})`));
  apply();
  return { proxy, apply };
}
