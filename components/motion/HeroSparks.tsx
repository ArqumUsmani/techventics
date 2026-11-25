"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion } from "@/lib/motion";

type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; w: number };
type Ember = { x: number; y: number; vy: number; drift: number; phase: number; r: number; a: number };
type Flash = { x: number; y: number; t: number; arc: [number, number][] };

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * Hero atmosphere: slow ember lighting, drifting embers and short electrical spark
 * bursts (a flash, a jagged arc, then a spray of sparks falling under gravity), like
 * working on live hardware. A plain 2D canvas, so it costs nothing on the 3D bundle.
 * Pauses off screen and in background tabs; skipped entirely with reduced motion.
 * Fades out as `progressRef` (the hero scroll progress, 0–1) moves on.
 */
export function HeroSparks({ progressRef, className = "" }: { progressRef?: RefObject<number>; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx || reduced) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let small = false;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = el.clientWidth;
      h = el.clientHeight;
      small = w < 768;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const sparks: Spark[] = [];
    const flashes: Flash[] = [];
    const embers: Ember[] = Array.from({ length: small ? 22 : 46 }, () => newEmber(true));
    function newEmber(anywhere = false): Ember {
      return { x: rand(0, w), y: anywhere ? rand(0, h) : h + 10, vy: rand(10, 34), drift: rand(6, 18), phase: rand(0, 6.28), r: rand(0.6, 1.8), a: rand(0.25, 0.8) };
    }

    // Burst origins: anywhere except the wordmark band, biased toward the sides of the mark.
    const burst = () => {
      const side = Math.random() < 0.5 ? -1 : 1;
      const x = w / 2 + side * rand(w * 0.08, w * 0.46);
      const y = rand(h * 0.18, h * 0.78);
      const n = Math.round(small ? rand(20, 34) : rand(32, 58));
      for (let i = 0; i < n; i++) {
        const angle = rand(-Math.PI, 0) + rand(-0.35, 0.35); // mostly upward, fanning out
        const speed = rand(180, 640);
        const max = rand(0.6, 1.5);
        sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: max, max, w: rand(1, 2.2) });
      }
      // Jagged arc between the origin and a nearby point.
      const ex = x + rand(-90, 90);
      const ey = y + rand(-70, 30);
      const arc: [number, number][] = [];
      const steps = 7;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const j = i === 0 || i === steps ? 0 : rand(-14, 14);
        arc.push([x + (ex - x) * t + j, y + (ey - y) * t + j * 0.6]);
      }
      flashes.push({ x, y, t: 0, arc });
    };

    let raf = 0;
    let running = false;
    let last = performance.now();
    let clock = 0;
    let nextBurst = 0.6;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      clock += dt;

      // Fade out as the camera flies through the mark.
      const fade = Math.max(0, 1 - (progressRef?.current ?? 0) * 1.6);
      el.style.opacity = String(fade);

      ctx.clearRect(0, 0, w, h);
      if (fade > 0) {
        ctx.globalCompositeOperation = "lighter";

        // Slow ember lighting: two soft pools that breathe out of phase.
        const pools: [number, number, number, number][] = [
          [w * 0.18, h * 0.82, Math.max(w, h) * 0.55, 0.11 + Math.sin(clock * 0.6) * 0.04],
          [w * 0.86, h * 0.22, Math.max(w, h) * 0.45, 0.08 + Math.sin(clock * 0.45 + 2) * 0.03],
        ];
        for (const [px, py, pr, pa] of pools) {
          const g = ctx.createRadialGradient(px, py, 0, px, py, pr);
          g.addColorStop(0, `rgba(252,84,0,${pa})`);
          g.addColorStop(1, "rgba(252,84,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
        }

        // Drifting embers with a flicker.
        for (const e of embers) {
          e.y -= e.vy * dt;
          e.x += Math.sin(clock * 0.8 + e.phase) * e.drift * dt;
          if (e.y < -10) Object.assign(e, newEmber());
          const flicker = 0.6 + 0.4 * Math.sin(clock * 3 + e.phase * 3);
          ctx.fillStyle = `rgba(255,${120 + Math.round(flicker * 60)},40,${e.a * flicker})`;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fill();
          // Soft halo
          ctx.fillStyle = `rgba(252,84,0,${0.12 * e.a * flicker})`;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Bursts.
        nextBurst -= dt;
        if (nextBurst <= 0) {
          burst();
          if (Math.random() < 0.3) window.setTimeout(burst, rand(90, 220)); // the odd double crackle
          nextBurst = rand(0.8, 2.1);
        }

        // Flash + arc: bright for ~60ms, gone by ~350ms.
        for (let i = flashes.length - 1; i >= 0; i--) {
          const f = flashes[i];
          f.t += dt;
          const k = Math.max(0, 1 - f.t / 0.45);
          if (k <= 0) {
            flashes.splice(i, 1);
            continue;
          }
          const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 190);
          g.addColorStop(0, `rgba(255,220,180,${0.5 * k * k})`);
          g.addColorStop(0.25, `rgba(252,84,0,${0.25 * k})`);
          g.addColorStop(1, "rgba(252,84,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(f.x - 190, f.y - 190, 380, 380);
          if (f.t < 0.18 && Math.random() > 0.2) {
            ctx.strokeStyle = `rgba(255,236,214,${0.9 * k})`;
            ctx.lineWidth = 1.2;
            ctx.shadowColor = "rgba(252,84,0,0.9)";
            ctx.shadowBlur = 12;
            ctx.beginPath();
            f.arc.forEach(([ax, ay], j) => (j ? ctx.lineTo(ax + rand(-3, 3), ay + rand(-3, 3)) : ctx.moveTo(ax, ay)));
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }

        // Sparks: streaks that cool from white-hot to ember as they fall.
        ctx.lineCap = "round";
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.life -= dt;
          if (s.life <= 0 || s.y > h + 20) {
            sparks.splice(i, 1);
            continue;
          }
          s.vy += 760 * dt; // gravity
          s.vx *= 1 - 1.6 * dt; // drag
          s.vy *= 1 - 0.6 * dt;
          const px = s.x;
          const py = s.y;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          const t = s.life / s.max; // 1 → 0
          const gch = Math.round(90 + 150 * t);
          const bch = Math.round(20 + 180 * t * t);
          ctx.strokeStyle = `rgba(255,${gch},${bch},${Math.min(1, t * 1.4)})`;
          ctx.lineWidth = s.w;
          ctx.beginPath();
          ctx.moveTo(px - s.vx * 0.03, py - s.vy * 0.03);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";
      }
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
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [reduced, progressRef]);

  if (reduced) return null;
  return <canvas ref={canvas} aria-hidden className={`pointer-events-none ${className}`} />;
}
