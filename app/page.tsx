import { CircuitDivider } from "@/components/motion/CircuitDivider";
import { ClosingCta } from "@/components/sections/home/ClosingCta";
import { GlobalPresence } from "@/components/sections/home/GlobalPresence";
import { Hero } from "@/components/sections/home/Hero";
import { Intro } from "@/components/sections/home/Intro";
import { Manifesto } from "@/components/sections/home/Manifesto";
import { Numbers } from "@/components/sections/home/Numbers";
import { Process } from "@/components/sections/home/Process";
import { SelectedWork } from "@/components/sections/home/SelectedWork";
import { ServicesTrack } from "@/components/sections/home/ServicesTrack";

export default function HomePage() {
  return (
    <>
      <Hero>
        <Intro />
      </Hero>
      <div className="relative">
        <Manifesto />
        <CircuitDivider />
        <ServicesTrack />
        <SelectedWork />
        <Numbers />
        <CircuitDivider flip />
        <Process />
        <GlobalPresence />
        <CircuitDivider />
        <ClosingCta />
      </div>
    </>
  );
}
