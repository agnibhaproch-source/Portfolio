export const vertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/*
 * Rising flame from domain-warped fbm noise. Smooth, no particles.
 * Crimson body, ember core, a pale hot centre; soft alpha edges.
 */
export const fragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform vec3 uDeep;
uniform vec3 uCore;
uniform vec3 uHot;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);

  // the pointer leans the upper flame a little
  p.x -= uPointer.x * 0.18 * uv.y * uv.y;

  float t = uTime * 0.32;
  vec2 q = vec2(fbm(p * 2.0 + vec2(0.0, -t * 1.6)), fbm(p * 2.0 + vec2(5.2, -t * 1.3)));
  vec2 r = vec2(fbm(p * 1.8 + q * 1.6 + vec2(1.7, -t * 2.0)),
                fbm(p * 1.8 + q * 1.6 + vec2(8.3, -t * 1.7)));
  float n = fbm(p * 2.4 + r * 1.3 - vec2(0.0, t * 2.4));

  // tongue shape: wide base, tapering and swaying upward
  float sway = (r.x - 0.5) * 0.45 * uv.y;
  float width = mix(0.62, 0.04, pow(uv.y, 0.85));
  float shape = 1.0 - smoothstep(0.0, width, abs(p.x + sway));
  float body = shape * (1.0 - uv.y * 1.02);
  float f = smoothstep(0.12, 0.9, body * 1.5 + (n - 0.5) * 0.95);

  vec3 col = mix(uDeep, uCore, smoothstep(0.25, 0.7, f));
  col = mix(col, uHot, smoothstep(0.78, 1.0, f));
  float alpha = smoothstep(0.04, 0.45, f);
  gl_FragColor = vec4(col, alpha);
}
`;
