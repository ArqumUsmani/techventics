import Link from "next/link";
import SplitText from "@/components/reactbits/SplitText";
import { offices } from "@/content/offices";
import { site } from "@/content/site";
import { Logo } from "./Logo";
import { Year } from "./Year";

export function Footer() {
  return (
    <footer className="border-t border-steel bg-ink">
      <div className="container-x grid grid-cols-1 gap-y-14 py-20 md:grid-cols-12 md:gap-x-8 md:py-28">
        {/* Brand */}
        <div className="md:col-span-5 lg:col-span-6">
          <Link href="/" aria-label={`${site.name} home`} className="inline-block">
            <Logo markWidth={50} />
          </Link>
          <p className="mt-6 max-w-[34ch] text-small text-ash">{site.tagline}</p>
          <a
            href={`mailto:${site.email}`}
            className="mt-10 inline-block font-display text-h4 font-medium text-bone underline decoration-steel decoration-1 underline-offset-[0.25em] transition-colors duration-400 hover:decoration-ember"
          >
            {site.email}
          </a>
        </div>

        {/* Nav */}
        <nav aria-label="Footer" className="md:col-span-2 lg:col-span-2">
          <h2 className="label text-ash">Sitemap</h2>
          <ul className="mt-5 space-y-3">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-small text-bone/85 transition-colors duration-400 hover:text-ember"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Offices */}
        <div className="md:col-span-5 lg:col-span-4">
          <h2 className="label text-ash">Offices</h2>
          <ul className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
            {offices.map((office) => (
              <li key={office.id}>
                <p className="text-small font-medium text-bone">{office.city}</p>
                <p className="label mt-1 text-ash">{office.country}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-x flex flex-col-reverse items-start justify-between gap-6 border-t border-steel py-8 sm:flex-row sm:items-center">
        <p className="label text-ash">
          © <Year /> {site.name}. All rights reserved.
        </p>
        <ul className="flex gap-3" aria-label="Social">
          {site.socials.map((social) =>
            social.href ? (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="font-mono text-label flex size-10 items-center justify-center rounded-full border border-steel text-bone/80 transition-colors duration-400 hover:border-ember hover:text-ember"
                >
                  {social.short}
                </a>
              </li>
            ) : (
              // PLACEHOLDER: no profile URL yet
              <li key={social.label}>
                <span
                  title={`${social.label} (coming soon)`}
                  className="font-mono text-label flex size-10 items-center justify-center rounded-full border border-dashed border-steel text-ash"
                >
                  <span aria-hidden>{social.short}</span>
                  <span className="sr-only">{social.label} (coming soon)</span>
                </span>
              </li>
            ),
          )}
        </ul>
      </div>

      {/* Giant wordmark (React Bits SplitText): letters rise from a mask as the footer
          scrolls in; the bottom of the letters is clipped by the page edge. TECH in
          faint bone, VENTICS in muted ember (orange stays a low-opacity accent). */}
      <div aria-hidden className="container-x pointer-events-none select-none overflow-hidden">
        <SplitText
          text="TECHVENTICS"
          tag="span"
          splitType="chars"
          effect="rise"
          mask
          delay={45}
          duration={1.1}
          staggerFrom="start"
          textAlign="center"
          // It sits at the very bottom of the page, so start as soon as it enters the viewport.
          threshold={0}
          rootMargin="0px"
          className="-mb-[0.17em] w-full whitespace-nowrap font-display text-[min(calc(13.1vw-0.3rem),9.7rem)] font-bold uppercase leading-[0.82] tracking-[-0.035em] text-bone/[0.13] [&_:is(.split-char,.split-char-mask):nth-child(n+5)]:text-ember/45"
        />
      </div>
    </footer>
  );
}
