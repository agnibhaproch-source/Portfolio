import Image from "next/image";
import { experienceCopy, profile, projects, sections, type Arc } from "@/content";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** Outcomes and stats as a quest checklist; the timeline draws each tick (data-tick). */
export function Objectives({ arc }: { arc: Arc }) {
  const items = [
    ...arc.outcomes,
    ...(arc.stats ?? []).map((s) => `${s.value.toFixed(s.decimals)} ${s.label}`),
  ];
  if (!items.length) return null;
  return (
    <div className="mt-6">
      <p className="text-14 text-muted">{experienceCopy.objectives}</p>
      <ul className="mt-2 space-y-2">
        {items.map((t) => (
          <li key={t} data-objective className="flex items-start gap-3 text-18">
            <svg aria-hidden viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0">
              <rect
                x="2"
                y="2"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              <path
                data-tick
                d="M6 12 L10.5 16.5 L19 6"
                fill="none"
                stroke="var(--agni)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const MERGE = "M6 7 V17 M18 11 C18 15.5 9 13 6 17";

/** Stats as gauges: pull requests as merge icons, grades as bars out of 10. */
export function XpGauges({ arc }: { arc: Arc }) {
  if (!arc.stats?.length) return null;
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {arc.stats.map((s) =>
        /pull/i.test(s.label) ? (
          <div key={s.label} className="sm:col-span-2">
            <p className="text-14 text-muted">
              <span className="font-display text-24 text-fg">{s.value}</span> {s.label}
            </p>
            <ul aria-hidden className="mt-2 flex flex-wrap gap-2">
              {Array.from({ length: s.value }, (_, k) => (
                <li
                  key={k}
                  data-merge
                  className="grid size-9 place-items-center border-2 border-fg bg-washi"
                >
                  <svg viewBox="0 0 24 24" className="size-6">
                    <path
                      d={MERGE}
                      fill="none"
                      stroke="var(--agni)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="6"
                      cy="5"
                      r="2.3"
                      fill="none"
                      stroke="var(--sumi)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="6"
                      cy="19"
                      r="2.3"
                      fill="none"
                      stroke="var(--sumi)"
                      strokeWidth="2"
                    />
                    <circle
                      cx="18"
                      cy="9"
                      r="2.3"
                      fill="none"
                      stroke="var(--sumi)"
                      strokeWidth="2"
                    />
                  </svg>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div key={s.label}>
            <p className="flex items-baseline justify-between gap-2 text-14 text-muted">
              {s.label}
              <span className="font-display text-24 text-fg">
                {s.value.toFixed(s.decimals)}
                <span className="text-14 text-muted">{experienceCopy.outOf}</span>
              </span>
            </p>
            <span aria-hidden className="mt-1 block h-3 border-2 border-fg">
              <span
                data-gauge
                className="block h-full origin-left bg-[linear-gradient(90deg,var(--agni),var(--kiln))]"
                style={{ width: `${Math.min(s.value / 10, 1) * 100}%` }}
              />
            </span>
          </div>
        ),
      )}
    </div>
  );
}

/** Term results printed like an exam slip, with the jump between terms. */
export function ResultSlip({ arc }: { arc: Arc }) {
  const grades = arc.grades ?? [];
  const cgpa = arc.stats?.find((s) => /cgpa/i.test(s.label));
  if (!grades.length) return null;
  return (
    <div className="mt-6 max-w-sm -rotate-1 border-2 border-dashed border-fg bg-[repeating-linear-gradient(0deg,transparent_0_23px,rgb(29_22_20/0.08)_23px_24px)] p-4 font-mono text-14">
      <p className="mb-2 font-display text-18">{experienceCopy.slip.title}</p>
      {grades.map((g, k) => {
        const prev = grades[k - 1];
        const diff = prev ? g.value - prev.value : 0;
        return (
          <p key={g.label} data-slip-row className="flex items-center justify-between gap-3 py-0.5">
            <span>{g.label}</span>
            <span className="flex items-center gap-2">
              {diff > 0 && (
                <span data-slip-up className="font-display text-agni">
                  ▲ {experienceCopy.slip.up(diff)}
                </span>
              )}
              <span className="font-display text-18">{g.value.toFixed(2)}</span>
            </span>
          </p>
        );
      })}
      {cgpa && (
        <p
          data-slip-row
          className="mt-2 flex items-center justify-between gap-3 border-t-2 border-fg pt-2"
        >
          <span className="font-bold">{experienceCopy.slip.cgpa}</span>
          <span
            data-slip-stamp
            className="-rotate-6 border-[3px] border-agni px-2 font-display text-24 text-agni"
          >
            {cgpa.value.toFixed(cgpa.decimals)}
          </span>
        </p>
      )}
    </div>
  );
}

/** The arc's project links as pinned polaroids that swing on hover. */
export function Polaroids({ arc }: { arc: Arc }) {
  if (!arc.links?.length) return null;
  return (
    <ul className="mt-6 flex flex-wrap gap-6">
      {arc.links.map((l, k) => {
        const shot = projects.find((p) => p.name === l.label)?.media[0];
        return (
          <li
            key={l.href}
            data-polaroid
            className={cn("origin-top", k % 2 ? "rotate-3" : "-rotate-2")}
          >
            <a
              href={l.href}
              target="_blank"
              rel="noreferrer"
              data-cursor-label="GitHub"
              className="group/pol block w-40 bg-[#f4ecd8] p-2 pb-8 shadow-[3px_4px_0_rgb(0_0_0/0.35)] transition-transform hover:animate-[polaroid-swing_0.9s_ease-in-out] focus-visible:outline-2 focus-visible:outline-agni"
            >
              <span
                aria-hidden
                className="mx-auto -mt-4 mb-1 block size-4 rounded-full bg-agni shadow-[0_2px_2px_rgb(0_0_0/0.4)]"
              />
              <span className="relative block aspect-square overflow-hidden bg-[#1d1614]">
                {shot ? (
                  <Image
                    src={shot.src}
                    alt=""
                    width={160}
                    height={160}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <span className="relative grid h-full place-items-center bg-[#1d1614] font-display text-24 text-[#ebdcb9]">
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-1 h-2 bg-[repeating-linear-gradient(90deg,#ebdcb9_0_6px,transparent_6px_14px)] opacity-60"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-1 h-2 bg-[repeating-linear-gradient(90deg,#ebdcb9_0_6px,transparent_6px_14px)] opacity-60"
                    />
                    {l.label}
                  </span>
                )}
              </span>
              <span className="mt-2 block text-center font-brush text-24 text-[#1d1614]">
                {l.label}
                <span className="sr-only"> {experienceCopy.opensInNewTab}</span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** The open mission slot: the real availability, and a way to fill it. */
export function NextMission({ n }: { n: number }) {
  if (!profile.availability) return null;
  return (
    <div
      data-next
      className="relative max-w-3xl border-[3px] border-dashed border-washi/60 p-6 md:p-8"
    >
      <p className="font-display text-14 text-muted">
        {experienceCopy.mission} {String(n).padStart(2, "0")}
      </p>
      <p className="mt-1 text-24 md:text-36">
        {experienceCopy.next.title}: {experienceCopy.next.sub}
        <span
          aria-hidden
          className="ml-1 inline-block h-[1em] w-[0.5ch] translate-y-1 animate-[cursor-blink_1s_steps(1)_infinite] bg-kiln motion-reduce:animate-none"
        />
      </p>
      <p className="mt-2 text-18 text-muted">{profile.availability}</p>
      <a
        href={`#${sections.contact.id}`}
        className={cn(buttonClass("primary"), "mt-6 inline-flex")}
      >
        {experienceCopy.next.cta}
      </a>
    </div>
  );
}
