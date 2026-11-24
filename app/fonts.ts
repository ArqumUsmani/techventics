import localFont from "next/font/local";

/* Self-hosted fonts. Files live in /public/fonts (licenses in /public/fonts/licenses). */

export const clash = localFont({
  src: [
    { path: "../public/fonts/ClashDisplay-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/ClashDisplay-Semibold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/ClashDisplay-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-clash",
  display: "swap",
  fallback: ["Arial Narrow", "system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const satoshi = localFont({
  src: [
    { path: "../public/fonts/Satoshi-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Satoshi-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Satoshi-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-satoshi",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const jetbrains = localFont({
  src: [
    { path: "../public/fonts/JetBrainsMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/JetBrainsMono-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-jetbrains",
  display: "swap",
  fallback: ["ui-monospace", "Consolas", "monospace"],
  adjustFontFallback: false,
});
