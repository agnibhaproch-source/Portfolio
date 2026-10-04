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
