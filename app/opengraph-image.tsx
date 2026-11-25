import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Techventics: web, mobile, brand and motion studio";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return renderOg({ eyebrow: "Digital studio", title: "We engineer what’s next." });
}
