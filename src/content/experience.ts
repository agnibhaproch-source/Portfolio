import { education } from "./profile";
import type { Arc } from "./types";

// Internships: none yet (owner is looking for one). Hackathon: shown once named.
const roles: Arc[] = [
  {
    role: "Open-source contributor",
    org: "GSSoC 2026 (GirlScript Summer of Code)",
    start: "2026",
    end: "2026",
    outcomes: [],
    stack: [],
    stats: [{ value: 7, decimals: 0, label: "pull requests" }],
  },
];

const educationArc: Arc = {
  role: education.degree,
  org: `${education.institution} with ${education.partner}`,
  start: String(education.start),
  end: String(education.end),
  outcomes: ["Built 3 to 4 projects during first year, including:"],
  stack: [],
  stats: [
    { value: 9.09, decimals: 2, label: "first-year CGPA" },
    { value: 9.65, decimals: 2, label: "semester 2" },
  ],
  // TODO: add Nova-Ai once the owner sends a working link
  links: [
    { label: "ReelHouse", href: "https://github.com/agnibhaproch-source/ReelHouse" },
    { label: "NightOwl", href: "https://github.com/agnibhaproch-source/NightOwl" },
  ],
};

/** Newest first. */
export const arcs: Arc[] = [...roles, educationArc];
