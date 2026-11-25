/**
 * Cover art for PLACEHOLDER projects: steel grid, outlined index and one ember
 * circuit trace (different per index). Clearly labelled so it is never mistaken
 * for real work. Not an AI image.
 */
const TRACES = [
  "M0 70 H38 L50 58 H100",
  "M30 0 V40 L42 52 V100",
  "M0 30 H55 L70 45 V100",
  "M100 80 H60 L45 65 V0",
];

export function PlaceholderArt({ index, label }: { index: number; label: string }) {
  const d = TRACES[index % TRACES.length];
  return (
    <div className="absolute inset-0 overflow-hidden bg-graphite">
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 [background-image:linear-gradient(#303030_1px,transparent_1px),linear-gradient(90deg,#303030_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d={d} fill="none" stroke="#FC5400" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
      </svg>
      <span
        aria-hidden
        className="absolute -bottom-[0.18em] right-4 font-display text-[clamp(6rem,14vw,12rem)] font-bold leading-none text-transparent [-webkit-text-stroke:1px_#303030]"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="label absolute left-4 top-4 border border-dashed border-steel bg-ink/80 px-2 py-1 text-ash">
        Placeholder · {label}
      </span>
    </div>
  );
}
