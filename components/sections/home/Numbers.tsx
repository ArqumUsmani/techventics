import { CountUp } from "@/components/motion/CountUp";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { home } from "@/content/home";
import { stats } from "@/content/stats";

/** Key numbers, counting up in JetBrains Mono. Values live in content/stats.ts. */
export function Numbers() {
  return (
    <section id="numbers" aria-labelledby="numbers-label" className="relative bg-ink py-20 md:py-28">
      <div className="container-x">
        <Eyebrow index="05">
          <span id="numbers-label">{home.numbers.eyebrow}</span>
        </Eyebrow>
        <dl className="mt-12 grid grid-cols-1 border-t border-steel sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col-reverse gap-4 border-b border-steel py-10 sm:px-6 lg:border-b-0 ${
                i % 2 === 1 ? "sm:border-l" : ""
              } ${i > 0 ? "lg:border-l" : "lg:pl-0"}`}
            >
              <dt className="label text-ash">{stat.label}</dt>
              <dd className="font-mono text-[clamp(2.5rem,1.6rem+2vw,3.5rem)] font-medium leading-none tracking-[-0.04em] text-bone">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
