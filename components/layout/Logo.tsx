import Image from "next/image";
import { facets, pointsAttr, toneHex, traces, VIEWBOX } from "@/components/three/vmarkShape";
import { site } from "@/content/site";

type LogoProps = {
  /** Collapse to the mark only (used by the compact sticky header). */
  compact?: boolean;
  className?: string;
};

/**
 * Techventics logo. Uses `site.logo.src` when set; otherwise a placeholder lockup
 * (mark + wordmark) drawn to read on the dark background.
 *
 * PLACEHOLDER: the mark below is an approximation of the triangular V. Replace it by
 * setting `site.logo.src` to the supplied SVG (a version with light "TECH" for dark backgrounds).
 */
export function Logo({ compact = false, className = "" }: LogoProps) {
  if (site.logo.src) {
    return (
      <Image
        src={site.logo.src}
        alt={site.logo.alt}
        width={site.logo.width}
        height={site.logo.height}
        priority
        className={`h-auto w-full object-contain object-left ${className}`}
      />
    );
  }

  return (
    <span className={`flex w-full items-center gap-1.5 ${className}`}>
      <VMark className="h-auto w-[30px] shrink-0" />
      <span
        aria-hidden
        className={`overflow-hidden whitespace-nowrap font-display text-[11px] font-semibold tracking-[0.01em] transition-[opacity,max-width] duration-400 ease-out-expo ${
          compact ? "max-w-0 opacity-0" : "max-w-[90px] opacity-100"
        }`}
      >
        <span className="text-bone">TECH</span>
        <span className="text-ember">VENTICS</span>
      </span>
      <span className="sr-only">{site.logo.alt}</span>
    </span>
  );
}

/** Placeholder V mark (2D), drawn from the same shape data as the 3D model. */
export function VMark({ className = "" }: { className?: string }) {
  const { x, y, width, height } = VIEWBOX;
  return (
    <svg viewBox={`${x} ${y} ${width} ${height}`} className={className} aria-hidden focusable="false">
      {facets.map((f) => (
        <polygon key={f.id} points={pointsAttr(f.points)} fill={toneHex[f.tone]} opacity={f.shade ?? 1} />
      ))}
      {traces.map((t) => {
        const [nx, ny] = t.points[t.points.length - 1];
        return (
          <g key={t.id}>
            <polyline points={pointsAttr(t.points)} fill="none" stroke="#FC5400" strokeWidth="1.6" />
            <circle cx={nx} cy={ny} r="2.4" fill="#FC5400" />
          </g>
        );
      })}
    </svg>
  );
}
