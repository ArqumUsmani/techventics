import { SplitReveal } from "@/components/motion/SplitReveal";
import { Slider } from "@/components/ui/Slider";
import { WorkCard } from "@/components/ui/WorkCard";
import { projects } from "@/content/projects";
import type { Service } from "@/content/types";

/** One service on the Services page: what we do, deliverables, tools and a related case. */
export function ServiceDetail({ service }: { service: Service }) {
  // Related work: the linked case first, then every other project tagged with this service.
  // New projects in projects.ts join the slider automatically.
  const related = projects
    .map((project, index) => ({ project, index }))
    .filter(({ project }) => project.id === service.relatedProject || project.services.includes(service.id))
    .sort((a, b) => Number(b.project.id === service.relatedProject) - Number(a.project.id === service.relatedProject));

  return (
    <section id={service.id} aria-labelledby={`${service.id}-title`} className="scroll-mt-24 border-t border-steel py-16 first:border-t-0 first:pt-0 md:py-24">
      <p className="label text-ember">{service.number}</p>
      <SplitReveal id={`${service.id}-title`} className="mt-4 text-h2 text-bone">
        {service.title}
      </SplitReveal>
      <p className="measure mt-6 text-lead text-ash">{service.description}</p>

      {service.images && service.images.length > 0 && (
        // Hidden on phones (and portrait tablets): shown from laptop width, or on a landscape tablet.
        <div className="mt-12 hidden gap-4 md:grid-cols-12 lg:grid [@media(min-width:48rem)_and_(min-height:37.5rem)_and_(orientation:landscape)]:grid">
          {service.images.map((img, i) => (
            <figure
              key={img.src}
              className={`relative aspect-[16/9] overflow-hidden border border-steel ${
                service.images!.length === 1 ? "md:col-span-12" : i % 2 === 0 ? "md:col-span-7" : "md:col-span-5 md:mt-16"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                srcSet={`${img.srcSmall} 800w, ${img.src} ${img.width}w`}
                sizes="(min-width: 1024px) 40vw, 100vw"
                alt={img.alt}
                width={img.width}
                height={img.height}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </figure>
          ))}
        </div>
      )}

      <div className="mt-12 grid gap-12 md:grid-cols-2">
        <div>
          <h3 className="label text-ash">Deliverables</h3>
          <ul className="mt-4 border-t border-steel">
            {service.deliverables.map((d) => (
              <li key={d} className="flex items-baseline gap-4 border-b border-steel py-3 text-bone">
                <span aria-hidden className="label text-ember">
                  —
                </span>
                {d}
              </li>
            ))}
          </ul>
        </div>
        {service.tools.length > 0 && (
          <div>
            <h3 className="label text-ash">Tools &amp; stack</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {service.tools.map((t) => (
                <li key={t} className="label border border-steel px-3 py-1.5 text-bone/80">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-14">
          <h3 className="label text-ash">Related work</h3>
          <Slider label={`${service.title}: related work`} className="mt-4">
            {related.map(({ project, index }) => (
              <WorkCard key={project.id} project={project} index={index} aspect="aspect-[16/9]" sizes="(min-width: 1024px) 58vw, 90vw" />
            ))}
          </Slider>
        </div>
      )}
    </section>
  );
}
