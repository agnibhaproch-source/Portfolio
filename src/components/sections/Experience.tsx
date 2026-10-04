import { arcs, sections } from "@/content";
import { Panel } from "@/components/ui/Panel";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Experience() {
  return (
    <section
      id={sections.experience.id}
      data-mode="colour"
      aria-labelledby={`${sections.experience.id}-heading`}
      className="px-4 py-24 md:px-10 md:py-32"
    >
      <SectionHeading copy={sections.experience} />

      {/* TODO(phase 6): ink timeline with arcs that slide out */}
      <ol className="space-y-gutter">
        {arcs.map((arc) => (
          <li key={`${arc.org}-${arc.start}`}>
            <Panel data-mode="print" className="max-w-3xl text-sumi" innerClassName="p-6 md:p-8">
              <h3 className="text-24 md:text-36">{arc.role}</h3>
              <p className="mt-2">{arc.org}</p>
              <p className="text-14 text-muted">
                {arc.start} to {arc.end}
              </p>
              {arc.outcomes.length > 0 && (
                <ul className="mt-4 list-disc pl-5">
                  {arc.outcomes.map((o) => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              )}
            </Panel>
          </li>
        ))}
      </ol>
    </section>
  );
}
