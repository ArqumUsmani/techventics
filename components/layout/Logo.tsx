import Image from "next/image";
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

/** Placeholder V mark: faceted arms with a circuit trace and node dots. */
export function VMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 58" className={className} aria-hidden focusable="false">
      {/* left arm (the "black" side, drawn in bone so it reads on ink) */}
      <polygon points="0,0 18,0 32,28" fill="#F6F1EA" />
      <polygon points="0,0 32,28 32,58" fill="#F6F1EA" opacity="0.72" />
      {/* right arm: ember facets */}
      <polygon points="46,0 64,0 32,28" fill="#FF7A1F" />
      <polygon points="64,0 32,58 32,28" fill="#E04808" />
      <polygon points="64,0 48,29 32,28" fill="#FC5400" />
      {/* circuit trace + nodes */}
      <polyline points="44,38 54,38 58,34" fill="none" stroke="#FC5400" strokeWidth="1.6" />
      <circle cx="59.5" cy="32.5" r="2.2" fill="#FC5400" />
      <circle cx="11" cy="9" r="1.8" fill="#0B0B0B" />
    </svg>
  );
}
