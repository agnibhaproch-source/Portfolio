"use client";

import { useRef, type ReactNode } from "react";
import { Panel, PANEL_SHAPES, clipPolygon, type PanelShape } from "@/components/ui/Panel";
import { DUR, gsap } from "@/lib/gsap";
import { triggerFor, type Trigger } from "@/lib/motion";
import { useMotion } from "@/lib/use-motion";

type From = "left" | "right" | "top" | "bottom";

/** Collapse every point onto one edge so clip-path can grow from it. */
function collapsed(shape: PanelShape, from: From) {
  return clipPolygon(
    PANEL_SHAPES[shape].map(([x, y]) => {
      if (from === "left") return [0, y] as const;
      if (from === "right") return [100, y] as const;
      if (from === "top") return [x, 0] as const;
      return [x, 100] as const;
    }),
  );
}

type Props = {
  shape?: PanelShape;
  from?: From;
  tone?: boolean;
  trigger?: Trigger;
  delay?: number;
  className?: string;
  innerClassName?: string;
  children?: ReactNode;
};

/**
 * A Panel whose 3px ink border draws itself (DrawSVG), then the content is
 * revealed by growing its clip-path from one edge.
 */
export function PanelFrame({
  shape = "rect",
  from = "left",
  trigger = "scroll",
  delay = 0,
  ...panel
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useMotion(
    (ctx, root) => {
      const border = root.querySelector("[data-panel-border] polygon");
      const content = root.querySelector<HTMLElement>("[data-panel-content]");
      if (!border || !content) return;

      if (ctx.reduced) {
        gsap.from(root, {
          opacity: 0,
          duration: DUR.micro,
          scrollTrigger: triggerFor(root, trigger),
        });
        return;
      }

      gsap
        .timeline({ delay, scrollTrigger: triggerFor(root, trigger) })
        .from(border, { drawSVG: "0%", duration: 0.8, ease: "ink" })
        .fromTo(
          content,
          { clipPath: collapsed(shape, from) },
          { clipPath: clipPolygon(PANEL_SHAPES[shape]), duration: DUR.standard, ease: "snap" },
          "-=0.45",
        );
    },
    ref,
    [shape, from],
  );

  return (
    <div ref={ref} className={panel.className}>
      <Panel
        shape={shape}
        tone={panel.tone}
        className="h-full"
        innerClassName={panel.innerClassName}
      >
        {panel.children}
      </Panel>
    </div>
  );
}
