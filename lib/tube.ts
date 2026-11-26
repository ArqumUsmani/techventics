/**
 * Fluorescent-tube flicker. A pattern is a list of [seconds, level] steps; level 0 is
 * off, 1 is lit, above 1 is a hot flash. Patterns are randomised on every call so
 * no two strikes look the same.
 */
export type TubePattern = [number, number][];

const r = (a: number, b: number) => a + Math.random() * (b - a);

/** A tube starting up: a few failed strikes, a buzz, then it holds. About 1.2–1.6 s. */
export function strikePattern(): TubePattern {
  return [
    [r(0.05, 0.18), 0],
    [r(0.03, 0.06), r(0.7, 1)],
    [r(0.08, 0.16), 0],
    [r(0.02, 0.05), r(0.4, 0.8)],
    [r(0.04, 0.08), 0.05],
    [r(0.03, 0.05), 1.2],
    [r(0.1, 0.2), 0],
    [r(0.04, 0.07), r(0.6, 0.9)],
    [r(0.03, 0.05), 0.1],
    [r(0.06, 0.1), 1],
    [r(0.03, 0.05), 0.25],
    [r(0.2, 0.32), r(0.55, 0.75)], // the dim buzz before it catches
    [r(0.04, 0.06), 1.25],
    [0, 1],
  ];
}

/** A loose-contact blink, for hover. About 0.3 s. */
export function blinkPattern(): TubePattern {
  return [
    [r(0.02, 0.05), r(0.05, 0.25)],
    [r(0.03, 0.06), 1.15],
    [r(0.02, 0.05), r(0.1, 0.3)],
    [r(0.04, 0.08), 1],
    [r(0.02, 0.04), r(0.3, 0.6)],
    [0, 1],
  ];
}

export function patternLength(p: TubePattern) {
  return p.reduce((sum, [d]) => sum + d, 0);
}

/** Level at `t` seconds into the pattern (1 once it has finished). */
export function sampleTube(p: TubePattern, t: number) {
  if (t < 0) return p[0]?.[1] ?? 1;
  let acc = 0;
  for (const [d, level] of p) {
    acc += d;
    if (t < acc) return level;
  }
  return 1;
}

/**
 * Plays a pattern on an element's opacity (levels above 1 are clamped).
 * Resolves when done; the element is left fully visible.
 */
export function flickerElement(el: HTMLElement, pattern: TubePattern = strikePattern(), delay = 0) {
  return new Promise<void>((resolve) => {
    const len = patternLength(pattern);
    const start = performance.now() + delay * 1000;
    el.style.opacity = String(Math.min(1, pattern[0]?.[1] ?? 0));
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      if (t >= len) {
        el.style.opacity = "1";
        resolve();
        return;
      }
      el.style.opacity = String(Math.min(1, sampleTube(pattern, t)));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/** Fired on window when the splash screen has gone (or was skipped). */
export const SPLASH_DONE = "tv:splash-done";

/** True once the splash has finished or will not show this session. */
export function splashFinished() {
  return document.documentElement.dataset.splash === "done";
}
