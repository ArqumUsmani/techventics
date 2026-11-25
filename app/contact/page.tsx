import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { ContactDetails } from "@/components/sections/contact/ContactDetails";
import { ContactForm } from "@/components/sections/contact/ContactForm";
import { contact } from "@/content/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a project with Techventics. Write to Info@techventics.com or visit us in Karachi, Scotland or Texas.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow={contact.hero.eyebrow} title={contact.hero.title}>
        <p className="measure text-lead text-ash">{contact.hero.body}</p>
      </PageHero>

      <section aria-label="Project enquiry" className="bg-ink pb-24 md:pb-32">
        <div className="container-x grid gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <div className="lg:sticky lg:top-[calc(var(--spacing-header-compact)+3rem)]">
              <ContactDetails />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
