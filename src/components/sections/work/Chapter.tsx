import Image from "next/image";
import type { Project } from "@/content";
import { workCopy } from "@/content";
import { buttonClass } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { cn } from "@/lib/utils";

export const chapterLabel = (i: number) => `${workCopy.chapter} ${String(i + 1).padStart(2, "0")}`;

// Skewed panel cuts for the collage on the track (a, b, c grid areas).
const CUTS = [
  "polygon(0 0, 100% 0, 100% 92%, 0 100%)",
  "polygon(0 6%, 100% 0, 96% 100%, 0 100%)",
  "polygon(6% 0, 100% 4%, 100% 100%, 0 100%)",
];
const AREAS = ["[grid-area:a]", "[grid-area:b]", "[grid-area:c]"];

/** Original title art for chapters without a live build to screenshot. */
function FilmArt({ project }: { project: Project }) {
  return (
    <div className="relative grid min-h-64 place-items-center overflow-hidden border-[3px] border-washi bg-sumi [grid-area:a/a/c/c]">
      <div className="absolute inset-x-0 top-0 h-6 bg-[repeating-linear-gradient(90deg,var(--washi)_0_14px,transparent_14px_30px)] opacity-30" />
      <div className="absolute inset-x-0 bottom-0 h-6 bg-[repeating-linear-gradient(90deg,var(--washi)_0_14px,transparent_14px_30px)] opacity-30" />
      <div className="absolute inset-0 tone opacity-15 [--tone-dot:var(--washi)]" />
      <p data-parallax className="relative font-display text-56 text-washi lg:text-96">
        {project.name}
      </p>
      <p className="absolute right-6 bottom-10 rotate-[-8deg] border-[3px] border-agni px-3 py-1 font-display text-18 text-agni uppercase">
        {workCopy.status[project.status]}
      </p>
    </div>
  );
}

export function Chapter({ project, index }: { project: Project; index: number }) {
  const headingId = `chapter-${project.slug}`;
  return (
    <article
      data-chapter
      aria-labelledby={headingId}
      className="work-chapter relative [perspective:2000px]"
    >
      {/* Cover: title card. Flips open on the desktop track. */}
      <div
        data-cover
        aria-hidden
        className="chapter-cover relative grid min-h-[38svh] place-items-center overflow-hidden border-[3px] border-washi bg-sumi px-6 text-center"
      >
        <div className="absolute inset-3 border border-washi/40" />
        {["top-5 left-5", "top-5 right-5", "bottom-5 left-5", "bottom-5 right-5"].map((pos) => (
          <span key={pos} className={cn("absolute size-3 rotate-45 border-2 border-aura", pos)} />
        ))}
        <div data-cover-inner>
          <p className="font-display text-18 text-muted md:text-24">{chapterLabel(index)}</p>
          <p className="mt-2 font-display text-56 md:text-[clamp(3rem,9vw,8rem)] md:leading-none">
            {project.name}
          </p>
          <div className="mx-auto mt-5 h-[3px] w-40 bg-[linear-gradient(90deg,var(--agni),var(--kiln))]" />
        </div>
      </div>

      <Panel
        fill={false}
        className="chapter-body mt-gutter text-washi"
        innerClassName="grid gap-6 bg-[linear-gradient(160deg,var(--twilight),var(--sumi)_70%)] p-5 md:p-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10"
      >
        <div className="chapter-media min-h-0">
          {project.media.length > 0 ? (
            project.media.slice(0, 3).map((m, i) => (
              <figure
                key={m.src}
                className={cn("relative min-h-48 overflow-hidden bg-sumi", AREAS[i])}
                style={{ clipPath: CUTS[i] }}
              >
                <Image
                  data-parallax
                  src={m.src}
                  alt={m.alt}
                  width={m.width}
                  height={m.height}
                  sizes="(min-width: 1024px) 40vw, 82vw"
                  className="h-full w-full scale-110 object-cover object-top"
                />
              </figure>
            ))
          ) : (
            <FilmArt project={project} />
          )}
        </div>

        <div className="flex min-h-0 flex-col justify-center">
          <p className="font-display text-14 text-muted">
            {chapterLabel(index)} <span aria-hidden>·</span> {workCopy.status[project.status]}
          </p>
          <h3 id={headingId} className="mt-2 text-56 lg:text-96">
            {project.name}
          </h3>
          <p className="mt-3 max-w-prose text-18 lg:text-24">{project.pitch}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {project.stack.slice(0, 6).map((t) => (
              <li key={t} className="border-2 border-washi/40 px-2 py-0.5 text-14">
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <TransitionLink
              href={`/work/${project.slug}`}
              className={buttonClass("primary")}
              data-cursor="charge"
            >
              {workCopy.viewProject}
            </TransitionLink>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonClass("ghost")}
                data-cursor="charge"
              >
                {workCopy.liveSite}
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="ink-link text-18"
              >
                {workCopy.sourceCode}
              </a>
            )}
          </div>
        </div>
      </Panel>
    </article>
  );
}
