import type { SiteConfig } from "./types";

export const site: SiteConfig = {
  name: "Techventics",
  tagline: "A digital studio building websites, apps, brands and motion from Karachi, London and New York.",
  description:
    "Techventics designs and builds websites, web apps, mobile apps, brand identities and motion work for companies in the USA, UK and Pakistan.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://techventics.com",
  email: "Info@techventics.com",
  logo: {
    // Swap to e.g. "/brand/logo.svg" once a version for dark backgrounds is supplied.
    src: null,
    alt: "Techventics",
    width: 250,
    height: 56,
  },
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
