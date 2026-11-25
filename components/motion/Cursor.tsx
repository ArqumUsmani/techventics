"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useFinePointer, useReducedMotion } from "@/lib/motion";

type CursorState = "hidden" | "default" | "link" | "view" | "text";

/**
 * Custom cursor: a small ember ring that trails the pointer, grows over links and
 * becomes a filled "View" disc over [data-cursor="view"] (work cards). Over text
 * fields the native cursor returns. Off on touch devices and with reduced motion.
 */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const enabled = fine && !reduced;
  const root = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CursorState>("hidden");
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!enabled || !root.current) return;
    const el = root.current;
    const html = document.documentElement;
    html.classList.add("has-cursor");

    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
    let placed = false;

    const resolve = (target: EventTarget | null): CursorState => {
      const t = target instanceof Element ? target : null;
      if (!t) return "default";
      if (t.closest("input, textarea, select, [contenteditable='true']")) return "text";
      if (t.closest("[data-cursor='view']")) return "view";
      if (t.closest("a, button, [role='button'], summary, label")) return "link";
      return "default";
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!placed) {
        gsap.set(el, { x: e.clientX, y: e.clientY });
        placed = true;
      }
      xTo(e.clientX);
      yTo(e.clientY);
      const next = resolve(e.target);
      setState((s) => (s === next ? s : next));
    };
    const onLeave = () => setState("hidden");
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    html.addEventListener("pointerleave", onLeave);
    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      html.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={root} aria-hidden data-state={state} className="group pointer-events-none fixed left-0 top-0 z-[90]">
      <div
        className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-ember transition-[width,height,background-color,opacity,scale] duration-400 ease-out-expo ${
          down ? "scale-75" : "scale-100"
        } size-7 group-data-[state=hidden]:opacity-0 group-data-[state=text]:opacity-0 group-data-[state=link]:size-12 group-data-[state=link]:bg-ember/10 group-data-[state=view]:size-24 group-data-[state=view]:bg-ember`}
      >
        <span className="label scale-50 text-ink opacity-0 transition-[opacity,scale] duration-300 ease-out-expo group-data-[state=view]:scale-100 group-data-[state=view]:opacity-100">
          View
        </span>
      </div>
    </div>
  );
}
