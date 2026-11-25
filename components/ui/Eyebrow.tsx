import type { ElementType, ReactNode } from "react";

/**
 * Mono eyebrow label, optionally with a section index (e.g. "01").
 * Use `as="h2"` where the eyebrow is the section's only heading (keeps heading order valid).
 */
export function Eyebrow({
  index,
  children,
  className = "",
  as: Tag = "p",
  id,
}: {
  index?: string;
  children: ReactNode;
  className?: string;
  as?: ElementType;
  id?: string;
}) {
  return (
    <Tag id={id} className={`label flex items-center gap-3 font-normal text-ash ${className}`}>
      {index && <span className="text-ember">{index}</span>}
      {index && <span aria-hidden className="h-px w-8 bg-steel" />}
      <span>{children}</span>
    </Tag>
  );
}
