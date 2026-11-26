"use client";

import { useEffect, useRef, useState } from "react";
import { LOGO_FILES } from "@/components/brand/logoFiles";
import { prefersReducedMotion } from "@/lib/motion";
import { SPLASH_DONE, blinkPattern, flickerElement, sampleTube, strikePattern } from "@/lib/tube";
import { createDotMark, type DotMark } from "./splashMark";

const SEEN_KEY = "tv-splash";
const MIN_SECONDS = 2.1;
const MAX_SECONDS = 5;
const WORD = [
  { text: "TECH", tone: "text-bone" },
  { text: "VENTICS", tone: "text-ember" },
];

/**
 * Start-up screen, once per browser session. The hero's dotted mark strikes on like a
 * fluorescent tube (white and ember strokes as two separate tubes), the wordmark
 * letters catch one by one, and a line counts up while the page loads. It then lifts
 * away and fires SPLASH_DONE, which starts the hero logo's own strike. Skipped before
 * first paint on later page loads (inline script in the layout); hidden without JS.
 */
export function Splash() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.splash === "done") {
      setGone(true);
      return;
    }
    const finish = () => {
      html.dataset.splash = "done";
      html.style.overflow = "";
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      window.dispatchEvent(new Event(SPLASH_DONE));
      setGone(true);
    };

    html.style.overflow = "hidden";
    const reduced = prefersReducedMotion();
    let loaded = document.readyState === "complete";
    const onLoad = () => (loaded = true);
    window.addEventListener("load", onLoad, { once: true });

    // The dotted mark: two tubes with their own strikes, the ember one a beat later.
    let mark: DotMark | null = null;
    if (canvas.current) {
      createDotMark(canvas.current)
        .then((m) => (mark = m))
        .catch(() => {});
    }
    const strikeWhite = strikePattern();
    const strikeEmber = strikePattern();
    const emberDelay = 0.12 + Math.random() * 0.15;
    let markT0 = -1; // the strike starts once the dots are ready
    const hum = { white: { p: null as ReturnType<typeof blinkPattern> | null, at: 0 }, ember: { p: null as ReturnType<typeof blinkPattern> | null, at: 0 }, next: 0 };

    const letters = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-splash-letter]") ?? []);
    if (reduced) letters.forEach((el) => (el.style.opacity = "1"));
    else letters.forEach((el, i) => flickerElement(el, i % 3 === 0 ? strikePattern().slice(5) : blinkPattern(), 0.45 + i * 0.07 + Math.random() * 0.12));

    const t0 = performance.now();
    let shown = 0;
    let leaving = false;
    let raf = 0;
    const tick = (now: number) => {
      const t = (now - t0) / 1000;

      if (mark) {
        if (markT0 < 0) {
          markT0 = t;
          hum.next = t + 2.2;
        }
        const mt = t - markT0;
        let white = 1;
        let ember = 1;
        if (!reduced) {
          white = sampleTube(strikeWhite, mt);
          ember = sampleTube(strikeEmber, mt - emberDelay);
          // After the strike: the odd stutter on one tube, like the hero on hover.
          if (t > hum.next) {
            if (Math.random() < 0.5) hum.white = { p: blinkPattern(), at: t };
            else hum.ember = { p: blinkPattern(), at: t };
            hum.next = t + 0.9 + Math.random() * 1.4;
          }
          if (hum.white.p) white = Math.min(white, sampleTube(hum.white.p, t - hum.white.at));
          if (hum.ember.p) ember = Math.min(ember, sampleTube(hum.ember.p, t - hum.ember.at));
        }
        mark.draw(white, ember, t);
      }

      // Progress: eases toward 90% while loading, then to 100% once the page has loaded.
      const target = loaded ? 100 : Math.min(90, (t / 2.4) * 90);
      shown += (target - shown) * Math.min(1, 0.08 + (loaded ? 0.1 : 0));
      if (bar.current) bar.current.style.transform = `scaleX(${shown / 100})`;
      if (count.current) count.current.textContent = String(Math.round(shown)).padStart(3, "0");

      // Leave once loaded, and (unless reduced motion) only after the logo has fully struck on.
      const struck = reduced || (markT0 >= 0 && t - markT0 >= 1.9);
      const ready = (loaded && shown > 99.2 && t >= (reduced ? 0.4 : MIN_SECONDS) && struck) || t >= MAX_SECONDS;
      if (ready && !leaving) {
        leaving = true;
        mark?.draw(1, 1, t);
        root.current?.setAttribute("data-leaving", "");
        window.setTimeout(finish, reduced ? 200 : 650);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
      html.style.overflow = "";
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={root}
      data-splash-screen
      role="status"
      aria-label="Loading Techventics"
      className="fixed inset-0 z-[200] grid place-items-center bg-ink transition-[opacity,transform] duration-600 ease-out-expo data-leaving:pointer-events-none data-leaving:scale-[1.04] data-leaving:opacity-0"
    >
      <div className="flex flex-col items-center">
        {/* The hero's dotted mark, drawn by splashMark.ts */}
        <canvas
          ref={canvas}
          aria-hidden
          className="w-[min(78vw,20rem)] md:w-[26rem]"
          style={{ aspectRatio: `${LOGO_FILES.mark.width} / ${LOGO_FILES.mark.height}` }}
        />

        <p aria-hidden className="mt-10 flex font-display text-[clamp(1.1rem,2.4vw,1.6rem)] font-medium tracking-[0.38em] [margin-right:-0.38em]">
          {WORD.map((part) => (
            <span key={part.text} className={`flex ${part.tone}`}>
              {part.text.split("").map((ch, i) => (
                <span key={i} data-splash-letter data-splash-dim>
                  {ch}
                </span>
              ))}
            </span>
          ))}
        </p>

        <div aria-hidden className="mt-12 w-48">
          <div className="h-px w-full bg-steel">
            <div ref={bar} className="h-px origin-left scale-x-0 bg-ember" />
          </div>
          <p className="label mt-3 flex justify-between text-ash">
            <span>Powering up</span>
            <span>
              <span ref={count}>000</span>%
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
