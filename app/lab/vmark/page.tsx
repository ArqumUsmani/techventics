import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VMarkLab } from "./VMarkLab";

/* Dev-only test bench for the 3D mark. 404s in production; removed in step 7. */

export const metadata: Metadata = { title: "Lab: V mark", robots: { index: false, follow: false } };

export default function VMarkLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <VMarkLab />;
}
