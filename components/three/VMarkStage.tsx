"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type RefObject } from "react";
import { LOGO_FILES } from "@/components/brand/logoFiles";
import { useGpuTier, type Tier } from "./useGpuTier";

// The three.js bundle is only downloaded when a live scene will actually render.
const VMarkScene = dynamic(() => import("./VMarkScene"), { ssr: false });

export const VMARK_FALLBACK = "/images/vmark-fallback.webp";
const VMARK_FALLBACK_SMALL = "/images/vmark-fallback-960.webp";

/** Where the mark sits in the home hero (fraction of height from the top), matched to the reference. */
export const HERO_FOCUS_Y = 0.54;

type VMarkStageProps = {
  progressRef?: RefObject<number>;
  /** Force a tier (testing / lab). Otherwise detected per device. */
  tier?: Tier;
  /** Cursor lean, hole and particles. */
  interactive?: boolean;
  /** Mark centre as a fraction of the stage height (0.5 = centred). */
  focusY?: number;
  /** Load the fallback image eagerly (it is the hero's first paint). */
  priority?: boolean;
  className?: string;
  /** Reports the tier in use and when the live scene has drawn its first frame. */
  onStatus?: (status: { tier: Tier | null; live: boolean }) => void;
};

/**
 * Hero backdrop. Shows the static render first (instant, no layout shift), then
 * mounts the WebGL scene when the browser is idle and fades it in over the image.
 * Reduced motion, weak GPUs and no-WebGL devices keep the image.
 */
export function VMarkStage({
  progressRef,
  tier: forcedTier,
  interactive = true,
  focusY = 0.5,
  priority = false,
  className = "",
  onStatus,
}: VMarkStageProps) {
  const detected = useGpuTier();
  const tier = forcedTier ?? detected;
  const live = tier === "high" || tier === "low";

  const root = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(true);
  const glow = useRef<HTMLDivElement>(null);

  // Mount the canvas when the main thread is idle, so it never competes with first paint.
  // Low tier (phones, modest laptops): wait for the first interaction or 4s, so the
  // three.js download and parse never lands inside the initial load.
  useEffect(() => {
    if (!live) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number | undefined;
    let timer: number | undefined;
    let done = false;
    const mount = () => {
      if (done) return;
      done = true;
      cleanupTriggers();
      if (w.requestIdleCallback) idleId = w.requestIdleCallback(() => setMounted(true), { timeout: 1200 });
      else timer = window.setTimeout(() => setMounted(true), 300);
    };
    const events = ["pointerdown", "touchstart", "keydown", "wheel", "scroll"] as const;
    const cleanupTriggers = () => events.forEach((e) => window.removeEventListener(e, mount));

    let delay: number | undefined;
    if (tier === "low") {
      events.forEach((e) => window.addEventListener(e, mount, { once: true, passive: true }));
      delay = window.setTimeout(mount, 4000);
    } else {
      mount();
    }
    return () => {
      cleanupTriggers();
      window.clearTimeout(delay);
      window.clearTimeout(timer);
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
    };
  }, [live, tier]);

  // Pause rendering while off screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    onStatus?.({ tier, live: live && ready });
  }, [tier, live, ready, onStatus]);

  const showCanvas = live && mounted;

  return (
    <div ref={root} aria-hidden className={`relative overflow-hidden bg-ink ${className}`}>
      {/* Sized like the live camera frames the mark: full height on wide screens,
          ~78% of the width on narrow ones (the render is 1920×1200 on ink, so edges blend). */}
      {/* Plain <img> + srcset: static hosting has no image optimiser, so both sizes are pre-rendered. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={VMARK_FALLBACK}
        srcSet={`${VMARK_FALLBACK_SMALL} 960w, ${VMARK_FALLBACK} 1920w`}
        sizes="(max-width: 1023px) 150vw, 100vw"
        alt=""
        width={1920}
        height={1200}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className={`absolute left-1/2 top-1/2 h-[min(100%,93.75vw)] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 transition-opacity duration-600 ease-out-cubic ${
          showCanvas && ready ? "opacity-0" : "opacity-100"
        }`}
      />
      {showCanvas && (
        <div className={`absolute inset-0 transition-opacity duration-600 ease-out-cubic ${ready ? "opacity-100" : "opacity-0"}`}>
          <VMarkScene
            key={tier}
            quality={tier}
            progressRef={progressRef}
            interactive={interactive}
            focusY={focusY}
            paused={!inView}
            onReady={() => setReady(true)}
            glowRef={glow}
          />
          {/* Tube-light glow: the logo artwork blurred and screen-blended over the dots, like the splash.
              Placed and dimmed by the mark each frame (see VMark). */}
          <div ref={glow} aria-hidden className="pointer-events-none absolute left-0 top-0 opacity-0 mix-blend-screen will-change-transform">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_FILES.mark.srcOnDark} alt="" className="absolute inset-0 h-full w-full opacity-45 blur-[5px]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_FILES.mark.srcOnDark} alt="" className="absolute inset-[-6%] h-[112%] w-[112%] opacity-50 blur-[28px]" />
          </div>
        </div>
      )}
    </div>
  );
}
