"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { prefersReducedMotion } from "@/lib/motion";

export type SummonSmokeHandle = {
  /** 0 to 1: how much anti-magic smoke pours out of the void. */
  setAmount: (n: number) => void;
};

const VERT = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

// Domain-warped fbm plume rising from the void. Thin smoke is lit crimson at
// its edges, thick smoke is black, so it reads against the dark page.
const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uAmt;
uniform vec2 uOrigin;
out vec4 o;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int k = 0; k < 5; k++) { v += a * noise(p); p = p * 2.02 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}
void main() {
  vec2 p = (gl_FragCoord.xy - uOrigin * uRes) / uRes.y;
  float t = uTime;
  vec2 q = vec2(p.x * 2.2, p.y * 1.6 - t * 0.45);
  vec2 w = vec2(fbm(q + vec2(0.0, t * 0.12)), fbm(q + vec2(5.2, 1.3) - t * 0.08));
  float n = fbm(q + 1.8 * w);
  // Plume: wide at the void, rising and spreading; a low pool around the rim.
  float h = clamp(p.y, 0.0, 2.0);
  float width = 0.18 + h * 0.55;
  float plume = smoothstep(width, width * 0.25, abs(p.x + (w.x - 0.5) * 0.25 * h)) * smoothstep(1.1 * uAmt + 0.05, 0.0, h);
  float pool = smoothstep(0.75 * uAmt + 0.02, 0.0, length(p * vec2(0.9, 3.2)));
  float d = clamp((n * 1.6 - 0.45) * max(plume * step(-0.02, p.y), pool) * (0.4 + uAmt), 0.0, 1.0);
  vec3 ember = vec3(0.76, 0.12, 0.13);
  vec3 col = mix(ember * (0.6 + 0.6 * n), vec3(0.01, 0.0, 0.01), smoothstep(0.12, 0.5, d));
  float a = smoothstep(0.03, 0.35, d);
  o = vec4(col * a, a);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

/**
 * Anti-magic smoke for the summoning, drawn with a small WebGL2 shader
 * (smooth, no particles). Renders at half resolution and only while the
 * amount is above zero and the canvas is on screen. Nothing under reduced
 * motion or without WebGL2.
 */
export function SummonSmoke({
  ref,
  originX = 0.5,
  originY = 0.36,
  className,
}: {
  ref?: Ref<SummonSmokeHandle>;
  /** Plume origin, as fractions of the canvas from the left... */
  originX?: number;
  /** ...and from the bottom. */
  originY?: number;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const amount = useRef(0);
  const wake = useRef<() => void>(() => {});

  useImperativeHandle(ref, () => ({
    setAmount: (n) => {
      amount.current = n;
      wake.current();
    },
  }));

  useEffect(() => {
    const c = canvas.current;
    if (!c || prefersReducedMotion()) return;
    const gl = c.getContext("webgl2", { premultipliedAlpha: true, antialias: false });
    if (!gl) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uAmt = gl.getUniformLocation(prog, "uAmt");
    gl.uniform2f(gl.getUniformLocation(prog, "uOrigin"), originX, originY);

    const resize = () => {
      const scale = 0.5;
      c.width = Math.max(1, Math.round(c.clientWidth * scale));
      c.height = Math.max(1, Math.round(c.clientHeight * scale));
      gl.viewport(0, 0, c.width, c.height);
      gl.uniform2f(uRes, c.width, c.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);

    let visible = false;
    let raf = 0;
    const start = performance.now();
    const frame = () => {
      raf = 0;
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform1f(uAmt, amount.current);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (amount.current > 0.001) gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (visible && amount.current > 0.001) raf = requestAnimationFrame(frame);
    };
    wake.current = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      wake.current();
    });
    io.observe(c);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      wake.current = () => {};
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [originX, originY]);

  return <canvas ref={canvas} aria-hidden className={className} />;
}
