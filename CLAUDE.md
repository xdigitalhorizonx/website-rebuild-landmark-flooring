# CLAUDE.md — Landmark Flooring website

Project memory for the **Landmark Flooring** marketing-site rebuild. Read this
before working on the site. Detailed SEO research/plan lives in `docs/seo/`.

## What this is
Static marketing site (plain HTML + CSS + a little inline vanilla JS, **no build
step, no framework**) for **Landmark Flooring** — Carson City NV's flooring store
**and** professional installer, serving Northern Nevada. Host: any static host; serve
repo root, `index.html` is the entry point. Local preview: `python3 -m http.server`.

## Business facts (NAP — keep consistent on every page; verify against the live GBP)
- **Name:** Landmark Flooring
- **Address:** 2085 East William St, Suite 10, Carson City, NV 89701
- **Phone:** (775) 297-3236  →  `tel:+17752973236`
- **Hours:** Mon–Fri 9am–5pm
- **Domain:** https://landmarkflooringusa.com/  (live domain currently returns 403 to bots)
- **Sells + installs:** Carpet · Luxury Vinyl (LVP/LVT, waterproof) · Laminate · Hardwood/wood · Custom Rugs · professional installation
- **Segments:** Residential · Property Management · Commercial
- **Service area (from the Carson City showroom):** Carson City, Reno, Sparks, Minden, Gardnerville, Lake Tahoe (NV), Virginia City, Fallon, + all Northern Nevada
- **Differentiators:** "The Landmark Guarantee" (warrantied products + warrantied labor) · licensed, bonded & insured · free estimates · financing available · in-store flooring visualizer · premium & budget options

## ⚑ Installer wording (LOCKED — client directive)
- Describe installers as **"skilled installers on our team"** / **"our skilled installers"** / **"skilled installers who are part of our team."**
- **Never** use "in-house", "our own crews/team", "warrantied in-house labor", or any wording that contrasts against subs. **Never** mention subcontractors or contractors in visible copy. Some installers are contractors — the site must not reveal or contrast that.
- Keep all warranty/guarantee language: "warrantied", "warrantied labor", "warrantied installation", "The Landmark Guarantee", "licensed, bonded & insured".
- The **only** allowed use of "contractor" is the *Nevada State Contractors Board license* (the licensing authority) — currently in `TODO (pre-publish)` comments.

## ⛔ DO NOT INVENT (placeholders only until the client supplies real data)
- **NV State Contractors Board license number** (goes next to "Licensed, bonded & insured" on home, /about/, /installation/). Leave the existing `TODO (pre-publish)` markers.
- **Google rating value + review count, and any review quotes/names.** Never add `aggregateRating`/`Review` schema. Replace placeholder testimonials with REAL reviews only.
- **Financing APR / lender / terms** — keep generic "financing available" wording.
- **Specific local projects, customer names, project photos** on city/segment pages.
- **Cost numbers** — only industry ranges explicitly labeled as estimates, never "Landmark's price."
- **Brand names carried** (Shaw/Mohawk/Stanton/etc.) — list only brands the client confirms they stock.
- **"Since [year]" / project counts / trust stats**, and the **official logo** (`assets/logo.png`).

## Design system (match it exactly on new pages — see `index.html` + `styles.css`)
- **Brand:** blue `#0074D4` (`--blue`), pale `#E6F4FF`; warm amber AA-token system
  `--accent-text:#965012` (text on cream), `--accent-on-dark:#EDB068` (on photos),
  `--accent-fill:#8A4A0E` (fills). Surfaces: cream `#FBF6EF` / `#F4ECE0`; ink `#1C2530`.
- **Font:** Outfit (400–800), loaded from Google Fonts. Global film-grain `body::before`.
- **Layout:** `.container` (max 1200px); numbered banded sections (`.band-cream` / `band-cream2`
  / `band-pale` / `band-blue`) with oversized `.sec-num` + `.eyebrow` + `.section-head`.
- **Reusable components (reuse, don't reinvent):** `.btn`(`-primary`/`-amber`/`-ghost`/`-outline`),
  `.eyebrow`, `.stat`/`.stat-grid`, `.offer`/`.offer-grid`, `.serve-card`, `.split`(`.rev`),
  `.checklist`, `.chips`/`.chip`, `.steps`/`.step`, `.area-grid`, `.quotes`/`.quote`, `.fin`,
  `.faq` (`<details>`), `.cta`, `.plank`, `.site-header`/`.nav`, `.site-footer`, `.sticky-call`.
  The home-only `.rail` (section index) and the "subfloor/blueprint" easter egg stay on home only.
- Accessibility baked in: skip link, `:focus-visible`, aria labels, `prefers-reduced-motion`,
  JS-off-safe `.reveal` via `<noscript>`. Keep it.

## New-page build conventions
- **Clean URLs via folders:** `/flooring/luxury-vinyl/index.html` → `/flooring/luxury-vinyl/`.
- **Root-relative refs everywhere on sub-pages:** `/styles.css`, `/assets/pages.css`, `/assets/site.js`, `/assets/…`, and links like `/flooring/carpet/`. (Root `index.html` keeps its existing relative refs.)
- New shared component CSS → `assets/pages.css` (loaded after `styles.css`). Shared sub-page JS → `assets/site.js` (home keeps its own inline JS).
- Every non-home page: unique `<title>` (~51–60 chars) + `<meta description>` (~150–158), one `<h1>`,
  self-referencing **absolute canonical with trailing slash**, OG/Twitter, a visible breadcrumb +
  matching `BreadcrumbList` JSON-LD, the standard header/footer, NAP, sticky click-to-call.

## Structured-data rules (current as of 2026)
- ONE business node: `["HomeAndConstructionBusiness","Store"]` with stable `@id`
  `https://landmarkflooringusa.com/#business` on home; **reference the same `@id`** from
  `/contact/` and every `Service` node (`provider` → `#business`). Do **not** mint a second
  LocalBusiness per city.
- `Service` (serviceType + provider `#business` + areaServed) on installation/material/segment/city pages.
  `Product`/`Offer` only where a real product image + real price exists. `Article`/`BlogPosting` on guides.
- **No `FAQPage` schema anywhere.** Google fully deprecated FAQ rich results on **2026-05-07**
  (restricted to gov/health since Aug 2023). Keep FAQ as visible HTML for users + AI engines only.
  The legacy `FAQPage` JSON-LD was removed from `index.html` for this reason.
- **Never** add `Review`/`AggregateRating` self-markup (ineligible + policy risk).

## SEO strategy (the short version — full detail in `docs/seo/`)
- Convert the one-pager into a **pillar-cluster site**: materials hub + 5 material pages,
  installation pillar + 5 service spokes, commercial + property-management, a service-area hub +
  gated city pages, conversion/trust pages (free-estimate, contact, about, reviews, financing),
  and a guides hub.
- **Money pages first** (transactional). Per-material/per-service pages are the #1 local-organic
  factor **only if genuinely deep** (~600–1,000+ words, real specifics/photos) — never spun
  near-duplicates (those rank *worse*).
- **City pages are an organic (blue-link) play, NOT a Map-Pack shortcut** — a single Carson City
  showroom can't proximity-rank in Reno/Sparks/Tahoe Maps. Each city page must earn unique local
  value (neighborhoods, climate, honest "serving X from our Carson City showroom" framing).
  **Tier-3 cities (Lake Tahoe, Virginia City, Fallon) stay UNBUILT/UNLINKED until real local proof
  exists.** Minden+Gardnerville may merge into one page if proof is thin. Avoid an 8-city footer
  cross-link block (reads as doorway scaffolding).
- **Guides** are top-of-funnel + AI-citation/assist, NOT a money-page ranking lever; each must link
  to its money page + /free-estimate/. Sequence them after money pages.
- The real Map-Pack lever is **off-site** (Google Business Profile + reviews + citations) — flag to client.

## Key docs
- `docs/seo/PAGE-PLAN.md` — all 41 pages: slugs, keywords, title/meta/H1, section outlines, schema, links, build order.
- `docs/seo/KEYWORD-MAP.md` — search terms → target page.
- `docs/seo/SEO-DECISIONS.md` — adversarial-verification verdicts, competitor snapshot, schema strategy, all sources.
