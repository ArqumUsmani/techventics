"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/motion";

/**
 * Thin ember circuit trace between sections, echoing the lines in the logo.
 * Behaves like the Process timeline: the trace draws with the scroll (scrubbed both
 * ways) and each node lights up when the trace reaches it.
 */
export function CircuitDivider({ flip = false, className = "" }: { flip?: boolean; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const path = root.current?.querySelector<SVGPathElement>("[data-trace]");
      const [startNode, endNode] = gsap.utils.toArray<HTMLElement>("[data-node]");
      if (!path || !startNode || !endNode) return;

      const light = (progress: number) => {
        startNode.toggleAttribute("data-lit", progress > 0.01);
        endNode.toggleAttribute("data-lit", progress > 0.985);
      };

      if (reduced) {
        gsap.set(path, { strokeDashoffset: 0 });
        light(1);
        return;
      }
      light(0);
      gsap.fromTo(
        path,
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          ease: "none",
          // The dash runs 1 → 0 (pathLength 1): GSAP must not round it to whole pixels.
          autoRound: false,
          // A long range (about 60% of the viewport) so the drawing is visible as you scroll.
          scrollTrigger: { trigger: root.current, start: "top 92%", end: "top 32%", scrub: true, onUpdate: (self) => light(self.progress) },
        },
      );
    },
    { scope: root, dependencies: [reduced] },
  );

  // 1000 × 60 viewBox, stretched to the container width; strokes stay 1px.
  const d = flip ? "M1000 10 H620 L580 50 H0" : "M0 10 H380 L420 50 H1000";
  const node =
    "absolute block size-3 rounded-full border border-steel bg-ink transition-[background-color,border-color,box-shadow] duration-400 data-lit:border-ember data-lit:bg-ember data-lit:shadow-[0_0_0_5px_rgba(252,84,0,0.16)]";
  return (
    <div ref={root} aria-hidden className={`container-x ${className}`}>
      <div className="relative">
        <svg viewBox="0 0 1000 60" preserveAspectRatio="none" className="h-[60px] w-full overflow-visible">
          <path d={d} fill="none" stroke="#303030" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path
            data-trace
            d={d}
            fill="none"
            stroke="#FC5400"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1}
          />
        </svg>
        {/* Nodes sit centred on the two ends of the trace. */}
        <span data-node className={`${node} top-[4px] ${flip ? "-right-1.5" : "-left-1.5"}`} />
        <span data-node className={`${node} top-[44px] ${flip ? "-left-1.5" : "-right-1.5"}`} />
      </div>
    </div>
  );
}
