# VÖLT — Pro 3K

A scroll-cinematic single-product site for **VÖLT**, an electric padel-racket brand.
Built as a Codiolab reference for animated, image-led product storytelling on a static
hosting target (Cloudflare Pages).

> **Live:** https://volt.codiolab.com

---

## Stack

| Layer | Choice |
|------|--------|
| Framework | Next.js 16 (App Router) with `output: "export"` |
| UI | React 19, TypeScript strict |
| Styling | Tailwind CSS v4 (OKLCH brand tokens in `app/globals.css`) |
| Typography | Barlow Condensed + Chivo + JetBrains Mono (Google Fonts) |
| State | Zustand 5 with `persist` (cart in `localStorage`) |
| Icons | Lucide React |
| Browser testing | Playwright 1.60 |
| Hosting | Cloudflare Pages (static) |

---

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export to ./out
npm run typecheck
npm run lint
```

`out/` is the static bundle Cloudflare Pages serves directly.

---

## Project layout

```
app/                    # App Router routes — all client-static, no API routes
  globals.css           # Tailwind tokens (OKLCH palette, font vars)
  icon.svg              # Browser favicon (32×32 Zap mark)
  apple-icon.png        # iOS home-screen icon (180×180)
  layout.tsx            # Fonts, Nav, Footer, body padding for bottom-nav
  page.tsx              # Home (Hero + Chapters + CTA)
  product/              # Configurator + gallery
  technology / about / faq / cart / checkout / legal
components/             # Presentational + interactive components
  scroll-scrub-video.tsx   # RAF-driven currentTime scrubbing
  scroll-canvas.tsx        # 148-frame turntable on <canvas>
  chapter-video.tsx        # Pinned cinematic chapter wrapper
  product-gallery.tsx      # Native scroll-snap + mouse drag carousel
  nav.tsx                  # Top header + mobile bottom tab bar
lib/                    # cart-store.ts (Zustand), product.ts, utils.ts
public/
  hero/desktop/         # 148 turntable frames (.webp)
  product/              # Cleaned racket images (bg removed via rembg)
  posters/              # First-frame fallbacks for scroll-scrub videos
  videos/               # All-keyframe MP4s for scrub (charge / impact / hero)
```

Source assets (`images/`, `videos/`, `frames/`) are git-ignored — they are the
raw renders fed through `rembg`, `ffmpeg`, and PIL into the optimized `public/`
artifacts the site actually serves.

---

## Notable techniques

- **Scroll-scrubbed video** — Each chapter MP4 is re-encoded with
  `-g 1 -keyint_min 1 -sc_threshold 0` (every frame an I-frame) so `video.currentTime = t`
  seeks instantly. A `requestAnimationFrame` loop lerps current time toward the
  scroll-driven target with factor `0.18` for a cinematic feel.
- **Canvas turntable** — 148 transparent `.webp` frames pre-decoded with
  `requestIdleCallback`; canvas `drawImage` per RAF tick with contain-fit and a
  `1.5×` scale on portrait viewports so the racket fills the frame.
- **Mobile-first chapter layout** — On portrait viewports the canvas is sized
  to 60vh and the chapter text lives in the remaining 40vh — no overlap.
- **Facebook-style bottom nav** — Mobile-only 5-tab bar with safe-area
  padding; the desktop header keeps the same routes inline.
- **Native scroll-snap gallery** — Horizontal `snap-x snap-mandatory` carousel
  with pointer-event mouse drag, `IntersectionObserver` for active-state sync,
  smooth `scrollTo` for dot / arrow / thumbnail clicks.
- **Background-stripped product shots** — `rembg` + Pillow `getbbox` crop to
  tight `.webp` so the racket dominates the gallery frame at any size.

---

## Deploy — Cloudflare Pages

The static export in `out/` is the deployment artifact.

### Option A — Pages + GitHub (recommended)

1. Connect the GitHub repo in **Cloudflare Dashboard → Pages → Create project → Connect to Git**.
2. Build settings:
   - **Framework preset:** Next.js (Static HTML Export)
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
   - **Node version:** 20+
3. Custom domain → `volt.codiolab.com` → Cloudflare auto-creates the CNAME on the `codiolab.com` zone.

Every push to `main` triggers a production deploy. Every PR gets a preview URL.

### Option B — Wrangler CLI (direct upload)

```bash
npm run build
npx wrangler pages deploy out --project-name volt-padel
```

---

## Brand

- Accent: `#A8FF00` (electric chartreuse / "VÖLT green")
- Background: near-black `oklch(0.07 0 0)`
- Display: Barlow Condensed 900 italic — compressed athletic energy
- Body: Chivo — clean, fast-reading neutral sans
- Mono: JetBrains Mono — technical labels and spec readouts

---

Built with care by Codiolab.
