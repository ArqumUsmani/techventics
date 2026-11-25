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

export type Service = {
  /** URL anchor on the Services page, e.g. /services#development */
  id: string;
  number: string;
  title: string;
  /** Two-line description for the Home track. */
  summary: string;
  /** 3–4 deliverable tags for the Home track. */
  tags: string[];
  /** Services page: what we do. */
  description: string;
  /** Services page: full deliverables list. */
  deliverables: string[];
  /** Services page: tools / stack tags. */
  tools: string[];
  /** Services page: id of the related case (projects.ts). */
  relatedProject: string;
};

export type Project = {
  id: string;
  /** PLACEHOLDER projects are marked in the UI until real case studies arrive. */
  placeholder: boolean;
  title: string;
  client: string;
  year: string;
  /** Service ids (services.ts) this project covers. */
  services: string[];
  summary: string;
  /** Cover image path, or null to use the generated placeholder art. */
  image: string | null;
  /** Muted MP4/WebM preview played on hover, or null. */
  previewSrc: string | null;
  /** Case study URL, or null while there isn't one. */
  href: string | null;
};

export type Stat = {
  value: number;
  /** Shown after the number, e.g. "+" or "k". */
  suffix?: string;
  label: string;
};

export type ProcessStep = {
  number: string;
  title: string;
  description: string;
};
