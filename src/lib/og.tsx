import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";

/*
 * Shared frame for the generated share images (next/og): an ink page with an
 * ember glow, a ruled magic-circle ring and a manga panel border. Fonts are
 * the OFL files in assets/fonts (Dela Gothic One, Kaushan Script).
 */

export const ogSize = { width: 1200, height: 630 };

export const C = {
  sumi: "#1d1614",
  washi: "#ebdcb9",
  agni: "#c2272d",
  kiln: "#e2622b",
  aura: "#c9a24a",
  muted: "#93887a",
};

export async function ogFonts() {
  const dir = join(process.cwd(), "assets/fonts");
  const [dela, brush] = await Promise.all([
    readFile(join(dir, "DelaGothicOne-Regular.ttf")),
    readFile(join(dir, "KaushanScript-Regular.ttf")),
  ]);
  return [
    { name: "Dela", data: dela, style: "normal" as const, weight: 400 as const },
    { name: "Brush", data: brush, style: "normal" as const, weight: 400 as const },
  ];
}

export function OgFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: `radial-gradient(circle at 85% 95%, rgba(226,98,43,0.55), rgba(42,26,34,0.9) 45%, ${C.sumi} 75%)`,
        fontFamily: "Dela",
        color: C.washi,
      }}
    >
      {/* magic circle ring, bottom right */}
      <svg
        width="560"
        height="560"
        viewBox="0 0 200 200"
        style={{ position: "absolute", right: -90, bottom: -170, opacity: 0.55 }}
      >
        <circle cx="100" cy="100" r="96" fill="none" stroke={C.aura} strokeWidth="2" />
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke={C.aura}
          strokeWidth="1"
          strokeDasharray="3 6"
        />
        <polygon
          points="100,22 146,163 26,76 174,76 54,163"
          fill="none"
          stroke={C.aura}
          strokeWidth="1.2"
        />
        <circle cx="100" cy="100" r="30" fill="none" stroke={C.aura} strokeWidth="1.5" />
      </svg>
      {/* panel border */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 28,
          right: 28,
          bottom: 28,
          border: `4px solid ${C.washi}`,
          display: "flex",
        }}
      />
      <div
        style={{ display: "flex", flexDirection: "column", padding: "70px 80px", width: "100%" }}
      >
        {children}
      </div>
    </div>
  );
}
