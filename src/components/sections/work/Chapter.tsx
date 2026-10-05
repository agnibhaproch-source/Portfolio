import Image from "next/image";
import type { Project } from "@/content";
import { workCopy } from "@/content";
import { Magnetic } from "@/components/motion/Magnetic";
import { buttonClass } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { GrimoireSummon } from "./GrimoireSummon";
import { PreviewVideo } from "./PreviewVideo";
import { cn } from "@/lib/utils";

export const chapterLabel = (i: number) => `${workCopy.chapter} ${String(i + 1).padStart(2, "0")}`;

// Skewed panel cuts for the collage on the track (a, b, c grid areas).
const CUTS = [
  "polygon(0 0, 100% 0, 100% 92%, 0 100%)",
  "polygon(0 6%, 100% 0, 96% 100%, 0 100%)",
  "polygon(6% 0, 100% 4%, 100% 100%, 0 100%)",
];
const AREAS = ["[grid-area:a]", "[grid-area:b]", "[grid-area:c]"];

/** Animated status seal: a pulsing beacon when live, a turning hourglass while in progress. */
export function StatusSeal({
  status,
  className,
}: {
  status: Project["status"];
  className?: string;
}) {
  const live = status === "live";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border-[3px] px-2 py-0.5 font-display text-14 uppercase",
        live ? "border-kiln text-kiln" : "border-aura text-aura",
        className,
      )}
    >
      {live ? (
        <span aria-hidden className="relative flex size-2.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-kiln motion-reduce:animate-none" />
          <span className="relative size-2.5 rounded-full bg-kiln" />
        </span>
      ) : (
        <svg
          aria-hidden
          viewBox="0 0 12 16"
          className="h-4 w-3 animate-[hourglass_2.4s_ease-in-out_infinite] motion-reduce:animate-none"
        >
          <path
            d="M1 1 H11 M1 15 H11 M2 1 C2 6 10 10 10 15 M10 1 C10 6 2 10 2 15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M4 4 H8 L6 7 Z M6 12 L4 14 H8 Z" fill="currentColor" />
        </svg>
      )}
      {workCopy.seal[status]}
    </span>
  );
}

/** In-progress chapter without screenshots: its title as a silhouette under a flickering projector beam. */
function ComingSoon({ project }: { project: Project }) {
  return (
    <div className="relative grid min-h-64 place-items-center overflow-hidden border-[3px] border-washi bg-[#0e0a09] [grid-area:a/a/c/c]">
      <div className="absolute inset-x-0 top-0 h-6 bg-[repeating-linear-gradient(90deg,var(--washi)_0_14px,transparent_14px_30px)] opacity-30" />
      <div className="absolute inset-x-0 bottom-0 h-6 bg-[repeating-linear-gradient(90deg,var(--washi)_0_14px,transparent_14px_30px)] opacity-30" />
      {/* projector beam from the top-left */}
      <div
        aria-hidden
        className="absolute -top-10 -left-10 h-[140%] w-[80%] origin-top-left rotate-[-8deg] animate-[projector-flicker_1.6s_steps(6)_infinite] bg-[conic-gradient(from_110deg_at_0%_0%,transparent_0deg,rgb(255_236_200/0.22)_8deg,rgb(255_236_200/0.08)_28deg,transparent_36deg)] motion-reduce:animate-none"
      />
      <div className="relative text-center">
        <p
          aria-hidden
          data-parallax
          className="font-display text-56 text-[#0e0a09] [text-shadow:0_0_1px_rgb(255_236_200/0.8),0_0_24px_rgb(255_236_200/0.45)] lg:text-96"
        >
          {project.name}
        </p>
        <p className="mt-2 font-display text-14 tracking-[0.3em] text-[#ebdcb9] uppercase">
          {workCopy.comingSoon}
        </p>
      </div>
    </div>
  );
}

/** A drawn laptop and phone holding the chapter's screenshots, at different depths. */
function Devices({ project }: { project: Project }) {
  const portrait = project.media.find((m) => m.height > m.width);
  const wide = project.media.filter((m) => m.width >= m.height);
  const [main, back] = wide;
  if (!portrait || !main) return null;
  return (
    <div className="devices relative h-full min-h-0 w-full">
      {back && (
        <figure
          data-shot
          data-depth-shot="0.4"
          className="absolute top-[2%] left-[2%] w-[46%] overflow-hidden border-2 border-washi/60 bg-sumi shadow-[0_10px_30px_rgb(0_0_0/0.5)]"
        >
          <div className="flex gap-1 bg-[#2a201d] px-2 py-1">
            {[0, 1, 2].map((k) => (
              <span key={k} className="size-1.5 rounded-full bg-washi/40" />
            ))}
          </div>
          <Image
            data-loupe
            src={back.src}
            alt={back.alt}
            width={back.width}
            height={back.height}
            sizes="25vw"
            className="w-full"
          />
          <span
            aria-hidden
            data-flash
            className="pointer-events-none absolute inset-0 bg-washi opacity-0"
          />
        </figure>
      )}
      <figure
        data-shot
        data-device="laptop"
        data-depth-shot="1"
        className="absolute right-[14%] bottom-[10%] w-[74%]"
      >
        <div className="relative rounded-t-lg border-[6px] border-b-[10px] border-[#2a201d] bg-sumi shadow-[0_20px_40px_rgb(0_0_0/0.55)]">
          <div className="laptop-screen relative aspect-[16/10] overflow-hidden">
            {/* no loupe here when the live preview plays on this screen */}
            <Image
              data-loupe={project.preview ? undefined : true}
              src={main.src}
              alt={main.alt}
              width={main.width}
              height={main.height}
              sizes="(min-width: 1024px) 40vw, 82vw"
              className="h-full w-full object-cover object-top"
            />
            <span
              aria-hidden
              data-flash
              className="pointer-events-none absolute inset-0 bg-washi opacity-0"
            />
            {project.preview && <PreviewVideo {...project.preview} />}
          </div>
        </div>
        <div
          aria-hidden
          className="mx-auto h-3 w-[112%] -translate-x-[5.4%] rounded-b-xl bg-[linear-gradient(180deg,#3a2c26,#1a1210)]"
        />
      </figure>
      <figure
        data-shot
        data-device="phone"
        data-depth-shot="1.7"
        className="absolute right-[2%] bottom-[4%] w-[22%]"
      >
        <div className="relative overflow-hidden rounded-[1.2rem] border-[5px] border-[#2a201d] bg-sumi shadow-[0_18px_36px_rgb(0_0_0/0.6)]">
          <span
            aria-hidden
            className="absolute top-1.5 left-1/2 z-10 h-1.5 w-1/3 -translate-x-1/2 rounded-full bg-[#2a201d]"
          />
          <Image
            data-loupe
            src={portrait.src}
            alt={portrait.alt}
            width={portrait.width}
            height={portrait.height}
            sizes="12vw"
            className="w-full"
          />
          <span
            aria-hidden
            data-flash
            className="pointer-events-none absolute inset-0 bg-washi opacity-0"
          />
        </div>
      </figure>
    </div>
  );
}

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
      <p className="absolute right-6 bottom-10 rotate-[-8deg] border-[3px] border-kiln px-3 py-1 font-display text-18 text-kiln uppercase">
        {workCopy.status[project.status]}
      </p>
    </div>
  );
}

export function Chapter({ project, index }: { project: Project; index: number }) {
  const headingId = `chapter-${project.slug}`;
  const devices =
    project.media.some((m) => m.height > m.width) && project.media.some((m) => m.width >= m.height);
  return (
    <article
      data-chapter
      data-jump-target
      aria-labelledby={headingId}
      className="work-chapter relative [perspective:2000px]"
    >
      <span
        aria-hidden
        data-curl-shade
        className="pointer-events-none absolute inset-0 z-[30] bg-[linear-gradient(90deg,transparent_35%,rgb(0_0_0/0.7))] opacity-0"
      />
      {/* Giant ink-outlined chapter number, drifting behind at a slower depth */}
      <span
        aria-hidden
        data-chapter-num
        className="pointer-events-none absolute -top-[14%] -left-[3%] font-display text-[clamp(9rem,30vh,22rem)] leading-none text-transparent select-none [-webkit-text-stroke:2px_color-mix(in_srgb,var(--washi)_22%,transparent)]"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

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
        <div
          aria-hidden
          data-cover-veil
          className="pointer-events-none absolute inset-0 z-10 bg-sumi opacity-0"
        />
        <div data-cover-inner>
          <p className="font-display text-18 text-washi/80 md:text-24">{chapterLabel(index)}</p>
          <p className="foil-title mt-2 font-display text-56 md:text-[clamp(3rem,9vw,8rem)] md:leading-none">
            {project.name}
          </p>
          <div className="mx-auto mt-5 h-[3px] w-40 bg-[linear-gradient(90deg,var(--agni),var(--kiln))]" />
        </div>
      </div>

      <Panel
        fill={false}
        className="chapter-body mt-gutter text-washi"
        overlay={
          <div
            aria-hidden
            data-flip-shade
            className="pointer-events-none absolute inset-0 z-[5] bg-[linear-gradient(90deg,rgb(0_0_0/0.8),transparent_65%)] opacity-0"
          />
        }
        innerClassName="grid gap-6 bg-[linear-gradient(160deg,var(--twilight),var(--sumi)_70%)] p-5 md:p-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10"
      >
        <div className="chapter-media relative min-h-0">
          {/* On the desktop track a chapter with phone and desktop shots shows them in device frames */}
          {devices && (
            <div className="device-view hidden [grid-area:a/a/c/c]">
              <Devices project={project} />
            </div>
          )}
          <div className={cn("contents", devices && "flat-view")}>
            {project.preview && !devices && <PreviewVideo {...project.preview} />}
            {project.media.length > 0 ? (
              project.media.slice(0, 3).map((m, i) => (
                <figure
                  key={m.src}
                  data-shot
                  data-depth-shot={["0.6", "1.2", "1.8"][i]}
                  className={cn("relative min-h-48 overflow-hidden bg-sumi", AREAS[i])}
                  style={{ clipPath: CUTS[i] }}
                >
                  <Image
                    data-parallax
                    data-loupe
                    src={m.src}
                    alt={m.alt}
                    width={m.width}
                    height={m.height}
                    sizes="(min-width: 1024px) 40vw, 82vw"
                    className="h-full w-full scale-110 object-cover object-top"
                  />
                  <span
                    aria-hidden
                    data-flash
                    className="pointer-events-none absolute inset-0 bg-washi opacity-0"
                  />
                </figure>
              ))
            ) : project.status === "in progress" ? (
              <ComingSoon project={project} />
            ) : (
              <FilmArt project={project} />
            )}
          </div>
          <GrimoireSummon />
        </div>

        <div className="flex min-h-0 flex-col justify-center">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-14 text-muted">{chapterLabel(index)}</p>
            <StatusSeal status={project.status} />
          </div>
          <h3
            id={headingId}
            data-title
            className="mt-2 text-[clamp(2.5rem,9vw,3.5rem)] leading-none lg:text-[clamp(3rem,5.2vw,6rem)]"
          >
            {project.name}
          </h3>
          <p data-pitch className="mt-3 max-w-prose text-18 lg:text-24">
            {project.pitch}
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {project.stack.slice(0, 6).map((t) => (
              <li
                key={t}
                data-chip
                data-skill-text={t}
                className="cursor-default border-2 border-washi/40 px-2 py-0.5 text-14 transition-colors hover:border-aura hover:text-aura"
              >
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Magnetic>
              <TransitionLink
                href={`/work/${project.slug}`}
                transition="page"
                turnLabel={project.name}
                className={buttonClass("primary")}
                data-cursor="charge"
              >
                {workCopy.viewProject}
              </TransitionLink>
            </Magnetic>
            {project.liveUrl && (
              <Magnetic>
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass("ghost")}
                  data-cursor="charge"
                >
                  {workCopy.liveSite}
                </a>
              </Magnetic>
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
