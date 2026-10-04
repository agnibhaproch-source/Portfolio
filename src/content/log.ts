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
    // TODO: waiting for the owner's bullet points; stays unpublished until then.
    body: [],
    published: false,
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
