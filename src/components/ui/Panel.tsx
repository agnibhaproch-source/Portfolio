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
  ...rest
}: PanelProps) {
  // All panel tags share div attributes; narrow for the JSX checker.
  const Tag = (as ?? "div") as "div";
  const points = PANEL_SHAPES[shape];
  const clip = clipPolygon(points);

  return (
    <Tag className={cn("group/panel relative isolate", className)} {...rest}>
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
      {overlay}
    </Tag>
  );
}
