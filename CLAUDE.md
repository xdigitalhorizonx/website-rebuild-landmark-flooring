# CLAUDE.md — Landmark Flooring website

Project memory for the **Landmark Flooring** marketing-site rebuild. Read this
before working on the site. Detailed SEO research/plan lives in `docs/seo/`.

## What this is
Static marketing site (plain HTML + CSS + a little inline vanilla JS, **no framework**)
for **Landmark Flooring** — Carson City NV's flooring store **and** professional
installer, serving Northern Nevada. Host: any static host; serve repo root,
`index.html` is the entry point. Local preview: `python3 -m http.server`.
The only build step is an optional, fail-safe Sanity content injection (see
**Sanity CMS** below) — the committed HTML is always a complete, servable site.

## Sanity CMS (build-time content injection — SEO-safe)
Client-editable content lives in the **"Landmark Flooring"** Sanity project
(**projectId `qjx96i9p`**, dataset **`production`**, public read, org `o0aQQrsCl`,
account brandon@landmarkflooringusa.com). Content is baked into the static HTML at
**build time** by `scripts/build-from-sanity.mjs` (run via `npm run build`, wired in
`vercel.json`) — **never** fetched client-side, so SEO is unaffected.
- **Wired now (all 31 pages):** every page's `<main>` body copy (headings, paragraphs,
  lists, FAQ answers, etc. — including the home H1) and its `<head>` SEO fields
  (title, meta/OG/Twitter description, OG image alt) and in-body `img alt` text are
  editable — **~1,750 fields**. Injection points are `<!-- sanity:KEY -->…<!-- /sanity:KEY -->`
  comment pairs (body) and `<!--sanity-attr:KEY|ATTR-->` comments before a tag
  (attributes). **Keep the marker comments intact** — they are how the build finds
  what to replace. Home hero eyebrow/sub still come from `homePage`, and the home FAQ
  from `faqItem` docs.
- **Schema / where content lives:** one **`page`** document per URL (`_id: page-<slug>`)
  holding `title`, `path`, and a `blocks[]` array of `contentBlock`s (each = a `key`
  + read-only `label`/`group` + the editable `value`); plus the **`homePage`** singleton
  (hero) and the **`faqItem`** collection. The build map is keyed by `contentBlock.key`;
  **never edit a block's `key`** or the marker in the HTML will no longer match.
- **Tooling:** `scripts/build-from-sanity.mjs` is the deploy-time injector (generic,
  dependency-free, fail-safe). The one-time marker extractor + Sanity pusher used to
  set this up live in the session scratchpad, not the repo.
- **Fail-safe:** on any Sanity error/timeout the build deploys the committed HTML
  unchanged; a CMS outage can never break a deploy. Injection is byte-exact for body
  text; a few meta/alt attributes get harmless apostrophe re-encoding (`'`→`&#39;`).
- **Edit flow:** change + **Publish** in Sanity Studio (https://landmark-flooring.sanity.studio/,
  sign in as brandon@landmarkflooringusa.com) → **redeploy the site** (content is baked
  at build). After editing in Sanity, also update the committed HTML to match (or run
  `npm run build` and commit) so the repo stays the source of truth.
- **Intentionally NOT editable (locked for consistency):** the **NAP** (business
  name/address/phone/hours), the global **header/footer/sticky-call** chrome, and raw
  **JSON-LD** structured data. Per the binding NAP rule these must be wired everywhere
  at once or not at all — a future pass can add atomic NAP fields to a `siteSettings`
  singleton and reference them site-wide (incl. JSON-LD). Reviews stay out until REAL
  reviews exist (see DO-NOT-INVENT). Adding/removing/reordering whole sections is also
  a future enhancement (today's blocks edit existing content in place).
- CORS origins registered: landmarkflooringusa.com (+www), the production
  vercel.app alias, and localhost:8000 (build-time fetch needs none of these; they
  future-proof any runtime/Studio use).

## ⚑ Always give a view link when finishing changes (client directive)
After committing/pushing any change, ALWAYS end the reply with a link where the client can view it:
- **Vercel preview (latest for this branch):** https://website-rebuild-landmark-git-ce7011-xdigitalhorizonxs-projects.vercel.app — the branch alias always points to the newest deploy of `claude/landmark-flooring-seo-pages-4y1jr0`.
- Or the dashboard: https://vercel.com/xdigitalhorizonxs-projects/website-rebuild-landmark-flooring → **Deployments → top entry → Visit**.
- Deployments are protection-gated, so the link opens for the client when signed in to Vercel. Give it ~1 min to rebuild after a push. (If a specific deploy URL is known from a Vercel webhook, prefer linking that.)

## Business facts (NAP — keep consistent on every page; verify against the live GBP)
- **Name:** Landmark Flooring
- **Address:** 2085 East William St, Suite 10, Carson City, NV 89701
- **Phone:** (775) 297-3236  →  `tel:+17752973236`
- **Hours:** Mon–Fri 9am–5pm
- **Domain:** https://landmarkflooringusa.com/  (live domain currently returns 403 to bots)
- **Sells + installs:** Carpet · Luxury Vinyl (LVP/LVT, waterproof) · Laminate · Hardwood/wood · Custom Rugs · professional installation
- **Segments:** Residential · Property Management · Commercial
- **Service area (from the Carson City showroom):** Carson City, Reno, Sparks, Minden, Gardnerville, Lake Tahoe (NV), Virginia City, Fallon, + all Northern Nevada
- **Differentiators:** "The Landmark Guarantee" (warrantied products + warrantied labor) · licensed, bonded & insured · free estimates · financing available · premium & budget options. (The **in-store flooring visualizer was REMOVED** as a feature on 2026-07-21 per client — do not mention it anywhere on the site.)

## ⚑ Installer wording (LOCKED — client directive, updated 2026-07-21)
- Describe installation as **"we use skilled installers and warranty our labor"** / **"the skilled installers we use"** / **"our skilled installers."**
- **Never** claim installers are "on our team", "part of our team", or "part of Landmark" (retired 2026-07-21 per client). **Never** use "in-house", "our own crews/team", "warrantied in-house labor", or any wording that contrasts against subs. **Never** mention subcontractors or contractors in visible copy. Some installers are contractors — the site must not reveal or contrast that.
- Keep all warranty/guarantee language: "warrantied", "warrantied labor", "warrantied installation", "The Landmark Guarantee", "licensed, bonded & insured".
- The **only** allowed use of "contractor" is the *Nevada State Contractors Board license* (the licensing authority) — currently in `TODO (pre-publish)` comments.

## ⛔ DO NOT INVENT (placeholders only until the client supplies real data)
- **NV State Contractors Board license number** (goes next to "Licensed, bonded & insured" on home, /about/, /installation/). Leave the existing `TODO (pre-publish)` markers.
- **Google rating value + review count, and any review quotes/names.** Never add `aggregateRating`/`Review` schema. Replace placeholder testimonials with REAL reviews only.
- **Financing APR / lender / terms** — keep generic "financing available" wording.
- **Specific local projects, customer names, project photos** on city/segment pages.
- **Cost numbers** — only industry ranges explicitly labeled as estimates, never "Landmark's price."
- **Brand names carried** (Shaw/Mohawk/Stanton/etc.) — list only brands the client confirms they stock.
- **"Since [year]" / project counts / trust stats.** (The **real logo is now supplied**: blue "LANDMARK FLOORING" wordmark, transparent, no icon, at `assets/logo.png` (700×120) — shown in every header/footer via `.brand-logo`; the dark footer renders it white with CSS `filter:brightness(0) invert(1)`. Source variants incl. white + LF-icon versions are in the client's logo zip.)

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
  **Built city pages:** Carson City, Reno, Sparks, **Minden+Gardnerville** (one combined page,
  `/service-area/minden-gardnerville/`), **Dayton**. **Lake Tahoe, Virginia City & Fallon stay
  UNBUILT/UNLINKED until real local proof exists** — the client explicitly HELD Lake Tahoe on
  2026-07-01 pending a real Tahoe project (organic-only play; a single Carson City showroom can't
  proximity-rank the Tahoe Map Pack). Avoid an 8-city footer cross-link block (doorway scaffolding).
- **Guides** are top-of-funnel + AI-citation/assist, NOT a money-page ranking lever; each must link
  to its money page + /free-estimate/. Sequence them after money pages.
- The real Map-Pack lever is **off-site** (Google Business Profile + reviews + citations) — flag to client.

## Key docs
- `docs/seo/PAGE-PLAN.md` — all 41 pages: slugs, keywords, title/meta/H1, section outlines, schema, links, build order.
- `docs/seo/KEYWORD-MAP.md` — search terms → target page.
- `docs/seo/SEO-DECISIONS.md` — adversarial-verification verdicts, competitor snapshot, schema strategy, all sources.
