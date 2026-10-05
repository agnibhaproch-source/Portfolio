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

/**
 * Set in sessionStorage to skip the opening for the rest of the session
 * (used by automated checks; visitors use the Skip button).
 */
export const SKIP_INTRO_KEY = "agni:skipintro";

/**
 * Runs in <head> before first paint: flags JS, and decides whether the
 * opening ceremony should show: every fresh load of the home page, unless
 * motion is reduced or calm mode is on.
 */
export const headScript = `(function(){try{var d=document.documentElement;d.setAttribute('data-js','');var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;var c=false;try{var sc=localStorage.getItem('agni:calm');var n=navigator,weak=(n.connection&&n.connection.saveData)||(n.deviceMemory&&n.deviceMemory<=2)||(n.hardwareConcurrency&&n.hardwareConcurrency<=2);c=sc==='1'||(sc===null&&!!weak);if(c)d.setAttribute('data-calm','');if(localStorage.getItem('agni:print')==='1')d.setAttribute('data-print','');}catch(e){}if(!r&&!c&&location.pathname==='/'&&!sessionStorage.getItem('${SKIP_INTRO_KEY}'))d.setAttribute('data-preload','');var h=new Date().getHours();d.setAttribute('data-tod',h>=5&&h<10?'dawn':h>=10&&h<16?'day':h>=16&&h<19?'dusk':'night');}catch(e){}})();`;
