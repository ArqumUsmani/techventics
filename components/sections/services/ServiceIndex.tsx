"use client";

import { useEffect, useState } from "react";
import type { Service } from "@/content/types";

/**
 * Sticky left index of the services. The item for the section currently in the
 * middle of the viewport is highlighted in ember.
 */
export function ServiceIndex({ items }: { items: Pick<Service, "id" | "number" | "title">[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="Services" className="sticky top-[calc(var(--spacing-header-compact)+3rem)]">
      <ol className="border-l border-steel">
        {items.map((s) => {
          const isActive = s.id === active;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={isActive ? "true" : undefined}
                className={`group relative flex items-baseline gap-4 py-3 pl-6 transition-colors duration-400 ${
                  isActive ? "text-ember" : "text-ash hover:text-bone"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute -left-px top-0 h-full w-[2px] origin-top bg-ember transition-transform duration-400 ease-out-expo ${
                    isActive ? "scale-y-100" : "scale-y-0"
                  }`}
                />
                <span className="label">{s.number}</span>
                <span className="font-display text-h4">{s.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
