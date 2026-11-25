import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Techventics services";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return renderOg({ eyebrow: "Services", title: "Development, brand, design, motion." });
}

// Generated once at build time (static export).
export const dynamic = "force-static";
