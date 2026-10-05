import type { Metadata } from "next";
import Link from "next/link";
import {
  arcs,
  education,
  learning,
  profile,
  projects,
  quickCopy,
  resumeCopy,
  sheetTally,
  sideQuests,
  statsCopy,
  topSkills,
} from "@/content";
import { buttonClass } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { Portrait } from "@/components/ui/Portrait";
import { getGithubStats, getLeetcodeStats } from "@/lib/stats";

export const metadata: Metadata = {
  title: quickCopy.title,
  description: `${profile.name.full}, ${profile.role}: skills, projects, experience and contact on one page.`,
};

function H({ children }: { children: string }) {
  return <h2 className="mb-4 text-24 md:text-36">{children}</h2>;
}

/**
 * The recruiter fast path: one calm page with the facts, live stats and
 * every link, and no scroll scenes. Same content sources as the main site.
 */
export default async function QuickPage() {
  const [github, leetcode] = await Promise.all([getGithubStats(), getLeetcodeStats()]);
  const cgpa = arcs.flatMap((a) => a.stats ?? []).find((s) => s?.label === "first-year CGPA");
  const glance = [
    cgpa && { value: cgpa.value.toFixed(cgpa.decimals), label: quickCopy.cgpa },
    sheetTally && { value: String(sheetTally.count), label: quickCopy.prs },
    github && {
      value: github.total.toLocaleString("en-US"),
      label: `GitHub ${statsCopy.contributions}`,
    },
    leetcode && { value: String(leetcode.solved), label: `LeetCode ${statsCopy.solved}` },
  ].filter((x): x is { value: string; label: string } => Boolean(x));
  const links = [profile.links.github, profile.links.linkedin, ...profile.links.others];

  return (
    <main id="main" data-mode="print" className="min-h-svh px-4 pt-28 pb-24 md:px-10">
      <div className="mx-auto grid max-w-5xl gap-gutter">
        <Panel tape className="text-fg" innerClassName="p-6 md:p-10">
          {profile.portrait && (
            <div className="absolute top-8 right-8 hidden aspect-[4/5] w-40 -rotate-2 overflow-hidden border-[3px] border-fg shadow-[4px_4px_0_var(--agni)] lg:block">
              <Portrait sizes="160px" position="55% 66%" zoom={1.6} />
            </div>
          )}
          <p className="text-14 text-muted">{quickCopy.title}</p>
          <h1 className="mt-1 text-56 md:text-96">{profile.name.full}</h1>
          <p className="mt-2 text-18 md:text-24">
            {profile.role} · {education.degree} · {profile.location}
          </p>
          {profile.availability && (
            <p className="mt-4 inline-block -rotate-2 border-[3px] border-agni px-2 py-0.5 font-display text-18 text-agni uppercase">
              {profile.availability}
            </p>
          )}
          <p className="mt-4 max-w-prose text-muted">{quickCopy.intro}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`mailto:${profile.email}`} className={buttonClass("primary")}>
              {quickCopy.email}
            </a>
            <Link href={profile.resume ?? "/resume"} className={buttonClass("ghost")}>
              {quickCopy.resume}
            </Link>
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="ink-link self-center"
              >
                {l.label}
              </a>
            ))}
          </div>
        </Panel>

        <section aria-labelledby="glance">
          <h2 id="glance" className="sr-only">
            {quickCopy.glance}
          </h2>
          <ul className="grid grid-cols-2 gap-gutter md:grid-cols-4">
            {glance.map((g) => (
              <li key={g.label}>
                <Panel className="h-full" innerClassName="p-5">
                  <p className="font-display text-36 md:text-56">{g.value}</p>
                  <p className="text-14 text-muted">{g.label}</p>
                </Panel>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-gutter lg:grid-cols-12">
          <Panel className="lg:col-span-5" innerClassName="p-6">
            <H>{quickCopy.skills}</H>
            <ul className="space-y-2">
              {topSkills.map((s) => (
                <li key={s.name} className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <span className="font-bold">{s.name}</span>
                  <span className="font-display">
                    {s.rating}
                    <span className="text-14 text-muted">{quickCopy.outOf}</span>
                  </span>
                  <span className="col-span-2 h-2 border-2 border-fg">
                    <span
                      className="block h-full bg-[linear-gradient(90deg,var(--agni),var(--kiln))]"
                      style={{ width: `${s.rating * 10}%` }}
                    />
                  </span>
                </li>
              ))}
            </ul>
            {learning && (
              <p className="mt-4 text-14">
                <span className="text-muted">{quickCopy.learning}: </span>
                {learning}
              </p>
            )}
          </Panel>

          <Panel className="lg:col-span-7" innerClassName="p-6">
            <H>{quickCopy.experience}</H>
            <ul className="space-y-4">
              {arcs.map((a) => (
                <li key={a.org}>
                  <p className="font-bold">
                    {a.role} <span className="font-normal text-muted">· {a.org}</span>
                  </p>
                  <p className="text-14 text-muted">
                    {a.start === a.end ? a.start : `${a.start} to ${a.end}`}
                  </p>
                  {a.stats && a.stats.length > 0 && (
                    <p className="text-14">
                      {a.stats.map((s) => `${s.value.toFixed(s.decimals)} ${s.label}`).join(" · ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <section aria-labelledby="quick-projects">
          <h2 id="quick-projects" className="mb-4 text-24 md:text-36">
            {quickCopy.projects}
          </h2>
          <ul className="grid gap-gutter md:grid-cols-2">
            {projects.map((p) => (
              <li key={p.slug}>
                <Panel className="h-full" innerClassName="flex h-full flex-col gap-3 p-6">
                  <p className="text-14 text-muted uppercase">{p.status}</p>
                  <h3 className="text-36">{p.name}</h3>
                  <p>{p.pitch}</p>
                  <p className="text-14 text-muted">{p.stack.join(", ")}</p>
                  <p className="mt-auto flex flex-wrap gap-4 text-14">
                    <Link href={`/work/${p.slug}`} className="ink-link">
                      {quickCopy.caseStudy}
                    </Link>
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noreferrer" className="ink-link">
                        {resumeCopy.live}
                      </a>
                    )}
                    {p.repoUrl && (
                      <a href={p.repoUrl} target="_blank" rel="noreferrer" className="ink-link">
                        {resumeCopy.code}
                      </a>
                    )}
                  </p>
                </Panel>
              </li>
            ))}
            {sideQuests.map((q) => (
              <li key={q.name}>
                <Panel className="h-full" innerClassName="flex h-full flex-col gap-2 p-6">
                  <h3 className="text-24">{q.name}</h3>
                  <p className="text-14">{q.pitch}</p>
                  <a
                    href={q.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-auto ink-link text-14"
                  >
                    {resumeCopy.code}
                  </a>
                </Panel>
              </li>
            ))}
          </ul>
        </section>

        <Panel
          className="text-fg"
          innerClassName="flex flex-wrap items-center justify-between gap-4 p-6"
        >
          <div>
            <h2 className="text-24">{quickCopy.contact}</h2>
            <a href={`mailto:${profile.email}`} className="ink-link text-18">
              {profile.email}
            </a>
          </div>
          <Link href="/" className={buttonClass("ghost")}>
            {quickCopy.full}
          </Link>
        </Panel>
      </div>
    </main>
  );
}
