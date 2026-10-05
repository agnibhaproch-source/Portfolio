/*
 * A tiny stickman rig shared by the sparring panel and the training montage.
 * A pose is 11 joints (x, y pairs, facing right, hip near x = 0) plus the
 * sword angle in degrees (0 = straight up, clockwise). Poses are tweened as
 * plain number arrays and drawn by setting SVG attributes.
 */

// head, neck, hip, elbowF, handF, elbowB, handB, kneeF, footF, kneeB, footB, sword
export type Pose = number[];

const P = (pts: [number, number][], sword: number): Pose => [...pts.flat(), sword];

export const POSES = {
  idle: P(
    [
      [4, 100],
      [6, 116],
      [0, 160],
      [22, 132],
      [38, 124],
      [-10, 136],
      [-2, 150],
      [18, 184],
      [30, 210],
      [-12, 186],
      [-24, 210],
    ],
    35,
  ),
  bob: P(
    [
      [4, 104],
      [6, 120],
      [0, 164],
      [22, 136],
      [38, 128],
      [-10, 140],
      [-2, 154],
      [20, 188],
      [30, 210],
      [-14, 190],
      [-24, 210],
    ],
    28,
  ),
  windup: P(
    [
      [-2, 98],
      [0, 114],
      [-4, 160],
      [-14, 108],
      [-6, 92],
      [-18, 132],
      [-28, 140],
      [16, 184],
      [30, 210],
      [-16, 186],
      [-30, 210],
    ],
    -45,
  ),
  strike: P(
    [
      [30, 108],
      [28, 122],
      [14, 162],
      [46, 128],
      [62, 140],
      [6, 134],
      [-8, 128],
      [38, 180],
      [56, 210],
      [-6, 190],
      [-26, 210],
    ],
    125,
  ),
  duck: P(
    [
      [-20, 128],
      [-14, 140],
      [-6, 172],
      [8, 150],
      [22, 146],
      [-26, 152],
      [-36, 160],
      [12, 192],
      [30, 210],
      [-22, 194],
      [-40, 210],
    ],
    60,
  ),
  leap: P(
    [
      [-10, 70],
      [-8, 86],
      [-6, 128],
      [10, 100],
      [24, 94],
      [-24, 104],
      [-34, 96],
      [10, 146],
      [2, 170],
      [-20, 150],
      [-34, 168],
    ],
    20,
  ),
  thrust: P(
    [
      [22, 104],
      [20, 120],
      [8, 160],
      [40, 120],
      [62, 118],
      [0, 134],
      [-14, 142],
      [30, 182],
      [48, 210],
      [-10, 188],
      [-30, 210],
    ],
    90,
  ),
  hurt: P(
    [
      [-18, 112],
      [-12, 124],
      [0, 164],
      [10, 140],
      [18, 156],
      [-24, 120],
      [-36, 108],
      [14, 188],
      [26, 210],
      [-10, 190],
      [-20, 210],
    ],
    150,
  ),
  charge: P(
    [
      [0, 96],
      [0, 112],
      [0, 162],
      [10, 92],
      [4, 74],
      [-10, 92],
      [2, 74],
      [24, 186],
      [40, 210],
      [-24, 186],
      [-40, 210],
    ],
    0,
  ),
  finish: P(
    [
      [34, 122],
      [30, 134],
      [10, 168],
      [50, 146],
      [64, 166],
      [40, 150],
      [60, 166],
      [36, 188],
      [54, 210],
      [-14, 194],
      [-34, 210],
    ],
    165,
  ),
  down: P(
    [
      [-62, 202],
      [-46, 203],
      [0, 204],
      [-30, 196],
      [-20, 190],
      [-40, 206],
      [-56, 206],
      [16, 196],
      [36, 206],
      [16, 206],
      [38, 208],
    ],
    100,
  ),
} satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;

const BONES: [number, number][] = [
  [1, 2], // spine
  [1, 3],
  [3, 4], // front arm
  [1, 5],
  [5, 6], // back arm
  [2, 7],
  [7, 8], // front leg
  [2, 9],
  [9, 10], // back leg
];

export type Rig = { pose: Pose; x: number; facing: 1 | -1 };

export function makeRig(name: PoseName, x: number, facing: 1 | -1): Rig {
  return { pose: [...POSES[name]], x, facing };
}

/** Write a rig's pose into its SVG group (rendered by <Stickman>). */
export function drawRig(g: SVGGElement | null, rig: Rig) {
  if (!g) return;
  const { pose, x, facing } = rig;
  const px = (i: number) => x + facing * pose[i * 2]!;
  const py = (i: number) => pose[i * 2 + 1]!;
  const lines = g.querySelectorAll<SVGLineElement>("[data-bone]");
  BONES.forEach(([a, b], k) => {
    const l = lines[k];
    if (!l) return;
    l.setAttribute("x1", px(a).toFixed(1));
    l.setAttribute("y1", py(a).toFixed(1));
    l.setAttribute("x2", px(b).toFixed(1));
    l.setAttribute("y2", py(b).toFixed(1));
  });
  const head = g.querySelector("[data-head]");
  head?.setAttribute("cx", px(0).toFixed(1));
  head?.setAttribute("cy", (py(0) - 2).toFixed(1));
  const sword = g.querySelector("[data-blade]");
  sword?.setAttribute(
    "transform",
    `translate(${px(4).toFixed(1)} ${py(4).toFixed(1)}) rotate(${(facing * pose[22]!).toFixed(1)})`,
  );
}

/** The SVG for one fighter; pose it with drawRig(). */
export function Stickman({
  rig,
  blade = "broad",
  className,
  ref,
}: {
  rig: Rig;
  blade?: "broad" | "katana";
  className?: string;
  ref?: React.Ref<SVGGElement>;
}) {
  const { pose, x, facing } = rig;
  const px = (i: number) => x + facing * pose[i * 2]!;
  const py = (i: number) => pose[i * 2 + 1]!;
  return (
    <g
      ref={ref}
      className={className}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {BONES.map(([a, b], k) => (
        <line key={k} data-bone x1={px(a)} y1={py(a)} x2={px(b)} y2={py(b)} strokeWidth="6" />
      ))}
      <circle data-head cx={px(0)} cy={py(0) - 2} r="12" fill="currentColor" stroke="none" />
      <g data-blade transform={`translate(${px(4)} ${py(4)}) rotate(${facing * pose[22]!})`}>
        <line x1="0" y1="8" x2="0" y2="-2" strokeWidth="5" />
        <line x1="-8" y1="-3" x2="8" y2="-3" strokeWidth="4" />
        {blade === "broad" ? (
          <path d="M-6 -5 L6 -5 L7 -54 L0 -66 L-7 -56 Z" fill="currentColor" strokeWidth="1.5" />
        ) : (
          <path
            d="M-1.5 -5 L1.5 -5 C3 -30 2 -52 -3 -72 C-1 -52 -2 -30 -1.5 -5 Z"
            fill="currentColor"
            strokeWidth="1.5"
          />
        )}
      </g>
    </g>
  );
}

/** Tween target: animate `rig.pose` toward a named pose with GSAP's endArray. */
export const poseTo = (name: PoseName) => ({ endArray: POSES[name] });
