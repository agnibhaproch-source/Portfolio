import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { projects, sections, workCopy } from "@/content";
import { PanelFrame } from "@/components/motion/PanelFrame";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { TitleCard } from "@/components/motion/TitleCard";
import { buttonClass } from "@/components/ui/Button";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { chapterLabel } from "@/components/sections/work/Chapter";
import { Footer } from "@/components/sections/Footer";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return { title: project.name, description: project.pitch };
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t-[3px] border-washi/20 py-10 md:grid-cols-[14rem_1fr] md:gap-10">
      <h2 className="text-24 text-muted">{title}</h2>
      <div className="max-w-prose">{children}</div>
    </section>
  );
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  if (!project) notFound();
  const next = projects[(index + 1) % projects.length];

  return (
    <>
      <main id="main" data-mode="colour" className="min-h-svh">
        <TitleCard
          trigger="mount"
          level="h1"
          label={chapterLabel(index)}
          title={project.name}
          className="min-h-[70svh] border-b-[3px] border-washi pt-16"
        />

        <div className="px-4 py-16 md:px-10 md:py-24">
          <SplitReveal as="p" className="max-w-4xl font-display text-36 md:text-56">
            {project.pitch}
          </SplitReveal>
          <p className="mt-4 text-14 text-muted">{workCopy.status[project.status]}</p>

          <div className="mt-14">
            <Block title={workCopy.problem}>
              <SplitReveal className="text-18 md:text-24">{project.problem}</SplitReveal>
            </Block>
            <Block title={workCopy.built}>
              <ul className="space-y-3 text-18">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-3">
                    <span aria-hidden className="mt-2.5 size-2 shrink-0 rotate-45 bg-kiln" />
                    {h}
                  </li>
                ))}
              </ul>
            </Block>
            <Block title={workCopy.role}>
              <p className="text-18">{project.role}</p>
            </Block>
            <Block title={workCopy.stack}>
              <ul className="flex flex-wrap gap-2">
                {project.stack.map((t) => (
                  <li key={t} className="border-2 border-washi/40 px-2 py-0.5 text-14">
                    {t}
                  </li>
                ))}
              </ul>
            </Block>
          </div>

          {project.media.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-6 text-24 text-muted">{workCopy.gallery}</h2>
              <div className="grid gap-gutter md:grid-cols-3">
                {project.media.map((m, i) => (
                  <PanelFrame
                    key={m.src}
                    shape={i === 0 ? "slant-bottom" : i === 1 ? "cut-right" : "cut-left"}
                    from={i % 2 ? "right" : "left"}
                    delay={i * 0.12}
                    className={i === 0 ? "text-washi md:col-span-2" : "text-washi"}
                    innerClassName="bg-sumi"
                  >
                    <Image
                      src={m.src}
                      alt={m.alt}
                      width={m.width}
                      height={m.height}
                      sizes="(min-width: 768px) 60vw, 100vw"
                      className="h-full max-h-[70svh] w-full object-cover object-top"
                    />
                  </PanelFrame>
                ))}
              </div>
            </section>
          )}

          <section className="mt-14 flex flex-wrap items-center gap-4">
            <h2 className="sr-only">{workCopy.links}</h2>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonClass("primary")}
              >
                {workCopy.liveSite}
              </a>
            )}
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonClass("ghost")}
              >
                {workCopy.sourceCode}
              </a>
            )}
            <TransitionLink href={`/#${sections.work.id}`} className="ink-link text-18">
              {workCopy.backToGrimoire}
            </TransitionLink>
          </section>
        </div>

        {next && next.slug !== project.slug && (
          <TransitionLink
            href={`/work/${next.slug}`}
            className="group block border-t-[3px] border-washi px-4 py-16 md:px-10 md:py-24"
          >
            <span className="block font-display text-18 text-muted">{workCopy.nextChapter}</span>
            <span className="mt-2 block font-display text-56 transition-transform duration-500 ease-heat group-hover:translate-x-4 md:text-160">
              {next.name}
            </span>
          </TransitionLink>
        )}
      </main>
      <Footer />
    </>
  );
}
