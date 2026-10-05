"use client";

import dynamic from "next/dynamic";

/*
 * Global effect layers that render nothing useful on the server and are not
 * needed for first paint: loaded on the client after hydration, in their own
 * chunks.
 */
const VelocityFx = dynamic(() => import("./motion/VelocityFx").then((m) => m.VelocityFx), {
  ssr: false,
});
const LimitBreak = dynamic(() => import("./motion/LimitBreak").then((m) => m.LimitBreak), {
  ssr: false,
});
const SpellCast = dynamic(() => import("./ui/SpellCast").then((m) => m.SpellCast), { ssr: false });
const ImpactFrame = dynamic(() => import("./motion/ImpactFrame").then((m) => m.ImpactFrame), {
  ssr: false,
});

export function LazyOverlays() {
  return (
    <>
      <VelocityFx />
      <LimitBreak />
      <SpellCast />
      <ImpactFrame />
    </>
  );
}
