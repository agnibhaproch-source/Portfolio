"use client";

import { useEffect, useRef, useState } from "react";
import { aboutCopy } from "@/content";
import { SpeedLines } from "@/components/motion/SpeedLines";
import { Panel } from "@/components/ui/Panel";
import { gsap } from "@/lib/gsap";
import { haptic } from "@/lib/haptics";
import { impactFrame } from "@/lib/impact";
import { prefersReducedMotion } from "@/lib/motion";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { drawRig, makeRig, poseTo, POSES, Stickman, type PoseName } from "./stickman";

const copy = aboutCopy.fight;
const HOME = { a: 130, b: 270 };
const START = { a: makeRig("idle", HOME.a, 1), b: makeRig("idle", HOME.b, -1) };

/** Final poses per move, used as still frames under reduced motion. */
const STILLS: [PoseName, PoseName][] = [
  ["strike", "duck"],
  ["leap", "strike"],
  ["thrust", "hurt"],
  ["finish", "down"],
];

/**
 * A manga panel where two stickmen spar. Each hover (or tap / Enter) plays
 * the next move: slash, dodge, counter, anti-magic finisher, each with its
 * own sound word. Between moves they bob in their stance. Under reduced
 * motion the panel shows each move's final frame instead.
 */
export function StickFight({ className }: { className?: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const gA = useRef<SVGGElement>(null);
  const gB = useRef<SVGGElement>(null);
  const rigs = useRef({ a: makeRig("idle", HOME.a, 1), b: makeRig("idle", HOME.b, -1) });
  const play = useRef<() => void>(() => {});
  const [move, setMove] = useState(-1);

  useEffect(() => {
    const root = svg.current;
    if (!root) return;
    const { a, b } = rigs.current;
    const q = gsap.utils.selector(root);
    const reduced = prefersReducedMotion();
    const draw = () => {
      drawRig(gA.current, a);
      drawRig(gB.current, b);
      q("[data-aura]")[0]?.setAttribute("transform", `translate(${a.x} 0)`);
    };

    let busy = false;
    let next = 0;
    let idle: gsap.core.Timeline | null = null;
    const stance = () => {
      idle?.kill();
      if (reduced) return;
      idle = gsap
        .timeline({ repeat: -1, yoyo: true, onUpdate: draw })
        .to(a.pose, { ...poseTo("bob"), duration: 0.45, ease: "sine.inOut" }, 0)
        .to(b.pose, { ...poseTo("bob"), duration: 0.5, ease: "sine.inOut" }, 0.1);
    };

    const say = (i: number, x: number, y: number) => {
      const el = word.current;
      if (!el) return;
      el.textContent = copy.sfx[i] ?? "";
      sound.play(i === 3 ? "impact" : "slash");
      haptic("impact");
      gsap
        .timeline()
        .set(el, {
          left: `${(x / 400) * 100}%`,
          top: `${(y / 240) * 100}%`,
          xPercent: -50,
          yPercent: -50,
        })
        .fromTo(
          el,
          { scale: 2.4, opacity: 0, rotation: -20 },
          { scale: 1, opacity: 1, rotation: -8, duration: 0.18, ease: "steps(3)" },
        )
        .to(el, { opacity: 0, duration: 0.3 }, 0.8);
    };
    const flashAt = (sel: string, x: number, y: number) => {
      const el = q(sel)[0];
      if (!el) return;
      el.setAttribute("transform", `translate(${x} ${y})`);
      gsap.fromTo(
        el.querySelectorAll("path, polyline"),
        { drawSVG: "0% 0%", opacity: 1 },
        {
          keyframes: [
            { drawSVG: "0% 100%", duration: 0.12, ease: "power2.out" },
            { drawSVG: "100% 100%", opacity: 0, duration: 0.3 },
          ],
        },
      );
    };
    const home = (tl: gsap.core.Timeline, at = ">") =>
      tl
        .to(a, { x: HOME.a, duration: 0.4, ease: "power2.out" }, at)
        .to(b, { x: HOME.b, duration: 0.4, ease: "power2.out" }, "<")
        .to(a.pose, { ...poseTo("idle"), duration: 0.35 }, "<")
        .to(b.pose, { ...poseTo("idle"), duration: 0.35 }, "<");

    const moves: ((tl: gsap.core.Timeline) => void)[] = [
      // Slash: wind up, dash in, cut; the rival ducks under it
      (tl) => {
        tl.to(a.pose, { ...poseTo("windup"), duration: 0.22, ease: "power2.out" })
          .to(a, { x: 190, duration: 0.16, ease: "power3.in" })
          .to(a.pose, { ...poseTo("strike"), duration: 0.12, ease: "power4.in" }, "<0.04")
          .to(b.pose, { ...poseTo("duck"), duration: 0.12 }, "<")
          .call(() => {
            flashAt("[data-fx-arc]", 240, 120);
            say(0, 250, 70);
          })
          .to({}, { duration: 0.5 });
        home(tl);
      },
      // Dodge: the rival lunges, the hero leaps back out of reach
      (tl) => {
        tl.to(b.pose, { ...poseTo("windup"), duration: 0.22 })
          .to(b, { x: 205, duration: 0.16, ease: "power3.in" })
          .to(b.pose, { ...poseTo("strike"), duration: 0.12, ease: "power4.in" }, "<0.04")
          .to(a, { x: 80, duration: 0.2, ease: "power2.out" }, "<")
          .to(a.pose, { ...poseTo("leap"), duration: 0.12 }, "<")
          .call(() => say(1, 90, 50))
          .to(a.pose, { ...poseTo("duck"), duration: 0.15, ease: "power2.in" }, "+=0.1")
          .to({}, { duration: 0.35 });
        home(tl);
      },
      // Counter: a straight thrust; blades meet, the rival is knocked back
      (tl) => {
        tl.to(a.pose, { ...poseTo("duck"), duration: 0.15 })
          .to(a, { x: 175, duration: 0.14, ease: "power3.in" })
          .to(a.pose, { ...poseTo("thrust"), duration: 0.12, ease: "power4.in" }, "<")
          .call(() => {
            flashAt("[data-fx-spark]", 238, 118);
            say(2, 238, 70);
          })
          .to(b, { x: 300, duration: 0.25, ease: "power2.out" })
          .to(b.pose, { ...poseTo("hurt"), duration: 0.15 }, "<")
          .to({}, { duration: 0.45 });
        home(tl);
      },
      // Finisher: black anti-magic aura charges, one huge cut, the rival goes down
      (tl) => {
        tl.to(a.pose, { ...poseTo("charge"), duration: 0.3, ease: "power2.out" })
          .to(q("[data-aura]"), { opacity: 1, duration: 0.2 }, "<")
          .to(q("[data-lines]"), { opacity: 1, duration: 0.3 }, "<")
          .to(a, { keyframes: { x: [HOME.a + 2, HOME.a - 2, HOME.a + 2, HOME.a] }, duration: 0.5 })
          .to(a, { x: 210, duration: 0.14, ease: "power4.in" })
          .to(a.pose, { ...poseTo("finish"), duration: 0.12, ease: "power4.in" }, "<0.03")
          .call(() => {
            flashAt("[data-fx-arc]", 262, 130);
            say(3, 290, 60);
            impactFrame(1);
          })
          .to(b, { x: 320, duration: 0.3, ease: "power2.out" })
          .to(b.pose, { ...poseTo("down"), duration: 0.25 }, "<")
          .to(q("[data-aura]"), { opacity: 0, duration: 0.4 }, "+=0.3")
          .to(q("[data-lines]"), { opacity: 0, duration: 0.4 }, "<")
          .to({}, { duration: 0.4 });
        home(tl);
      },
    ];

    play.current = () => {
      if (busy) return;
      const i = next;
      next = (next + 1) % moves.length;
      setMove(i);
      if (reduced) {
        const [pa, pb] = STILLS[i]!;
        a.pose = [...POSES[pa]];
        b.pose = [...POSES[pb]];
        draw();
        return;
      }
      busy = true;
      idle?.kill();
      const tl = gsap.timeline({
        onUpdate: draw,
        onComplete: () => {
          busy = false;
          stance();
        },
      });
      moves[i]!(tl);
    };

    // Only animate while the panel is on screen.
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        if (!busy) stance();
      } else idle?.kill();
    });
    io.observe(root);
    draw();
    return () => {
      io.disconnect();
      idle?.kill();
      gsap.killTweensOf([a, b, a.pose, b.pose]);
    };
  }, []);

  const caption =
    move < 0
      ? copy.title
      : `${copy.title} · ${move + 1}/${copy.moves.length} · ${copy.moves[move]}`;

  return (
    <Panel
      shape="slant-top"
      fill={false}
      className={cn("text-sumi", className)}
      innerClassName="bg-sumi text-washi"
    >
      <button
        type="button"
        aria-label={copy.next}
        onPointerEnter={(e) => e.pointerType === "mouse" && play.current()}
        onClick={() => play.current()}
        data-no-cast
        className="relative block h-full min-h-72 w-full cursor-pointer text-left md:min-h-80"
      >
        <div
          data-lines
          aria-hidden
          className="pointer-events-none absolute inset-0 text-washi/25 opacity-0"
        >
          <SpeedLines variant="radial" intensity={0.9} />
        </div>
        <svg ref={svg} aria-hidden viewBox="0 0 400 240" className="absolute inset-0 h-full w-full">
          <line
            x1="0"
            y1="212"
            x2="400"
            y2="212"
            stroke="var(--washi)"
            strokeOpacity="0.25"
            strokeWidth="2"
          />
          <g data-aura opacity="0">
            <ellipse
              cx="0"
              cy="140"
              rx="46"
              ry="78"
              fill="#000"
              stroke="var(--agni)"
              strokeWidth="3"
              filter="url(#black-flame)"
            />
          </g>
          <Stickman ref={gB} rig={START.b} blade="katana" className="text-agni" />
          <Stickman ref={gA} rig={START.a} className="text-washi" />
          <g data-fx-arc>
            <path
              d="M-40 -70 Q 30 -60 20 60"
              fill="none"
              stroke="var(--washi)"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0"
            />
          </g>
          <g data-fx-spark>
            {Array.from({ length: 8 }, (_, i) => {
              const ang = (i / 8) * Math.PI * 2;
              return (
                <polyline
                  key={i}
                  points={`0,0 ${(Math.cos(ang) * 16).toFixed(1)},${(Math.sin(ang) * 16).toFixed(1)} ${(Math.cos(ang + 0.1) * 30).toFixed(1)},${(Math.sin(ang + 0.1) * 30).toFixed(1)}`}
                  fill="none"
                  stroke="var(--kiln)"
                  strokeWidth="3"
                  opacity="0"
                />
              );
            })}
          </g>
        </svg>
        <span
          ref={word}
          aria-hidden
          className="pointer-events-none absolute sfx text-36 text-kiln opacity-0 [text-shadow:0_0_12px_var(--agni)] md:text-56"
        />
        <span
          className="absolute top-[14%] left-4 border-2 border-washi bg-sumi px-2 py-0.5 font-display text-14"
          aria-live="polite"
        >
          {caption}
        </span>
        <span className="absolute right-4 bottom-3 text-14 text-washi/80">
          {copy.hint}
        </span>
      </button>
    </Panel>
  );
}
