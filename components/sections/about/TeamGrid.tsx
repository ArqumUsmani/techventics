import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { about } from "@/content/about";

/**
 * Team grid: portraits in monochrome that turn to colour on hover; name and role in mono.
 * Slots without a photo show a clearly marked placeholder (no AI images).
 */
export function TeamGrid() {
  const { eyebrow, big, title, members } = about.team;
  return (
    <section aria-labelledby="team-title" className="relative overflow-x-clip bg-ink py-24 md:py-32">
      <div className="container-x">
        <SectionHeader id="team-title" index="03" eyebrow={eyebrow} big={big} title={title} />

        <ul className="mt-16 grid grid-cols-2 gap-x-4 gap-y-12 md:mt-24 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {members.map((m, i) => (
            // Every other column sits lower: an offset rhythm instead of a flat grid.
            <li key={`${m.role}-${i}`} className={i % 2 === 1 ? "lg:translate-y-12" : ""}>
              <figure className="group">
                <div className="relative aspect-[4/5] overflow-hidden border border-steel bg-graphite">
                  {m.photo ? (
                    <Image
                      src={m.photo}
                      alt={`${m.name}, ${m.role}`}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                      className="object-cover grayscale transition-[filter] duration-600 ease-out-cubic group-hover:grayscale-0"
                    />
                  ) : (
                    <>
                      <svg aria-hidden viewBox="0 0 100 125" className="absolute inset-x-0 bottom-0 w-full text-steel">
                        <circle cx="50" cy="48" r="18" fill="none" stroke="currentColor" strokeWidth="0.75" />
                        <path d="M14 125c0-22 16-38 36-38s36 16 36 38" fill="none" stroke="currentColor" strokeWidth="0.75" />
                      </svg>
                      <span className="label absolute left-3 top-3 border border-dashed border-steel bg-ink/80 px-2 py-1 text-ash">
                        Photo to come
                      </span>
                    </>
                  )}
                </div>
                <figcaption className="mt-4">
                  <p className="text-small font-medium text-bone">{m.name}</p>
                  <p className="label mt-1 text-ash">{m.role}</p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
