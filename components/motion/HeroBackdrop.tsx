"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "@/lib/motion";
import { ENGINES, HERO_BACKDROPS, type HeroBackdropName, type Pointer } from "./heroBackdrops";

export const DEFAULT_HERO_BACKDROP: HeroBackdropName = "circuit";

/** The backdrop named in the address bar (?hero=circuit|signal|network|sparks), else the default. */
function chosenBackdrop(): HeroBackdropName {
  const name = new URLSearchParams(window.location.search).get("hero");
  return (HERO_BACKDROPS as readonly string[]).includes(name ?? "") ? (name as HeroBackdropName) : DEFAULT_HERO_BACKDROP;
}

/**
 * Interactive hero background on a 2D canvas behind the wordmark. Reacts to hover
 * (the area around the cursor lights up) and to clicks or taps (a burst from that
 * point). Pauses off screen and in background tabs, fades out as the hero scrolls
 * away (`progressRef`, 0–1). Reduced motion: one still frame, no animation.
 */
export function HeroBackdrop({ progressRef, className = "" }: { progressRef?: RefObject<number>; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const engine = ENGINES[chosenBackdrop()]();

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      engine.resize(w, h, w < 768, dpr);
    };
    resize();

    const pointer: Pointer = { x: -9999, y: -9999, inside: false, speed: 0 };
    let fade = 1;

    if (reduced) {
      ctx.clearRect(0, 0, w, h);
      engine.frame(ctx, 0, 0, pointer);
      return;
    }

    // The canvas sits under the page content, so listen on the window and map to it.
    let lastMove = performance.now();
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const now = performance.now();
      const dt = Math.max(1, now - lastMove) / 1000;
      lastMove = now;
      if (pointer.inside) pointer.speed = pointer.speed * 0.7 + (Math.hypot(x - pointer.x, y - pointer.y) / dt) * 0.3;
      pointer.x = x;
      pointer.y = y;
      pointer.inside = e.pointerType === "mouse" && x >= 0 && y >= 0 && x <= r.width && y <= r.height && fade > 0.2;
    };
    const onLeave = () => {
      pointer.inside = false;
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest("a, button, input, textarea, select, label, [role='button']")) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x >= 0 && y >= 0 && x <= r.width && y <= r.height && fade > 0.2) engine.click(x, y);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    let raf = 0;
    let running = false;
    let last = performance.now();
    let clock = 0;
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      clock += dt;
      fade = Math.max(0, 1 - (progressRef?.current ?? 0) * 1.6);
      el.style.opacity = String(fade);
      pointer.speed *= 1 - Math.min(1, dt * 4);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      if (fade > 0) engine.frame(ctx, dt, clock, pointer);
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    let visible = true;
    const sync = () => (visible && !document.hidden ? start() : stop());
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const ro = new ResizeObserver(() => resize());
    ro.observe(el);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced, progressRef]);

  return <canvas ref={canvas} aria-hidden className={`pointer-events-none ${className}`} />;
}
