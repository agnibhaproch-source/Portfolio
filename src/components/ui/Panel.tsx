import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Panel outlines as [x%, y%] points. Diagonal cuts give the manga-page feel. */
export const PANEL_SHAPES = {
  rect: [
    [0, 0],
    [100, 0],
    [100, 100],
    [0, 100],
  ],
  "cut-right": [
    [0, 0],
    [100, 0],
    [88, 100],
    [0, 100],
  ],
  "cut-left": [
    [12, 0],
    [100, 0],
    [100, 100],
    [0, 100],
  ],
  "slant-top": [
    [0, 8],
    [100, 0],
    [100, 100],
    [0, 100],
  ],
  "slant-bottom": [
    [0, 0],
    [100, 0],
    [100, 92],
    [0, 100],
  ],
  "torn-bottom": [
    [0, 0],
    [100, 0],
    [100, 96],
    [93, 99],
    [86, 95.5],
    [78, 99.5],
    [70, 96],
    [61, 100],
    [52, 95],
    [44, 98.5],
    [35, 95.5],
    [26, 99.5],
    [17, 96],
    [8, 99],
    [0, 96],
  ],
} as const satisfies Record<string, ReadonlyArray<readonly [number, number]>>;

export type PanelShape = keyof typeof PANEL_SHAPES;
export type Points = ReadonlyArray<readonly [number, number]>;

export function clipPolygon(points: Points) {
  return `polygon(${points.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
}

type PanelTag = "div" | "section" | "article" | "li" | "figure";

type PanelProps = {
  as?: PanelTag;
  shape?: PanelShape;
  /** Screentone fill behind the content. */
  tone?: boolean;
  /** Paint the mode background inside the panel (default true). */
  fill?: boolean;
  className?: string;
  innerClassName?: string;
  children?: ReactNode;
  /** Rendered above the border, outside the clip (e.g. speech bubbles). */
  overlay?: ReactNode;
  /** Manga page number printed small in the bottom corner. */
  page?: number;
  /** A strip of tape holding the panel to the page. */
  tape?: boolean;
  /** On hover the art bursts out past the border, which cracks at the corner. */
  breakout?: boolean;
} & Omit<ComponentPropsWithoutRef<"div">, "className" | "children">;

/**
 * A ruled manga panel. Content is clipped to the shape; the 3px ink border
 * is an SVG polygon with non-scaling stroke, so it stays 3px at any size and
 * can be drawn on with DrawSVG (data-panel-border).
 */
export function Panel({
  as,
  shape = "rect",
  tone = false,
  fill = true,
  className,
  innerClassName,
  children,
  overlay,
  page,
  tape = false,
  breakout = false,
  ...rest
}: PanelProps) {
  // All panel tags share div attributes; narrow for the JSX checker.
  const Tag = (as ?? "div") as "div";
  const points = PANEL_SHAPES[shape];
  const clip = clipPolygon(points);

  return (
    <Tag
      className={cn("group/panel relative isolate", breakout && "breakout", className)}
      {...rest}
    >
      {breakout && (
        <div
          aria-hidden
          data-breakout-shadow
          className="pointer-events-none absolute inset-0 bg-sumi/70"
          style={{ clipPath: clip }}
        />
      )}
      <div
        data-panel-content
        className={cn("relative h-full", fill && "bg-bg", tone && "tone", innerClassName)}
        style={{ clipPath: clip }}
      >
        {children}
      </div>
      <svg
        data-panel-border
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          points={points.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="currentColor"
          style={{ strokeWidth: "var(--ink-w)" }}
          strokeLinejoin="miter"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {breakout && (
        <svg
          aria-hidden
          data-breakout-crack
          className="pointer-events-none absolute inset-0 z-[3] h-full w-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            pathLength={100}
            d="M0 0 L7 4 L5 9 L12 13 L10 19 M7 4 L13 2 L18 6 M5 9 L0 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
          <polygon data-shard="1" points="2,1 6,2 3,5" fill="currentColor" />
          <polygon data-shard="2" points="9,0 13,1 10,4" fill="currentColor" />
          <polygon data-shard="3" points="0,6 3,8 0,10" fill="currentColor" />
        </svg>
      )}
      {tape && (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-3 left-1/2 z-10 h-6 w-24 -translate-x-1/2 -rotate-3 bg-[rgb(250_244_222/0.6)] shadow-[0_1px_2px_rgb(0_0_0/0.2)] [clip-path:polygon(3%_0,97%_0,100%_20%,97%_40%,100%_60%,97%_80%,100%_100%,3%_100%,0_80%,3%_60%,0_40%,3%_20%,0_0)]"
        />
      )}
      {page !== undefined && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 bottom-2 z-10 font-display text-[10px] tracking-widest text-muted"
        >
          {page}
        </span>
      )}
      {overlay}
    </Tag>
  );
}
