# Anime portfolio for Agnibha "Agni" Bhattacharya

You are building a personal portfolio website. Read this file fully, then read every file in `docs/` before writing code.

## Read order

1. `docs/PROFILE.md` : facts about the owner. Single source of truth for content.
2. `docs/01-DESIGN.md` : concept, palette, type, layout.
3. `docs/02-MOTION.md` : every animation, how it is built, performance rules.
4. `docs/03-SECTIONS.md` : section by section spec.
5. `docs/04-PHASES.md` : build order, what to ask at each phase, acceptance checks.

## The ask-first protocol (most important rule)

The owner will give you personal information only when you ask for it. So:

1. At the start of each phase, open `docs/04-PHASES.md` and find that phase's "Ask before starting" list.
2. Check `docs/PROFILE.md`. Skip any question already answered there.
3. Ask the remaining questions in one message, numbered, at most 6 at a time. Keep them short. Offer a default in brackets where one makes sense so the owner can reply "default".
4. Wait for the answer. Do not start the phase with open questions.
5. Write every answer into `docs/PROFILE.md` straight away, under the right heading, and replace the `ASK` marker.
6. If the owner says "skip", write `SKIPPED` and design the section so it works without that item. Never fill a gap with invented facts, numbers, testimonials, dates or links.
7. Lines marked `CONFIRM` in PROFILE.md are believed true but must be confirmed once before they are shown on the site.
8. When an asset is needed (photo, resume PDF, screenshots), say the exact folder to drop it in and the file name you expect, then wait.

## Working rules

- One phase at a time. At the end of a phase: run the build, run lint, list what was done, list the acceptance checks and whether each passed, then stop and wait for "next".
- Commit at the end of every phase with a message `phase N: <summary>`.
- Keep a short log in `docs/DECISIONS.md`: date, decision, reason. Add to it when you deviate from these specs.
- If a spec is unclear or two specs conflict, ask. Do not guess on design direction.
- Check the result in the browser before calling a phase done. Take screenshots at 1440, 1024 and 390 wide if you can.
- All site content lives in `src/content/*.ts`, typed, generated from PROFILE.md. No hard-coded personal text inside components.

## Stack

- Next.js (App Router, latest stable), TypeScript strict, pnpm (via corepack; Node is managed by fnm).
- Tailwind CSS for layout and tokens. Design tokens as CSS variables in `globals.css`.
- GSAP with ScrollTrigger, SplitText, Flip, CustomEase, DrawSVG, and `@gsap/react` (`useGSAP`). GSAP is the only animation engine for scroll and timeline work.
- Lenis for smooth scroll, driven by `gsap.ticker`.
- three + @react-three/fiber only for the hero flame shader. Load it with `next/dynamic`, `ssr: false`.
- Check current versions with `pnpm view <pkg> version` before installing. Do not pin from memory.
- Deploy target: Vercel. Custom domain is added later.

## Folder shape

```
src/
  app/            layout, page, project routes, globals.css
  components/
    sections/     one file per section
    motion/       reusable animation primitives
    ui/           buttons, cursor, nav, panel frame
    gl/           shader canvas
  content/        typed content from PROFILE.md
  lib/            gsap setup, lenis, hooks, utils
public/
  me/             owner photos
  projects/       screenshots and video loops
  sfx/            optional sounds
  resume.pdf
docs/
```

## Hard limits

- Original art only. No characters, logos, screenshots, music, fonts or frames taken from any real anime or manga. The site borrows the visual language of the medium (panels, screentone, speed lines, title cards), not anyone's property.
- Every animation has a `prefers-reduced-motion` fallback.
- No particle dot fields in the hero. The owner asked for smooth.
- No autoplaying sound. Sound is off until the visitor turns it on.
