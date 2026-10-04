import type { Project, SideQuest } from "./types";

/*
 * Chapters of the grimoire, in order. Text drafted from each repo's README
 * and the live site (2026-10-04); owner to approve. Nova-Ai is left out until
 * a working link arrives.
 */
export const projects: Project[] = [
  {
    slug: "nightowl",
    name: "NightOwl",
    pitch: "Late-night snack delivery for college hostels, from 9 PM to 2 AM.",
    problem:
      "Hungry at 1 AM with everything closed. NightOwl is a Blinkit-style delivery service that runs inside a campus: packaged snacks only, delivered to a hostel block and room number between 9 PM and 2 AM.",
    role: "Built the frontend: the customer app and the store admin.",
    stack: [
      "React 18",
      "TypeScript",
      "Vite",
      "Tailwind CSS",
      "Framer Motion",
      "Lenis",
      "Zustand",
      "Recharts",
      "Firebase Auth",
    ],
    highlights: [
      "Two apps in one codebase: a customer app to browse, order, track and reorder, and a store admin for orders, stock, catalogue and reports.",
      "Admin actions reach the customer app instantly, across tabs.",
      "A Kanban order board: dragging an order updates the customer's tracking screen live.",
      "Dark and light themes, with reduced-motion support.",
    ],
    liveUrl: "https://night-owl-neon.vercel.app",
    repoUrl: "https://github.com/agnibhaproch-source/NightOwl",
    status: "live",
    flagship: true,
    media: [
      {
        src: "/projects/nightowl/welcome.webp",
        alt: "NightOwl onboarding screen asking “Hungry at 1 AM?” with a crescent moon",
        kind: "image",
        width: 1440,
        height: 900,
      },
      {
        src: "/projects/nightowl/sign-in.webp",
        alt: "NightOwl sign-in page: “Midnight delivery, reimagined” beside the login form",
        kind: "image",
        width: 1440,
        height: 900,
      },
      {
        src: "/projects/nightowl/mobile.webp",
        alt: "NightOwl onboarding on a phone",
        kind: "image",
        width: 1170,
        height: 1992,
      },
    ],
  },
  {
    slug: "reelhouse",
    name: "ReelHouse",
    pitch: "A cinematic movie-discovery site with motion on every surface.",
    problem:
      "A movie-discovery website in the class of Netflix and Hotstar, built around motion: a custom film cursor, smooth scroll, scroll-driven scenes and animated page transitions.",
    role: "Designing and building it end to end, phase by phase.",
    stack: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "GSAP",
      "Lenis",
      "three.js",
      "Supabase",
      "TanStack Query",
      "Zustand",
      "Zod",
    ],
    highlights: [
      "Movie data from the TMDB API with attribution; no scraped or rehosted images.",
      "Planned in five phases: foundation, core UI, motion, features (auth, profiles, watchlist, trailers) and polish.",
      "Motion built on GSAP, Lenis smooth scroll and three.js for WebGL scenes.",
    ],
    liveUrl: null,
    repoUrl: "https://github.com/agnibhaproch-source/ReelHouse",
    status: "in progress",
    flagship: false,
    // No live build yet, so no screenshots: the chapter shows title art instead.
    media: [],
  },
];

/*
 * Smaller builds shown after the main chapters. UBuy's live site currently
 * fails to load its products, so it links to the repo only until fixed.
 */
export const sideQuests: SideQuest[] = [
  {
    name: "nexus",
    pitch:
      "A full-stack reference app with zero runtime dependencies: JWT auth with roles, relational and document stores, RAG, a tool-using agent, WebSockets, payments and scheduled jobs, all on Node's standard library.",
    stack: ["Node.js", "JavaScript", "WebSockets", "Docker"],
    repoUrl: "https://github.com/agnibhaproch-source/nexus",
    liveUrl: null,
  },
  {
    name: "UBuy",
    pitch:
      "A storefront for curated collections, with category tabs, sorting, and price, brand, rating and colour filters.",
    stack: ["HTML", "CSS", "JavaScript"],
    repoUrl: "https://github.com/agnibhaproch-source/UBuy",
    liveUrl: null,
  },
];
