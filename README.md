# Landmark Flooring — Website

Marketing website for **Landmark Flooring**, Carson City's premier flooring
store and installer, serving all of Northern Nevada (carpet, luxury vinyl,
laminate, hardwood, and custom rugs).

This is a self-contained **static site** — plain HTML, CSS, and image assets,
with a small amount of vanilla JavaScript inlined in `index.html`. No build
step, framework, or dependencies are required.

## Structure

```
.
├── index.html      # The full single-page site (markup + inline JS)
├── styles.css      # All styling
└── assets/         # Photography and the social-share (Open Graph) image
```

## Local preview

Because the page loads `styles.css` and images via relative paths, open it
through a local web server rather than the `file://` protocol:

```bash
# Python 3
python3 -m http.server 8000
# then visit http://localhost:8000
```

Any static server works (`npx serve`, etc.).

## Deployment

It can be hosted by any static host — GitHub Pages, Netlify, Vercel, or an
S3/CDN bucket. Serve the repository root; `index.html` is the entry point.

## Features

- Responsive, single-page layout with a sticky header, a desktop
  section-index rail, and a real mobile disclosure menu (hamburger with
  `aria-expanded`, Escape-to-close, and click-outside-to-close).
- Performance-tuned hero: a responsive `srcset`/`sizes` image (768–2560px
  variants plus the full-resolution original) with `rel=preload` and
  `fetchpriority=high` for a fast LCP, and below-the-fold images that are
  lazy-loaded and `decoding=async`.
- Interactive "See the Difference" before/after install reveal slider —
  draggable via Pointer Events (mouse + touch) and operable from the keyboard
  via an overlaid range input.
- Accessible by default: skip link, surface-aware focus-visible outlines,
  `aria` labels, tactile `:active` states, and a `prefers-reduced-motion` path
  (including a reduced-motion-safe Ken Burns hero drift).
- On-scroll reveal animations that degrade gracefully with JS disabled
  (via `<noscript>`) and with reduced-motion enabled.
- SEO/structured data: Open Graph + Twitter card meta (absolute image URLs),
  plus `HomeAndConstructionBusiness`/`Store` and `FAQPage` JSON-LD. The on-page
  FAQ text is kept codepoint-identical to the `FAQPage` schema.
- A hidden "Subfloor / blueprint" mode easter egg (Konami code, typing
  `subfloor`, tapping the `LF` logo 5×, or the `#subfloor` URL hash).

## Pre-publish checklist

The HTML contains `TODO (pre-publish)` comments marking content that must be
filled in with **real** data before launch — these intentionally avoid invented
values:

- Official Landmark Flooring logo (referenced as `assets/logo.png` in the
  JSON-LD and footer).
- Nevada contractor license number, alongside the "Licensed, bonded & insured"
  copy and inside the FAQ answer + matching JSON-LD.
- Real Google reviews and a live aggregate rating/review count. The reviews
  section currently shows honest "what to expect" commitments rather than
  invented quotes, names, or star ratings; do **not** add `aggregateRating` to
  the JSON-LD until real review data exists.
- Specific financing terms (APR/partner), if and when confirmed.

## Notes

The "Explore …" product links and the footer's Flooring column currently point
to the on-page `#flooring` section. Dedicated product detail pages (carpet,
luxury vinyl, laminate, hardwood, custom rugs) are not part of this delivery; if
they're added later, repoint those links to the new pages.
