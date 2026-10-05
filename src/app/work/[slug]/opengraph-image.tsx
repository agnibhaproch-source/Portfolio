import { ImageResponse } from "next/og";
import { profile, projects, workCopy } from "@/content";
import { C, OgFrame, ogFonts, ogSize } from "@/lib/og";

export const alt = "Project chapter";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  return new ImageResponse(
    <OgFrame>
      <div style={{ display: "flex", fontSize: 30, color: C.muted }}>
        {workCopy.chapter} {String(Math.max(index, 0) + 1).padStart(2, "0")} ·{" "}
        {project ? workCopy.status[project.status] : ""}
      </div>
      <div style={{ display: "flex", fontSize: 140, marginTop: 20, lineHeight: 1 }}>
        {project?.name ?? profile.name.full}
      </div>
      <div
        style={{
          display: "flex",
          width: 260,
          height: 6,
          marginTop: 24,
          background: `linear-gradient(90deg, ${C.agni}, ${C.kiln})`,
        }}
      />
      <div style={{ display: "flex", fontSize: 34, marginTop: 30, maxWidth: 820, lineHeight: 1.3 }}>
        {project?.pitch ?? ""}
      </div>
      <div style={{ display: "flex", marginTop: "auto", fontSize: 28, color: C.aura }}>
        {profile.name.full} · {profile.role}
      </div>
    </OgFrame>,
    { ...size, fonts: await ogFonts() },
  );
}
