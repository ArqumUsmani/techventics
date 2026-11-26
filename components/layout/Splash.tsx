"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { SPLASH_DONE, blinkPattern, flickerElement, patternLength, sampleTube, strikePattern } from "@/lib/tube";

const SEEN_KEY = "tv-splash";
const MIN_SECONDS = 2.1;
const MAX_SECONDS = 5;
const WORD = [
  { text: "TECH", tone: "text-bone" },
  { text: "VENTICS", tone: "text-ember" },
];

/**
 * Start-up screen, once per browser session: the mark strikes on like a fluorescent
 * tube, the wordmark letters catch one by one, and a line counts up while the page
 * loads. It then lifts away and fires SPLASH_DONE, which starts the hero logo's own
 * flicker. Skipped before first paint on later page loads (see the inline script in
 * the layout); hidden entirely without JavaScript.
 */
export function Splash() {
  const root = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
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

    // Mark: a full strike; the glow behind it follows the same pattern.
    const strike = strikePattern();
    const strikeLen = patternLength(strike);
    const letters = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-splash-letter]") ?? []);
    if (reduced) {
      [mark.current, glow.current, ...letters].forEach((el) => el && (el.style.opacity = "1"));
    } else {
      letters.forEach((el, i) => flickerElement(el, i % 3 === 0 ? strikePattern().slice(5) : blinkPattern(), 0.45 + i * 0.07 + Math.random() * 0.12));
    }

    const t0 = performance.now();
    let shown = 0;
    let leaving = false;
    let raf = 0;
    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      if (!reduced && mark.current && glow.current) {
        const level = t < strikeLen ? sampleTube(strike, t) : 0.92 + Math.sin(t * 9) * 0.03 + (Math.random() < 0.015 ? -0.5 : 0);
        mark.current.style.opacity = String(Math.min(1, level));
        glow.current.style.opacity = String(Math.min(1.2, level) * 0.85);
      }
      // Progress: eases toward 90% while loading, then to 100% once the page has loaded.
      const target = loaded ? 100 : Math.min(90, (t / 2.4) * 90);
      shown += (target - shown) * Math.min(1, 0.08 + (loaded ? 0.1 : 0));
      if (bar.current) bar.current.style.transform = `scaleX(${shown / 100})`;
      if (count.current) count.current.textContent = String(Math.round(shown)).padStart(3, "0");

      const ready = (loaded && shown > 99.2 && t >= (reduced ? 0.4 : MIN_SECONDS)) || t >= MAX_SECONDS;
      if (ready && !leaving) {
        leaving = true;
        if (mark.current) mark.current.style.opacity = "1";
        if (glow.current) glow.current.style.opacity = "1";
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
      className="group/splash fixed inset-0 z-[200] grid place-items-center bg-ink transition-[opacity,transform] duration-600 ease-out-expo data-leaving:pointer-events-none data-leaving:scale-[1.04] data-leaving:opacity-0"
    >
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Glow of the lit tube */}
          <div
            ref={glow}
            aria-hidden
            data-splash-dim
            className="absolute left-1/2 top-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(252,84,0,0.28),rgba(252,84,0,0)_62%)]"
          />
          <div ref={mark} data-splash-dim className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/techventics-mark-on-dark.svg"
              alt=""
              width={160}
              height={160}
              className="h-28 w-auto drop-shadow-[0_0_10px_rgba(252,84,0,0.65)] md:h-36"
            />
          </div>
        </div>

        <p aria-hidden className="mt-10 flex font-display text-[clamp(1.1rem,2.4vw,1.6rem)] font-medium tracking-[0.38em] [margin-right:-0.38em]">
          {WORD.map((part) => (
            <span key={part.text} className={`flex ${part.tone}`}>
              {part.text.split("").map((ch, i) => (
                <span key={i} data-splash-letter data-splash-dim className="[text-shadow:0_0_12px_rgba(252,84,0,0.45)]">
                  {ch}
                </span>
              ))}
            </span>
          ))}
        </p>

        <div aria-hidden className="mt-12 w-48">
          <div className="h-px w-full bg-steel">
            <div ref={bar} className="h-px origin-left scale-x-0 bg-ember shadow-[0_0_8px_rgba(252,84,0,0.8)]" />
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
