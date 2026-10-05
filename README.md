# Agni — portfolio of Agnibha Bhattacharya

A manga / shōnen-anime styled portfolio: a grimoire ceremony opening, a
fire-forged hero, and every section told as part of a training arc. Original
art only (no characters, logos or music from any show).

Built with Next.js (App Router), TypeScript, Tailwind CSS, GSAP (ScrollTrigger,
SplitText, DrawSVG, Flip...), Lenis, a small three.js flame and a raw WebGL
smoke shader. Live GitHub and LeetCode numbers are fetched on the server and
refreshed daily.

## Run it

```bash
corepack enable          # pnpm via corepack
pnpm install
cp .env.example .env.local   # add RESEND_API_KEY for the contact form
pnpm dev                 # http://localhost:3000
```

Checks: `pnpm lint`, `pnpm typecheck`, `pnpm build`.

## Change the content

All text and facts live in `src/content/*.ts` (generated from
`docs/PROFILE.md`). No personal text is hard-coded in components.

- `profile.ts`: name, role, bio, links, availability, education
- `projects.ts`: chapters (screenshots in `public/projects/<slug>/`)
- `experience.ts`, `skills.ts`, `log.ts`, `sections.ts` (all UI copy)

Still waiting on the owner (the site already works without them):

- Portrait: `public/me/portrait.jpg`, then set `profile.portrait`
- Resume: `public/resume.pdf`, then set `profile.resume`
- Dev log bullets for "My first year at Kalvium" (`src/content/log.ts`)
- ReelHouse screenshots, the Nova-Ai link, UBuy's live URL, hackathon name

## Deploy (Vercel)

1. Push this repository to GitHub.
2. Import it in Vercel (framework: Next.js; build command and output are detected).
3. Add `RESEND_API_KEY` in Project → Settings → Environment Variables.
4. When the custom domain is connected, set `NEXT_PUBLIC_SITE_URL` to it.

Vercel Web Analytics turns on automatically on Vercel deployments.

## Modes for visitors

- **Calm**: header toggle that switches off the heavy scenes. Starts on by
  itself on very low-end devices or with Data Saver, unless the visitor chose.
- **Print**: black-and-white manga print reading mode.
- **Sound**: off by default; synthesized effects only after the visitor opts in.
- **60s**: `/quick`, a one-page summary for recruiters.
- Reduced motion is respected everywhere (still frames instead of animation).

## Notes for automated checks

The opening ceremony waits for a tap. Set `sessionStorage["agni:skipintro"] = "1"`
before loading the page to skip it in tests. Design decisions and deviations
are logged in `docs/DECISIONS.md`.
