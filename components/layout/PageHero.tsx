import type { ReactNode } from "react";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Eyebrow } from "@/components/ui/Eyebrow";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  children?: ReactNode;
};

/** Top of the inner pages: eyebrow, one big line, optional body. `data-hero` drives the sticky header. */
export function PageHero({ eyebrow, title, children }: PageHeroProps) {
  return (
    <section data-hero className="relative bg-ink pb-16 pt-[calc(var(--spacing-header)+5rem)] md:pb-24 md:pt-[calc(var(--spacing-header)+8rem)]">
      <div className="container-x">
        <Eyebrow>{eyebrow}</Eyebrow>
        <SplitReveal as="h1" className="mt-8 max-w-[16ch] text-h1 text-bone" start="top 95%">
          {title}
        </SplitReveal>
        {children && <div className="mt-12 md:mt-16">{children}</div>}
      </div>
    </section>
  );
}
