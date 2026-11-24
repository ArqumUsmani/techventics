/* Shared content types. Every editable piece of copy or data on the site is typed here. */

export type NavItem = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  /** Short placeholder glyph shown until real icons are added. */
  short: string;
  /** null = account not live yet; rendered as a disabled placeholder. */
  href: string | null;
};

export type Office = {
  id: string;
  city: string;
  country: string;
  /** IANA time zone, used for the live clock (Intl.DateTimeFormat). */
  timeZone: string;
  /** Street address lines, or null until supplied. */
  address: string[] | null;
  isHeadquarters?: boolean;
  /** Used by the globe and the map. */
  coordinates: { lat: number; lng: number };
};

export type SiteConfig = {
  name: string;
  /** One-line description used in the footer and default metadata. */
  tagline: string;
  description: string;
  url: string;
  email: string;
  logo: {
    /**
     * Path to a logo file that reads on a dark background (e.g. /brand/logo.svg).
     * null = use the built-in placeholder lockup.
     */
    src: string | null;
    alt: string;
    /** Intrinsic size of the file, for next/image. */
    width: number;
    height: number;
  };
  nav: NavItem[];
  socials: SocialLink[];
};
