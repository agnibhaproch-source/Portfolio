import { profile, sections } from "@/content";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Contact() {
  const links = [
    { label: profile.email, href: `mailto:${profile.email}` },
    profile.links.github,
    profile.links.linkedin,
    ...profile.links.others,
  ];

  return (
    <section
      id={sections.contact.id}
      data-mode="colour"
      aria-labelledby={`${sections.contact.id}-heading`}
      className="px-4 py-24 md:px-10 md:py-32"
    >
      <SectionHeading copy={sections.contact} />
      {profile.availability && <p className="mb-8 text-24">{profile.availability}</p>}

      {/* TODO(phase 8): form with charge-up send button */}
      <ul className="flex flex-wrap gap-x-8 gap-y-3 text-18 md:text-24">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="ink-link" rel="noreferrer">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
