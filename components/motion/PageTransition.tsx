"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/motion";

/*
 * Route transition: a triangle sweeps left → right across the screen.
 * An ember layer leads and an ink layer follows, so the screen is covered in ink with a
 * thin ember edge (orange stays a "laser", not a flood). The new route renders under
 * the ink, then the triangle continues off to the right to reveal it.
 *
 * Clip-path triangles (percentages of the viewport; the base overshoots so the
 * corners are covered when the tip is at 200%):
 */
const START = "polygon(0% -100%, 0% 200%, 0% 50%)"; // collapsed on the left edge
const COVER = "polygon(0% -100%, 0% 200%, 200% 50%)"; // covers the viewport
const EXIT = "polygon(200% -100%, 200% 200%, 400% 50%)"; // gone off the right edge

const SAFETY_MS = 4000;

export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const ember = useRef<HTMLDivElement>(null);
  const ink = useRef<HTMLDivElement>(null);
  const phase = useRef<"idle" | "covering" | "covered" | "revealing">("idle");
  const safety = useRef<number | undefined>(undefined);

  const reveal = () => {
    if (phase.current !== "covered") return;
    phase.current = "revealing";
    window.clearTimeout(safety.current);
    gsap
      .timeline({
        onComplete: () => {
          gsap.set([ember.current, ink.current], { clipPath: START });
          if (root.current) root.current.style.pointerEvents = "none";
          phase.current = "idle";
        },
      })
      .to(ink.current, { clipPath: EXIT, duration: 0.6, ease: "power3.inOut" }, 0.05)
      .to(ember.current, { clipPath: EXIT, duration: 0.6, ease: "power3.inOut" }, 0.13);
  };

  // Intercept internal link clicks (capture phase, before Next's <Link> handler).
  useEffect(() => {
    if (reduced) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href) return;
      if ((a.target && a.target !== "_self") || a.hasAttribute("download") || a.dataset.noTransition !== undefined) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // same page / hash links: let them scroll

      e.preventDefault();
      if (phase.current !== "idle") return;
      phase.current = "covering";
      if (root.current) root.current.style.pointerEvents = "auto";
      const href = url.pathname + url.search + url.hash;

      gsap
        .timeline({
          onComplete: () => {
            phase.current = "covered";
            router.push(href, { scroll: false });
            // If the route never changes (error, same page), uncover anyway.
            safety.current = window.setTimeout(reveal, SAFETY_MS);
          },
        })
        .fromTo(ember.current, { clipPath: START }, { clipPath: COVER, duration: 0.55, ease: "power3.inOut" }, 0)
        .fromTo(ink.current, { clipPath: START }, { clipPath: COVER, duration: 0.55, ease: "power3.inOut" }, 0.08);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [reduced, router]);

  // New route committed: give it two frames to paint, then reveal.
  useEffect(() => {
    if (phase.current !== "covered") return;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(reveal);
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [pathname]);

  useEffect(() => () => window.clearTimeout(safety.current), []);

  if (reduced) return null;

  return (
    <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-[80]">
      <div ref={ember} className="absolute inset-0 bg-ember" style={{ clipPath: START }} />
      <div ref={ink} className="absolute inset-0 bg-ink" style={{ clipPath: START }} />
    </div>
  );
}
