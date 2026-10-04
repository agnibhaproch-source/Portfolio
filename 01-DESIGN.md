# Design

## Concept: ink to flame

The site is one episode of a show about the owner. It opens as a black and white manga page: paper, ink, screentone, hand-ruled panel borders. As the visitor scrolls, the page gets "animated": colour floods in, panels break their borders, and the print world becomes a cel-shaded night scene lit by fire. Agni means fire, so flame is the one colour motif and the one thing that is allowed to be loud.

Two modes, used on purpose:

- **Print mode** (preloader, about, experience): paper background, ink text, screentone shading, no colour except a single flame mark.
- **Colour mode** (hero after the reveal, skills, projects, contact): night background, flame and aura light, glow, depth.

The switch between modes is the signature moment of the site. Spend the boldness there. Everything else stays disciplined.

## Palette

Retro "aged grimoire" variant, chosen by the owner 2026-10-04 (see DECISIONS.md).

| Token | Hex | Use |
|---|---|---|
| `--sumi` | `#1d1614` | brown-black ink, text in print mode, colour mode background |
| `--washi` | `#e6d9bc` | yellowed old-book paper, text in colour mode |
| `--tone` | `#8a7f6e` | screentone, secondary text |
| `--agni` | `#b8232f` | deep crimson flame, primary accent, focus rings |
| `--kiln` | `#e2622b` | ember, flame core, highlights, hover heat |
| `--twilight` | `#2a1a22` | dark wine night, depth gradients in colour mode |
| `--aura` | `#c9a24a` | tarnished gold, only for "power" states: skills chart, active nav, cursor charge, magic circles |

Retro texture: subtle film grain overlay (static noise, low opacity), halftone dots, slightly faded paper edges and ink bleed on panel borders. Crimson is for marks and large display text only; body text is always washi on sumi or sumi on washi (AA).

Rules: flame is never used as a flat fill behind text. Aura and flame never touch each other directly. Print mode uses zero gradients; shading there is screentone (dot pattern via CSS `radial-gradient` or SVG pattern) and hatching.

## Type

- Display: **Dela Gothic One** (Google Fonts). Heavy, has Latin and Japanese glyphs, so title cards and katakana match. Used large, tight leading, sentence case or as set.
- Text: **Zen Kaku Gothic New** (Google Fonts), 400 / 500 / 700. Body 17 to 18px, line height 1.6, max 68 characters per line.
- Sound-effect lettering (the BAM / DON style words): **Rampart One**, used a handful of times across the whole site, always rotated and overlapping a panel edge.
- Load with `next/font/google`, subset, `display: swap`.
- Scale (desktop): 14, 18, 24, 36, 56, 96, 160. Hero name uses `clamp()` up to about 22vw.
- Japanese text is decoration plus meaning: only words that are correct and approved in PROFILE.md. Mark decorative Japanese with `aria-hidden` and `lang="ja"`.

Avoid: one coloured word inside a headline, all-caps tracked labels above every heading, monospace data labels, arrows glued to link text, identical rounded cards with soft grey shadows.

## Layout

Manga page logic, not a web grid. Panels have ruled borders (3px ink), uneven sizes, diagonal cuts (`clip-path`), and gutters of 12 to 16px. Content sometimes breaks out of its panel. Reading direction stays left to right.

```
HERO (after reveal)
+--------------------------------------------------+
| nav: agni      about  skills  work  contact  [♪] |
|                                                  |
|  AGNIBHA                       /\  portrait      |
|  BHATTACHARYA       flame     /  \ cut-out,      |
|  アグニ             shader   /    \ halftone     |
|  full-stack developer       /______\             |
|                                                  |
|  ep. 01 ------------------------------ scroll    |
+--------------------------------------------------+

ABOUT (print mode, panels assemble)
+-----------+---------------------+
|  panel 1  |      panel 2        |
|  photo    |   origin text       |
+------+----+-----------+---------+
| p3   |      panel 4   /  p5     |
| fact |   big quote   /  fact    |
+------+---------------+----------+

PROJECTS (colour mode, pinned horizontal)
[ title card ] -> [ episode 01 ] -> [ episode 02 ] -> [ episode 03 ] -> [ all work ]
```

Alignment: left aligned text everywhere. Centre alignment only for title cards.

Episode numbering is real structure here (projects are an ordered list the owner chooses), so numbered markers are allowed on projects and on the experience timeline. Do not number anything else.

## Recurring motifs

- Panel frames with ruled borders
- Screentone dots and gradient tone
- Speed lines (radial and parallel), drawn in SVG or canvas
- Ink brush wipes for transitions (SVG mask)
- Title cards: full-screen ink background, big display text, a thin flame line
- A small flame mark as logo, cursor state and favicon

## Voice

First person, plain, a bit dry. Section names say what they are: About, Skills, Experience, Work, Contact. Anime flavour sits in the subtitle line (for example "Work" with "episodes so far" beneath it), not in the navigation. Buttons say what they do: "View project", "Download resume", "Send message".

## Quality floor

Responsive from 360px up. Visible keyboard focus (flame ring). Contrast AA. Semantic HTML with one `h1`. Works with JavaScript animations disabled: content is visible by default and animation is added on top, never the other way round.
