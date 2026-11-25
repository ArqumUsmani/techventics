import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VMarkLab } from "./VMarkLab";

/* Dev-only test bench + capture page for the 3D mark (used by `npm run capture:vmark`). 404s in production. */

export const metadata: Metadata = { title: "Capture: V mark", robots: { index: false, follow: false } };

export default function VMarkLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <VMarkLab />;
}
