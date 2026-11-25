import { SplitReveal } from "@/components/motion/SplitReveal";
import { Eyebrow } from "./Eyebrow";

type SectionHeaderProps = {
  index: string;
  eyebrow: string;
  /** Giant soft-gradient word behind the heading (decorative), as on the reference. */
  big?: string;
  title: string;
  id?: string;
  className?: string;
};

/**
 * Section heading in the reference's style: a very large uppercase word filled with a
 * soft gradient (5rem → 6rem → 11rem), with the real heading overlapping its lower
 * half. The big word is decorative (aria-hidden) because its contrast is intentionally low.
 */
export function SectionHeader({ index, eyebrow, big, title, id, className = "" }: SectionHeaderProps) {
  return (
    <div className={`relative ${className}`}>
      <Eyebrow index={index}>{eyebrow}</Eyebrow>
      {big && (
        // w-max: background-clip:text only paints inside the element's box.
        <p
          aria-hidden
          className="pointer-events-none mt-6 w-max select-none whitespace-nowrap bg-linear-to-b from-bone/[0.15] to-bone/[0.015] bg-clip-text font-display text-[5rem] font-bold uppercase leading-[0.8] tracking-[-0.02em] text-transparent md:text-[6rem] xl:text-[11rem]"
        >
          {big}
        </p>
      )}
      <SplitReveal id={id} className={`max-w-[18ch] text-h2 text-bone ${big ? "relative -mt-8 md:-mt-10 xl:-mt-[4.5rem]" : "mt-5"}`}>
        {title}
      </SplitReveal>
    </div>
  );
}
