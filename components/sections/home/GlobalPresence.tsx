import { SectionHeader } from "@/components/ui/SectionHeader";
import { home } from "@/content/home";
import { offices } from "@/content/offices";

/** Offices list + globe. The 3D dotted globe with arcs is added in step 6 (slot below). */
export function GlobalPresence() {
  return (
    <section id="presence" aria-labelledby="presence-title" className="relative overflow-x-clip bg-ink py-24 md:py-32">
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

        {/* STEP 6 SLOT: dotted 3D globe with pins and arcs Karachi → London / New York */}
        <div className="lg:col-span-6 lg:self-center">
          <div className="relative mx-auto flex aspect-square w-full max-w-[34rem] items-center justify-center rounded-full border border-dashed border-steel">
            <span className="label text-ash">Globe · step 6</span>
          </div>
        </div>
      </div>
    </section>
  );
}
