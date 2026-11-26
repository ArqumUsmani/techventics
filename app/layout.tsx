import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SiteBackdrop } from "@/components/layout/SiteBackdrop";
import { SkipLink } from "@/components/layout/SkipLink";
import { Splash } from "@/components/layout/Splash";
import { Cursor } from "@/components/motion/Cursor";
import { PageTransition } from "@/components/motion/PageTransition";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { offices } from "@/content/offices";
import { site } from "@/content/site";
import { clash, jetbrains, satoshi } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.seoDescription,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
  colorScheme: "dark",
};

// Organization structured data (schema.org) for search engines.
const hq = offices.find((o) => o.isHeadquarters);
const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  email: site.email,
  description: site.description,
  logo: new URL("/apple-icon", site.url).toString(),
  address: hq?.address
    ? { "@type": "PostalAddress", streetAddress: hq.address.slice(0, -1).join(", "), addressLocality: hq.city, addressCountry: "PK" }
    : undefined,
  location: offices.map((o) => ({ "@type": "Place", name: `${site.name} ${o.city}`, address: { "@type": "PostalAddress", addressLocality: o.city, addressCountry: o.country } })),
  sameAs: site.socials.map((s) => s.href).filter(Boolean),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${clash.variable} ${satoshi.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks JS as available before first paint, so reveal start states never flash. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {/* The splash plays once per session: later loads skip it before first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(sessionStorage.getItem('tv-splash'))document.documentElement.dataset.splash='done'}catch(e){}",
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd).replace(/</g, "\\u003c") }} />
      </head>
      <body>
        <Splash />
        <SiteBackdrop />
        <SkipLink />
        <SmoothScroll>
          <Header />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <PageTransition />
          <Cursor />
        </SmoothScroll>
      </body>
    </html>
  );
}
