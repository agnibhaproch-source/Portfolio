import { education } from "./profile";
import type { Arc } from "./types";

// TODO(phase 6): internships, open-source programs, hackathons, clubs, freelance
const roles: Arc[] = [];

const educationArc: Arc = {
  role: education.degree,
  org: `${education.institution} with ${education.partner}`,
  start: String(education.start),
  end: String(education.end),
  outcomes: education.highlights,
  stack: [],
};

/** Newest first. */
export const arcs: Arc[] = [...roles, educationArc];
