"use client";

import { useRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/motion";

type SplitRevealProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children: ReactNode;
  /** Seconds before the reveal starts once in view. */
  delay?: number;
  /** ScrollTrigger start position. */
  start?: string;
};

/**
 * Headline that slides up line by line from a mask when it scrolls into view.
 * Lines re-split on resize/font load. Hidden before JS runs only via the `.js`
 * class (with a CSS fallback that shows it after 3s), so text is never lost.
 */
export function SplitReveal({ as: Tag = "h2", children, delay = 0, start = "top 85%", ...rest }: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (reduced) {
        el.dataset.splitReady = "";
        return;
      }
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          el.dataset.splitReady = "";
          return gsap.from(self.lines, {
            yPercent: 110,
            duration: 0.6,
            ease: "expo.out",
            stagger: 0.04,
            delay,
            scrollTrigger: { trigger: el, start, once: true },
          });
        },
      });
      return () => split.revert();
    },
    { dependencies: [reduced] },
  );

  return (
    <Tag ref={ref} data-split="" {...rest}>
      {children}
    </Tag>
  );
}
