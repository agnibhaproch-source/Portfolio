# Sections

Home is one long page. Projects also get detail pages at `/work/[slug]`.

## 0. Preloader

Motion spec: moment 1. Shows only the counter, the flame mark and one line of text (the tagline from PROFILE.md once known). Must never block content longer than 2.5s even if assets are slow.

## 1. Hero

- Content: full name as the `h1`, katakana alias, role line, tagline, two actions: "View work" (scrolls) and "Download resume".
- Portrait: owner's photo as a cut-out with halftone treatment in print state and a rim light in colour state. If no photo yet, a silhouette panel holds the space.
- Motion: moments 2 and 3.
- Bottom strip: episode label and a scroll cue.

## 2. About

- Print mode, five panels (see wireframe in 01-DESIGN).
- Panel 1: second photo or cropped portrait. Panel 2: short bio. Panel 3 and 5: two facts (location, studying at LPU with Kalvium, graduating 2029). Panel 4: one line in his own words, set large.
- Motion: moment 4. Ends with moment 5 (mode switch).

## 3. Skills

- Colour mode.
- Left: radar chart of the top 6 self-rated skills. Right: skill groups (languages, frontend, backend, mobile, tools) as tilting cards with plain lists.
- "Currently learning" as a single line under the chart.
- Motion: moment 6. No percentage bars.

## 4. Experience

- Print-on-night hybrid: paper cards on the night background.
- Timeline of arcs, newest first: the owner's roles from PROFILE.md (asked in phase 6), then education (LPU with Kalvium).
- Each arc: role, organisation, dates, 2 to 3 outcome lines, stack chips.
- Motion: moment 7.

## 5. Work

- Colour mode. Order and flagship come from PROFILE.md.
- Track: intro title card, one panel per featured project, closing panel linking to all work and GitHub.
- Each project panel: episode number, name, one-line pitch, stack, screenshots, "View project", "Source code" if public.
- Motion: moment 8.

### Project detail page `/work/[slug]`

- Opens with the project's title card, then: problem, what he built, his role, stack, highlights, screenshot gallery in panel layout, links, next project link styled as "next episode".
- Statically generated from `src/content/projects.ts`.

## 6. Achievements (only if PROFILE.md has content)

- A shelf of certificate and award cards that fan out on scroll. Skip the whole section if empty.

## 7. Contact

- Heading plus availability line from PROFILE.md.
- Form: name, email, message, "Send message". Clear inline errors that say what is wrong and how to fix it. Success state says "Message sent" and what happens next.
- Direct links: email, GitHub, LinkedIn, others.
- Motion: moment 10.

## 8. Footer

- Credits roll (moment 11), copyright line with current year, back-to-top.

## Site-wide

- Nav, cursor, progress line, sound toggle, easter egg as in 02-MOTION.
- 404 page: an empty panel with a single sound-effect word and a link home.
- Metadata: title, description, Open Graph image generated with `next/og` in the site's title-card style, favicon from the flame mark, `sitemap.ts`, `robots.ts`, JSON-LD `Person`.
