"use client";

import { useSyncExternalStore } from "react";

/*
 * Original UI sounds, synthesized with Web Audio (no recordings, nothing from
 * any show). Off by default; the AudioContext is only created after the
 * visitor turns sound on, so nothing ever autoplays.
 */

export type Sfx = "slash" | "page" | "impact" | "stamp" | "chime" | "tick";

const KEY = "agni:sound";
let enabled = false;
let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
const listeners = new Set<() => void>();

function audio() {
  if (!ctx) {
    ctx = new AudioContext();
    // one second of white noise, reused by every noisy sound
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function env(c: AudioContext, peak: number, attack: number, decay: number) {
  const g = c.createGain();
  const t = c.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  g.connect(c.destination);
  return g;
}

function noiseBurst(
  c: AudioContext,
  out: AudioNode,
  filter: BiquadFilterType,
  from: number,
  to: number,
  dur: number,
) {
  const src = c.createBufferSource();
  src.buffer = noise;
  const f = c.createBiquadFilter();
  f.type = filter;
  f.Q.value = 4;
  f.frequency.setValueAtTime(from, c.currentTime);
  f.frequency.exponentialRampToValueAtTime(to, c.currentTime + dur);
  src.connect(f).connect(out);
  src.start();
  src.stop(c.currentTime + dur + 0.05);
}

function tone(
  c: AudioContext,
  out: AudioNode,
  type: OscillatorType,
  from: number,
  to: number,
  dur: number,
) {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(from, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(to, c.currentTime + dur);
  o.connect(out);
  o.start();
  o.stop(c.currentTime + dur + 0.05);
}

const recipes: Record<Sfx, (c: AudioContext) => void> = {
  // blade swish: bright noise sweeping down fast
  slash: (c) => noiseBurst(c, env(c, 0.35, 0.005, 0.22), "bandpass", 6000, 900, 0.22),
  // paper flip: soft high noise rustle
  page: (c) => noiseBurst(c, env(c, 0.18, 0.01, 0.16), "highpass", 2500, 4000, 0.16),
  // impact: low drum thump plus a crack of noise
  impact: (c) => {
    tone(c, env(c, 0.7, 0.004, 0.45), "sine", 120, 40, 0.45);
    noiseBurst(c, env(c, 0.25, 0.002, 0.08), "lowpass", 3000, 400, 0.08);
  },
  // ink stamp: short dull thud
  stamp: (c) => {
    tone(c, env(c, 0.5, 0.003, 0.18), "triangle", 180, 70, 0.18);
    noiseBurst(c, env(c, 0.15, 0.002, 0.06), "lowpass", 1200, 300, 0.06);
  },
  // rune found: two bright notes
  chime: (c) => {
    tone(c, env(c, 0.18, 0.01, 0.5), "sine", 880, 880, 0.5);
    setTimeout(() => tone(c, env(c, 0.16, 0.01, 0.6), "sine", 1318, 1318, 0.6), 110);
  },
  tick: (c) => tone(c, env(c, 0.08, 0.002, 0.05), "square", 1800, 1200, 0.05),
};

export const sound = {
  isOn: () => enabled,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  /** Called from a click, so the AudioContext is allowed to start. */
  toggle() {
    enabled = !enabled;
    try {
      window.localStorage.setItem(KEY, enabled ? "1" : "0");
    } catch {}
    if (enabled) {
      audio();
      recipes.chime(audio());
    }
    listeners.forEach((fn) => fn());
  },
  /** Remembered preference; the context still waits for a gesture. */
  restore() {
    try {
      enabled = window.localStorage.getItem(KEY) === "1";
    } catch {}
    // Browsers only start audio after a gesture: wake it on the first click.
    if (enabled) window.addEventListener("pointerdown", () => audio(), { once: true });
    listeners.forEach((fn) => fn());
  },
  play(name: Sfx) {
    if (!enabled) return;
    try {
      recipes[name](audio());
    } catch {}
  },
};

export function useSoundOn() {
  return useSyncExternalStore(sound.subscribe, sound.isOn, () => false);
}
