import type { SiteConfig } from "./types";

export const site: SiteConfig = {
  name: "Techventics",
  // Client tagline and description
  tagline: "Innovating Today. Empowering Tomorrow.",
  description: "At Techventics, we combine cutting-edge IT hardware, advanced technology, and innovative digital solutions to empower businesses for the future. From enterprise-grade IT infrastructure and hardware distribution to intelligent technology solutions, we deliver the products and expertise businesses need to operate smarter, perform better, and stay ahead in an evolving digital world.",
  // Short version for search results (the full description runs past ~160 characters).
  seoDescription:
    "Techventics combines IT hardware, advanced technology and digital solutions: enterprise IT infrastructure, hardware distribution and intelligent technology solutions for businesses.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://techventics.com",
  email: "Info@techventics.com",
  // Logo artwork: public/brand/techventics-*.svg (see components/brand/logoFiles.ts)
  logo: { alt: "Techventics" },
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" },
  ],
  // PLACEHOLDER: replace href with real profile URLs.
  socials: [
    { label: "LinkedIn", short: "In", href: null },
    { label: "Instagram", short: "Ig", href: null },
    { label: "Behance", short: "Be", href: null },
    { label: "Dribbble", short: "Dr", href: null },
  ],
};
