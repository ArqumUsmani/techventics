"use client";

import Link from "next/link";
import { useRef } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { home } from "@/content/home";
import { services } from "@/content/services";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/motion";

/**
 * Four tall service panels. Desktop with motion: pinned, scrolling sideways as you
 * scroll down. Mobile or reduced motion: a plain stack / grid.
 */
export function ServicesTrack() {
  const root = useRef<HTMLElement>(null);
  const pinArea = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const horizontal = useMediaQuery("(min-width: 62rem) and (min-height: 54rem) and (prefers-reduced-motion: no-preference)");

  useGSAP(
    () => {
      if (!horizontal || !track.current || !pinArea.current) return;
      const distance = () => Math.max(0, track.current!.scrollWidth - window.innerWidth);
      gsap.to(track.current, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pinArea.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      gsap.fromTo(
        "[data-track-progress]",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: pinArea.current, start: "top top", end: () => `+=${distance()}`, scrub: true, invalidateOnRefresh: true },
        },
      );
    },
    { scope: root, dependencies: [horizontal], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="services" aria-labelledby="services-title" className="relative overflow-x-clip bg-ink pt-24 md:pt-32">
      <div className="container-x">
        <SectionHeader id="services-title" index="03" eyebrow={home.services.eyebrow} big={home.services.big} title={home.services.title} />
      </div>

      <div ref={pinArea} className={horizontal ? "flex h-screen flex-col justify-center-safe pb-8 pt-[calc(var(--spacing-header-compact)+2rem)]" : "py-16 md:py-24"}>
        <div
          ref={track}
          className={
            horizontal
              ? "flex w-max gap-6 pl-[max(1.25rem,calc((100vw-72.75rem)/2+0.75rem))] pr-[max(1.25rem,calc((100vw-72.75rem)/2+0.75rem))]"
              : "container-x grid gap-6 md:grid-cols-2"
          }
        >
          {services.map((s) => (
            <article
              key={s.id}
              className={`group relative flex flex-col border border-steel bg-graphite p-7 transition-colors duration-400 hover:border-ember/60 md:p-9 ${
                horizontal ? "w-[min(28rem,36vw)] shrink-0" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="label text-ember">{s.number}</span>
                <span className="label text-ash">Service</span>
              </div>

              {s.images?.[0] && (
                // The whole image, never cropped: it fits inside a frame that is the same size on every card,
                // and a blurred copy of itself fills any space left at the sides.
                <div className="relative mt-6 aspect-[16/10] w-full shrink-0 overflow-hidden border border-steel bg-ink [@media(max-height:60rem)]:aspect-[2/1]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.images[0].srcSmall}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-xl"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.images[0].src}
                    srcSet={`${s.images[0].srcSmall} 800w, ${s.images[0].src} ${s.images[0].width}w`}
                    sizes="(min-width: 62rem) and (min-height: 54rem) 28rem, (min-width: 48rem) 50vw, 100vw"
                    alt={s.images[0].alt}
                    width={s.images[0].width}
                    height={s.images[0].height}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-contain transition-transform duration-600 ease-out-expo group-hover:scale-[1.03]"
                  />
                </div>
              )}

              <div className={`flex flex-1 flex-col ${s.images?.[0] ? "mt-6" : "mt-16"}`}>
                <h3 className="text-h3 text-bone">{s.title}</h3>
                <p className="mt-4 max-w-[34ch] text-small text-ash">{s.summary}</p>
                <ul className="mt-8 flex flex-wrap gap-2 [@media(max-height:60rem)]:mt-6" aria-label={`${s.title} deliverables`}>
                  {s.tags.map((tag) => (
                    <li key={tag} className="label border border-steel px-3 py-1.5 text-bone/80">
                      {tag}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/services#${s.id}`}
                  className="label mt-auto inline-flex items-center gap-3 self-start pt-10 [@media(max-height:60rem)]:pt-7 text-bone transition-colors duration-400 hover:text-ember"
                >
                  <span className="border-b border-bone/40 pb-1 transition-colors duration-400 group-hover:border-ember">
                    Explore<span className="sr-only"> {s.title}</span>
                  </span>
                  <span aria-hidden className="transition-transform duration-400 ease-out-expo group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {horizontal && (
          <div className="container-x mt-10">
            <div className="h-px w-full bg-steel">
              <div data-track-progress className="h-px origin-left bg-ember" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
