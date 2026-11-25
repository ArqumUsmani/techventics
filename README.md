# Techventics website

Marketing site for Techventics: Home, About, Services and Contact.
Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, three.js
(@react-three/fiber + drei), GSAP + ScrollTrigger and Lenis. Every page is statically
generated; the only server code is the contact form endpoint.

---

## 1. Run it locally

Requirements: **Node.js 20.9 or newer** (tested on Node 26).

```bash
npm install
cp .env.example .env.local   # then fill in the values (see section 3)
npm run dev                  # http://localhost:3000
```

Other commands:

| Command | What it does |
| --- | --- |
| `npm run build` | Production build (also type-checks and lints) |
| `npm start` | Serve the production build locally |
| `npm run lint` / `npm run typecheck` | Lint / type-check only |
| `npm run capture:vmark` | Re-render the hero mark's static fallback image (dev server must be running) |
| `npm run capture:globe` | Re-render the globe's static fallback image (dev server must be running) |

---

## 2. Edit content (no component changes needed)

All copy and data live in typed files under [`content/`](content/):

| File | What's in it |
| --- | --- |
| `site.ts` | Company name, tagline, email, nav, social links, logo path |
| `home.ts` | Home page copy: intro, manifesto, section titles, closing CTA |
| `services.ts` | The four services: summary, tags, description, deliverables, tools, related project |
| `projects.ts` | Case studies (currently **placeholders**: set `placeholder: false` for real ones) |
| `stats.ts` | The numbers on Home (currently **placeholder values**) |
| `process.ts` | Discover / Design / Build / Launch steps |
| `about.ts` | About page: story, values, team (placeholder slots) |
| `offices.ts` | Offices: city, time zone (for the live clocks), address, map coordinates |
| `faqs.ts` | Services page FAQ (placeholder answers) |
| `contact.ts` | Contact page copy, form options (service list, budget ranges) |

Images:

- **Project covers / hover videos:** put files in `public/images/work/` and set `image`
  (e.g. `/images/work/freight.jpg`) and `previewSrc` (a short muted `.mp4`) in `projects.ts`.
- **Team portraits:** put files in `public/images/team/` and set `photo` in `about.ts`.
  They are shown in monochrome and turn to colour on hover.
- **Logo:** export a version that reads on a dark background (light "TECH") as
  `public/brand/logo.svg` and set `logo.src` in `site.ts`. The 3D mark, favicon and share
  images use the V shape in [`components/three/vmarkShape.ts`](components/three/vmarkShape.ts):
  replace the facet points there with the real logo's, then run `npm run capture:vmark`.

---

## 3. Contact form email

The form posts to `/api/contact`, which validates the input (zod), drops spam (hidden
honeypot field, minimum fill time, basic rate limit) and emails the enquiry with the
sender set as Reply-To.

It sends through **SMTP** if `SMTP_*` is set, otherwise through **Resend** if
`RESEND_API_KEY` is set. In development with neither, the message is printed in the
terminal instead.

### Option A: cPanel mailbox over SMTP (current setup)

In `.env.local` (and on Vercel, see below):

```env
CONTACT_TO_EMAIL=Info@techventics.com      # must be a real mailbox or forwarder in cPanel
SMTP_HOST=mail.techventics.com             # cPanel → Email Accounts → Connect Devices
SMTP_PORT=465                              # 465 = SSL, 587 = STARTTLS
SMTP_USER=techandk@techventics.com
SMTP_PASS=…                                # the mailbox password
```

In cPanel → **Email Deliverability**, make sure SPF and DKIM are valid, so enquiries
don't land in spam.

### Option B: Resend

Leave `SMTP_*` empty and set `RESEND_API_KEY`. To send from your own domain, verify
`techventics.com` in Resend and set `CONTACT_FROM_EMAIL="Techventics Website <website@techventics.com>"`.
Until then Resend's test sender only delivers to the Resend account owner.

**Never commit `.env.local`** (it is git-ignored).

---

## 4. Deploy to Vercel (free tier)

1. Push this repository to GitHub (already done: `ArqumUsmani/techventics`).
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import the repository.
   Framework preset: Next.js. No build settings need changing.
3. **Settings → Environment Variables**: add the same variables as `.env.local`, plus
   `NEXT_PUBLIC_SITE_URL=https://techventics.com` (used for canonical URLs, sitemap and
   share images).
4. Deploy. Every push to `main` deploys to production; pull requests get preview URLs.

### Point techventics.com at Vercel (keep email on cPanel)

Email for `@techventics.com` is hosted on cPanel, so **do not move the domain's
nameservers to Vercel**: change only the website records, and leave the MX records alone.

1. In Vercel → Project → **Settings → Domains**, add `techventics.com` and `www.techventics.com`.
2. In cPanel → **Zone Editor** for techventics.com:
   - `A` record for `techventics.com` (`@`) → `76.76.21.21`
   - `CNAME` record for `www` → `cname.vercel-dns.com`
   - Remove any other `A`/`AAAA` record for `@` or `www` that points at the old hosting.
   - **Leave the `MX`, `mail`, SPF (`TXT`) and DKIM records unchanged.**
3. Wait for DNS (minutes to a few hours). Vercel issues the HTTPS certificate automatically.
   Use the values Vercel shows on the Domains page if they differ from the ones above.

---

## 5. How it's put together

```
app/                    Routes (Home, About, Services, Contact), API route, SEO files
  api/contact/          Contact form endpoint
  capture/              Dev-only pages used to render the 3D fallback images (404 in production)
  sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx, apple-icon.tsx, icon.svg
components/
  layout/               Header (reference-matched nav), footer, page hero, logo
  sections/             Page sections (home/, about/, services/, contact/)
  motion/               Smooth-scroll-aware motion: reveals, count-up, circuit traces,
                        cursor, magnetic buttons, page transitions
  reactbits/            SplitText from React Bits (footer wordmark reveal), ported to TypeScript
  three/                3D: dotted V mark + hero scene, globe, device tiers
  ui/                   Buttons, cards, accordion, section header, live clock
content/                All editable copy and data
lib/                    GSAP setup, motion hooks, contact schema, mailer, share-image renderer
public/fonts/           Self-hosted Clash Display, Satoshi, JetBrains Mono (+ licenses)
public/images/          Static fallbacks for the 3D scenes
scripts/                capture-fallback.mjs
```

### Performance and accessibility

- The 3D scenes load lazily and only on capable devices. Each device gets a tier:
  - **high:** bloom effects on.
  - **low:** phones and modest laptops; lighter scene.
  - **static:** reduced motion, no WebGL or weak hardware; a pre-rendered image instead.
  Scenes pause when off screen.
- `prefers-reduced-motion` turns off smooth scroll, the fly-through, the custom cursor,
  magnetic buttons and page transitions, and shows all text without animation.
- Fonts are self-hosted through `next/font`, which avoids layout shift. Focus states are
  ember outlines, and every interactive element can be reached by keyboard.

### Fonts and data

- **Clash Display and Satoshi:** from Fontshare, under the Fontshare Free Font License
  (free for commercial use).
- **JetBrains Mono:** under the SIL Open Font License.
- **Globe land outlines:** from Natural Earth (public domain).
- **SplitText** (`components/reactbits/SplitText.tsx`): from [React Bits](https://reactbits.dev), under MIT + Commons Clause.
- Licenses are in `public/fonts/licenses/`.

---

## 6. Still to supply (placeholders in the site today)

- Logo as SVG (dark-background version)
- USA and UK office addresses (`content/offices.ts`)
- Team names, roles and portraits (`content/about.ts`)
- Real case studies with images or videos (`content/projects.ts`)
- Real numbers (`content/stats.ts`) and FAQ answers (`content/faqs.ts`)
- Social profile URLs (`content/site.ts`)
- Final founding story and service list, if they change
