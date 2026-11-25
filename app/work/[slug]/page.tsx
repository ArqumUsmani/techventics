import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircuitDivider } from "@/components/motion/CircuitDivider";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { PageHero } from "@/components/layout/PageHero";
import { ClosingCta } from "@/components/sections/home/ClosingCta";
import { ImageSlider } from "@/components/ui/ImageSlider";
import { projects } from "@/content/projects";
import { services } from "@/content/services";

type Params = { slug: string };

// One static page per project; anything else is a 404.
export const dynamicParams = false;
export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.id === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${project.id}` },
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.id === slug);
  if (index < 0) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const projectServices = project.services.map((id) => services.find((s) => s.id === id)).filter((s) => s !== undefined);

  const meta = [
    { label: "Client", value: project.client },
    { label: "Year", value: project.year },
  ];

  return (
    <>
      <PageHero eyebrow={`Case study · ${project.year}`} title={project.title}>
        <p className="measure text-lead text-ash">{project.summary}</p>
      </PageHero>

      {/* Meta row */}
      <section aria-label="Project details" className="bg-ink">
        <div className="container-x">
          <dl className="grid grid-cols-2 gap-8 border-y border-steel py-8 md:grid-cols-4">
            {meta.map((m) => (
              <div key={m.label}>
                <dt className="label text-ash">{m.label}</dt>
                <dd className="mt-3 text-bone">{m.value}</dd>
              </div>
            ))}
            <div className="col-span-2">
              <dt className="label text-ash">Services</dt>
              <dd className="mt-3 flex flex-wrap gap-2">
                {projectServices.map((s) => (
                  <Link
                    key={s.id}
                    href={`/services#${s.id}`}
                    className="label border border-steel px-3 py-1.5 text-bone/80 transition-colors duration-400 hover:border-ember hover:text-ember"
                  >
                    {s.title}
                  </Link>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Images: one shows on its own, more become a slider */}
      <section aria-label="Project images" className="bg-ink pt-12 md:pt-16">
        <div className="container-x">
          <ImageSlider
            images={project.gallery}
            label={`${project.title} images`}
            sizes="(min-width: 72.75rem) 72.75rem, 100vw"
            className="aspect-[16/10] w-full border border-steel md:aspect-[21/9]"
          />
        </div>
      </section>

      {/* Story */}
      <section aria-label="The project" className="bg-ink py-24 md:py-32">
        <div className="container-x space-y-20 md:space-y-28">
          <StoryBlock number="01" heading="Overview">
            <p className="text-lead text-bone">{project.overview}</p>
          </StoryBlock>

          <StoryBlock number="02" heading="The challenge">
            <p className="text-lead text-ash">{project.challenge}</p>
          </StoryBlock>

          <StoryBlock number="03" heading="What we did">
            <ol className="border-t border-steel">
              {project.approach.map((step, i) => (
                <li key={step} className="flex gap-6 border-b border-steel py-5">
                  <span className="label shrink-0 pt-1 text-ember">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-bone">{step}</span>
                </li>
              ))}
            </ol>
          </StoryBlock>

          <StoryBlock number="04" heading="The outcome">
            <p className="text-lead text-ash">{project.outcome}</p>
            {project.results.length > 0 && (
              <dl className="mt-12 grid gap-px border border-steel bg-steel sm:grid-cols-3">
                {project.results.map((r) => (
                  <div key={r.label} className="bg-ink p-6 md:p-8">
                    <dt className="sr-only">{r.label}</dt>
                    <dd>
                      <span className="block font-display text-h2 text-ember">{r.value}</span>
                      <span className="mt-3 block text-small text-ash">{r.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </StoryBlock>
        </div>
      </section>

      <CircuitDivider />

      {/* Next project */}
      {next.id !== project.id && (
        <section aria-label="Next project" className="bg-ink py-24 md:py-32">
          <div className="container-x">
            <Link href={`/work/${next.id}`} className="group block" data-cursor="view">
              <p className="label text-ash">Next project</p>
              <SplitReveal as="p" className="mt-6 text-h1 text-bone transition-colors duration-400 group-hover:text-ember">
                {next.title}
              </SplitReveal>
              <p className="label mt-8 inline-flex items-center gap-3 text-bone">
                <span className="border-b border-bone/40 pb-1 transition-colors duration-400 group-hover:border-ember">View project</span>
                <span aria-hidden className="transition-transform duration-400 ease-out-expo group-hover:translate-x-1">
                  →
                </span>
              </p>
            </Link>
          </div>
        </section>
      )}

      <ClosingCta index="05" />
    </>
  );
}

function StoryBlock({ number, heading, children }: { number: string; heading: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      <h2 className="flex items-baseline gap-4 lg:col-span-4">
        <span className="label text-ember">{number}</span>
        <span className="text-h4 text-bone">{heading}</span>
      </h2>
      <div className="min-w-0 lg:col-span-8">{children}</div>
    </div>
  );
}
