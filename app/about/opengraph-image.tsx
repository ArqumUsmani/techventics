import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "About Techventics";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return renderOg({ eyebrow: "About", title: "A studio built across three time zones." });
}
