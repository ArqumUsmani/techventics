"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/motion";

const LenisContext = createContext<Lenis | null>(null);

/** The active Lenis instance, or null when smooth scroll is off (reduced motion / SSR). */
export function useLenis() {
  return useContext(LenisContext);
}

/**
 * Smooth scroll with Lenis, driven by GSAP's ticker so ScrollTrigger and Lenis
 * stay frame-locked. Disabled entirely under prefers-reduced-motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();
  const firstPath = useRef(true);

  useEffect(() => {
    if (reduced) return;

    const instance = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      smoothWheel: true,
      anchors: { offset: -64 },
      autoRaf: false,
    });

    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, [reduced]);

  // Route change: jump to top (Lenis keeps its own target position otherwise).
  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    lenis?.scrollTo(0, { immediate: true, force: true });
    ScrollTrigger.refresh();
  }, [pathname, lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
