import type { CSSProperties } from "react";
import { LOGO_FILES } from "@/components/brand/logoFiles";
import { site } from "@/content/site";

type LogoProps = {
  /** Collapse to the mark only (used by the compact sticky header). */
  compact?: boolean;
  /** Mark width; the wordmark is sized from it in the logo's own proportions. */
  markWidth?: number;
  className?: string;
};

const { mark, wordmark, logo } = LOGO_FILES;
// Proportions of the lockup (from the traced files): wordmark height and gap relative to mark width.
const WORD_H = (wordmark.height / mark.height) * (mark.height / mark.width);
const WORD_W = WORD_H * (wordmark.width / wordmark.height);
const GAP = (logo.width - mark.width - wordmark.width) / mark.width;

/**
 * Techventics logo (mark + wordmark), the on-dark versions: the logo's black is drawn in
 * bone so it reads on ink. Files live in public/brand (see components/brand/logoFiles.ts).
 */
export function Logo({ compact = false, markWidth = 36, className = "" }: LogoProps) {
  const style = { "--mark": `${markWidth}px` } as CSSProperties;
  return (
    <span className={`flex items-center ${className}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mark.srcOnDark}
        alt=""
        width={mark.width}
        height={mark.height}
        fetchPriority="high"
        className="block h-auto w-[var(--mark)] max-w-none shrink-0"
      />
      <span
        aria-hidden
        className="block overflow-hidden transition-[max-width,opacity] duration-400 ease-out-expo"
        style={{ maxWidth: compact ? 0 : `calc(var(--mark) * ${(WORD_W + GAP).toFixed(4)})`, opacity: compact ? 0 : 1 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={wordmark.srcOnDark}
          alt=""
          width={wordmark.width}
          height={wordmark.height}
          className="block w-auto max-w-none"
          style={{ height: `calc(var(--mark) * ${WORD_H.toFixed(4)})`, marginLeft: `calc(var(--mark) * ${GAP.toFixed(4)})` }}
        />
      </span>
      <span className="sr-only">{site.logo.alt}</span>
    </span>
  );
}
