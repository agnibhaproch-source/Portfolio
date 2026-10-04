import { achievements, sections } from "@/content";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Hidden entirely while there is nothing to show (03-SECTIONS, section 6). */
export function Achievements() {
  if (achievements.length === 0) return null;

  return (
    <section
      id={sections.achievements.id}
      data-mode="colour"
      aria-labelledby={`${sections.achievements.id}-heading`}
      className="px-4 py-24 md:px-10 md:py-32"
    >
      <SectionHeading copy={sections.achievements} />
      {/* TODO(phase 8): card shelf that fans out */}
      <ul>
        {achievements.map((a) => (
          <li key={a.title}>
            {a.title}, {a.issuer}, {a.year}
          </li>
        ))}
      </ul>
    </section>
  );
}
