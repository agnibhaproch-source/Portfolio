"use client";

import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

let registered = false;

/** Registers plugins and the site eases exactly once, client side. */
function register() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, Flip, CustomEase, DrawSVGPlugin);

  // docs/02-MOTION.md: ink = slow start, hard settle; snap = slams; heat = slight overshoot
  CustomEase.create("ink", "M0,0 C0.2,0 0.1,1 1,1");
  CustomEase.create("snap", "M0,0 C0.7,0 0.2,1 1,1");
  CustomEase.create("heat", "M0,0 C0.3,1.4 0.5,1 1,1");

  gsap.defaults({ ease: "ink", duration: 0.6 });
  registered = true;
}

register();

export const DUR = { micro: 0.2, standard: 0.6, titleCard: 1.1 } as const;
export const STAGGER = { tight: 0.04, loose: 0.08 } as const;

export { gsap, ScrollTrigger, SplitText, Flip, CustomEase, DrawSVGPlugin, useGSAP };
