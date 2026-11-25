import { SplitReveal } from "@/components/motion/SplitReveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { home } from "@/content/home";

/**
 * The section the camera flies into. Carries the headline that the reference-style
 * hero doesn't have. Transparent so the 3D layer behind it shows through.
 */
export function Intro() {
  const { eyebrow, headline, accent, subline } = home.intro;
  return (
    <section id="intro" className="relative flex min-h-[100svh] items-center py-32">
      <div className="container-x">
        <Eyebrow index="01">{eyebrow}</Eyebrow>
        {/* Sized so the longest word ("EMPOWERING") fits a 360px-wide phone. */}
        <SplitReveal className="mt-8 font-display text-[clamp(2.25rem,1.1rem+6.6vw,8.5rem)] font-bold uppercase leading-[0.92] tracking-[-0.02em] text-bone" start="top 80%">
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
        <p className="measure mt-10 text-lead text-ash">{subline}</p>
      </div>
    </section>
  );
}
