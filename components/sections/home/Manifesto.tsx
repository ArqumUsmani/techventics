"use client";

import { useRef } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { home } from "@/content/home";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/motion";

const BONE = "#F6F1EA";
const EMBER = "#FC5400";

type ManifestoProps = {
  /** Defaults to the Home manifesto. */
  eyebrow?: string;
  text?: string;
  index?: string;
  id?: string;
};

/** One oversized sentence that lights up word by word (ash → bone) as you scroll. */
export function Manifesto({ eyebrow = home.manifesto.eyebrow, text = home.manifesto.text, index = "02", id = "manifesto" }: ManifestoProps) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const words = text.split(" ").map((raw) => {
    const accent = raw.startsWith("*");
    return { text: raw.replace(/\*/g, ""), accent };
  });

  useGSAP(
    () => {
      const els = gsap.utils.toArray<HTMLElement>("[data-word]");
      if (reduced) {
        els.forEach((el) => (el.style.color = el.hasAttribute("data-accent") ? EMBER : BONE));
        return;
      }
      const tl = gsap.timeline({
        scrollTrigger: { trigger: "[data-manifesto]", start: "top 78%", end: "bottom 45%", scrub: true },
      });
      els.forEach((el, i) => {
        tl.to(el, { color: el.hasAttribute("data-accent") ? EMBER : BONE, duration: 1, ease: "none" }, i * 0.6);
      });
    },
    { scope: root, dependencies: [reduced, text] },
  );

  return (
    <section ref={root} id={id} aria-labelledby={`${id}-label`} className="relative bg-ink py-32 md:py-48">
      <div className="container-x">
        <Eyebrow index={index} as="h2" id={`${id}-label`}>
          {eyebrow}
        </Eyebrow>
        <p data-manifesto className="mt-10 font-display text-h2 font-medium leading-[1.04] text-ash">
          {words.map((w, i) => (
            <span key={i} data-word data-accent={w.accent ? "" : undefined}>
              {w.text}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
