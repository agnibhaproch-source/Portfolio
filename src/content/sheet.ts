import { arcs } from "./experience";
import { aboutCopy } from "./sections";
import { education, profile } from "./profile";
import { learning, topSkills } from "./skills";

/*
 * The About character sheet, assembled from the owner's real details only.
 * Nothing here is invented: each row points at a fact elsewhere in content/.
 */

const c = aboutCopy.sheet;
const stat = (label: string) => arcs.flatMap((a) => a.stats ?? []).find((s) => s?.label === label);
const cgpa = stat("first-year CGPA");
const prs = stat("pull requests");

export const sheetRows: { label: string; value: string; note?: string }[] = [
  { label: c.name, value: profile.name.full },
  { label: c.alias, value: `${profile.name.alias} (${profile.name.aliasJa})` },
  { label: c.attribute, value: c.attributeValue, note: c.attributeNote },
  { label: c.grimoire, value: profile.role },
  { label: c.home, value: profile.location },
  {
    label: c.training,
    value: `${education.institution}, ${education.region} × ${education.partner}`,
  },
  ...(learning ? [{ label: c.learning, value: learning }] : []),
];

/** Gauges fill to value / max. */
export const sheetGauges: { label: string; value: number; max: number; decimals: number }[] = [
  ...(cgpa ? [{ label: c.cgpa, value: cgpa.value, max: 10, decimals: cgpa.decimals }] : []),
  ...topSkills.slice(0, 2).map((s) => ({ label: s.name, value: s.rating, max: 10, decimals: 0 })),
];

/** Tally marks, one per merged contribution. */
export const sheetTally = prs ? { label: c.prs, count: prs.value } : null;

export const sheetQuest = profile.availability;
