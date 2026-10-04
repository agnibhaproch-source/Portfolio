import { profile, projects, sections } from "@/content";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Work() {
  return (
    <section
      id={sections.work.id}
      data-mode="colour"
      aria-labelledby={`${sections.work.id}-heading`}
      className="px-4 py-24 md:px-10 md:py-32"
    >
      <SectionHeading copy={sections.work} />

      {/* TODO(phase 7): grimoire track, chapter title cards, detail pages */}
      {projects.length > 0 && (
        <ol>
          {projects.map((p, i) => (
            <li key={p.slug}>
              <p className="text-14 text-muted">Chapter {String(i + 1).padStart(2, "0")}</p>
              <h3 className="text-36">{p.name}</h3>
              <p>{p.pitch}</p>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-10">
        <Button href={profile.links.github.href} variant="ghost">
          All work on GitHub
        </Button>
      </div>
    </section>
  );
}
