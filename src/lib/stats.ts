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
  repos: number;
  languages: { name: string; count: number }[];
};
export type LeetcodeStats = {
  solved: number;
  easy: number;
  medium: number;
  hard: number;
  ranking: number | null;
};

export async function getGithubStats(): Promise<GithubStats | null> {
  try {
    const [calRes, reposRes] = await Promise.all([
      fetch(`https://github.com/users/${handles.github}/contributions`, {
        next: { revalidate: DAY },
      }),
      fetch(`https://api.github.com/users/${handles.github}/repos?per_page=100`, {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: DAY },
      }),
    ]);
    if (!calRes.ok || !reposRes.ok) return null;
    const html = await calRes.text();

    // Day cells carry data-date and data-level (0 to 4); tooltips carry counts.
    const days: ContributionDay[] = [];
    for (const m of html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})"[^>]*?data-level="(\d)"/g)) {
      days.push({ date: m[1]!, level: Number(m[2]) });
    }
    days.sort((a, b) => a.date.localeCompare(b.date));
    let total = 0;
    for (const m of html.matchAll(/>(\d+) contributions? on /g)) total += Number(m[1]);

    const repos = (await reposRes.json()) as { fork: boolean; language: string | null }[];
    const own = repos.filter((r) => !r.fork);
    const counts = new Map<string, number>();
    for (const r of own) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    const languages = [...counts]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      days,
      total,
      activeDays: days.filter((d) => d.level > 0).length,
      repos: own.length,
      languages,
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
    };
  } catch {
    return null;
  }
}
