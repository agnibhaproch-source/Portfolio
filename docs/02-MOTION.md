# Motion

Extensive, but directed. Each section gets one signature move plus quiet supporting motion. No generic fade-and-slide-up on every block.

## Foundations

- `src/lib/gsap.ts` registers plugins once and exports `gsap`, `ScrollTrigger` and friends. Client only.
- Lenis instance in a provider; `lenis.on('scroll', ScrollTrigger.update)`; `gsap.ticker.add((t) => lenis.raf(t * 1000))`; `gsap.ticker.lagSmoothing(0)`.
- All component animation inside `useGSAP` with a scope ref, so cleanup is automatic.
- Use `gsap.matchMedia()` for three contexts: desktop (>= 1024, fine pointer), touch/small, and reduced motion.
- Eases, registered with CustomEase:
  - `ink`: `M0,0 C0.2,0 0.1,1 1,1` slow start, hard settle. Default for reveals.
  - `snap`: `M0,0 C0.7,0 0.2,1 1,1` for panel slams and title cards.
  - `heat`: `M0,0 C0.3,1.4 0.5,1 1,1` slight overshoot for hover and cursor.
- Durations: micro 0.2s, standard 0.6s, title card 1.1s. Stagger 0.04 to 0.08s.
- Anime timing trick: for impact moments, animate "on twos" by stepping (`steps(6)` to `steps(12)`) so motion feels drawn, then return to smooth motion.

## Reusable primitives (`components/motion/`)

| Component | What it does |
|---|---|
| `SplitReveal` | SplitText by lines/chars, masked rise, optional stepped mode |
| `PanelFrame` | panel with border that draws itself (DrawSVG), content clipped then revealed |
| `InkWipe` | full-screen SVG brush mask transition, used between routes and modes |
| `SpeedLines` | canvas radial or parallel lines, intensity prop bound to scroll velocity |
| `Screentone` | dot pattern whose dot size animates (tone "develops" like print) |
| `Magnetic` | element pulls toward the cursor within a radius |
| `Tilt` | 3D card tilt with a moving highlight |
| `TitleCard` | full-screen episode card: slam in, hold, cut out |
| `ScrambleText` | text resolves from katakana glyphs to Latin |
| `Parallax` | depth layers tied to scroll and pointer |

## Signature moments

1. **Preloader, "cold open".** Paper screen. A pencil line draws a panel border, a counter runs 000 to 100 in display type, the flame mark is inked stroke by stroke. At 100 the panel slams to full screen and cuts to the hero. Under 2.5s total; skipped on repeat visits in the same session.
2. **Hero reveal, ink to flame.** Hero starts as a manga page: name in ink, portrait in halftone. A brush stroke crosses the screen (InkWipe) and behind it the scene is in colour: night gradient, flame shader rising behind the portrait, name glowing. Name characters land one at a time with stepped timing and a 2px camera shake on the last one. After load, portrait, name and flame are parallax layers reacting to the pointer.
3. **Flame shader.** Fragment shader on a single plane: domain-warped fbm noise shaped into a rising flame, colours from `--agni` to `--kiln`, soft edges, slow. It is smooth, not particles. Pointer position bends it slightly. Pauses when off-screen and when the tab is hidden. Fallback: animated CSS gradient.
4. **About, panels assemble.** Section pins briefly. Five panels fly in from different directions and lock into the page layout using Flip, borders draw, screentone develops, then text reveals line by line. One sound-effect word pops across a gutter.
5. **Mode switch.** Between About and Skills the paper burns away: an irregular burning edge (noise-based mask with a flame-coloured rim) wipes up the screen, leaving the night background. Scrubbed to scroll.
6. **Skills, power level.** A radar chart draws itself; values count up; on completion an aura pulse rings outward. Skill cards are tilting holographic cards; hovering charges a thin aura border.
7. **Experience, arcs.** A vertical ink line draws with scroll. Each role is an "arc" whose title card slides out from the line; the active arc has speed lines behind its heading.
8. **Work, episodes.** Pinned horizontal scroll. Each project opens with a quick TitleCard ("Episode 01" plus project name), then the project panel: screenshots in skewed panels with parallax, hover plays a video loop. Scroll velocity drives SpeedLines and a slight skew on the track. Clicking a project expands its panel to full screen with Flip and routes to the detail page.
9. **Route transitions.** InkWipe covers, route changes, wipe uncovers. Use the View Transitions API where supported, GSAP fallback otherwise.
10. **Contact, "next episode".** Styled as a next-episode preview: big type, form fields underline-draw on focus, the send button charges on hold or hover and fires a flame burst on success.
11. **Footer, credits roll.** Slow vertical roll of credits (built with, fonts, thanks) that the visitor's scroll drives.

## Global interactions

- **Cursor.** Small ink dot plus trailing ring. States: default, link (ring grows, label text), drag (on the work track), charge (on buttons). Hidden on touch devices.
- **Nav.** Hides on scroll down, returns on scroll up. Active link has the flame mark. Mobile menu opens as a full-screen panel page with staggered links.
- **Scroll progress.** A thin flame line along the top, styled like an episode timeline, with chapter ticks at each section.
- **Text links.** Underline redraws from left on hover.
- **Easter egg.** Konami code triggers a 3 second "power up": screen flash, speed lines, palette shifts to aura. Log it in the console as a hint.
- **Sound (optional, off by default).** Tiny UI sounds on title cards and send. Toggle in nav. Only original or properly licensed sounds.

## Performance budget

- Animate only `transform`, `opacity`, `clip-path`, `filter` sparingly. Never layout properties in a scrub.
- 60fps on an M-series MacBook Air; no long frames over 50ms while scrolling.
- Shader: cap DPR at 1.5, render at reduced resolution on small screens, stop the loop off-screen.
- three.js chunk lazy loaded after first paint. Total JS for first load under 250kB gzipped excluding the three chunk.
- Images through `next/image`, AVIF/WebP. Video loops under 2MB, muted, `playsInline`, lazy.
- `will-change` added just before an animation and removed after.
- Lighthouse targets: performance 85+ desktop and 70+ mobile, accessibility 95+, SEO 95+.

## Touch and small screens

- No pinned horizontal scroll: work becomes a vertical stack with a swipeable screenshot strip per project.
- Shader replaced by the CSS gradient fallback below 768px unless the device is clearly capable.
- No cursor, no tilt, no magnetic. Keep SplitReveal, panel assembly (simplified to two directions), title cards, mode switch.

## Reduced motion

`prefers-reduced-motion: reduce` means: no smooth scroll hijack, no pinning, no shake, no parallax, shader frozen on one frame, reveals become 0.2s opacity changes, preloader skipped. All content reachable and readable.
