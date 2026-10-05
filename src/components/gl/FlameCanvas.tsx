"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color, type ShaderMaterial } from "three";
import { fragment, vertex } from "./flame.glsl";

const MAX_DPR = 1.5;

/** Flame colours (deep, core, hot) for the visitor's local time of day. */
const PALETTES = {
  night: ["#b8232f", "#e2622b", "#f4c99a"],
  dawn: ["#c2451f", "#f08a3a", "#ffd9a0"],
  day: ["#a83a28", "#d9763a", "#f2d6b0"],
  dusk: ["#8f1f4a", "#d4503a", "#f2b38a"],
} as const;

function FlamePlane({ pointer }: { pointer: React.RefObject<{ x: number; y: number }> }) {
  const mat = useRef<ShaderMaterial>(null);
  const size = useThree((s) => s.size);

  const uniforms = useMemo(() => {
    const tod = (document.documentElement.dataset.tod ?? "night") as keyof typeof PALETTES;
    const p = PALETTES[tod] ?? PALETTES.night;
    return {
      uTime: { value: 17.3 },
      uRes: { value: [1, 1] },
      uPointer: { value: [0, 0] },
      uDeep: { value: new Color(p[0]) },
      uCore: { value: new Color(p[1]) },
      uHot: { value: new Color(p[2]) },
    };
  }, []);

  useFrame((_, delta) => {
    const m = mat.current;
    if (!m) return;
    const u = m.uniforms;
    u.uTime!.value += Math.min(delta, 0.05);
    u.uRes!.value = [size.width, size.height];
    const pv = u.uPointer!.value as number[];
    const target = pointer.current ?? { x: 0, y: 0 };
    pv[0] = pv[0]! + (target.x - pv[0]!) * 0.04;
    pv[1] = pv[1]! + (target.y - pv[1]!) * 0.04;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * The hero flame. Renders only while on screen and the tab is visible;
 * DPR capped at 1.5. Calls onReady after the first frame so the CSS
 * fallback underneath can fade out.
 */
export default function FlameCanvas({ onReady }: { onReady?: () => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let onScreen = true;
    const update = () => setRunning(onScreen && !document.hidden);
    const io = new IntersectionObserver(([e]) => {
      onScreen = !!e?.isIntersecting;
      update();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={wrap} data-running={running} className="absolute inset-0">
      <Canvas
        dpr={[1, MAX_DPR]}
        frameloop={running ? "always" : "never"}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        onCreated={() => requestAnimationFrame(() => onReady?.())}
        aria-hidden
      >
        <FlamePlane pointer={pointer} />
      </Canvas>
    </div>
  );
}
