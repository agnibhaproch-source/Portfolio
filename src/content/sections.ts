import { profile } from "./profile";
import type { SectionCopy } from "./types";

/** Plain headings for recruiters; the theme lives in the subtitle line. */
export const sections = {
  about: { id: "about", heading: "About", subtitle: "the origin", chant: "我が起源を記せ" },
  skills: { id: "skills", heading: "Skills", subtitle: "spell list", chant: "呪文よ、並べ" },
  experience: {
    id: "experience",
    heading: "Experience",
    subtitle: "missions so far",
    chant: "任務の頁を開け",
  },
  stats: {
    id: "stats",
    heading: "Stats",
    subtitle: "the training log, updated daily",
    chant: "修行の記録よ、示せ",
  },
  work: {
    id: "work",
    heading: "Work",
    subtitle: "the grimoire, chapters so far",
    chant: "魔導書よ、章を開け",
  },
  achievements: {
    id: "achievements",
    heading: "Achievements",
    subtitle: "stars earned",
    chant: "星よ、輝け",
  },
  contact: { id: "contact", heading: "Contact", subtitle: "next chapter", chant: "次の章を呼べ" },
} satisfies Record<string, SectionCopy>;

export const nav = [sections.about, sections.skills, sections.work, sections.contact];

export const heroCopy = {
  chapterLabel: "Chapter 01",
  scrollCue: "Scroll",
  viewWork: "View work",
  downloadResume: "Download resume",
  viewResume: "View resume",
  antiMagicHint: "Shows the name in Japanese and switches the page to anti-magic mode",
  /** Hero strip label for the visitor's local time of day. */
  timeOfDay: { night: "Night", dawn: "Dawn", day: "Midday", dusk: "Dusk" },
  /** Real roles the role line brush-swipes through. */
  roles: [profile.role, "Open-source contributor (GSSoC 2026)", "B.Tech CSE student", "Anime fan"],
  rolesLabel: "Roles",
  /** Brush signature under the name, with a hanko seal (火 = fire, what "Agni" means). */
  signature: profile.name.alias,
  seal: "火",
  status: profile.availability,
  clock: { city: "Kolkata", timeZone: "Asia/Kolkata", label: "Local time in Kolkata" },
  titleDrop: "DOON!",
  coverLabel: "Grimoire",
};

export const navCopy = {
  printOff: "Print",
  printLabel: "Read in black-and-white print mode",
  sound: "Sound",
  soundLabel: "Sound effects",
  calm: "Calm",
  calmLabel: "Calm mode: turn off the heavy animations",
  quick: "60s",
  quickLabel: "The 60-second version: everything on one page",
  settings: "Reading options",
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
    { label: "Type", value: "Dela Gothic One, Zen Kaku Gothic New, Rampart One, Kaushan Script" },
    { label: "Inspired by", value: "Manga ink, and the underdog energy of shōnen anime" },
    { label: "Special thanks", value: "You, for scrolling this far" },
  ],
  ending: "To be continued",
  backToTop: "Back to top",
  /** Anime "next time" card, from the real availability. */
  nextTime: "Next time",
  nextTitle: "The Internship Arc!",
  nextCta: "Recruit me",
  fin: "完",
  finLabel: "The end",
  runes: "Runes found",
  runesHint: "They are hidden around the home page.",
  updated: (date: string) => `Last updated ${date}`,
  tech: [
    "Next.js",
    "TypeScript",
    "React",
    "Tailwind CSS",
    "GSAP",
    "Lenis",
    "three.js",
    "WebGL",
    "Web Audio",
    "Vercel",
  ],
  rewind: "REWIND",
  holdHint: "Hold to charge",
};

export const aboutCopy = {
  from: "From",
  offline: "Off the clock",
  favouriteAnime: "Favourite anime",
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
  /** Stickman sparring panel: each hover or tap plays the next move. */
  fight: {
    title: "Sparring",
    hint: "Hover or tap for the next move",
    next: "Play the next sparring move",
    moves: ["Slash", "Dodge", "Counter", "Anti-magic finisher"],
    sfx: ["ZAN!", "SHU!", "GIN!", "DOON!"],
  },
  /** Scroll-driven training montage. */
  montage: {
    title: "Training arc",
    sub: "Daily swings",
    rep: "Rep",
    done: "1000!",
  },
  /** Character profile sheet. Every value comes from the owner's real details. */
  sheet: {
    title: "Character profile",
    name: "Name",
    alias: "Alias",
    attribute: "Magic attribute",
    attributeValue: "Fire",
    attributeNote: "Agni means fire",
    grimoire: "Grimoire",
    home: "Home",
    training: "Training ground",
    learning: "Learning",
    quest: "Current quest",
    gauges: "Power gauges",
    cgpa: "First-year CGPA",
    prs: "GSSoC pull requests",
    outOf: "out of 10",
  },
};

export const skillsCopy = {
  chartTitle: "Power level",
  chartCaption: "Top six skills, self-rated out of 10",
  learning: "Currently learning",
  outOf: "out of 10",
  usedIn: "Used in",
  /** Shout as the chart finishes charging. */
  powerWord: "HAAA!",
  lv: "Lv.",
  chartStyle: "Chart style",
  radar: "Radar",
  bars: "Bars",
  vs: "VS",
  vsHint: "Hover two skills to compare them",
  compare: (name: string) => `Compare ${name}`,
  notInProject: "Not in a project yet",
  chain: "CHAIN",
  comboWord: "COMBO SPELL!",
  comboHint: "Click three skills in a row to chain a combo",
  inTraining: "In training",
  tree: { title: "Skill tree", sub: "how the grimoire branches" },
  dummy: {
    title: "Training dummy",
    hint: "Pick a skill to strike. The damage is the real rating.",
    strike: (name: string, rating: number) => `Strike with ${name} (rating ${rating})`,
  },
  constellation: {
    title: "Skill constellation",
    sub: "which skills power which projects",
    tableCaption: "Skills used in each project",
  },
};

export const experienceCopy = {
  mission: "Mission",
  to: "to",
  builtLabel: "Built",
  opensInNewTab: "(opens GitHub)",
  status: { cleared: "CLEARED", "in-progress": "IN PROGRESS" },
  objectives: "Objectives",
  /** Sound words for the hover replay, by mission order. */
  words: ["MERGE!", "LEVEL UP!", "GO!"],
  slip: { title: "Result slip", cgpa: "First-year CGPA", up: (d: number) => `+${d.toFixed(2)}` },
  outOf: "/10",
  next: {
    title: "Internship",
    sub: "Your team?",
    cta: "Recruit me",
  },
};

export const transitionCopy = {
  /** Revealed on the night side of the paper burn, just before Skills. */
  burnLine: "The grimoire opens",
  summonWord: "GOGOGO",
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
  preview: "Live preview",
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
  step: "Step",
  storySub: "how this chapter went",
  stackSub: "the spells behind it",
  gallerySub: "panels from the build",
  openChapter: "Open the next chapter",
  contents: "Contents",
  contentsSub: "Jump to a chapter",
  contentsIntro: "Grimoire",
  ribbonLabel: "Chapter bookmarks",
  ribbon: (n: number, total: number) => `Chapter ${n} / ${total}`,
  jumpTo: (name: string) => `Jump to ${name}`,
  seal: { live: "LIVE", "in progress": "IN PROGRESS", archived: "ARCHIVED" },
  comingSoon: "Next chapter coming soon",
  sideQuestStamp: "SIDE QUEST",
  reward: "Reward",
  toBeContinued: "To be continued",
  complete: "COMPLETE!",
};

export const contactCopy = {
  directLabel: "Or reach me directly",
  charge: (n: number) =>
    n >= 3 ? "Fully charged. Send it." : `Summoning circle ${n} of 3 charged`,
  stamp: "SENT",
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
  copied: "COPIED!",
  copyEmail: "Copy email address",
  copiedLive: "Email address copied",
  mailApp: "Open in mail app",
  meter: (n: number) => `${Math.min(n, 10)} / 10`,
  meterDone: "Charged",
  finalChapter: "Final chapter",
  /** Speech bubble above the form. Written by Claude; the owner can change it. */
  bubble: "Got a team that needs a builder? Let's talk.",
  comic: ["Written", "Sealed", "In flight", "Delivered!"],
  seal: "火",
  findMe: "Find me on",
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
  live: "LIVE",
  updated: (hours: number) =>
    hours < 1
      ? "updated less than an hour ago"
      : `updated ${hours} hour${hours === 1 ? "" : "s"} ago`,
  status: "STATUS",
  cutIn: { leetcode: "SOLVE!", github: "GRIND!" },
  defeated: "DEFEATED",
  notFaced: "Not yet faced",
  tiers: { easy: "Easy tier", medium: "Medium tier", hard: "Hard tier" },
  levels: ["no contributions", "light day", "moderate day", "busy day", "very busy day"],
  streak: "Current streak",
  longest: "Longest streak",
  days: (n: number) => `${n} day${n === 1 ? "" : "s"}`,
  ofRepos: "of repos",
  milestones: "Milestones",
  skyline: "Skyline view of the same year",
};

/** The 60-second version: a calm one-page summary for recruiters. */
export const quickCopy = {
  title: "The 60-second version",
  intro: "Everything that matters on one page, no scroll scenes.",
  glance: "At a glance",
  cgpa: "first-year CGPA",
  prs: "GSSoC pull requests",
  skills: "Top skills",
  outOf: "/10",
  learning: "Learning",
  projects: "Projects",
  caseStudy: "Case study",
  experience: "Experience and education",
  contact: "Get in touch",
  email: "Email me",
  resume: "Resume",
  full: "See the full experience",
};

export const heroTiltCopy = { enable: "Enable tilt" };
export const comboCopy = { combo: "COMBO" };

export const runeCopy = {
  total: 5,
  label: "Hidden rune",
  found: (n: number, total: number) => `Rune ${n} of ${total} found`,
  allFound: "All five runes found. A sealed page has opened.",
  open: "Open it",
  secretPath: "/final-form",
  // secret page
  sealedTitle: "Sealed",
  sealedBody:
    "This page opens once all five hidden runes are found. They are somewhere on the home page.",
  unlockedTitle: "Final form",
  unlockedBody: "You found every rune. Thanks for exploring this far.",
  progress: (n: number, total: number) => `${n} of ${total} runes found`,
  back: "Back to the first page",
  contact: "Say hello",
  close: "Close notice",
};

export const resumeCopy = {
  title: "Resume",
  print: "Save as PDF",
  printHint: "Opens your browser's print dialog; choose “Save as PDF”.",
  education: "Education",
  experience: "Experience",
  projects: "Projects",
  sideProjects: "Other builds",
  skills: "Skills",
  cgpa: "First-year CGPA",
  live: "Live",
  code: "Code",
};

/** Sound-effect lettering for impacts (Latin romanisations of manga SFX). */
export const sfxCopy = { strike: "ZAN!", slam: "DOON!", hit: "BAM!", clash: "GIN!" };

/** Hold-to-cast spell names, by charge. Original names. */
export const spellCopy = {
  small: "Ember Spark",
  mid: "Flame Burst",
  max: "Inferno Grimoire",
  consoleHint: "Hold the mouse anywhere (or long-press on a phone) to charge a spell.",
};

export const limitBreakCopy = {
  word: "LIMIT BREAK!",
  consoleHint: "Old habits die hard. Try the oldest cheat code on this page.",
};

export const progressCopy = {
  label: "Chapters",
  opening: "Opening",
  jump: (name: string) => `Jump to ${name}`,
  page: (n: number, total: number) => `p. ${n} / ${total}`,
};
