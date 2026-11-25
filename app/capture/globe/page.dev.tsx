import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobeLab } from "./GlobeLab";

/* Dev-only test bench + capture page for the globe (used by `npm run capture:globe`). 404s in production. */

export const metadata: Metadata = { title: "Capture: Globe", robots: { index: false, follow: false } };

export default function GlobeLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <GlobeLab />;
}
