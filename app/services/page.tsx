import type { Metadata } from "next";
import { PageStub } from "@/components/layout/PageStub";

export const metadata: Metadata = {
  title: "Services",
  description: "Development, brand identity, design, and motion and video from Techventics.",
};

export default function ServicesPage() {
  return <PageStub eyebrow="Services" title="What we make." />;
}
