# Aniket Shrivastava, portfolio

Static site, no build step. Open `index.html` in a browser to preview.

## Structure
- `index.html`: the homepage (Ember Blinds hero)
- `assets/css/tokens.css`: colour tokens, the single source of truth for colour
- `docs/design-system`: design system docs (start with `README.md`, then `colour.md`)
- `assets/js`: GSAP 3.13 (ScrollTrigger, SplitText), served with the site
- `assets/fonts`: Inter Tight and JetBrains Mono (latin), served with the site
- `assets/img`: favicon, share image (`og.jpg`), no-WebGL fallback (`hero-still.jpg`)
- `404.html`: shown for any missing page

## Editing
- Colour: `assets/css/tokens.css` only. Components read the semantic `--color-*` roles; see `docs/design-system/colour.md` for the rules and the contrast audit.
- Type and grid: the `:root` block at the top of `index.html`.
- Hero effect: the `effect-settings` JSON in `index.html`. Paste the output of the Ember Blinds configurator "Copy settings (JSON)" as-is; values are clamped to safe ranges.

## Before public launch
1. Replace placeholder content (case studies, bio, portrait, email and LinkedIn links, footer line).
2. Delete the `<meta name="robots" content="noindex, nofollow">` line.
3. Make `og:image` an absolute URL (for example `https://yourdomain.com/assets/img/og.jpg`) so LinkedIn and WhatsApp show the preview.

## Deploy
GitHub Pages: Settings, Pages, Source "Deploy from a branch", branch `main`, folder `/ (root)`.
