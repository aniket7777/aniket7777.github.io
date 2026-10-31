# Aniket Shrivastava, portfolio

Static site, no build step. Open `index.html` in a browser to preview.

## Structure
- `index.html`: the homepage (timed curtain version)
- `assets/js`: GSAP 3.13 (ScrollTrigger, SplitText), served with the site
- `assets/fonts`: Inter Tight and JetBrains Mono (latin), served with the site
- `assets/img`: favicon, share image (`og.jpg`), no-WebGL fallback (`hero-still.jpg`)
- `404.html`: shown for any missing page

## Editing
All design values live at the top of `index.html`:
- `EFFECT COLOURS` and `TYPE & GRID` blocks inside `:root`
- the `effect-settings` JSON (from the Gradient Blinds Lab)
- `TUNE` in the script (curtain speed, triggers, hero button legibility)

## Before public launch
1. Replace placeholder content (case studies, bio, portrait, email and LinkedIn links, footer line).
2. Delete the `<meta name="robots" content="noindex, nofollow">` line.
3. Make `og:image` an absolute URL (for example `https://yourdomain.com/assets/img/og.jpg`) so LinkedIn and WhatsApp show the preview.

## Deploy
GitHub Pages: Settings, Pages, Source "Deploy from a branch", branch `main`, folder `/ (root)`.
