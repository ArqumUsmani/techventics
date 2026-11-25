"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Office } from "@/content/types";
import { useGpuTier, type Tier } from "./useGpuTier";

const GlobeScene = dynamic(() => import("./GlobeScene"), { ssr: false });

export const GLOBE_FALLBACK = "/images/globe-fallback.webp";

type GlobeStageProps = {
  offices: Office[];
  hubId: string;
  tier?: Tier;
  interactive?: boolean;
  className?: string;
  /** Load the fallback eagerly (only where the globe is the main image, e.g. the lab page). */
  priority?: boolean;
  onStatus?: (live: boolean) => void;
};

/**
 * Dotted globe with office pins and arcs. The 3D code loads only when the globe is
 * about to scroll into view; until then (and on static-tier devices) a pre-rendered
 * image of the same globe is shown in the same box, so nothing shifts.
 */
export function GlobeStage({ offices, hubId, tier: forced, interactive = true, className = "", priority = false, onStatus }: GlobeStageProps) {
  const detected = useGpuTier();
  const tier = forced ?? detected;
  const live = tier === "high" || tier === "low";
  const root = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLElement | null)[]>([]);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const nearIo = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "600px" });
    const viewIo = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "100px" });
    nearIo.observe(el);
    viewIo.observe(el);
    return () => {
      nearIo.disconnect();
      viewIo.disconnect();
    };
  }, []);

  useEffect(() => onStatus?.(live && ready), [live, ready, onStatus]);

  const showCanvas = live && near;
  const names = offices.map((o) => o.city).join(", ");

  return (
    <div
      ref={root}
      role="img"
      aria-label={`Globe showing Techventics offices in ${names}, connected from ${offices.find((o) => o.id === hubId)?.city ?? "head office"}.`}
      className={`relative aspect-square ${className}`}
    >
      <Image
        src={GLOBE_FALLBACK}
        alt=""
        fill
        sizes="(min-width: 1024px) 34rem, 90vw"
        priority={priority}
        className={`object-contain transition-opacity duration-600 ease-out-cubic ${showCanvas && ready ? "opacity-0" : "opacity-100"}`}
      />
      {showCanvas && (
        <div className={`absolute inset-0 transition-opacity duration-600 ease-out-cubic ${ready ? "opacity-100" : "opacity-0"}`}>
          <GlobeScene
            key={tier}
            offices={offices}
            hubId={hubId}
            quality={tier}
            interactive={interactive}
            paused={!inView}
            labelsRef={labels}
            onReady={() => setReady(true)}
          />
          {/* City labels: plain DOM over the canvas, positioned by the scene each frame. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {offices.map((o, i) => (
              <div
                key={o.id}
                ref={(el) => {
                  labels.current[i] = el;
                }}
                className="absolute left-0 top-0 opacity-0"
              >
                <span className="label absolute left-3.5 top-0 -translate-y-1/2 whitespace-nowrap text-bone">
                  {o.city}
                  {o.isHeadquarters && <span className="ml-2 text-ember">HQ</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
