import { education, profile, sections } from "@/content";
import { Panel } from "@/components/ui/Panel";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function About() {
  const facts = [
    profile.location,
    `${education.degree}, ${education.institution} with ${education.partner}`,
    `Graduating ${education.end}`,
  ];

  return (
    <section
      id={sections.about.id}
      data-mode="print"
      aria-labelledby={`${sections.about.id}-heading`}
      className="px-4 py-24 md:px-10 md:py-32"
    >
      <SectionHeading copy={sections.about} />

      {/* TODO(phase 4): five-panel assembly, photo, bio, big line */}
      <div className="grid gap-gutter md:grid-cols-[1fr_2fr]">
        <Panel tone className="min-h-64" />
        <Panel shape="slant-top" innerClassName="p-6 md:p-10">
          {profile.bio && <p className="max-w-prose">{profile.bio}</p>}
          <ul className="mt-4 space-y-2">
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </Panel>
      </div>
    </section>
  );
}
