import { SplitReveal } from "@/components/motion/SplitReveal";
import { ButtonLink, TextLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { home } from "@/content/home";

/**
 * The section the camera flies into. Carries the headline that the reference-style
 * hero doesn't have. Transparent so the 3D layer behind it shows through.
 */
export function Intro() {
  const { eyebrow, headline, accent, subline, primaryCta, secondaryCta } = home.intro;
  return (
    <section id="intro" className="relative flex min-h-[100svh] items-center py-32">
      <div className="container-x">
        <Eyebrow index="01">{eyebrow}</Eyebrow>
        <SplitReveal className="mt-8 font-display text-h1 font-bold uppercase text-bone" start="top 80%">
          {headline.map((line, i) => (
            <span key={line} className="block">
              {line.includes(accent) ? (
                <>
                  {line.replace(accent, "")}
                  <span className="text-ember">{accent}</span>
                </>
              ) : (
                line
              )}
              {i < headline.length - 1 && " "}
            </span>
          ))}
        </SplitReveal>
        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="measure text-lead text-ash">{subline}</p>
          <div className="flex shrink-0 items-center gap-8">
            <ButtonLink href={primaryCta.href}>{primaryCta.label}</ButtonLink>
            <TextLink href={secondaryCta.href}>{secondaryCta.label}</TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}
