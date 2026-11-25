"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/motion";

/**
 * high   – full scene: bloom, high DPR, MSAA
 * low    – phones / modest laptops: no post-processing, DPR ≤ 1.25
 * static – reduced motion, no WebGL, software rendering, or very weak devices: show the image
 */
export type Tier = "high" | "low" | "static";

const TIERS: readonly Tier[] = ["high", "low", "static"];

export function detectTier(): Tier {
  if (typeof window === "undefined") return "static";

  // Manual override for testing: ?tier=high|low|static
  const forced = new URLSearchParams(window.location.search).get("tier");
  if (forced && (TIERS as readonly string[]).includes(forced)) return forced as Tier;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "static";

  let renderer = "";
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return "static";
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    return "static";
  }
  if (/swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i.test(renderer)) return "static";

  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  if (memory <= 2 || cores <= 2) return "static";

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;
  if (coarse || narrow || memory <= 4 || cores <= 4) return "low";

  return "high";
}

/** Device tier for the 3D scenes. `null` until detected on the client. */
export function useGpuTier(): Tier | null {
  const reduced = useReducedMotion();
  const [tier, setTier] = useState<Tier | null>(null);

  useEffect(() => {
    setTier(detectTier());
  }, [reduced]);

  return tier;
}
