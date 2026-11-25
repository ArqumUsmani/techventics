"use client";

import { useRef, useState, type PointerEvent } from "react";

type SlideImage = { src: string; srcSmall: string; alt: string; width: number; height: number };

/**
 * Crossfading image slider for any number of images, sized by its container
 * (give it an aspect class). Arrows and dots, plus swipe on touch screens; vertical
 * scrolling still passes through. A single image renders without controls.
 * A crossfade rather than a sideways track, so it works inside the home page's
 * horizontally scrolling services row.
 */
export function ImageSlider({ images, sizes, label, className = "" }: { images: SlideImage[]; sizes: string; label: string; className?: string }) {
  const [index, setIndex] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const count = images.length;
  const go = (to: number) => setIndex(((to % count) + count) % count);

  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") start.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - s.y)) go(index + (dx < 0 ? 1 : -1));
  };

  const control =
    "grid size-9 place-items-center rounded-full border border-bone/20 bg-ink/70 text-bone backdrop-blur-sm transition-colors duration-400 hover:border-ember hover:text-ember";

  return (
    <div
      role={count > 1 ? "region" : undefined}
      aria-roledescription={count > 1 ? "carousel" : undefined}
      aria-label={count > 1 ? label : undefined}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={() => (start.current = null)}
      className={`relative touch-pan-y overflow-hidden ${className}`}
    >
      {images.map((img, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={img.src}
          src={img.src}
          srcSet={`${img.srcSmall} 800w, ${img.src} ${img.width}w`}
          sizes={sizes}
          alt={img.alt}
          aria-hidden={i !== index}
          width={img.width}
          height={img.height}
          loading="lazy"
          decoding="async"
          draggable={false}
          className={`absolute inset-0 h-full w-full select-none object-cover transition-[opacity,transform] duration-600 ease-out-expo group-hover:scale-[1.03] ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {count > 1 && (
        <>
          <div className="absolute bottom-3 left-3 flex gap-1.5" aria-hidden>
            {images.map((img, i) => (
              <span
                key={img.src}
                className={`h-1 rounded-full transition-[width,background-color] duration-400 ${i === index ? "w-5 bg-ember" : "w-1.5 bg-bone/50"}`}
              />
            ))}
          </div>
          <div className="absolute bottom-2 right-2 flex gap-2">
            <button type="button" className={control} onClick={() => go(index - 1)} aria-label="Previous image">
              <span aria-hidden>←</span>
            </button>
            <button type="button" className={control} onClick={() => go(index + 1)} aria-label="Next image">
              <span aria-hidden>→</span>
            </button>
          </div>
          <p className="sr-only" aria-live="polite">
            Image {index + 1} of {count}
          </p>
        </>
      )}
    </div>
  );
}
