import { cn } from "@/lib/utils";
import type { SectionCopy } from "@/content";

/** Plain section name, with the anime flavour in the subtitle beneath. */
export function SectionHeading({ copy, className }: { copy: SectionCopy; className?: string }) {
  return (
    <header className={cn("mb-10 md:mb-14", className)}>
      <h2 id={`${copy.id}-heading`} className="text-56 md:text-96">
        {copy.heading}
      </h2>
      <p className="mt-2 text-18 text-muted md:text-24">{copy.subtitle}</p>
    </header>
  );
}
