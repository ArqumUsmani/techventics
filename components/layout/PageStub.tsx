import { Eyebrow } from "@/components/ui/Eyebrow";

/** Temporary page body until each page is built (step 5). */
export function PageStub({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <section className="container-x min-h-[100svh] pb-24 pt-[calc(var(--spacing-header)+6rem)]">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-6 max-w-[14ch] text-h1 text-bone">{title}</h1>
      <p className="measure mt-8 text-ash">This page is built in step 5.</p>
    </section>
  );
}
