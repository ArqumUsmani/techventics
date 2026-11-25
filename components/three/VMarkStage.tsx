"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import { useGpuTier, type Tier } from "./useGpuTier";

// The three.js bundle is only downloaded when a live scene will actually render.
const VMarkScene = dynamic(() => import("./VMarkScene"), { ssr: false });

export const VMARK_FALLBACK = "/images/vmark-fallback.webp";

type VMarkStageProps = {
  progressRef?: RefObject<number>;
  /** Force a tier (testing / lab). Otherwise detected per device. */
  tier?: Tier;
  lean?: boolean;
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
export function VMarkStage({ progressRef, tier: forcedTier, lean = true, priority = false, className = "", onStatus }: VMarkStageProps) {
  const detected = useGpuTier();
  const tier = forcedTier ?? detected;
  const live = tier === "high" || tier === "low";

  const root = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(true);

  // Mount the canvas when the main thread is idle, so it never competes with first paint.
  useEffect(() => {
    if (!live) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setMounted(true), { timeout: 1200 });
      return () => window.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setMounted(true), 300);
    return () => window.clearTimeout(id);
  }, [live]);

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
      <Image
        src={VMARK_FALLBACK}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className={`object-cover transition-opacity duration-600 ease-out-cubic ${showCanvas && ready ? "opacity-0" : "opacity-100"}`}
      />
      {showCanvas && (
        <div className={`absolute inset-0 transition-opacity duration-600 ease-out-cubic ${ready ? "opacity-100" : "opacity-0"}`}>
          <VMarkScene key={tier} quality={tier} progressRef={progressRef} lean={lean} paused={!inView} onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
