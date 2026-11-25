"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/motion";

/**
 * Thin ember circuit trace between sections, echoing the lines in the logo.
 * Draws itself (stroke-dashoffset) as it scrolls through the viewport.
 */
export function CircuitDivider({ flip = false, className = "" }: { flip?: boolean; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const path = root.current?.querySelector<SVGPathElement>("[data-trace]");
      const nodes = root.current?.querySelectorAll("[data-node]");
      if (!path || !nodes) return;
      gsap.fromTo(
        path,
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top 90%", end: "bottom 45%", scrub: true } },
      );
      gsap.fromTo(
        nodes,
        { scale: 0, transformOrigin: "center" },
        { scale: 1, duration: 0.4, ease: "expo.out", stagger: 0.3, scrollTrigger: { trigger: root.current, start: "top 75%", once: true } },
      );
    },
    { scope: root, dependencies: [reduced] },
  );

  // 1000 × 60 viewBox, stretched to the container width; strokes stay 1px.
  const d = flip ? "M1000 10 H620 L580 50 H0" : "M0 10 H380 L420 50 H1000";
  return (
    <div ref={root} aria-hidden className={`container-x ${className}`}>
      <svg viewBox="0 0 1000 60" preserveAspectRatio="none" className="h-[60px] w-full overflow-visible">
        <path d={d} fill="none" stroke="#303030" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path
          data-trace
          d={d}
          fill="none"
          stroke="#FC5400"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={reduced ? 0 : undefined}
        />
      </svg>
      <div className="relative -mt-[60px] h-[60px]">
        <span data-node className={`absolute top-[6px] size-2 rounded-full bg-ember ${flip ? "right-0" : "left-0"}`} />
        <span data-node className={`absolute top-[46px] size-2 rounded-full bg-ember ${flip ? "left-0" : "right-0"}`} />
      </div>
    </div>
  );
}
