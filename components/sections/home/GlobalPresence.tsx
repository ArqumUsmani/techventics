import { GlobeStage } from "@/components/three/GlobeStage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { home } from "@/content/home";
import { offices } from "@/content/offices";

/** Offices list + dotted 3D globe with office pins and arcs from the HQ. */
export function GlobalPresence() {
  return (
    <section id="presence" aria-labelledby="presence-title" className="relative overflow-x-clip py-24 md:py-32">
      <div className="container-x grid gap-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <SectionHeader id="presence-title" index="07" eyebrow={home.presence.eyebrow} big={home.presence.big} title={home.presence.title} />
          <p className="measure mt-8 text-ash">{home.presence.body}</p>

          <ul className="mt-12 border-t border-steel">
            {offices.map((office) => (
              <li key={office.id} className="flex items-baseline justify-between gap-6 border-b border-steel py-5">
                <span className="font-display text-h4 text-bone">{office.city}</span>
                <span className="label text-ash">
                  {office.country}
                  {office.isHeadquarters && <span className="ml-3 text-ember">HQ</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dotted 3D globe: pins on each office, arcs from the HQ to Scotland and Texas */}
        <div className="lg:col-span-6 lg:self-center">
          <GlobeStage offices={offices} hubId={offices.find((o) => o.isHeadquarters)?.id ?? offices[0].id} className="mx-auto w-full max-w-[34rem]" />
        </div>
      </div>
    </section>
  );
}
