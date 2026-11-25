import { ButtonLink, TextLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * The section the camera flies into. Carries the headline that the reference-style
 * hero doesn't have. Transparent so the 3D layer behind it shows through.
 */
export function Intro() {
  return (
    <section id="intro" className="relative flex min-h-[100svh] items-center py-32">
      <div className="container-x">
        <Eyebrow index="01">Techventics</Eyebrow>
        <h2 className="mt-8 font-display text-h1 font-bold uppercase text-bone">
          We engineer
          <br />
          what&rsquo;s <span className="text-ember">next.</span>
        </h2>
        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="measure text-lead text-ash">Web, mobile, brand and motion, from Karachi, London and New York.</p>
          <div className="flex shrink-0 items-center gap-8">
            <ButtonLink href="/contact">Start a project</ButtonLink>
            <TextLink href="#work">See our work</TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}
