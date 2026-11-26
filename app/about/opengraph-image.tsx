import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "About Techventics";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return renderOg({ eyebrow: "About", title: "An office built across three time zones." });
}

// Generated once at build time (static export).
export const dynamic = "force-static";
