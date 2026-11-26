"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { HeroBackdrop } from "@/components/motion/HeroBackdrop";
import { useGpuTier } from "@/components/three/useGpuTier";
import { HERO_FOCUS_Y, VMarkStage } from "@/components/three/VMarkStage";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/motion";
import { SPLASH_DONE, flickerElement, splashFinished } from "@/lib/tube";

const WORD = [
  { text: "TECH", tone: "text-bone" },
  { text: "VENTICS", tone: "text-ember" },
];

/**
 * Home hero, laid out like the reference: full viewport (min 900px), the mark large
 * and centred, the spaced wordmark just below the fold. The live 3D mark replaces
 * the reference's background photo.
 *
 * The 3D layer is sticky across the hero AND the section passed as `children`, so
 * scrolling flies the camera through the V's opening and into that section.
 */
export function Hero({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const tier = useGpuTier();
  const reduced = useReducedMotion();
  const live = tier === "high" || tier === "low";
  const tube = useRef<HTMLDivElement>(null);

  // The mark switches on like a fluorescent tube: after the splash lifts, or straight
  // away when the splash was skipped this session.
  useEffect(() => {
    const el = tube.current;
    if (!el) return;
    if (reduced) {
      el.style.opacity = "1";
      return;
    }
    const strike = () => flickerElement(el, undefined, 0.12);
    if (splashFinished()) {
      strike();
      return;
    }
    window.addEventListener(SPLASH_DONE, strike, { once: true });
    return () => window.removeEventListener(SPLASH_DONE, strike);
  }, [reduced]);

  // Wordmark letters slide up from a mask.
  useGSAP(
    () => {
      const chars = gsap.utils.toArray<HTMLElement>("[data-split-char]");
      // y: 0 clears the px offset GSAP would otherwise read from the CSS start state.
      if (reduced) {
        gsap.set(chars, { y: 0, yPercent: 0 });
      } else {
        gsap.fromTo(chars, { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 0.6, ease: "expo.out", stagger: 0.035, delay: 0.2 });
      }
    },
    { scope, dependencies: [reduced] },
  );

  // Scroll drives the camera fly-through (live 3D only).
  useGSAP(
    () => {
      if (!live || reduced) {
        progressRef.current = 0;
        return;
      }
      ScrollTrigger.create({
        trigger: hero.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });
    },
    { scope, dependencies: [live, reduced], revertOnUpdate: true },
  );

  return (
    <div ref={scope} className="relative">
      {/* 3D layer. Live: sticky behind hero + next section. Static: just behind the hero. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className={live ? "sticky top-0 h-[100lvh]" : "relative h-[100svh]"}>
          <div ref={tube} data-tube className="absolute inset-0 bg-ink">
            <VMarkStage
              className="h-full w-full"
              tier={tier ?? "static"}
              focusY={HERO_FOCUS_Y}
              progressRef={progressRef}
              priority
            />
          </div>
          {/* Interactive background over the mark: circuit board by default, others via ?hero= */}
          {/* Masked clear around the mark so the background never tints the logo. */}
          <HeroBackdrop
            progressRef={progressRef}
            className="absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_44%_19%_at_50%_54%,transparent_62%,black_112%)] md:[mask-image:radial-gradient(ellipse_27%_40%_at_50%_54%,transparent_62%,black_112%)]"
          />
        </div>
      </div>

      <section ref={hero} data-hero aria-label="Introduction" className="relative min-h-[max(100svh,900px)]">
        <h1 className="absolute inset-x-0 bottom-[12%] text-center">
          <span className="sr-only">Techventics: IT hardware, development, brand and design</span>
          <span
            aria-hidden
            className="inline-flex font-display text-[clamp(1.5rem,3.1vw,3.25rem)] font-medium uppercase leading-none tracking-[0.38em] [margin-right:-0.38em] [text-shadow:0_0_18px_rgba(11,11,11,0.95),0_0_4px_rgba(11,11,11,0.9)]"
          >
            {WORD.map((part) => (
              <span key={part.text} className={`inline-flex ${part.tone}`}>
                {part.text.split("").map((ch, i) => (
                  <span key={i} className="inline-block overflow-hidden pb-[0.08em]">
                    <span data-split-char className="inline-block">
                      {ch}
                    </span>
                  </span>
                ))}
              </span>
            ))}
          </span>
        </h1>
      </section>

      {children}
    </div>
  );
}
