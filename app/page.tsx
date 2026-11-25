import { Hero } from "@/components/sections/home/Hero";
import { Intro } from "@/components/sections/home/Intro";
import { Eyebrow } from "@/components/ui/Eyebrow";

export default function HomePage() {
  return (
    <>
      <Hero>
        <Intro />
      </Hero>

      {/* STEP 4 STAND-IN: manifesto, services, work etc. are built next. */}
      <section id="work" className="relative min-h-[120vh] border-t border-steel bg-ink py-32">
        <div className="container-x">
          <Eyebrow index="02">Work anchor</Eyebrow>
          <p className="measure mt-8 text-ash">Target for the &ldquo;See our work&rdquo; link. Built in step 4.</p>
        </div>
      </section>
    </>
  );
}
