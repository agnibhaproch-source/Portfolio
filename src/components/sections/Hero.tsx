import { heroCopy, profile, sections } from "@/content";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";

export function Hero() {
  const { name, role, tagline, resume, portrait } = profile;

  return (
    <section
      id="top"
      data-mode="colour"
      aria-label="Introduction"
      className="relative flex min-h-svh flex-col overflow-hidden px-4 pt-24 pb-6 md:px-10"
    >
      <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h1 className="text-hero">
            <span className="block">{name.first}</span>
            <span className="block text-[0.62em]">{name.last}</span>
          </h1>
          <p lang="ja" aria-hidden className="mt-4 font-display text-36 text-aura md:text-56">
            {name.aliasJa}
          </p>
          <p className="mt-6 text-24">{role}</p>
          {tagline && <p className="mt-2 max-w-prose text-18 text-muted">{tagline}</p>}

          <div className="mt-10 flex flex-wrap gap-4">
            <Button href={`#${sections.work.id}`}>{heroCopy.viewWork}</Button>
            {resume && (
              <Button href={resume} variant="ghost" download>
                {heroCopy.downloadResume}
              </Button>
            )}
          </div>
        </div>

        <Panel
          shape="cut-left"
          tone={!portrait}
          className="mx-auto aspect-[4/5] w-full max-w-md text-washi"
          innerClassName="bg-twilight"
        >
          {/* TODO(phase 3): cut-out portrait with halftone; silhouette holds the space */}
          <svg
            aria-hidden
            viewBox="0 0 200 250"
            className="absolute inset-x-0 bottom-0 mx-auto h-[85%] text-sumi"
          >
            <circle cx="100" cy="80" r="42" fill="currentColor" />
            <path d="M20 250c0-60 36-100 80-100s80 40 80 100z" fill="currentColor" />
          </svg>
        </Panel>
      </div>

      <div className="mt-8 flex items-center gap-4 text-14 text-muted">
        <span>{heroCopy.chapterLabel}</span>
        <span aria-hidden className="h-px flex-1 bg-current" />
        <span>{heroCopy.scrollCue}</span>
      </div>
    </section>
  );
}
