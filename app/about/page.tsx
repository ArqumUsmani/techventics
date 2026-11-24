import type { Metadata } from "next";
import { PageStub } from "@/components/layout/PageStub";

export const metadata: Metadata = {
  title: "About",
  description: "Who Techventics is, how we work, and where our offices are.",
};

export default function AboutPage() {
  return <PageStub eyebrow="About" title="A studio across three time zones." />;
}
