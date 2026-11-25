"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useFinePointer, useReducedMotion } from "@/lib/motion";

type MagneticProps = {
  children: ReactNode;
  /** Share of the pointer offset the element follows (0–1). */
  strength?: number;
  /** Pull starts this many px outside the element's edge. */
  radius?: number;
  /** Maximum travel in px. */
  max?: number;
  className?: string;
};

/**
 * Pulls its child toward the pointer while the pointer is within `radius` px of it,
 * and eases back when it leaves. Measures an unmoved outer box, so the pull never
 * feeds back on itself. Off on touch devices and with reduced motion.
 */
export function Magnetic({ children, strength = 0.25, radius = 80, max = 16, className = "" }: MagneticProps) {
  const outer = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!fine || reduced || !outer.current || !inner.current) return;
    const box = outer.current;
    const node = inner.current;
    const xTo = gsap.quickTo(node, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(node, "y", { duration: 0.5, ease: "power3.out" });
    let pulled = false;

    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const near = Math.abs(dx) < r.width / 2 + radius && Math.abs(dy) < r.height / 2 + radius;
      if (near) {
        xTo(gsap.utils.clamp(-max, max, dx * strength));
        yTo(gsap.utils.clamp(-max, max, dy * strength));
        pulled = true;
      } else if (pulled) {
        xTo(0);
        yTo(0);
        pulled = false;
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      gsap.set(node, { x: 0, y: 0 });
    };
  }, [fine, reduced, strength, radius, max]);

  return (
    <span ref={outer} className={`inline-block ${className}`}>
      <span ref={inner} className="inline-block will-change-transform">
        {children}
      </span>
    </span>
  );
}
