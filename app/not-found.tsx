import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[80svh] flex-col justify-center pb-24 pt-[calc(var(--spacing-header)+4rem)]">
      <Eyebrow index="404">Page not found</Eyebrow>
      <h1 className="mt-8 max-w-[14ch] text-h1 text-bone">This page took a wrong turn.</h1>
      <p className="measure mt-6 text-lead text-ash">The link may be old, or the page may have moved. Everything else is one click away.</p>
      <div className="mt-10 flex flex-wrap gap-4">
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/contact" variant="outline">
          Contact us
        </ButtonLink>
      </div>
    </section>
  );
}
