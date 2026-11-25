"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type PointerEvent, type ReactNode } from "react";
import type { Project } from "@/content/types";
import { services } from "@/content/services";
import { useFinePointer, useReducedMotion } from "@/lib/motion";
import { PlaceholderArt } from "./PlaceholderArt";

const MAX_TILT = 5; // degrees

type WorkCardProps = {
  project: Project;
  index: number;
  /** Tailwind aspect class for the media, e.g. "aspect-[4/5]". */
  aspect: string;
  className?: string;
  sizes?: string;
};

/**
 * Case card: tilts slightly toward the cursor and plays a muted preview on hover
 * (fine pointers only, never with reduced motion). `data-cursor="view"` lets the
 * custom cursor grow into a "View" label over it.
 */
export function WorkCard({ project, index, aspect, className = "", sizes = "(min-width: 768px) 50vw, 100vw" }: WorkCardProps) {
  const card = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const interactive = fine && !reduced;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive || !card.current) return;
    const r = card.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.current.style.transform = `perspective(1100px) rotateX(${(-y * MAX_TILT).toFixed(2)}deg) rotateY(${(x * MAX_TILT).toFixed(2)}deg)`;
  };
  const onEnter = () => {
    if (interactive) video.current?.play().catch(() => {});
  };
  const onLeave = () => {
    if (card.current) card.current.style.transform = "";
    if (video.current) {
      video.current.pause();
      video.current.currentTime = 0;
    }
  };

  const serviceNames = project.services.map((id) => services.find((s) => s.id === id)?.title).filter(Boolean);

  return (
    <article className={className}>
      <CardLink href={project.href}>
        <div
          ref={card}
          onPointerMove={onMove}
          onPointerEnter={onEnter}
          onPointerLeave={onLeave}
          className={`relative overflow-hidden border border-steel transition-transform duration-500 ease-out-cubic will-change-transform ${aspect}`}
        >
          {project.image ? (
            <Image src={project.image} alt={`${project.title} for ${project.client}`} fill sizes={sizes} className="object-cover" />
          ) : (
            <PlaceholderArt index={index} label={project.client} />
          )}
          {project.previewSrc && interactive && (
            <video
              ref={video}
              src={project.previewSrc}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-400 group-hover:opacity-100"
            />
          )}
        </div>

        <div className="mt-5 flex items-start justify-between gap-6">
          <div>
            <h3 className="text-h4 text-bone transition-colors duration-400 group-hover:text-ember">{project.title}</h3>
            <p className="mt-2 text-small text-ash">{project.summary}</p>
          </div>
          <p className="label shrink-0 text-right text-ash">
            {project.year}
            <br />
            <span className="text-bone/80">{serviceNames.join(" · ")}</span>
          </p>
        </div>
      </CardLink>
    </article>
  );
}

function CardLink({ href, children }: { href: string | null; children: ReactNode }) {
  return href ? (
    <Link href={href} className="group block" data-cursor="view">
      {children}
    </Link>
  ) : (
    <div className="group block" data-cursor="view">
      {children}
    </div>
  );
}
