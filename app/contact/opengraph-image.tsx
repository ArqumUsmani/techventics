import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Contact Techventics";
export const size = ogSize;
export const contentType = ogContentType;

export default function OpenGraphImage() {
  return renderOg({ eyebrow: "Contact", title: "Tell us what you’re building." });
}
