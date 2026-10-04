"use client";

/*
 * Coordinates the opening sequence: the preloader marks the intro done at
 * its cut, and the hero starts its reveal from that moment. When there is
 * no preloader (repeat visit, reduced motion) it is marked done on mount.
 */

let done = false;
const listeners = new Set<() => void>();

export function markIntroDone() {
  if (done) return;
  done = true;
  listeners.forEach((fn) => fn());
  listeners.clear();
}

/** Runs `fn` once the intro is done (immediately if it already is). */
export function onIntroDone(fn: () => void) {
  if (done) {
    fn();
    return () => {};
  }
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export const PRELOADED_KEY = "agni:preloaded";

/**
 * Runs in <head> before first paint: flags JS, and decides whether the
 * preloader should show (first visit in this session, motion allowed).
 */
export const headScript = `(function(){try{var d=document.documentElement;d.setAttribute('data-js','');var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(!r&&!sessionStorage.getItem('${PRELOADED_KEY}'))d.setAttribute('data-preload','');try{if(localStorage.getItem('agni:print')==='1')d.setAttribute('data-print','');}catch(e){}}catch(e){}})();`;
