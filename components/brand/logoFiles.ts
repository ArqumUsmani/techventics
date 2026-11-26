/*
 * Logo files traced from scripts/brand-source/techventics-logo-screenshot.png (a 383px
 * screenshot). Replace the SVGs in public/brand with the original vector logo when
 * available (keep the file names) and update the sizes below.
 */

export const LOGO_FILES = {
  mark: { src: "/brand/techventics-mark.svg", srcOnDark: "/brand/techventics-mark-on-dark.svg", width: 958, height: 797 },
  wordmark: { src: "/brand/techventics-wordmark.svg", srcOnDark: "/brand/techventics-wordmark-on-dark.svg", width: 2316, height: 248 },
  logo: { src: "/brand/techventics-logo.svg", srcOnDark: "/brand/techventics-logo-on-dark.svg", width: 3325, height: 797 },
} as const;

/**
 * Circuit-node holes in the mark artwork (logo space 0–1; radius as a share of the mark
 * width). Shared by the 3D hero mark and the splash, which both fill them with pulsing dots.
 */
export const MARK_NODES = [
  { u: 0.15, v: 0.125, r: 0.022 },
  { u: 0.542, v: 0.125, r: 0.022 },
  { u: 0.834, v: 0.125, r: 0.026 },
] as const;
