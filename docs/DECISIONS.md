# Decisions

| Date | Decision | Reason |
|---|---|---|
| 2026-10-04 | Owner is Agnibha Bhattacharya. Placeholder data that came with the spec template removed from PROFILE.md and reset to ASK. | Never ship facts that are not the owner's. |
| 2026-10-04 | "Ink to flame" concept approved. | Owner approval, Phase 0. |
| 2026-10-04 | Black Clover is the visual reference (owner favourites: Asta, Yami, Nacht). Borrow only generic visual language: heavy black ink, spellbook/grimoire pages, jagged slash cuts, creeping shadow. No characters, names, clover symbol, logos, spells or frames from the show. | Owner preference + CLAUDE.md hard limit on original art. |
| 2026-10-04 | Phone number kept out of the repo and the site by default. | Privacy; PROFILE.md will be committed and may be public. |
| 2026-10-04 | Spec files sit at project root, not `docs/`. Move them into `docs/` in Phase 1. | Match the folder shape in CLAUDE.md. |
| 2026-10-04 | Work section is a grimoire: projects are chapters/pages that flip open. "Episode" wording replaced by "Chapter" site-wide (title cards, numbering). | Owner chose all four Black Clover motifs. |
| 2026-10-04 | Route/mode transitions use a diagonal "dimension slash" instead of the brush InkWipe. Mode switch adds creeping shadow tendrils to the burn. Skills chart gets a jagged black-red aura on fill. | Same. |
| 2026-10-04 | Sound effects on (still off by default, toggle in nav). All sounds original, synthesised or self-made; nothing ripped from the show. | Owner wants a Black Clover feel; CLAUDE.md forbids using the show's audio. |
| 2026-10-04 | No domain yet; ship on Vercel URL. | Owner. |
| 2026-10-04 | Palette replaced with retro "aged grimoire": crimson `--agni`, ember `--kiln`, tarnished gold `--aura` (was cyan), yellowed paper, brown-black ink, film grain. Token names kept. | Owner: Black Clover colours, retro look. |
| 2026-10-04 | Extras added: grimoire preloader (original emblem, no clover), self-drawing magic circles, blade cursor with click slash, limit-break Konami egg (black flood + crimson cracks). | Owner picked all four. |
| 2026-10-04 | Headings stay plain; theme wording only in subtitles. | Recruiter clarity; matches 01-DESIGN voice rule. |
| 2026-10-04 | Phone not shown. | Owner. |
| 2026-10-04 | Spec docs moved into `docs/`. Next 16 scaffold adds `AGENTS.md`; CLAUDE.md imports it. | Folder shape in CLAUDE.md; Next 16 agent rules. |
| 2026-10-04 | Stack pinned from `pnpm view`: Next 16.3.8, React 19.2, Tailwind 4.3, GSAP 3.15 (all plugins free), Lenis 1.3.26, three 0.186, R3F 9.8, pnpm 12.9 via corepack. pnpm 12 needs build approval: `allowBuilds` for sharp and unrs-resolver in pnpm-workspace.yaml. | CLAUDE.md: check versions, don't pin from memory. |
| 2026-10-04 | Added `--tone-ink` #5e5548 for muted text on paper. | `--tone` on `--washi` is about 2.8:1, fails AA; tone-ink is about 5.2:1. |
| 2026-10-04 | Focus ring is crimson in print mode, ember (`--kiln`) in colour mode, via a per-mode `--ring`. | Crimson on sumi is about 2.8:1, under the 3:1 non-text minimum. |
| 2026-10-04 | Colour roles (`--bg`, `--fg`, `--muted`, `--ring`) switch per section with `data-mode="print|colour"`; Tailwind tokens use `@theme inline` so the switch applies. | Two-mode design in 01-DESIGN. |
| 2026-10-04 | Unknown content is `null` / empty in `src/content` with `TODO(phase N)` comments; components render nothing for missing items. | Ask-first protocol: never invent facts. |
| 2026-10-04 | Temporary flame-mark `icon.svg` added so there is no favicon 404; final favicon in phase 9. | Clean console in phase 1. |
| 2026-10-04 | `InkWipe` primitive built as `SlashWipe` (provider with `cover` / `uncover` / `play`), mounted once in the root layout for route and mode transitions. | Owner chose the dimension-slash transition. |
| 2026-10-04 | `MagicCircle` added as an 11th primitive (original rune ring + {7/3} star, DrawSVG, spins only while on screen). | Owner-approved extra; reused by headings and contact send. |
| 2026-10-04 | `ScrambleText` uses GSAP's ScrambleTextPlugin (free since 3.13) with a katakana set; final text reserves the box so wider katakana never reflow. | GSAP stays the only engine; no layout shift. |
| 2026-10-04 | All primitives go through `useMotion` (useGSAP + scoped gsap.matchMedia: desktop / touch / reduced). Magnetic and Tilt are desktop-only; Parallax and SplitReveal are off/opacity-only under reduced motion. | 02-MOTION contexts and reduced-motion rules. |
| 2026-10-04 | TitleCard title is sized with container units (`cqi`) so it fits any panel, not only full-screen. | Same card is reused inside the Work track. |
