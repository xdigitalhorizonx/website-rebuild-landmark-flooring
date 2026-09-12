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
- **Address:** 2085 E William St #10, Carson City, NV 89701
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
- ~~NV State Contractors Board license number~~ — **RESOLVED 2026-09-11: `#0088180`** (client-supplied).
  Wired into all 26 credential spots + the footer line on every page, and into the matching Sanity blocks.
  Rendered as "Nevada State Contractors Board license **#0088180**" in body copy and
  "· NV Lic. #0088180" in the footer / home badge. This is the ONLY approved use of "contractor" in visible copy.
- **Google rating value + review count, and any review quotes/names.** Never add `aggregateRating`/`Review` schema. Replace placeholder testimonials with REAL reviews only.
- ~~Financing APR / lender / terms~~ — **RESOLVED 2026-09-11.** The client supplied the real
  terms (sourced verbatim from the live WordPress page https://landmarkflooringusa.com/financing/).
  See **Financing** below — use those exact figures, never invent new ones.
- **Specific local projects, customer names, project photos** on city/segment pages.
- **Cost numbers** — only industry ranges explicitly labeled as estimates, never "Landmark's price."
- **Brand names carried** (Shaw/Mohawk/Stanton/etc.) — list only brands the client confirms they stock.
- **"Since [year]" / project counts / trust stats.** (The **real logo is now supplied**: blue "LANDMARK FLOORING" wordmark, transparent, no icon, at `assets/logo.png` (700×120) — shown in every header/footer via `.brand-logo`; the dark footer renders it white with CSS `filter:brightness(0) invert(1)`. Source variants incl. white + LF-icon versions are in the client's logo zip.)

## Financing (REAL terms — Synchrony; sourced from the live site 2026-09-11)
`/financing/` carries the client's actual promotional financing, copied verbatim from
https://landmarkflooringusa.com/financing/. **Do not paraphrase, round, or invent any of it.**
- **Lender/partner:** Synchrony. **Card:** *Mohawk Flooring Synchrony HOME™ Credit Card.*
- **Apply Now link (exact, do not alter the querystring — it is the store's tracking code):**
  `https://www.synchrony.com/mmc/MI235043200?sitecode=ac0lpi0e6` (opens in a new tab, `rel="noopener"`).
- **Two offers:** *No Interest if paid in full within 6 months\** (qualifying purchases) and
  *No Interest if paid in full within 12 months\** (purchases of **$5,000.00 or more**).
- Both are **deferred-interest** offers. Each card prints the **full Synchrony disclosure verbatim**
  (As of 07/16/2024 · Purchase APR 34.99% · Penalty APR 39.99% · Min Interest Charge $2 · 2% promo fee
  on equal-payment no-interest promos of 18 months or more · subject to credit approval).
- ⚑ **The disclosure must stay visible** — never collapse it behind a `<details>`/accordion or truncate it.
  Deferred-interest offers are regulated; the terms have to be clear and conspicuous next to the claim.
  It lives in `.promo-fine` (`assets/pages.css`), which is always rendered.
- When Synchrony changes the promotion, update **both** the HTML and the matching Sanity blocks
  (`financing.035`–`financing.042`) and re-check the "As of" date.
- ⛔ Still DO NOT INVENT: monthly payment examples, approval odds/amounts, or any claim that a
  specific cost (e.g. labor) is guaranteed financeable — the offers only specify "one receipt."

## Primary navigation (7 items — order is deliberate)
`Flooring · Installation · Financing · Service Area · Guides · About · Contact` — a funnel:
what you buy → who installs it → how you pay → where we serve. In the header nav of every
page and the footer "Company" column (404.html has no footer columns).

**The header row cannot shrink.** `.brand`, `.nav-links` and `.nav-cta` are all `flex:none`
(`.brand` deliberately so — letting it shrink is what squashed the mobile wordmark), so the
row either fits or it overflows the page. Full-width it needs ~1250px. Three rules keep it
honest — **change one and re-measure all of them**:
- **≤1023px** → hamburger (`@media (max-width:1023px)` in **both** `styles.css` and
  `assets/pages.css` — these must stay in sync).
- **1024–1279px** → desktop nav, but the logo eases to 32px and the header phone is hidden
  (`.site-header .nav-cta .phone` — the `.site-header` prefix is required to beat the later
  base rule). Click-to-call stays available via `.sticky-call` and the footer.
- **≥1280px** → everything on: 40px logo, phone visible.

`.nav-links` also uses a responsive `clamp()` gap and font with `white-space:nowrap`.
**Verified 320px → 1600px: zero horizontal overflow on all 32 pages, and the nav is always
reachable (never both nav and hamburger, never neither).** Re-run that sweep before adding
an 8th nav item or changing the logo size — there is no slack left at 1024px.

## Forms → Resend (the site's only backend)
The lead form posts to **`api/lead.js`**, a Vercel serverless function that emails the
submission via **Resend**. Everything else on the site is static. Client directive: all
forms go through Resend — never Bricks, Netlify Forms, Formspree or a mailto fallback.
- **Env vars** (Vercel → Project → Settings → Environment Variables):
  `RESEND_API_KEY` (also accepts `RESEND_TOKEN` / `RESEND_API_TOKEN` / `RESEND`) ·
  `LEAD_TO` (defaults to brandon@ + jeff@landmarkflooringusa.com) ·
  `LEAD_FROM` (defaults to `website@landmarkflooringusa.com` — **the domain must be
  verified in Resend**, or every send is rejected while the key still looks fine).
  The destination comes from env or those defaults, **never the request body**, so the
  endpoint cannot be used as an open relay.
- ⚠️ **`RESEND_API_KEY` is Production-scoped.** Preview deploys return
  `{"ok":false,"keyEnvVar":null}` and cannot send. Tick **Preview** on the variable to
  test from a PR URL.
- **`GET /api/lead` is a config check** — reports which env var name resolved, the
  to/from addresses and whether the key was found, with no secret values. Use it to
  verify wiring on any deploy without submitting a real lead.
- **Behaviour:** validates name/phone/email; strips CR/LF from every field (`name` is
  interpolated into the `Subject` header, so a raw newline could inject headers); caps
  field and payload sizes; drops an unrecognised `project_type` rather than echoing it;
  rejects `multipart/form-data` with 415 (the browser paths send urlencoded/JSON, so
  multipart means a caller regressed); 10s timeout; `reply_to` is the visitor. An
  off-canvas **honeypot** (`name="company"`) returns a silent 200 without sending.
- **Content negotiation** (`Accept: application/json` ⇒ JSON, else redirect):
  JS on → JSON + an inline message painted by `assets/site.js` (`.lead-form`,
  `#form-status`). JS off → **303 to `/thank-you/` on success**, or back to
  `/free-estimate/?sent=invalid|error` on failure. Success needs the static page
  because the `?sent=ok` message is painted by JS — a JS-off visitor would otherwise
  see nothing. A `<noscript>` note on the form points at the phone number.
- A misconfigured deploy must fail **loudly** (logged + an honest error naming the
  phone number), never fake a success that drops the lead.
- **`/thank-you/`** is `noindex,follow` and deliberately **absent from sitemap.xml** — a
  confirmation page must never rank or be counted as a landing page.
- `outputDirectory: "."` serves the repo root statically. Vercel routes `api/*.js` to the
  function, but a `.mjs` handler would be served as **downloadable source**, so
  `vercel.json` redirects `/api/:fn(.*)\.(mjs|js)` → `/api/:fn` as a guard. Prefer `.js`.
- `/contact/` has **no** form — only the free-estimate page does. Any new form should
  post to this same endpoint.

## ⚑ The `<title>` marker trap (fixed 2026-09-11 — don't reintroduce)
`<title>` is **RCDATA**: comments inside it are NOT markup, they are literal text. A
`<!--sanity:KEY-->…<!--/sanity:KEY-->` pair placed *inside* `<title>` therefore renders the
marker text in the browser tab and in Google's SERP, on every page — and the build preserves
markers, so it never self-corrects. All 30 pages had this.
- **Correct form:** `<!--sanity-title:KEY--><title>…</title>` — marker **before** the tag.
  `scripts/build-from-sanity.mjs` has a `titleRe` pass that rewrites the title's text and escapes it.
- Title values are stored **decoded** in Sanity (like attribute values), so a title containing
  `&` round-trips instead of double-encoding to `&amp;amp;`.

## ⚑ CSS grid: always set `min-width:0` on grid items
Grid items default to `min-width:auto`, whose floor is the content's min-content width. A wide
child (a `table.cmp` at `min-width:560px`, a flex heading, an `li` with an icon) therefore
**stretches the track past the viewport** instead of shrinking or scrolling inside its own
wrapper. This caused horizontal page scroll on 8 pages at phone widths.
Fixed via `.layout > *`, `.proscons .pc/h3/li`, `.quotes > *`, and `minmax(0,1fr)` in the
collapsed media query. **Verified: 0 of 30 pages scroll horizontally from 320px to 1600px.**
Re-check this whenever you add a two-column layout or a wide table.

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
