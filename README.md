# Techventics website

Marketing site for Techventics: Home, About, Services and Contact.
Built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, three.js
(@react-three/fiber + drei), GSAP + ScrollTrigger and Lenis.

**Hosting: cPanel, as static files.** `npm run build` exports the whole site to `out/`
(plain HTML, JS, CSS and images), which is uploaded to `public_html`. The only server-side
code is `contact.php`, which emails contact-form enquiries through cPanel's own mail server.

---

## 1. Run it locally

Requirements: **Node.js 20.9 or newer** (tested on Node 26).

```bash
npm install
cp .env.example .env.local   # sets the public site URL (no secrets needed)
npm run dev                  # http://localhost:3000
```

Other commands:

| Command | What it does |
| --- | --- |
| `npm run build` | Static export to `out/` (also type-checks and lints): this is what you upload |
| `npm run preview` | Serve `out/` locally at http://localhost:3100 to check the build |
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
| `services.ts` | The four services: summary, tags, description, deliverables, tools, images (each list becomes a slider) |
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
- **Logo:** the artwork lives in `public/brand/` as six SVGs:
  - `techventics-mark`, `techventics-wordmark` and `techventics-logo` (mark + wordmark);
  - each in an original-colour version and an `-on-dark` version (black drawn in bone for
    the dark site).

  They were traced from a 383px screenshot (`scripts/brand-source/`), so some edges are
  slightly soft. **When the original vector logo is available:**
  1. Save it over these files, keeping the names.
  2. Update the sizes in [`components/brand/logoFiles.ts`](components/brand/logoFiles.ts).
  3. Re-run `npm run capture:vmark`.

  What updates automatically from these files:
  - the header and footer;
  - the dotted 3D hero mark, which is sampled from `techventics-mark-on-dark.svg`;
  - the favicon (`app/icon.svg`), the Apple icon and the share images.

---

## 3. Contact form email

The form posts to [`public/contact.php`](public/contact.php), which ships with the site.
It does the following:

- validates the input with the same rules as the browser;
- drops spam: a hidden honeypot field, a minimum fill time, 5 messages per IP per
  10 minutes, and posts from other websites;
- emails the enquiry with PHP `mail()`, which cPanel delivers through its own mail
  server. The visitor's address is set as Reply-To.

**No password or API key is needed or stored.** The addresses are at the top of
`contact.php`:

```php
const CONTACT_TO   = 'Info@techventics.com';      // where enquiries go
const CONTACT_FROM = 'techandk@techventics.com';  // sender: a real mailbox on this domain
```

Checklist in cPanel:

1. **Email Accounts / Forwarders:** `Info@techventics.com` must exist, as a mailbox or as a
   forwarder to one. Otherwise change `CONTACT_TO`.
2. **Email Deliverability:** SPF and DKIM for techventics.com should show as valid, so
   enquiries don't land in spam.
3. After uploading, send a test from the Contact page and check the inbox (and spam).

In `npm run dev`, the form posts to a local stand-in (`app/api/contact/route.dev.ts`)
that validates and prints the enquiry in the terminal, because PHP doesn't run in the
Next.js dev server.

---

## 4. Deploy to cPanel

1. Check `NEXT_PUBLIC_SITE_URL=https://techventics.com` in `.env.local`. It is baked into
   canonical URLs, the sitemap and share images.
2. Build:
   ```bash
   npm run build        # creates out/
   npm run preview      # optional: check it at http://localhost:3100
   ```
3. Upload the **contents** of `out/` (not the folder itself) to `public_html`. In
   cPanel → **File Manager**, the simplest way is:
   - zip the contents of `out/`;
   - upload the zip to `public_html`;
   - choose **Extract**;
   - delete the zip.

   Turn on **Settings → Show Hidden Files**, so you can confirm `.htaccess` arrived.

   Use a zip tool that writes standard `/` paths, such as 7-Zip, macOS Finder, or Windows' built-in `tar`:
   ```powershell
   tar -a -c -f techventics-upload.zip -C out .htaccess *
   ```
   Don't use PowerShell's `Compress-Archive` or .NET `ZipFile`. They write `\` paths, and
   cPanel would extract those as single files with odd names instead of folders.
4. Remove old files from previous uploads, but keep `.well-known/` (used for SSL) and
   anything else cPanel created.
5. Open https://techventics.com and click through the pages. Then send a test message
   from the Contact page.

The site must sit at the **root** of the domain, not in a sub-folder, because the
`.htaccess` rules assume it.

[`public/.htaccess`](public/.htaccess) is copied into the build automatically. It:

- serves clean URLs: `/about` serves `about.html`;
- forces HTTPS and redirects `www` to the bare domain;
- uses the custom 404 page;
- turns on compression and long-term caching for the hashed build files;
- adds basic security headers.

If the domain has no SSL certificate yet (cPanel → **SSL/TLS Status** → run AutoSSL),
comment out the three "Force HTTPS" lines until it does.

Each content change means: edit the files in `content/`, run `npm run build`, and upload
`out/` again.

---

## 5. How it's put together

```
app/                    Routes (Home, About, Services, Contact), SEO files
  api/contact/          route.dev.ts: dev-only stand-in for contact.php
  capture/              page.dev.tsx: dev-only pages that render the 3D fallback images
                        (*.dev.* files are routes in `next dev` only; see next.config.ts)
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
lib/                    GSAP setup, motion hooks, contact schema, share-image renderer
public/fonts/           Self-hosted Clash Display, Satoshi, JetBrains Mono (+ licenses)
public/images/          Static fallbacks for the 3D scenes (full + half size)
public/contact.php      Contact form mailer (runs on cPanel)
public/.htaccess        Apache rules for the live site
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

- The original vector logo (SVG/AI/PDF), to replace the traced version in `public/brand/`
- USA and UK office addresses (`content/offices.ts`)
- Team names, roles and portraits (`content/about.ts`)
- Real case studies with images or videos (`content/projects.ts`)
- Real numbers (`content/stats.ts`) and FAQ answers (`content/faqs.ts`)
- Social profile URLs (`content/site.ts`)
- Final founding story and service list, if they change
