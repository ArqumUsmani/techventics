"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Horizontal slider for any number of slides. Native scroll-snap (swipe and
 * trackpad work as normal), plus prev/next buttons, a counter and a progress line.
 * One slide renders on its own without controls; more slides show the next one
 * peeking in on wide screens.
 */
export function Slider({ children, label, className = "" }: { children: ReactNode; label: string; className?: string }) {
  const slides = Children.toArray(children);
  const count = slides.length;
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const onScroll = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const p = max > 0 ? el.scrollLeft / max : 0;
    setProgress(p);
    // Nearest slide to the left edge (the last one counts once we hit the end).
    const items = Array.from(el.children) as HTMLElement[];
    let nearest = 0;
    items.forEach((item, i) => {
      if (Math.abs(item.offsetLeft - el.scrollLeft) < Math.abs(items[nearest].offsetLeft - el.scrollLeft)) nearest = i;
    });
    setIndex(p > 0.995 ? count - 1 : nearest);
  }, [count]);

  useEffect(() => {
    onScroll();
  }, [onScroll]);

  const go = (to: number) => {
    const el = track.current;
    const target = el?.children[Math.max(0, Math.min(count - 1, to))] as HTMLElement | undefined;
    if (!el || !target) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: target.offsetLeft, behavior: reduced ? "auto" : "smooth" });
  };

  if (count <= 1) return <div className={className}>{slides}</div>;

  const pad = (n: number) => String(n).padStart(2, "0");
  const button =
    "grid size-11 place-items-center rounded-full border border-steel text-bone transition-colors duration-400 hover:border-ember hover:text-ember disabled:pointer-events-none disabled:opacity-30";

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className={className}>
      <div
        ref={track}
        onScroll={onScroll}
        tabIndex={0}
        className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain [scrollbar-width:none] focus-visible:outline-offset-4 [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className="w-[88%] shrink-0 snap-start md:w-[82%]"
          >
            {slide}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-6">
        <p className="label shrink-0 text-ash" aria-live="polite">
          <span className="text-bone">{pad(index + 1)}</span> / {pad(count)}
        </p>
        <div className="h-px flex-1 bg-steel">
          <div className="h-px origin-left bg-ember" style={{ transform: `scaleX(${Math.max(1 / count, progress)})` }} />
        </div>
        <div className="flex shrink-0 gap-3">
          <button type="button" className={button} onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous slide">
            <span aria-hidden>←</span>
          </button>
          <button type="button" className={button} onClick={() => go(index + 1)} disabled={index === count - 1} aria-label="Next slide">
            <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
