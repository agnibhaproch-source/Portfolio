import type { ContributionDay, GithubStats, LeetcodeStats } from "./stats";

/*
 * Facts derived from the live stats, for the Stats section: streaks from the
 * contribution calendar and the milestones actually crossed. Nothing here is
 * estimated; every value is computed from the fetched numbers.
 */

/** Current streak (ending today or yesterday) and longest streak, in days. */
export function streaks(days: ContributionDay[]) {
  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.level > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const d = days[i]!;
    // Today may simply not have a contribution yet; don't break the streak on it.
    if (i === days.length - 1 && d.level === 0) continue;
    if (d.level === 0) break;
    current++;
  }
  return { current, longest };
}

const highest = (value: number, steps: number[]) => [...steps].reverse().find((s) => value >= s);

/** Only milestones that the live numbers have actually crossed. */
export function milestones(gh: GithubStats | null, lc: LeetcodeStats | null) {
  const out: string[] = [];
  if (lc) {
    const solved = highest(lc.solved, [10, 25, 50, 100, 250, 500, 1000]);
    if (solved) out.push(`${solved}+ problems solved`);
    if (lc.hard > 0) out.push("First Hard solved");
    const med = highest(lc.medium, [10, 25, 50, 100]);
    if (med) out.push(`${med}+ Mediums`);
  }
  if (gh) {
    const total = highest(gh.total, [50, 100, 250, 500, 1000]);
    if (total) out.push(`${total}+ contributions`);
    const active = highest(gh.activeDays, [30, 60, 100, 200, 300]);
    if (active) out.push(`${active}+ active days`);
    const repos = highest(gh.repos, [5, 10, 25, 50]);
    if (repos) out.push(`${repos}+ public repos`);
    const { longest } = streaks(gh.days);
    const run = highest(longest, [3, 7, 14, 30]);
    if (run) out.push(`${run}-day streak`);
  }
  return out;
}
