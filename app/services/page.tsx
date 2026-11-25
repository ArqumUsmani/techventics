import type { Metadata } from "next";
import { CircuitDivider } from "@/components/motion/CircuitDivider";
import { PageHero } from "@/components/layout/PageHero";
import { ClosingCta } from "@/components/sections/home/ClosingCta";
import { ServiceDetail } from "@/components/sections/services/ServiceDetail";
import { ServiceIndex } from "@/components/sections/services/ServiceIndex";
import { Accordion } from "@/components/ui/Accordion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { faqs } from "@/content/faqs";
import { services } from "@/content/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Development, brand identity, design and IT hardware sales: websites, apps, identity systems, UI/UX, servers, networking and workstations from Techventics.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero eyebrow="Services" title="Four disciplines under one roof.">
        <p className="measure text-lead text-ash">
          Most projects need more than one of these. Because the same team plans, designs, builds and animates, nothing gets lost
          between agencies and nobody has to brief the same idea twice.
        </p>
      </PageHero>

      <div className="container-x grid gap-12 pb-12 lg:grid-cols-12 lg:gap-8">
        <aside className="hidden lg:col-span-4 lg:block">
          <ServiceIndex items={services.map(({ id, number, title }) => ({ id, number, title }))} />
        </aside>
        <div className="lg:col-span-8">
          {services.map((s) => (
            <ServiceDetail key={s.id} service={s} />
          ))}
        </div>
      </div>

      <CircuitDivider />

      <section aria-labelledby="faq-title" className="relative overflow-x-clip bg-ink py-24 md:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <SectionHeader id="faq-title" index="02" eyebrow="Questions" big="FAQ" title="Before you ask." />
          </div>
          <div className="lg:col-span-8 lg:pt-24">
            <Accordion items={faqs} />
          </div>
        </div>
      </section>

      <ClosingCta index="03" />
    </>
  );
}
