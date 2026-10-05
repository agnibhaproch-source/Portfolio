import type { Education, Profile } from "./types";

export const profile: Profile = {
  name: {
    full: "Agnibha Bhattacharya",
    first: "Agnibha",
    last: "Bhattacharya",
    alias: "Agni",
    aliasJa: "アグニ",
    ja: { first: "アグニバ", last: "バッタチャリヤ" },
  },
  role: "Full-stack developer",
  location: "Kolkata, India",
  tagline: "Born with zero talent, coding with pure grit.",
  bio: "I'm Agnibha, a full-stack developer studying Software Product Engineering at LPU through Kalvium's work-integrated program. I contribute to open source through GSSoC 2026 and like building real products end to end, not just demos.",
  origin:
    "I started out curious about how the apps and sites I used every day actually worked. I built small things, broke them, fixed them, and got hooked on the feeling of something finally running. Since then I've kept picking projects slightly bigger than what I know how to build.",
  bigLine: "Every project is a training arc.",
  interests: ["Anime", "Gaming", "Music"],
  favouriteAnime: ["Black Clover", "One Piece", "Naruto", "Attack on Titan"],
  availability: "Looking for an internship",
  email: "agnibhapro.ch@gmail.com",
  links: {
    github: { label: "GitHub", href: "https://github.com/agnibhaproch-source" },
    linkedin: {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/agnibha-bhattacharya-50b72b382/",
    },
    others: [{ label: "LeetCode", href: "https://leetcode.com/u/8MuNcqZBRp/" }],
  },
  resume: null, // Owner: keep the printable /resume page as the resume (no PDF).
  portrait: {
    src: "/me/portrait.jpg",
    alt: "Agnibha in sunglasses, a patterned sweater and a plaid scarf, on a mountain road with snow-covered peaks behind",
  },
  pose: null, // TODO(phase 4): public/me/pose.jpg (optional)
};

/** Usernames for live stats (fetched on the server, refreshed daily). */
export const handles = { github: "agnibhaproch-source", leetcode: "8MuNcqZBRp" };

export const education: Education = {
  degree: "B.Tech CSE (Software Product Engineering)",
  institution: "Lovely Professional University",
  partner: "Kalvium",
  region: "Punjab",
  start: 2025,
  end: 2029,
  highlights: ["First-year CGPA 9.09: 8.65 in semester 1, 9.65 in semester 2"],
};
