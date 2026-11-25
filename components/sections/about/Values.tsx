import { SplitReveal } from "@/components/motion/SplitReveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { about } from "@/content/about";

// Each statement sits at a different indent: editorial, not a row of identical cards.
const INDENT = ["", "md:ml-[16.66%]", "md:ml-[33.33%]"];

/** Three large value statements, each revealing line by line on scroll. */
export function Values() {
  return (
    <section aria-labelledby="values-label" className="relative bg-ink py-24 md:py-32">
      <div className="container-x">
        <Eyebrow index="02" as="h2" id="values-label">
          {about.values.eyebrow}
        </Eyebrow>
        <ol className="mt-16 space-y-20 md:mt-24 md:space-y-28">
          {about.values.items.map((v, i) => (
            <li key={v.title} className={`max-w-[48rem] ${INDENT[i % INDENT.length]}`}>
              <span className="label text-ember">{String(i + 1).padStart(2, "0")}</span>
              <SplitReveal as="h3" className="mt-4 font-display text-h1 font-semibold text-bone">
                {v.title}
              </SplitReveal>
              <p className="measure mt-6 text-lead text-ash">{v.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
