"use client";

import { useEffect, useRef } from "react";

/**
 * Site-wide background behind every page, in the hero's language:
 * - a faint dot grid, like a circuit board's pads;
 * - an ember "spotlight" that lights the grid around the cursor;
 * - two very soft ember glows drifting slowly;
 * - a fine grain so large dark areas don't look flat.
 * Fixed behind the content, no pointer events. Mostly CSS (see .site-backdrop in
 * globals.css); this only feeds the cursor position, at most once per frame.
 */
export function SiteBackdrop() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      raf = 0;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      el.dataset.pointer = "on";
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      el.dataset.pointer = "off";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={root} aria-hidden className="site-backdrop">
      <div className="site-backdrop__glow site-backdrop__glow--a" />
      <div className="site-backdrop__glow site-backdrop__glow--b" />
      <div className="site-backdrop__grid" />
      <div className="site-backdrop__lit" />
      <div className="site-backdrop__grain" />
    </div>
  );
}
