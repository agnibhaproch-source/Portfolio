/**
 * Content types. All personal text on the site comes from src/content,
 * which mirrors docs/PROFILE.md. `null` or an empty list means "not known
 * yet" (marked TODO with the phase that asks for it) or SKIPPED; components
 * must render cleanly without it.
 */

export type Link = { label: string; href: string };

export type Profile = {
  name: {
    full: string;
    first: string;
    last: string;
    alias: string;
    aliasJa: string;
    /** Approved katakana rendering of the full name, by line. */
    ja: { first: string; last: string };
  };
  role: string;
  location: string;
  tagline: string | null;
  bio: string | null;
  origin: string | null;
  bigLine: string | null;
  interests: string[];
  availability: string | null;
  email: string;
  links: { github: Link; linkedin: Link; others: Link[] };
  resume: string | null;
  portrait: { src: string; alt: string } | null;
  pose: { src: string; alt: string } | null;
};

export type Education = {
  degree: string;
  institution: string;
  partner: string;
  region: string;
  start: number;
  end: number;
  highlights: string[];
};

export type Arc = {
  role: string;
  org: string;
  start: string;
  end: string;
  outcomes: string[];
  stack: string[];
};

export type SkillGroup = { name: string; items: string[] };
export type RatedSkill = { name: string; rating: number };

export type Project = {
  slug: string;
  name: string;
  pitch: string;
  problem: string;
  role: string;
  stack: string[];
  highlights: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  status: "live" | "in progress" | "archived";
  flagship: boolean;
  media: { src: string; alt: string; kind: "image" | "video" }[];
};

export type Achievement = { title: string; issuer: string; year: string; href: string | null };

export type SectionCopy = { id: string; heading: string; subtitle: string };
