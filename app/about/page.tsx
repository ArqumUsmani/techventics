import type { Metadata } from "next";
import { CircuitDivider } from "@/components/motion/CircuitDivider";
import { PageHero } from "@/components/layout/PageHero";
import { ClosingCta } from "@/components/sections/home/ClosingCta";
import { Manifesto } from "@/components/sections/home/Manifesto";
import { Offices } from "@/components/sections/about/Offices";
import { TeamGrid } from "@/components/sections/about/TeamGrid";
import { Values } from "@/components/sections/about/Values";
import { about } from "@/content/about";

export const metadata: Metadata = {
  title: "About",
  description: "Who Techventics is, what we believe and where we work: a design and development studio in Karachi, Scotland and Texas.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow={about.hero.eyebrow} title={about.hero.title}>
        <div className="grid gap-8 md:grid-cols-12">
          {about.hero.story.map((p, i) => (
            <p key={i} className={`text-lead text-ash md:col-span-5 ${i === 0 ? "md:col-start-1" : "md:col-start-7 md:mt-24"}`}>
              {p}
            </p>
          ))}
        </div>
      </PageHero>
      <CircuitDivider />
      <Manifesto id="vision" index="02" eyebrow={about.vision.eyebrow} text={about.vision.text} />
      <Values />
      <TeamGrid />
      <Offices />
      <CircuitDivider flip />
      <ClosingCta index="06" />
    </>
  );
}
