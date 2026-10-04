import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Panel, PANEL_SHAPES, type PanelShape } from "@/components/ui/Panel";
import { profile } from "@/content";
import Link from "next/link";
import { MotionDemos } from "./MotionDemos";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const swatches = [
  { token: "--sumi", hex: "#1d1614", use: "Ink, colour-mode background" },
  { token: "--washi", hex: "#e6d9bc", use: "Paper, colour-mode text" },
  { token: "--tone", hex: "#8a7f6e", use: "Screentone, muted text on night" },
  { token: "--tone-ink", hex: "#5e5548", use: "Muted text on paper" },
  { token: "--agni", hex: "#b8232f", use: "Crimson flame, accent, print focus" },
  { token: "--kiln", hex: "#e2622b", use: "Ember, hover heat, night focus" },
  { token: "--twilight", hex: "#2a1a22", use: "Night depth" },
  { token: "--aura", hex: "#c9a24a", use: "Gold, power states only" },
];

const scale = [
  { cls: "text-160", px: 160 },
  { cls: "text-96", px: 96 },
  { cls: "text-56", px: 56 },
  { cls: "text-36", px: 36 },
  { cls: "text-24", px: 24 },
  { cls: "text-18", px: 18 },
  { cls: "text-14", px: 14 },
];

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t-[3px] border-current py-12">
      <h2 className="mb-8 text-36">{title}</h2>
      {children}
    </section>
  );
}

export default function Styleguide() {
  return (
    <main id="main" data-mode="print" className="min-h-svh px-4 py-16 md:px-10">
      <h1 className="text-96">Styleguide</h1>
      <p className="mt-2 max-w-prose text-muted">
        Tokens, type, panels, buttons and motion primitives for the aged-grimoire theme.
      </p>
      <Link href="/" className="mt-4 inline-block ink-link text-14">
        Back to home
      </Link>

      <Block title="Palette">
        <ul className="grid grid-cols-2 gap-gutter md:grid-cols-4">
          {swatches.map((s) => (
            <li key={s.token} className="border-[3px] border-sumi">
              <div className="h-24" style={{ background: `var(${s.token})` }} />
              <div className="border-t-[3px] border-sumi p-3 text-14">
                <p className="font-bold">{s.token}</p>
                <p>{s.hex}</p>
                <p className="text-muted">{s.use}</p>
              </div>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Type">
        <div className="space-y-4 overflow-hidden">
          {scale.map((t) => (
            <p key={t.cls} className={`font-display ${t.cls} whitespace-nowrap`}>
              <span className="mr-4 align-middle font-body text-14 text-muted">{t.px}</span>
              Agni
            </p>
          ))}
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div>
            <p className="text-14 text-muted">Display, Dela Gothic One, with katakana</p>
            <p className="font-display text-56">
              {profile.name.alias}{" "}
              <span lang="ja" aria-hidden>
                {profile.name.aliasJa}
              </span>
            </p>
          </div>
          <div>
            <p className="text-14 text-muted">Text, Zen Kaku Gothic New 400 / 500 / 700</p>
            <p className="max-w-prose">
              Body copy sits at 17 to 18px with a 1.6 line height and stays under 68 characters per
              line. <span className="font-medium">Medium for emphasis,</span>{" "}
              <span className="font-bold">bold for the rare strong word.</span>
            </p>
          </div>
        </div>
        <div className="relative mt-12 h-40">
          <Panel tone className="absolute inset-y-0 left-0 w-2/3" />
          <p className="absolute top-1/2 left-[55%] -translate-y-1/2 sfx text-96 text-washi">
            DOON
          </p>
        </div>
      </Block>

      <Block title="Panels">
        <div className="grid grid-cols-2 gap-gutter md:grid-cols-5">
          {(Object.keys(PANEL_SHAPES) as PanelShape[]).map((shape) => (
            <Panel key={shape} shape={shape} className="h-44" innerClassName="p-4">
              <p className="text-14">{shape}</p>
            </Panel>
          ))}
        </div>
        <div className="mt-gutter grid grid-cols-3 gap-gutter">
          <Panel tone className="h-32" innerClassName="p-4">
            <p className="text-14">tone</p>
          </Panel>
          <Panel className="h-32" innerClassName="tone-fade p-4">
            <p className="text-14">tone-fade</p>
          </Panel>
          <Panel className="h-32" innerClassName="hatch p-4">
            <p className="text-14">hatch</p>
          </Panel>
        </div>
      </Block>

      <Block title="Buttons and links">
        <div className="grid gap-gutter md:grid-cols-2">
          <div className="flex flex-wrap items-center gap-6 border-[3px] border-sumi p-8">
            <Button>View project</Button>
            <Button variant="ghost">Download resume</Button>
            <a href="#main" className="ink-link">
              Text link
            </a>
          </div>
          <div
            data-mode="colour"
            className="flex flex-wrap items-center gap-6 border-[3px] border-sumi p-8"
          >
            <Button>Send message</Button>
            <Button variant="ghost">Source code</Button>
            <a href="#main" className="ink-link">
              Text link
            </a>
          </div>
        </div>
      </Block>

      <Block title="Motion">
        <MotionDemos />
      </Block>

      <Block title="Modes">
        <div className="grid gap-gutter md:grid-cols-2">
          <div data-mode="print" className="border-[3px] border-sumi p-8">
            <p className="font-display text-36">Print mode</p>
            <p className="text-muted">Paper, ink, screentone. No gradients.</p>
          </div>
          <div
            data-mode="colour"
            className="border-[3px] border-sumi p-8"
            style={{ backgroundImage: "linear-gradient(160deg, var(--twilight), var(--sumi) 70%)" }}
          >
            <p className="font-display text-36">Colour mode</p>
            <p className="text-muted">
              Night, crimson flame, <span className="text-aura">gold for power states.</span>
            </p>
          </div>
        </div>
      </Block>
    </main>
  );
}
