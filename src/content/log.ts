/*
 * "Training arc log": short posts in the owner's words. A post appears on the
 * site only when `published` is true. Never fill a body with invented text.
 */

export type LogBlock =
  { type: "p"; text: string } | { type: "h2"; text: string } | { type: "list"; items: string[] };

export type LogPost = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  summary: string;
  body: LogBlock[];
  published: boolean;
};

export const posts: LogPost[] = [
  {
    slug: "first-year-at-kalvium",
    title: "My first year at Kalvium",
    date: "2026-10-05",
    summary: "What a year of Software Product Engineering at LPU with Kalvium taught me.",
    // The owner's own notes, word for word.
    body: [
      {
        type: "list",
        items: [
          "Started the Software Product Engineering program at LPU through Kalvium's work-integrated track: code from week one, theory alongside.",
          'Went from "it runs on my machine" to full-stack: Next.js, TypeScript, PostgreSQL, Prisma, Firebase, Expo.',
          "Shipped TrueVoice (voice impersonation detection), DigiVault, and the first version of Ascend.",
          "Built SENTINEL-X for Smart India Hackathon 2026: a GRU world model forecasting attacks across the kill chain, with a FastAPI backend and a Next.js 16 frontend. 96.4% pre-compromise warning rate.",
          "Learned to layer properly with FinTrack: Server Components → server actions → services → Prisma, backed by 27 passing unit tests.",
          "Took U-Sewa (local service marketplace, Expo + Firebase) to a pre-launch audit.",
          "Made my first open-source contributions: GSSoC 2026, and recreating SparkFun boards for tscircuit.",
          "Moved from Windows to a MacBook Air and rebuilt my whole toolchain.",
        ],
      },
      { type: "h2", text: "Biggest lesson" },
      {
        type: "p",
        text: "Finishing beats starting. Docs, tests, and audits are part of the build.",
      },
      { type: "h2", text: "Next" },
      {
        type: "p",
        text: "Kavach (zero-knowledge document vault) and live bus tracking, both real-world scale.",
      },
    ],
    published: true,
  },
];

export const publishedPosts = posts.filter((p) => p.published && p.body.length > 0);

export const logCopy = {
  heading: "Dev log",
  subtitle: "the training arc, in notes",
  empty: "The first entry is being written.",
  readPost: "Read",
  back: "All entries",
};
