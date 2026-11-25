import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Techventics: Innovating Today. Empowering Tomorrow.";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return renderOg({ eyebrow: "Techventics", title: "Innovating Today. Empowering Tomorrow." });
}

// Generated once at build time (static export).
export const dynamic = "force-static";
