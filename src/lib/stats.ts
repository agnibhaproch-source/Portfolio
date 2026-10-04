import "server-only";
import { handles } from "@/content/profile";

/*
 * Live stats, fetched on the server and cached for a day. Every fetcher
 * returns null on failure so the page still renders without that block.
 */

const DAY = 86400;

export type ContributionDay = { date: string; level: number };
export type GithubStats = {
  days: ContributionDay[];
  total: number;
  activeDays: number;
  /** Same number as the profile's "Repositories" tab. */
  repos: number;
  languages: { name: string; count: number }[];
  fetchedAt: string;
};
export type LeetcodeStats = {
  solved: number;
  easy: number;
  medium: number;
  hard: number;
  /** LeetCode profile "Rank". */
  ranking: number | null;
  fetchedAt: string;
};

export async function getGithubStats(): Promise<GithubStats | null> {
  try {
    const api = { headers: { Accept: "application/vnd.github+json" }, next: { revalidate: DAY } };
    const [calRes, userRes, reposRes] = await Promise.all([
      fetch(`https://github.com/users/${handles.github}/contributions`, {
        next: { revalidate: DAY },
      }),
      fetch(`https://api.github.com/users/${handles.github}`, api),
      fetch(`https://api.github.com/users/${handles.github}/repos?per_page=100`, api),
    ]);
    if (!calRes.ok || !userRes.ok || !reposRes.ok) return null;
    const html = await calRes.text();

    // One cell per day: data-date and data-level (0 to 4), as on the profile graph.
    const days: ContributionDay[] = [];
    for (const m of html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"[^>]*?data-level="(\d)"/g)) {
      days.push({ date: m[1]!, level: Number(m[2]) });
    }
    days.sort((a, b) => a.date.localeCompare(b.date));

    // GitHub's own headline, e.g. "235 contributions in the last year", exactly as the profile shows it.
    const headline = html.replace(/\s+/g, " ").match(/([\d,]+) contributions? in the last year/);
    if (!headline) return null;
    const total = Number(headline[1]!.replace(/,/g, ""));

    const user = (await userRes.json()) as { public_repos: number };
    const repos = (await reposRes.json()) as { fork: boolean; language: string | null }[];
    const counts = new Map<string, number>();
    for (const r of repos) {
      if (!r.fork && r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    }
    const languages = [...counts]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      days,
      total,
      activeDays: days.filter((d) => d.level > 0).length,
      repos: user.public_repos,
      languages,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function getLeetcodeStats(): Promise<LeetcodeStats | null> {
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
      body: JSON.stringify({
        query:
          "query($u:String!){matchedUser(username:$u){profile{ranking} submitStatsGlobal{acSubmissionNum{difficulty count}}}}",
        variables: { u: handles.leetcode },
      }),
      next: { revalidate: DAY },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: {
        matchedUser?: {
          profile?: { ranking?: number };
          submitStatsGlobal?: { acSubmissionNum?: { difficulty: string; count: number }[] };
        };
      };
    };
    const user = json.data?.matchedUser;
    const nums = user?.submitStatsGlobal?.acSubmissionNum;
    if (!nums) return null;
    const by = (d: string) => nums.find((n) => n.difficulty === d)?.count ?? 0;
    return {
      solved: by("All"),
      easy: by("Easy"),
      medium: by("Medium"),
      hard: by("Hard"),
      ranking: user?.profile?.ranking ?? null,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
