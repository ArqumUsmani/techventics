"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/motion";

const format = (n: number) => Math.round(n).toLocaleString("en-US");

/**
 * Number that counts up from 0 when it scrolls into view. Server HTML has the final
 * value (for no-JS and SEO); reduced motion keeps it static.
 */
export function CountUp({ value, suffix = "", className = "" }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced) return;
      const counter = { n: 0 };
      el.textContent = format(0);
      const tween = gsap.to(counter, {
        n: value,
        duration: 1.6,
        ease: "power3.out",
        paused: true,
        onUpdate: () => {
          el.textContent = format(counter.n);
        },
      });
      const st = ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => tween.play() });
      return () => {
        st.kill();
        tween.kill();
        el.textContent = format(value);
      };
    },
    { dependencies: [value, reduced] },
  );

  return (
    <span className={`tabular-nums ${className}`}>
      <span ref={ref}>{format(value)}</span>
      {suffix && <span className="text-ember">{suffix}</span>}
    </span>
  );
}
