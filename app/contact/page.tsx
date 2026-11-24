import type { Metadata } from "next";
import { PageStub } from "@/components/layout/PageStub";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a project with Techventics. Offices in Karachi, London and New York.",
};

export default function ContactPage() {
  return <PageStub eyebrow="Contact" title="Tell us what you're building." />;
}
