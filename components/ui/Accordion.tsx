"use client";

import { useId, useState } from "react";

type Item = { question: string; answer: string };

/** FAQ accordion: buttons with aria-expanded, panels animate open via grid rows. */
export function Accordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <ul className="border-t border-steel">
      {items.map((item, i) => {
        const isOpen = open === i;
        const btn = `${base}-q${i}`;
        const panel = `${base}-a${i}`;
        return (
          <li key={item.question} className="border-b border-steel">
            <h3>
              <button
                id={btn}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left md:py-8"
              >
                <span className="flex items-baseline gap-5">
                  <span className="label text-ember">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-h4 text-bone transition-colors duration-400 group-hover:text-ember">{item.question}</span>
                </span>
                <span aria-hidden className="relative block size-4 shrink-0">
                  <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-bone" />
                  <span
                    className={`absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-bone transition-transform duration-400 ease-out-expo ${
                      isOpen ? "scale-y-0" : "scale-y-100"
                    }`}
                  />
                </span>
              </button>
            </h3>
            <div
              id={panel}
              role="region"
              aria-labelledby={btn}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows] duration-500 ease-out-expo ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <p className="measure pb-8 pl-[calc(1.25rem+2ch)] text-ash">{item.answer}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
