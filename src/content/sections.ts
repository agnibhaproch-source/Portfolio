import { profile } from "./profile";
import type { SectionCopy } from "./types";

/** Plain headings for recruiters; the theme lives in the subtitle line. */
export const sections = {
  about: { id: "about", heading: "About", subtitle: "the origin" },
  skills: { id: "skills", heading: "Skills", subtitle: "spell list" },
  experience: { id: "experience", heading: "Experience", subtitle: "missions so far" },
  stats: { id: "stats", heading: "Stats", subtitle: "the training log, updated daily" },
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
    { label: "Starring", value: profile.name.full },
    { label: "Written, designed and built by", value: profile.name.full },
    { label: "Built with", value: "Next.js, TypeScript, Tailwind CSS" },
    { label: "Motion", value: "GSAP, Lenis, three.js" },
    { label: "Type", value: "Dela Gothic One, Zen Kaku Gothic New, Rampart One" },
    { label: "Inspired by", value: "Manga ink, and the underdog energy of shōnen anime" },
    { label: "Special thanks", value: "You, for scrolling this far" },
  ],
  ending: "To be continued",
  backToTop: "Back to top",
};

export const aboutCopy = {
  from: "From",
  offline: "Off the clock",
  studying: "Studying",
  classOf: "Class of",
  sfx: "DON!",
  /** Speech bubbles on the five About panels, in panel order. Chosen by Claude at the owner's request. */
  bubbles: [
    "This is me. Probably debugging.",
    "Demos are nice. Shipping is better.",
    "Kolkata to Punjab, for a CS degree.",
    "Every bug is just the next opponent.",
    "CGPA 9.09. Not bad for zero talent.",
  ],
  tapHint: "Tap a panel",
};

export const skillsCopy = {
  chartTitle: "Power level",
  chartCaption: "Top six skills, self-rated out of 10",
  learning: "Currently learning",
  outOf: "out of 10",
  usedIn: "Used in",
};

export const experienceCopy = {
  mission: "Mission",
  to: "to",
  builtLabel: "Built",
  opensInNewTab: "(opens GitHub)",
};

export const transitionCopy = {
  /** Revealed on the night side of the paper burn, just before Skills. */
  burnLine: "The grimoire opens",
};

export const workCopy = {
  chapter: "Chapter",
  introTitle: "Grimoire",
  introLine: "Every project is a chapter. Scroll to turn the pages.",
  chaptersSoFar: "chapters so far",
  viewProject: "View project",
  liveSite: "Live site",
  sourceCode: "Source code",
  status: { live: "Live", "in progress": "In progress", archived: "Archived" },
  sideQuests: "Side quests",
  sideQuestsLine: "Smaller builds between chapters.",
  closingTitle: "More chapters",
  closingLine: "Everything else I am building lives on GitHub.",
  allWork: "All work on GitHub",
  // detail page
  problem: "The problem",
  built: "What I built",
  role: "My role",
  stack: "Stack",
  gallery: "Gallery",
  links: "Links",
  nextChapter: "Next chapter",
  backToGrimoire: "Back to the grimoire",
};

export const contactCopy = {
  directLabel: "Or reach me directly",
  formTitle: "Send a message",
  name: "Name",
  email: "Email",
  message: "Message",
  send: "Send message",
  errors: {
    name: "Enter your name.",
    email: "Enter an email address like name@example.com.",
    message: "Write a message of at least 10 characters.",
  },
  errorSummary: "Fix the highlighted fields, then send again.",
  sending: "Sending...",
  successTitle: "Message sent",
  successBody:
    "Thanks, it is in my inbox. I will reply to the address you gave. You can also email me at",
  failed: "That did not go through. Try again in a minute, or email me directly at",
  again: "Write another",
};

export const notFoundCopy = {
  title: "Page not found",
  body: "This page is missing from the grimoire.",
  sfx: "SHIIN...",
  home: "Back to the first page",
};

export const statsCopy = {
  leetcode: "LeetCode",
  solved: "problems solved",
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  ranking: "global rank",
  github: "GitHub",
  contributions: "contributions in the last year",
  activeDays: "active days",
  repos: "public repos",
  languages: "Most used languages",
  profile: "View profile",
  heatmapLabel: (n: number) => `${n} contributions in the last year, one dot per day`,
  asOf: "Live from GitHub and LeetCode, as of",
};

export const heroTiltCopy = { enable: "Enable tilt" };
export const comboCopy = { combo: "COMBO" };
