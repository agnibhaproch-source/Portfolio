import { ImageResponse } from "next/og";
import { heroCopy, profile } from "@/content";
import { C, OgFrame, ogFonts, ogSize } from "@/lib/og";

export const alt = `${profile.name.full}, ${profile.role}`;
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <OgFrame>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, color: C.muted }}>
        <div
          style={{ width: 14, height: 14, borderRadius: 7, background: C.kiln, display: "flex" }}
        />
        {profile.availability ?? profile.location}
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 26, lineHeight: 0.95 }}>
        <div style={{ fontSize: 128, display: "flex" }}>{profile.name.first}</div>
        <div style={{ fontSize: 82, display: "flex" }}>{profile.name.last}</div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 22, marginTop: 22 }}>
        <div style={{ fontFamily: "Brush", fontSize: 72, display: "flex", lineHeight: 1 }}>
          {heroCopy.signature}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 70,
            height: 70,
            background: C.agni,
            border: `3px solid ${C.washi}`,
            fontSize: 42,
            transform: "rotate(-6deg)",
            marginBottom: 6,
          }}
        >
          {heroCopy.seal}
        </div>
        <div
          style={{ display: "flex", fontSize: 34, marginLeft: 18, marginBottom: 12, color: C.aura }}
        >
          {profile.name.aliasJa}
        </div>
      </div>
      <div style={{ display: "flex", marginTop: "auto", fontSize: 30 }}>
        {profile.role} · {profile.location}
      </div>
    </OgFrame>,
    { ...size, fonts: await ogFonts() },
  );
}
