import { ButtonLink, TextLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

/*
 * STEP 1 STAND-IN. The real hero (step 3) and the Home sections (step 4) replace this.
 * It exists so the transparent → solid header and smooth scroll can be checked.
 */
export default function HomePage() {
  return (
    <>
      <section className="relative flex min-h-[max(100svh,900px)] flex-col justify-end overflow-hidden pb-[12vh] pt-header">
        {/* temporary backdrop so the transparent header is visible over "something" */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_70%_10%,#181818_0%,#0B0B0B_60%)]" />
        <div className="container-x">
          <h1 className="font-display text-hero font-bold uppercase text-bone">
            We engineer
            <br />
            what&rsquo;s <span className="text-ember">next.</span>
          </h1>
          <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="measure text-lead text-ash">
              Web, mobile, brand and motion, from Karachi, London and New York.
            </p>
            <div className="flex items-center gap-8">
              <ButtonLink href="/contact">Start a project</ButtonLink>
              <TextLink href="#work">See our work</TextLink>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x border-t border-steel py-32">
        <Eyebrow index="01">Scroll test</Eyebrow>
        <p className="mt-8 max-w-[22ch] font-display text-h2 font-medium text-ash">
          Header turns solid and the logo compacts once you scroll past 40px.
        </p>
      </section>

      <section id="work" className="container-x min-h-[120vh] border-t border-steel py-32">
        <Eyebrow index="02">Work anchor</Eyebrow>
        <p className="measure mt-8 text-ash">Target for the &ldquo;See our work&rdquo; link. Built in step 4.</p>
      </section>
    </>
  );
}
