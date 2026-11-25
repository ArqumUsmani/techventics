import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

/*
 * Production builds are a static export (`out/`) for cPanel hosting: plain HTML, JS
 * and assets uploaded to public_html. The contact form posts to public/contact.php.
 *
 * Files named *.dev.tsx / *.dev.ts (the /capture pages and a local stand-in for the
 * contact endpoint) are routes in `next dev` only; production builds ignore them.
 */
export default function config(phase: string): NextConfig {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    output: dev ? undefined : "export",
    pageExtensions: dev ? ["dev.tsx", "dev.ts", "tsx", "ts"] : ["tsx", "ts"],
    reactStrictMode: true,
    poweredByHeader: false,
    // No image optimisation server on static hosting; images are pre-sized instead.
    images: { unoptimized: true },
    experimental: {
      optimizePackageImports: ["@react-three/drei", "gsap"],
    },
  };
}
