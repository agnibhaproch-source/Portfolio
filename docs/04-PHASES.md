# Phases

One phase at a time. Before each: ask the listed questions (skip those already answered in PROFILE.md). After each: build, lint, report acceptance checks, commit, wait for "next".

## Phase 0: Kickoff

Ask before starting:
1. Confirm the lines marked CONFIRM in PROFILE.md.
2. Is the "ink to flame" concept in 01-DESIGN approved, or should anything change (palette, fonts, tone)?
3. Favourite anime and what you like about their look (pacing, colour, linework). Used for direction only.
4. Domain name, if already decided.
5. Sound effects on the site: yes or no. [no]

Do: nothing in code. Record answers and any design changes in PROFILE.md and DECISIONS.md.

## Phase 1: Scaffold

Ask: nothing new.

Do: create the Next.js app, Tailwind, fonts, tokens, folder shape, `lib/gsap.ts`, Lenis provider, matchMedia contexts, ESLint and Prettier, empty section components with real headings, typed content files with placeholders clearly marked `TODO`.

Accept: `pnpm build` passes; page scrolls smoothly; tokens and fonts visible on a `/styleguide` route showing palette, type scale, panel frame and buttons.

## Phase 2: Motion primitives

Ask: nothing new.

Do: build every component in the primitives table of 02-MOTION and show each on `/styleguide` with a replay button.

Accept: each primitive works in all three matchMedia contexts; no console errors; cleanup verified by navigating away and back.

## Phase 3: Preloader, nav, cursor, hero

Ask before starting:
1. Tagline, one line.
2. Role line wording. [Full-stack developer]
3. Portrait photo: please drop it at `public/me/portrait.jpg`. Plain background preferred.
4. Approve the katakana for your name, or alias only (アグニ)?
5. Resume PDF: drop at `public/resume.pdf`, or skip for now.

Do: moments 1, 2, 3; nav; cursor; progress line. Cut out the portrait and build the halftone treatment.

Accept: hero reveal runs once and cleanly; shader holds 60fps and pauses off-screen; fallback gradient shows with reduced motion; hero readable at 390px.

## Phase 4: About and mode switch

Ask before starting:
1. Short bio, 2 to 3 sentences in your own words. Rough is fine, I will tidy grammar and show you the result.
2. How you got into coding, a few lines.
3. One line you would want set large on the page.
4. Show your city: yes or no.
5. Optional second photo at `public/me/pose.jpg`.
6. Interests outside code.

Do: moments 4 and 5.

Accept: panels assemble without layout shift; burn transition scrubs both directions; text never clipped at any width.

## Phase 5: Skills

Ask before starting:
1. Skills by group: languages, frontend, backend and databases, mobile, tools and cloud.
2. Your top 6 with an honest rating out of 10.
3. What you are learning right now.

Do: moment 6.

Accept: chart is accessible (values available as text); cards usable by keyboard.

## Phase 6: Experience

Ask before starting:
1. Internships or jobs: for each, what you built, stack, 2 to 3 outcomes (numbers if you have them).
2. Open-source programs or contributions: repos, merged PRs, any rank or badge.
3. LPU and Kalvium: start year, anything to highlight (CGPA optional).
4. Any other roles, hackathons, clubs or freelance work.

Do: moment 7.

Accept: timeline reads correctly with animations off; dates consistent with PROFILE.md.

## Phase 7: Work

Ask before starting:
1. Which projects to feature, in what order, and which is the flagship.
2. For each: one-line pitch, problem, your role, stack, 2 to 4 highlights, live URL, repo URL, status.
3. Screenshots or a short screen recording per project, dropped in `public/projects/<slug>/`.

Ask these project by project if the owner prefers, starting with the flagship.

Do: moment 8, detail pages, moment 9 route transitions.

Accept: horizontal track pins and releases without jump; back button restores scroll position; mobile layout is vertical; detail pages statically generated.

## Phase 8: Achievements, contact, footer

Ask before starting:
1. Certificates and awards to show, with links or images. Or skip the section.
2. Public email, LinkedIn URL, other profiles.
3. Availability line: open to internships, freelance, or neither.
4. Contact form delivery: an email service (which one) or a plain mailto link. [mailto]

Do: section 6 if content exists, moments 10 and 11, 404 page.

Accept: form validates and reports errors in plain language; success and failure states both tested.

## Phase 9: Polish

Ask before starting:
1. Anything that feels off after using the site for a day: list it.
2. Analytics: yes or no. [no]

Do: easter egg, sound if approved, Open Graph image, metadata, sitemap, JSON-LD, accessibility pass (keyboard, focus order, contrast, alt text), performance pass against the budget in 02-MOTION, cross-browser check (Chrome, Safari, Firefox, iOS Safari, Android Chrome).

Accept: Lighthouse targets met; no `TODO` or `ASK` left in shipped content; reduced-motion walkthrough complete.

## Phase 10: Ship

Ask before starting:
1. GitHub repo name and visibility.
2. Domain to connect, or ship on the Vercel URL first.

Do: push, deploy to Vercel, connect domain if provided, write a README with screenshots and a short "how it was built".

Accept: production URL loads under 3s on a mid-range phone on 4G; all links work.
