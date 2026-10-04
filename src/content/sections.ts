import type { SectionCopy } from "./types";

/** Plain headings for recruiters; the theme lives in the subtitle line. */
export const sections = {
  about: { id: "about", heading: "About", subtitle: "the origin" },
  skills: { id: "skills", heading: "Skills", subtitle: "spell list" },
  experience: { id: "experience", heading: "Experience", subtitle: "missions so far" },
  work: { id: "work", heading: "Work", subtitle: "the grimoire, chapters so far" },
  achievements: { id: "achievements", heading: "Achievements", subtitle: "stars earned" },
  contact: { id: "contact", heading: "Contact", subtitle: "next chapter" },
} satisfies Record<string, SectionCopy>;

export const nav = [sections.about, sections.skills, sections.work, sections.contact];

export const heroCopy = {
  chapterLabel: "Chapter 01",
  scrollCue: "Scroll",
  viewWork: "View work",
  downloadResume: "Download resume",
  antiMagicHint: "Shows the name in Japanese and switches the page to anti-magic mode",
};

export const navCopy = {
  home: "Home",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  menuLabel: "Menu",
};

export const credits = {
  heading: "Credits",
  rows: [
    { label: "Built with", value: "Next.js, TypeScript, Tailwind CSS" },
    { label: "Motion", value: "GSAP, Lenis, three.js" },
    { label: "Type", value: "Dela Gothic One, Zen Kaku Gothic New, Rampart One" },
  ],
  backToTop: "Back to top",
};

export const aboutCopy = {
  from: "From",
  offline: "Off the clock",
  studying: "Studying",
  classOf: "Class of",
  sfx: "DON!",
};
