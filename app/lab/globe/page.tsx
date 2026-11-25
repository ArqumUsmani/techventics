import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobeLab } from "./GlobeLab";

/* Dev-only test bench / capture page for the globe. 404s in production; removed in step 7. */

export const metadata: Metadata = { title: "Lab: Globe", robots: { index: false, follow: false } };

export default function GlobeLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <GlobeLab />;
}
