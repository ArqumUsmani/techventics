"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Tier } from "@/components/three/useGpuTier";
import { VMarkStage } from "@/components/three/VMarkStage";

type TierChoice = "auto" | Tier;

function useFps() {
  const [fps, setFps] = useState(0);
  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      frames++;
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return fps;
}

export function VMarkLab() {
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [choice, setChoice] = useState<TierChoice>("auto");
  const [lean, setLean] = useState(true);
  const [capture, setCapture] = useState(false);
  const [status, setStatus] = useState<{ tier: Tier | null; live: boolean }>({ tier: null, live: false });
  const fps = useFps();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("capture") === "1") {
      setCapture(true);
      setLean(false);
      setChoice("high");
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.vmarkLive = String(status.live);
  }, [status.live]);

  const onStatus = useCallback((s: { tier: Tier | null; live: boolean }) => setStatus(s), []);

  return (
    <section className="relative min-h-[max(100svh,900px)]">
      <VMarkStage
        key={choice}
        className="!absolute inset-0"
        tier={choice === "auto" ? undefined : choice}
        lean={lean}
        progressRef={progressRef}
        priority
        onStatus={onStatus}
      />

      {!capture && (
        <div className="absolute bottom-6 left-1/2 z-10 w-[min(92vw,44rem)] -translate-x-1/2 border border-steel bg-ink/90 p-5">
          <div className="label flex flex-wrap items-center justify-between gap-3 text-ash">
            <span>
              Tier <span className="text-bone">{status.tier ?? "…"}</span> · Live{" "}
              <span className={status.live ? "text-ember" : "text-bone"}>{status.live ? "yes" : "no"}</span>
            </span>
            <span>
              <span className="text-bone">{fps}</span> fps
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Quality tier">
            {(["auto", "high", "low", "static"] as TierChoice[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setChoice(t)}
                aria-pressed={choice === t}
                className={`label border px-3 py-2 transition-colors duration-300 ${
                  choice === t ? "border-ember text-ember" : "border-steel text-bone/80 hover:border-bone"
                }`}
              >
                {t}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setLean((v) => !v)}
              aria-pressed={lean}
              className={`label ml-auto border px-3 py-2 ${lean ? "border-ember text-ember" : "border-steel text-bone/80"}`}
            >
              Cursor lean
            </button>
          </div>

          <label className="label mt-5 flex items-center gap-4 text-ash">
            <span className="shrink-0">Fly-through</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={progress}
              onChange={(e) => {
                const v = Number(e.target.value);
                progressRef.current = v;
                setProgress(v);
              }}
              className="w-full accent-ember"
            />
            <span className="w-12 text-right text-bone">{progress.toFixed(2)}</span>
          </label>
        </div>
      )}
    </section>
  );
}
