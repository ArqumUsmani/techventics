import { SplitReveal } from "@/components/motion/SplitReveal";
import { WorkCard } from "@/components/ui/WorkCard";
import { projects } from "@/content/projects";
import type { Service } from "@/content/types";

/** One service on the Services page: what we do, deliverables, tools and a related case. */
export function ServiceDetail({ service }: { service: Service }) {
  const projectIndex = projects.findIndex((p) => p.id === service.relatedProject);
  const project = projects[projectIndex];

  return (
    <section id={service.id} aria-labelledby={`${service.id}-title`} className="scroll-mt-24 border-t border-steel py-16 first:border-t-0 first:pt-0 md:py-24">
      <p className="label text-ember">{service.number}</p>
      <SplitReveal id={`${service.id}-title`} className="mt-4 text-h2 text-bone">
        {service.title}
      </SplitReveal>
      <p className="measure mt-6 text-lead text-ash">{service.description}</p>

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
      </div>

      {project && (
        <div className="mt-14">
          <h3 className="label text-ash">Related work</h3>
          <WorkCard project={project} index={projectIndex} aspect="aspect-[16/9]" className="mt-4" sizes="(min-width: 1024px) 58vw, 100vw" />
        </div>
      )}
    </section>
  );
}
