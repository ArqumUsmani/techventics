"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { contact } from "@/content/contact";

/**
 * Karachi office map. Shows a styled dark preview first; the Google Maps embed only
 * loads on click (no third-party requests or cookies until asked, better Lighthouse).
 * The embed is darkened with a CSS filter to sit in the ink theme.
 */
export function OfficeMap() {
  const [loaded, setLoaded] = useState(false);
  const q = encodeURIComponent(contact.map.query);

  return (
    <div className="relative aspect-[4/3] overflow-hidden border border-steel bg-graphite md:aspect-[21/9]">
      {loaded ? (
        <iframe
          title="Map showing the Techventics head office in Karachi"
          src={`https://maps.google.com/maps?q=${q}&z=16&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0 [filter:invert(92%)_hue-rotate(180deg)_grayscale(0.7)_contrast(0.9)_brightness(0.85)]"
        />
      ) : (
        <>
          {/* Abstract street grid preview (not a real map) */}
          <svg aria-hidden viewBox="0 0 800 340" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
            <defs>
              <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="#303030" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="800" height="340" fill="url(#map-grid)" />
            <path d="M-20 250 L260 150 L520 175 L820 60" fill="none" stroke="#303030" strokeWidth="10" />
            <path d="M180 -20 L300 360" fill="none" stroke="#303030" strokeWidth="6" />
            <path d="M600 -20 L540 360" fill="none" stroke="#303030" strokeWidth="4" />
            <path d="M-20 90 L820 120" fill="none" stroke="#262626" strokeWidth="3" />
            <circle cx="400" cy="162" r="34" fill="#FC5400" opacity="0.12" />
            <circle cx="400" cy="162" r="7" fill="#FC5400" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-start justify-end gap-4 bg-linear-to-t from-ink/90 via-ink/30 to-transparent p-6 md:p-8">
            <p className="label text-ash">Head office · Karachi</p>
            <p className="max-w-[40ch] text-small text-bone">{contact.details.hq.lines.join(", ")}</p>
            <Button variant="outline" onClick={() => setLoaded(true)}>
              Load Google Map
            </Button>
          </div>
        </>
      )}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${q}`}
        target="_blank"
        rel="noopener noreferrer"
        className="label absolute right-4 top-4 bg-ink/85 px-3 py-2 text-bone transition-colors duration-400 hover:text-ember"
      >
        Open in Google Maps ↗<span className="sr-only"> (opens in a new tab)</span>
      </a>
    </div>
  );
}
