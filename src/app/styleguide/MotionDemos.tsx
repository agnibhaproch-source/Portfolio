"use client";

import { useEffect, useState, type ReactNode } from "react";
import { MagicCircle } from "@/components/motion/MagicCircle";
import { Magnetic } from "@/components/motion/Magnetic";
import { PanelFrame } from "@/components/motion/PanelFrame";
import { Parallax } from "@/components/motion/Parallax";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { Screentone } from "@/components/motion/Screentone";
import { useSlash } from "@/components/motion/SlashWipe";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { TitleCard } from "@/components/motion/TitleCard";
import { Tilt } from "@/components/motion/Tilt";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { ScrollTrigger } from "@/lib/gsap";
import { MOTION_QUERIES } from "@/lib/motion";

/** Remounts its children on Replay, which also exercises cleanup. */
function Demo({
  name,
  note,
  dark = false,
  replay = true,
  children,
}: {
  name: string;
  note: string;
  dark?: boolean;
  replay?: boolean;
  children: ReactNode;
}) {
  const [run, setRun] = useState(0);
  return (
    <article
      data-mode={dark ? "colour" : "print"}
      className="flex flex-col border-[3px] border-sumi"
      aria-label={`${name} demo`}
    >
      <header className="flex items-center justify-between gap-4 border-b-[3px] border-sumi px-4 py-3">
        <div>
          <h3 className="text-18">{name}</h3>
          <p className="text-14 text-muted">{note}</p>
        </div>
        {replay && (
          <button
            type="button"
            onClick={() => setRun((n) => n + 1)}
            className="shrink-0 border-2 border-current px-3 py-1 font-display text-14"
          >
            Replay
          </button>
        )}
      </header>
      <div key={run} className="relative min-h-56 flex-1 overflow-hidden p-4">
        {children}
      </div>
    </article>
  );
}

function ContextBadge() {
  const [label, setLabel] = useState("…");
  useEffect(() => {
    const update = () => {
      const hit = (Object.keys(MOTION_QUERIES) as (keyof typeof MOTION_QUERIES)[]).find(
        (k) => window.matchMedia(MOTION_QUERIES[k]).matches,
      );
      setLabel(hit ?? "none");
    };
    update();
    const lists = Object.values(MOTION_QUERIES).map((q) => window.matchMedia(q));
    lists.forEach((l) => l.addEventListener("change", update));
    // Test hook: lets the browser check confirm triggers are cleaned up.
    (window as unknown as { __motionDebug: () => unknown }).__motionDebug = () => ({
      triggers: ScrollTrigger.getAll().length,
    });
    return () => lists.forEach((l) => l.removeEventListener("change", update));
  }, []);
  return (
    <p className="text-14">
      Active motion context: <strong data-motion-context>{label}</strong>
    </p>
  );
}

function SlashDemo() {
  const slash = useSlash();
  return (
    <div className="flex h-full flex-col items-start justify-center gap-4">
      <p className="max-w-prose text-14 text-muted">
        Full-screen route and mode transition. A blade cuts the screen, two ink halves slam shut
        along it, then slide apart.
      </p>
      <Button onClick={() => void slash.play()}>Play slash</Button>
    </div>
  );
}

function SpeedDemo() {
  const [intensity, setIntensity] = useState(0.6);
  return (
    <div className="grid h-full gap-4">
      <div className="relative h-44 text-washi">
        <SpeedLines variant="radial" intensity={intensity} />
        <p className="absolute inset-0 grid sfx place-items-center text-56 text-washi">ZAN</p>
      </div>
      <label className="flex items-center gap-3 text-14">
        Intensity
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="flex-1 accent-[var(--agni)]"
        />
      </label>
    </div>
  );
}

export function MotionDemos() {
  return (
    <>
      <ContextBadge />
      <div className="mt-8 grid gap-gutter md:grid-cols-2">
        <Demo name="SplitReveal" note="Lines rise from a mask; second line steps on twos">
          <SplitReveal as="p" className="font-display text-36">
            Every page of the grimoire starts blank.
          </SplitReveal>
          <SplitReveal as="p" by="chars" stepped delay={0.3} className="mt-4 font-display text-56">
            Agni
          </SplitReveal>
        </Demo>

        <Demo name="PanelFrame" note="Border draws, content wipes in from an edge">
          <div className="grid h-48 grid-cols-3 gap-gutter">
            <PanelFrame shape="cut-right" from="left" tone className="h-full" />
            <PanelFrame
              shape="slant-top"
              from="top"
              delay={0.15}
              className="h-full"
              innerClassName="p-3"
            >
              <p className="text-14">from top</p>
            </PanelFrame>
            <PanelFrame
              shape="cut-left"
              from="right"
              delay={0.3}
              className="h-full"
              innerClassName="hatch"
            />
          </div>
        </Demo>

        <Demo name="SlashWipe" note="Replaces the brush InkWipe (dimension slash)" replay={false}>
          <SlashDemo />
        </Demo>

        <Demo name="SpeedLines" note="Canvas, radial; drag the intensity" dark>
          <SpeedDemo />
        </Demo>

        <Demo name="SpeedLines, scroll-bound" note="Parallel streaks follow scroll speed" dark>
          <div className="relative h-48 text-washi">
            <SpeedLines variant="parallel" followScroll />
            <p className="absolute inset-0 grid place-items-center text-center text-14 text-muted">
              Scroll the page quickly
            </p>
          </div>
        </Demo>

        <Demo name="Screentone" note="Dots develop like a print">
          <div className="grid h-48 grid-cols-2 gap-gutter">
            <Panel className="h-full">
              <Screentone className="h-full" dot={1.6} cell={7} />
            </Panel>
            <Panel className="h-full">
              <Screentone className="h-full" fade dot={2.2} cell={8} />
            </Panel>
          </div>
        </Demo>

        <Demo name="Magnetic" note="Desktop only: move the cursor near the button" replay={false}>
          <div className="grid h-full place-items-center">
            <Magnetic>
              <Button>Send message</Button>
            </Magnetic>
          </div>
        </Demo>

        <Demo name="Tilt" note="Desktop only: hover the card" dark replay={false}>
          <div className="grid h-full place-items-center">
            <Tilt className="h-44 w-full max-w-xs">
              <Panel className="h-full text-washi" innerClassName="bg-twilight p-5">
                <p className="font-display text-24">Spell card</p>
                <p className="mt-2 text-14 text-muted">Gold highlight follows the pointer.</p>
              </Panel>
            </Tilt>
          </div>
        </Demo>

        <Demo name="TitleCard" note="Slam in, hold, cut out" dark>
          <TitleCard label="Chapter 01" title="Grimoire" hold={1.2} className="min-h-48" />
        </Demo>

        <Demo name="ScrambleText" note="Katakana resolves into Latin" dark>
          <div className="grid h-full place-items-center">
            <ScrambleText as="p" text="Full-stack developer" className="font-display text-36" />
          </div>
        </Demo>

        <Demo name="Parallax" note="Scroll and pointer depth layers" replay={false}>
          <div className="relative h-48">
            <Parallax speed={30} pointer={8} className="absolute inset-0">
              <div className="h-48 tone" />
            </Parallax>
            <Parallax speed={-20} pointer={24} className="absolute inset-x-8 top-6">
              <Panel className="h-32" innerClassName="p-4">
                <p className="font-display text-24">Front layer</p>
              </Panel>
            </Parallax>
          </div>
        </Demo>

        <Demo name="MagicCircle" note="Extra: original rune circle draws itself" dark>
          <div className="grid h-full place-items-center">
            <MagicCircle className="size-48" />
          </div>
        </Demo>
      </div>
    </>
  );
}
