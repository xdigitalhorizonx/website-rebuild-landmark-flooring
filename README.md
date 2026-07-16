# Landmark Flooring — Website

Marketing website for **Landmark Flooring**, Carson City's premier flooring
store and installer, serving all of Northern Nevada (carpet, luxury vinyl,
laminate, hardwood, and custom rugs).

This is a self-contained **static site** — plain HTML, CSS, and image assets,
with a small amount of vanilla JavaScript inlined in `index.html`. No framework
or dependencies are required. An optional, fail-safe build step
(`npm run build` → `scripts/build-from-sanity.mjs`) injects client-editable
content (home hero copy + FAQ) from the "Landmark Flooring" Sanity project
(`qjx96i9p`/`production`) into the HTML at deploy time; if Sanity is
unreachable the committed HTML deploys unchanged.

## Structure

```
.
├── index.html              # Home (single-page, markup + inline JS)
├── styles.css              # Core styling (home + shared tokens/components)
├── sitemap.xml, robots.txt, 404.html
├── assets/
│   ├── *.jpg               # Photography + Open Graph image
│   ├── pages.css           # Components for the sub-pages
│   └── site.js             # Shared sub-page JS (header, reveal, mobile nav)
├── flooring/               # Materials hub + carpet / luxury-vinyl / laminate / hardwood / custom-rugs
├── installation/           # Installation pillar + per-material + hardwood-refinishing spokes
├── commercial/, property-management/
├── service-area/           # Hub + carson-city / reno / sparks (Tier-3 cities gated, see docs)
├── free-estimate/, contact/, about/, financing/
├── guides/                 # Resource hub + buying/cost/comparison guides
├── CLAUDE.md               # Project memory (brand facts, conventions, SEO strategy)
└── docs/seo/               # PAGE-PLAN.md · KEYWORD-MAP.md · SEO-DECISIONS.md
```

Each sub-page lives at `folder/index.html` for clean URLs (e.g.
`/flooring/luxury-vinyl/`) and references assets root-relative (`/styles.css`,
`/assets/...`). The home page keeps its original relative paths.

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

- Responsive, single-page layout with a sticky header and a desktop
  section-index rail.
- Accessible by default: skip link, focus-visible outlines, `aria` labels,
  and a `prefers-reduced-motion` path.
- On-scroll reveal animations that degrade gracefully with JS disabled
  (via `<noscript>`) and with reduced-motion enabled.
- SEO/structured data: Open Graph + Twitter card meta, plus a single
  `HomeAndConstructionBusiness`/`Store` JSON-LD node (`@id` `#business`) that
  sub-pages reference via `Service`/`BreadcrumbList`/`Article` schema. The
  `FAQPage` JSON-LD was removed — Google fully deprecated FAQ rich results on
  2026-05-07; the visible FAQ accordion stays for users + AI engines.
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
- Real Google reviews and a live aggregate rating/review count (the three
  testimonials and the "What customers say" section are placeholders; do **not**
  add `aggregateRating` to the JSON-LD until real data exists).
- Specific financing terms (APR/partner), if and when confirmed.

## Notes

Dedicated material, service, city, segment and guide pages now exist (see the
`Structure` tree). The home page's "Explore …" cards, footer and service-area
grid point at them, and the conversion CTAs point to `/free-estimate/`.

## SEO architecture

This site was expanded from a one-pager into a pillar-cluster structure so it can
rank for the most common flooring-store / installer searches across Carson City
and Northern Nevada. The full plan — page list, target keywords, ready-to-use
title/meta/H1, section outlines, schema, and the internal-linking map — lives in
[`docs/seo/PAGE-PLAN.md`](docs/seo/PAGE-PLAN.md), with the keyword→page map and
the (adversarially verified) decisions + sources in the sibling docs. Brand facts,
conventions and "do not invent" guardrails are in [`CLAUDE.md`](CLAUDE.md).

Two intentional guardrails to keep in mind before launch:

- **Tier-3 city pages** (Lake Tahoe, Virginia City, Fallon) are *not* built and
  *not* linked from the service-area grid/sitemap — they stay unbuilt until real
  local projects/photos/reviews exist, to avoid Google's doorway/thin-content
  policies. Minden + Gardnerville may be consolidated into one page.
- **The real local-pack lever is off-site** (Google Business Profile + reviews +
  citations); a single Carson City showroom won't proximity-rank in Reno/Sparks/
  Tahoe Maps. The city pages are an organic ("blue-link") play.
