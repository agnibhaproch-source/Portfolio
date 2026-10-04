import type { Metadata } from "next";
import { arcs, education, profile, projects, resumeCopy, sideQuests, skillGroups } from "@/content";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = {
  title: resumeCopy.title,
  description: `${profile.name.full}, ${profile.role}. ${education.degree}, ${education.institution}.`,
};

function H({ children }: { children: string }) {
  return (
    <h2 className="mt-10 border-b-[3px] border-sumi pb-1 text-24 print:mt-6 print:text-18">
      {children}
    </h2>
  );
}

const strip = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export default function ResumePage() {
  const contacts = [
    { label: profile.email, href: `mailto:${profile.email}` },
    { label: strip(profile.links.github.href), href: profile.links.github.href },
    { label: strip(profile.links.linkedin.href), href: profile.links.linkedin.href },
    ...profile.links.others.map((l) => ({ label: strip(l.href), href: l.href })),
  ];
  const roles = arcs.filter((a) => a.org !== `${education.institution} with ${education.partner}`);

  return (
    <main id="main" data-mode="print" className="min-h-svh px-4 pt-28 pb-24 md:px-10 print:p-0">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <p className="text-14 text-muted">{resumeCopy.printHint}</p>
          <PrintButton />
        </div>

        <header>
          <h1 className="text-56 print:text-36">{profile.name.full}</h1>
          <p className="mt-1 text-24 print:text-18">
            {profile.role} · {profile.location}
          </p>
          {profile.availability && (
            <p className="mt-1 text-18 text-muted">{profile.availability}</p>
          )}
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-14">
            {contacts.map((c) => (
              <li key={c.href}>
                <a href={c.href} className="ink-link">
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </header>

        {profile.bio && <p className="mt-8 max-w-prose text-18 print:text-14">{profile.bio}</p>}

        <H>{resumeCopy.education}</H>
        <div className="mt-4">
          <p className="font-bold">{education.degree}</p>
          <p>
            {education.institution} with {education.partner}, {education.region} · {education.start}{" "}
            to {education.end}
          </p>
          {education.highlights.map((h) => (
            <p key={h} className="text-muted">
              {h}
            </p>
          ))}
        </div>

        {roles.length > 0 && (
          <>
            <H>{resumeCopy.experience}</H>
            {roles.map((r) => (
              <div key={r.org} className="mt-4">
                <p className="font-bold">
                  {r.role}, {r.org}
                </p>
                <p className="text-muted">
                  {r.start === r.end ? r.start : `${r.start} to ${r.end}`}
                </p>
                {r.stats?.map((s) => (
                  <p key={s.label}>
                    {s.value.toFixed(s.decimals)} {s.label}
                  </p>
                ))}
                {r.outcomes.length > 0 && (
                  <ul className="list-disc pl-5">
                    {r.outcomes.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}

        <H>{resumeCopy.projects}</H>
        {projects.map((p) => (
          <div key={p.slug} className="mt-4 break-inside-avoid">
            <p className="font-bold">
              {p.name} <span className="font-normal text-muted">· {p.status}</span>
            </p>
            <p>{p.pitch}</p>
            <ul className="list-disc pl-5 print:text-14">
              {p.highlights.slice(0, 3).map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <p className="text-14 text-muted">{p.stack.join(", ")}</p>
            <p className="text-14">
              {p.liveUrl && (
                <a href={p.liveUrl} className="mr-4 ink-link">
                  {resumeCopy.live}: {strip(p.liveUrl)}
                </a>
              )}
              {p.repoUrl && (
                <a href={p.repoUrl} className="ink-link">
                  {resumeCopy.code}: {strip(p.repoUrl)}
                </a>
              )}
            </p>
          </div>
        ))}

        {sideQuests.length > 0 && (
          <>
            <H>{resumeCopy.sideProjects}</H>
            {sideQuests.map((q) => (
              <div key={q.name} className="mt-3 break-inside-avoid">
                <p>
                  <span className="font-bold">{q.name}</span>: {q.pitch}
                </p>
                <p className="text-14">
                  <a href={q.repoUrl} className="ink-link">
                    {strip(q.repoUrl)}
                  </a>
                </p>
              </div>
            ))}
          </>
        )}

        <H>{resumeCopy.skills}</H>
        <dl className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-[12rem_1fr]">
          {skillGroups.map((g) => (
            <div key={g.name} className="contents">
              <dt className="font-bold">{g.name}</dt>
              <dd>{g.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
}
