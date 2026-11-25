import { SplitReveal } from "@/components/motion/SplitReveal";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { home } from "@/content/home";
import { site } from "@/content/site";

/** Closing call to action. The button becomes magnetic in step 6. */
export function ClosingCta({ index = "08" }: { index?: string }) {
  const { eyebrow, headline, body, cta } = home.closing;
  return (
    <section id="start" aria-labelledby="start-title" className="relative overflow-hidden bg-ink py-28 md:py-40">
      <div className="container-x">
        <Eyebrow index={index}>{eyebrow}</Eyebrow>
        <SplitReveal
          id="start-title"
          className="mt-8 font-display text-[clamp(3rem,1.2rem+7.6vw,9.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.02em] text-bone"
        >
          {headline.map((line, i) => (
            <span key={line} className="block">
              {i === headline.length - 1 ? (
                <>
                  {line.replace(".", "")}
                  <span className="text-ember">.</span>
                </>
              ) : (
                <>{line} </>
              )}
            </span>
          ))}
        </SplitReveal>

        <div className="mt-12 flex flex-col gap-10 md:mt-16 md:flex-row md:items-end md:justify-between">
          <p className="measure text-lead text-ash">{body}</p>
          <div className="flex shrink-0 flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
            <ButtonLink href={cta.href} className="h-16 px-10">
              {cta.label}
            </ButtonLink>
            <a
              href={`mailto:${site.email}`}
              className="label text-bone underline decoration-steel underline-offset-[0.4em] transition-colors duration-400 hover:text-ember hover:decoration-ember"
            >
              {site.email}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
