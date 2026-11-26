import { SectionHeader } from "@/components/ui/SectionHeader";
import { WorkCard } from "@/components/ui/WorkCard";
import { home } from "@/content/home";
import { projects } from "@/content/projects";

// Asymmetric editorial grid: wide / tall / tall / wide, offset vertically.
const LAYOUT = [
  { className: "md:col-span-7", aspect: "aspect-[4/3]", sizes: "(min-width: 768px) 58vw, 100vw" },
  { className: "md:col-span-5 md:mt-40", aspect: "aspect-[4/5]", sizes: "(min-width: 768px) 42vw, 100vw" },
  { className: "md:col-span-5 md:-mt-16", aspect: "aspect-[4/5]", sizes: "(min-width: 768px) 42vw, 100vw" },
  { className: "md:col-span-6 md:col-start-7 md:mt-24", aspect: "aspect-[16/11]", sizes: "(min-width: 768px) 50vw, 100vw" },
];

export function SelectedWork() {
  return (
    <section id="work" aria-labelledby="work-title" className="relative overflow-x-clip py-24 md:py-32">
      <div className="container-x">
        <SectionHeader id="work-title" index="04" eyebrow={home.work.eyebrow} big={home.work.big} title={home.work.title} />

        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 md:mt-24 md:grid-cols-12">
          {projects.slice(0, 4).map((project, i) => (
            <WorkCard key={project.id} project={project} index={i} {...LAYOUT[i % LAYOUT.length]} />
          ))}
        </div>
      </div>
    </section>
  );
}
