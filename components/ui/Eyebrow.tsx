import type { ReactNode } from "react";

/** Mono eyebrow label, optionally with a section index (e.g. "01"). */
export function Eyebrow({ index, children, className = "" }: { index?: string; children: ReactNode; className?: string }) {
  return (
    <p className={`label flex items-center gap-3 text-ash ${className}`}>
      {index && <span className="text-ember">{index}</span>}
      {index && <span aria-hidden className="h-px w-8 bg-steel" />}
      <span>{children}</span>
    </p>
  );
}
