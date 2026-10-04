import type { Education, Profile } from "./types";

export const profile: Profile = {
  name: {
    full: "Agnibha Bhattacharya",
    first: "Agnibha",
    last: "Bhattacharya",
    alias: "Agni",
    aliasJa: "アグニ",
  },
  role: "Full-stack developer",
  location: "Kolkata, India",
  tagline: null, // TODO(phase 3): one-line tagline
  bio: null, // TODO(phase 4): short bio, 2 to 3 sentences
  origin: null, // TODO(phase 4): how he got into code
  bigLine: null, // TODO(phase 4): one line set large in About
  interests: [], // TODO(phase 4): interests outside code
  availability: null, // TODO(phase 8): open to internships / freelance
  email: "agnibhapro.ch@gmail.com",
  links: {
    github: { label: "GitHub", href: "https://github.com/agnibhaproch-source" },
    linkedin: {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/agnibha-bhattacharya-50b72b382/",
    },
    others: [], // TODO(phase 8): X, Instagram, LeetCode, others
  },
  resume: null, // TODO(phase 3): "/resume.pdf" once dropped in public/
  portrait: null, // TODO(phase 3): public/me/portrait.jpg
  pose: null, // TODO(phase 4): public/me/pose.jpg (optional)
};

export const education: Education = {
  degree: "B.Tech CSE (Software Product Engineering)",
  institution: "Lovely Professional University",
  partner: "Kalvium",
  region: "Punjab",
  start: 2025,
  end: 2029,
  highlights: [], // TODO(phase 6): anything to highlight (CGPA optional)
};
