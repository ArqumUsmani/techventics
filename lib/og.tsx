import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { facets, pointsAttr, toneHex, traces, VIEWBOX } from "@/components/three/vmarkShape";

/* Branded Open Graph / Twitter image (1200 × 630), rendered at build time. */

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

export function markDataUri() {
  const { x, y, width, height } = VIEWBOX;
  const polys = facets.map((f) => `<polygon points="${pointsAttr(f.points)}" fill="${toneHex[f.tone]}" opacity="${f.shade ?? 1}"/>`).join("");
  const lines = traces
    .map((t) => {
      const [nx, ny] = t.points[t.points.length - 1];
      return `<polyline points="${pointsAttr(t.points)}" fill="none" stroke="#FC5400" stroke-width="1.6"/><circle cx="${nx}" cy="${ny}" r="2.4" fill="#FC5400"/>`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${width} ${height}">${polys}${lines}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function renderOg({ eyebrow, title }: { eyebrow: string; title: string }) {
  const [clash, mono] = await Promise.all([
    readFile(join(process.cwd(), "lib/og-fonts/ClashDisplay-Semibold.ttf")),
    readFile(join(process.cwd(), "lib/og-fonts/JetBrainsMono-Medium.ttf")),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0B0B0B", padding: "64px 72px", position: "relative" }}>
        {/* steel grid */}
        {[210, 420].map((top) => (
          <div key={top} style={{ position: "absolute", left: 0, right: 0, top, height: 1, background: "#202020" }} />
        ))}
        {[400, 800].map((left) => (
          <div key={left} style={{ position: "absolute", top: 0, bottom: 0, left, width: 1, background: "#202020" }} />
        ))}
        {/* ember circuit trace */}
        <div style={{ position: "absolute", right: 72, bottom: 118, width: 300, height: 2, background: "#FC5400" }} />
        <div style={{ position: "absolute", right: 366, bottom: 113, width: 12, height: 12, borderRadius: 12, background: "#FC5400" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markDataUri()} width={74} height={65} alt="" />
          <div style={{ display: "flex", fontFamily: "Clash", fontSize: 30, letterSpacing: 2 }}>
            <span style={{ color: "#F6F1EA" }}>TECH</span>
            <span style={{ color: "#FC5400" }}>VENTICS</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div style={{ fontFamily: "Mono", fontSize: 22, letterSpacing: 3, color: "#FC5400", textTransform: "uppercase" }}>{eyebrow}</div>
          <div style={{ fontFamily: "Clash", fontSize: 78, lineHeight: 1, letterSpacing: -1.5, color: "#F6F1EA", marginTop: 18, maxWidth: 940 }}>
            {title}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 44, fontFamily: "Mono", fontSize: 20, letterSpacing: 2, color: "#8A8580" }}>
            <span>KARACHI · LONDON · NEW YORK</span>
            <span>TECHVENTICS.COM</span>
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Clash", data: clash, weight: 600, style: "normal" },
        { name: "Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
