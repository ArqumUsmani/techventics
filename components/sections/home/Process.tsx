"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { home } from "@/content/home";
import { processSteps } from "@/content/process";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/motion";

type Geometry = { d: string; stops: number[]; total: number };

type Pt = { x: number; y: number };

/**
 * Builds an orthogonal circuit trace through the node centres, with 45° chamfers
 * where it steps down, plus a tail running off to the edge. Returns the path and the
 * distance along it at which each node sits (to light nodes as the trace reaches them).
 */
function buildTrace(points: Pt[], width: number, height: number, horizontal: boolean): Geometry {
  const cmds: string[] = [`M${points[0].x} ${points[0].y}`];
  const stops = [0];
  let total = 0;
  let cur = points[0];
  const lineTo = (p: Pt) => {
    total += Math.hypot(p.x - cur.x, p.y - cur.y);
    cmds.push(`L${p.x} ${p.y}`);
    cur = p;
  };

  for (let i = 1; i < points.length; i++) {
    const b = points[i];
    const dx = b.x - cur.x;
    const dy = b.y - cur.y;
    if (Math.abs(dy) < 1 || Math.abs(dx) < 1) {
      lineTo(b);
    } else {
      const c = Math.min(Math.abs(dy), Math.abs(dx) * 0.5);
      lineTo({ x: b.x - Math.sign(dx) * c, y: cur.y });
      lineTo({ x: b.x, y: cur.y + Math.sign(dy) * c });
      if (Math.abs(b.y - cur.y) > 0.5) lineTo(b);
    }
    stops.push(total);
  }

  const last = points[points.length - 1];
  lineTo(horizontal ? { x: width, y: last.y } : { x: last.x, y: height });
  return { d: cmds.join(" "), stops, total };
}

export function Process() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLOListElement>(null);
  const [geo, setGeo] = useState<Geometry | null>(null);
  const reduced = useReducedMotion();

  // Measure node positions and rebuild the trace whenever the layout changes.
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => {
      const box = el.getBoundingClientRect();
      const pts = Array.from(el.querySelectorAll<HTMLElement>("[data-node]")).map((n) => {
        const r = n.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2 - box.left), y: Math.round(r.top + r.height / 2 - box.top) };
      });
      if (pts.length < 2) return;
      const horizontal = pts[1].x - pts[0].x > 20;
      setGeo(buildTrace(pts, Math.round(box.width), Math.round(box.height), horizontal));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      if (!geo) return;
      const trace = root.current?.querySelector<SVGPathElement>("[data-trace]");
      const nodes = gsap.utils.toArray<HTMLElement>("[data-node]");
      if (!trace) return;

      const light = (drawn: number) => nodes.forEach((n, i) => n.toggleAttribute("data-lit", drawn >= geo.stops[i] - 1));

      if (reduced) {
        gsap.set(trace, { strokeDasharray: geo.total, strokeDashoffset: 0 });
        light(geo.total);
        return;
      }
      gsap.fromTo(
        trace,
        { strokeDasharray: geo.total, strokeDashoffset: geo.total },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: stage.current,
            start: "top 85%",
            end: "bottom 45%",
            scrub: true,
            onUpdate: (self) => light(self.progress * geo.total),
          },
        },
      );
      light(0);
      ScrollTrigger.refresh();
    },
    { scope: root, dependencies: [geo, reduced], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="process" aria-labelledby="process-title" className="relative overflow-x-clip bg-ink py-24 md:py-32">
      <div className="container-x">
        <SectionHeader id="process-title" index="06" eyebrow={home.process.eyebrow} big={home.process.big} title={home.process.title} />

        <ol ref={stage} className="relative mt-16 grid gap-14 md:mt-24 lg:grid-cols-4 lg:gap-8 lg:pb-16">
          {geo && (
            <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
              <path d={geo.d} fill="none" stroke="#303030" strokeWidth="1" />
              <path data-trace d={geo.d} fill="none" stroke="#FC5400" strokeWidth="1.5" />
            </svg>
          )}
          {processSteps.map((step, i) => (
            <li
              key={step.number}
              style={{ "--i": i } as CSSProperties}
              className="relative pl-10 lg:mt-[calc(var(--i)*4rem)] lg:pl-0 lg:pr-6"
            >
              <span
                data-node
                aria-hidden
                className="absolute left-0 top-1.5 block size-3.5 rounded-full border border-steel bg-ink transition-[background-color,border-color,box-shadow] duration-400 data-lit:border-ember data-lit:bg-ember data-lit:shadow-[0_0_0_5px_rgba(252,84,0,0.16)] lg:static"
              />
              <p className="label text-ember lg:mt-8">{step.number}</p>
              <h3 className="mt-3 text-h3 text-bone">{step.title}</h3>
              <p className="mt-3 max-w-[30ch] text-small text-ash">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
