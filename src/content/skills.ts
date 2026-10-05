import { projects, sideQuests } from "./projects";
import type { RatedSkill, SkillGroup } from "./types";

export const skillGroups: SkillGroup[] = [
  { name: "Languages", items: ["JavaScript", "TypeScript", "Python", "Java", "C++"] },
  { name: "Frontend", items: ["React", "Next.js", "Tailwind CSS"] },
  { name: "Backend and databases", items: ["Node.js", "Express", "MongoDB", "PostgreSQL"] },
  { name: "Mobile", items: ["React Native", "Flutter"] },
  { name: "Tools and cloud", items: ["Git", "Docker", "Vercel"] },
];

/** Radar chart, clockwise from the top. Honest ratings out of 10, approved by the owner. */
export const topSkills: RatedSkill[] = [
  { name: "JavaScript", rating: 7 },
  { name: "React", rating: 7 },
  { name: "Next.js", rating: 6 },
  { name: "Node.js + Express", rating: 6 },
  { name: "MongoDB", rating: 6 },
  { name: "Git", rating: 7 },
];

export const learning: string | null = "Dart and Flutter";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+]/g, "");

/** Does a stack entry like "React 18" or "Node.js + Express" mention this skill? */
export function mentions(entry: string, skill: string) {
  const a = norm(entry);
  const b = norm(skill);
  return a === b || a.startsWith(b) || a.includes(b);
}

/** Radar skills that belong to a group (for the spell-cast highlight). */
export function radarSkillsFor(group: SkillGroup) {
  return topSkills
    .filter((t) => group.items.some((item) => mentions(t.name, item) || mentions(item, t.name)))
    .map((t) => t.name);
}

/** Projects and side quests whose stack uses any skill in the group. */
export function projectsUsing(group: SkillGroup) {
  const all = [...projects.map((p) => ({ name: p.name, stack: p.stack })), ...sideQuests];
  return all
    .filter((p) => p.stack.some((entry) => group.items.some((item) => mentions(entry, item))))
    .map((p) => p.name);
}

/** Every skill named in the groups, in order, without repeats. */
export const allSkills = [...new Set(skillGroups.flatMap((g) => g.items))];

/** Projects and side quests that use one skill. */
export function projectsUsingSkill(skill: string) {
  const all = [...projects.map((p) => ({ name: p.name, stack: p.stack })), ...sideQuests];
  return all.filter((p) => p.stack.some((entry) => mentions(entry, skill))).map((p) => p.name);
}

/** Every project and side quest with the group skills its stack uses. */
export function projectSkillLinks() {
  const all = [...projects.map((p) => ({ name: p.name, stack: p.stack })), ...sideQuests];
  return all.map((p) => ({
    name: p.name,
    skills: allSkills.filter((s) => p.stack.some((entry) => mentions(entry, s))),
  }));
}
