"use client";

import dynamic from "next/dynamic";

/*
 * Below-the-fold sections, each in its own client chunk. They still render on
 * the server; splitting them lets the browser download and hydrate them in
 * pieces (each is its own Suspense boundary), so the hero becomes interactive
 * sooner on slow phones.
 */

export const About = dynamic(() => import("./About").then((m) => m.About));
export const BurnTransition = dynamic(() =>
  import("./BurnTransition").then((m) => m.BurnTransition),
);
export const Skills = dynamic(() => import("./Skills").then((m) => m.Skills));
export const TrainingLog = dynamic(() => import("./TrainingLog").then((m) => m.TrainingLog));
export const Experience = dynamic(() => import("./Experience").then((m) => m.Experience));
export const Work = dynamic(() => import("./Work").then((m) => m.Work));
export const Achievements = dynamic(() => import("./Achievements").then((m) => m.Achievements));
export const Contact = dynamic(() => import("./Contact").then((m) => m.Contact));
export const Footer = dynamic(() => import("./Footer").then((m) => m.Footer));
export const SwordsmanDivider = dynamic(() =>
  import("@/components/motion/SwordsmanDivider").then((m) => m.SwordsmanDivider),
);
export const RipDivider = dynamic(() =>
  import("@/components/motion/PageTransitions").then((m) => m.RipDivider),
);
export const ShatterDivider = dynamic(() =>
  import("@/components/motion/PageTransitions").then((m) => m.ShatterDivider),
);
export const BrushDivider = dynamic(() =>
  import("@/components/motion/PageTransitions").then((m) => m.BrushDivider),
);
export const Eyecatch = dynamic(() =>
  import("@/components/motion/Eyecatch").then((m) => m.Eyecatch),
);
