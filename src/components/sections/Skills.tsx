import { learning, sections, skillGroups, topSkills } from "@/content";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Skills() {
  return (
    <section
      id={sections.skills.id}
      data-mode="colour"
      aria-labelledby={`${sections.skills.id}-heading`}
      className="px-4 py-24 md:px-10 md:py-32"
    >
      <SectionHeading copy={sections.skills} />

      {/* TODO(phase 5): radar chart and tilting skill cards */}
      {topSkills.length > 0 && (
        <ul>
          {topSkills.map((s) => (
            <li key={s.name}>
              {s.name}: {s.rating} out of 10
            </li>
          ))}
        </ul>
      )}
      {skillGroups.map((group) => (
        <div key={group.name}>
          <h3 className="text-24">{group.name}</h3>
          <ul>
            {group.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
      {learning && <p className="mt-6 text-muted">Currently learning: {learning}</p>}
    </section>
  );
}
