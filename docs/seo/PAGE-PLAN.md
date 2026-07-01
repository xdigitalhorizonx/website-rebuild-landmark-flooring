# Landmark Flooring — SEO Page Plan

> Build-ready architecture to make **landmarkflooringusa.com** rank for the most common flooring-store / installer searches across Carson City & Northern Nevada.
> Produced by a multi-agent research + adversarial-verification workflow (keyword intel, local-SEO architecture, competitor analysis, on-page/schema, topical authority), then synthesized and corrected against current (2024–2026) Google guidance.

## Executive summary

Landmark Flooring is a real Carson City flooring store AND in-house installer that currently lives on a single index.html where every "Explore" link jumps to #flooring and every city link jumps to #estimate. It can rank for almost nothing beyond its brand. This plan converts that one page into a pillar-cluster static site: 5 material money pages, an installation hub + 5 service spokes, 2 B2B segment pages (commercial, property management), 8 service-area city pages built in 3 quality-gated waves, conversion/trust pages (free estimate, contact/showroom, reviews, financing, about), and a 12-piece guides hub.

The plan reflects the adversarial verification verdicts, not the raw research optimism. Four beliefs were corrected: (1) FAQ rich results are REFUTED — Google restricted them to gov/health in Aug 2023 and fully deprecated them May 7, 2026, so the existing FAQPage JSON-LD in index.html should be REMOVED and not replicated; keep FAQ content as visible HTML for users/AI engines only. (2) City pages are an ORGANIC play, not a Map-Pack shortcut — a single Carson City showroom cannot proximity-rank in Reno/Sparks/Tahoe Maps no matter how many pages it builds; the doorway test is purpose + per-page user value, not just non-duplicate prose, so every city page is gated on real local proof and Tier-2/3 cities stay UNBUILT until that proof exists. (3) The guides hub is a supporting top-of-funnel + AI-citation asset that converts via internal links, NOT a lever that lifts money-page rankings — and AI Overviews now intercept ~88% of informational queries, so guides are measured on assisted conversions and brand visibility. (4) "Best flooring for X" and "vs" guides are commercial-investigation (mid-funnel), so they get stronger CTAs and direct money-page links, not blog-filler treatment. "Licensed/bonded/insured" is a trust signal placed ON the installation pillar, not a keyword cluster to build around.

What actually moves the transactional needle (per Whitespark/Sterling Sky/BrightLocal): dedicated per-material and per-service pages (the #1 local-organic factor), an optimized Google Business Profile + review velocity (the real Map-Pack lever, which lives off-site and is out of scope here but must be flagged to the client), exact NAP consistency, and clean internal linking. Build order front-loads the highest-intent money pages and the Carson City home market, then expands cities and guides only as fast as genuinely unique content and real project photos exist. Several inputs require client-supplied facts (NV license #, real Google rating/reviews, financing APR/partner) that must never be fabricated.

## Target information architecture

```
landmarkflooringusa.com/
├── / ............................................ Homepage (rebuild of index.html) [P0]
├── flooring/ .................................... Materials hub (nav silo root)
│   ├── carpet/ ................................. [P0]
│   ├── luxury-vinyl/ .......................... [P0]  ← lead money page
│   ├── laminate/ .............................. [P1]
│   ├── hardwood/ .............................. [P0]
│   └── custom-rugs/ ........................... [P2]
├── installation/ ............................... Service pillar (nav silo root) [P0]
│   ├── carpet/ ................................ [P1]
│   ├── luxury-vinyl/ ......................... [P1]
│   ├── laminate/ ............................. [P2]
│   ├── hardwood/ ............................. [P1]
│   └── hardwood-refinishing/ ................. [P0]
├── commercial/ ................................. B2B segment [P1]
├── property-management/ ........................ B2B segment [P1]
├── service-area/ ............................... City silo root (contains doorway cluster) [P1]
│   ├── carson-city/ ........................... [P0]  Wave 1 (home market)
│   ├── reno/ .................................. [P1]  Wave 1 (gate on real proof)
│   ├── sparks/ ............................... [P1]  Wave 1 (gate on real proof)
│   ├── minden/ ............................... [P1]  Wave 2  *(or merge w/ Gardnerville)
│   ├── gardnerville/ ......................... [P1]  Wave 2  *(or merge w/ Minden)
│   ├── lake-tahoe/ .......................... [P2]  Wave 3 — BUILD ONLY WITH REAL PROOF
│   ├── virginia-city/ ....................... [P2]  Wave 3 — BUILD ONLY WITH REAL PROOF
│   └── fallon/ .............................. [P2]  Wave 3 — BUILD ONLY WITH REAL PROOF
├── free-estimate/ .............................. Lead-capture landing (real home for #estimate CTAs) [P0]
├── contact/ .................................... Contact / showroom (canonical NAP) [P0]
├── about/ ...................................... E-E-A-T [P1]
├── reviews/ .................................... Testimonials (real reviews only) [P2]
├── financing/ .................................. Financing detail [P2]
├── guides/ ..................................... Resource hub root [P1]
│   ├── flooring-cost-carson-city-northern-nevada/ ... [P1] flagship cost
│   ├── lvp-vs-laminate-vs-hardwood/ ................. [P1] flagship comparison
│   ├── best-flooring-for-northern-nevada-climate/ ... [P1] local authority
│   ├── best-flooring-for-pets-and-kids/ ............. [P1]
│   ├── refinish-vs-replace-hardwood-floors/ ......... [P1]
│   ├── lvp-flooring-cost-northern-nevada/ ........... [P2]
│   ├── hardwood-flooring-cost-nevada/ ............... [P2]
│   ├── carpet-installation-cost-northern-nevada/ .... [P2]
│   ├── how-to-choose-flooring/ ..................... [P2]
│   ├── best-flooring-for-rental-properties/ ........ [P2]
│   ├── how-to-prepare-for-flooring-installation/ ... [P2]
│   └── does-new-flooring-increase-home-value/ ...... [P2]
├── sitemap.xml ................................. (build, submit to GSC)
├── robots.txt .................................. (reference sitemap)
└── 404.html .................................... (custom 404)

NOTE: Tier-2/3 city pages (lake-tahoe, virginia-city, fallon) are listed for the
target IA but MUST remain unbuilt and unlinked from the service-area grid + sitemap
until Landmark has real local projects/photos/reviews for each (doorway guardrail).
Minden + Gardnerville: ship as two genuinely-unique pages OR one combined
/service-area/minden-gardnerville/ page if proof is thin.
```

## Corrections applied after adversarial verification

_These overturned or qualified the raw research — they are the reason for the due-diligence step._

- FAQ rich results (REFUTED): The research's plan to use FAQPage schema for rich results is dead. Google restricted FAQ rich results to gov/health sites (Aug 2023) and fully deprecated them for everyone on May 7, 2026 (Rich Results Test support removed June 2026; Search Console API FAQ data ends Aug 2026). ACTION: remove the existing FAQPage JSON-LD from index.html and do not add it to any new page; keep FAQ content as visible HTML purely for users + AI/answer engines. No page in this plan carries FAQPage schema.
- City pages = ORGANIC, not Map Pack (QUALIFIED): A single Carson City showroom cannot proximity-rank in the Reno/Sparks/Tahoe local pack regardless of how many pages it builds (Whitespark 2024 test; Sterling Sky 2025 — service-area settings/content don't move the pack; proximity to the verified address governs). City pages were reframed as organic ('blue-link') assets, the client is told not to expect pack visibility in outer cities, and the real pack lever (GBP + reviews + citations) is flagged as off-site/out-of-scope.
- Doorway test is purpose + per-page user value, NOT just non-duplicate prose (QUALIFIED): 'Genuinely unique' wording is necessary but NOT sufficient. Every city page is gated on demonstrable local value (real projects/photos, city-specific reviews, neighborhoods/landmarks, climate/logistics) and an honest service-area framing ('serving X from our Carson City showroom'). Tier-2/3 cities (Lake Tahoe, Virginia City, Fallon) are explicitly left UNBUILT and UNLINKED until real proof exists; Minden+Gardnerville may be consolidated into one richer page rather than shipping two thin near-duplicates — to stay clear of Google's scaled-content/doorway policies (hardened since the March 2024 core update).
- Guides do NOT materially lift money-page rankings (QUALIFIED): The research overstated the buying-guide hub as a way to rank transactional pages. Studies (Sterling Sky, Whitespark, BrightLocal) show content barely moves the local pack, and any organic benefit to money pages is indirect — via internal links + earned authority — not direct. The hub is repositioned as a supporting top-of-funnel + AI-citation asset measured on assisted conversions/brand visibility; every guide must internally link to its money page (the only conversion mechanism). It is sequenced AFTER the money pages, not before.
- Informational vs near-me volume (QUALIFIED): The claim that 'near me' terms out-VOLUME informational guides is unreliable — many flooring informational head terms carry equal/greater raw volume. Near-me/transactional pages are prioritized on INTENT + SERP-capturability (they trigger the pack ~100%, rarely trigger AI Overviews), NOT on assumed higher volume. Build order front-loads transactional money pages for that reason; informational guides are kept but repositioned for AI-era discovery (AI Overviews now intercept ~88% of informational queries).
- 'Best for X' and 'vs' guides reclassified as COMMERCIAL-INVESTIGATION / mid-funnel (CORRECTED): The research bucketed these as top-of-funnel blog filler. They are mid-funnel commercial-investigation intent that converts well, so best-flooring-for-pets-and-kids, lvp-vs-laminate-vs-hardwood, and refinish-vs-replace are P1, lead with a direct recommendation, carry stronger CTAs, and link straight to the matching money page + estimate.
- 'Licensed/bonded/insured' is a TRUST SIGNAL, not a keyword cluster (CORRECTED): Negligible search demand. It is placed as E-E-A-T/conversion copy + badges (and the FAQ) ON the installation pillar, About, and city pages — the installation pillar is instead targeted at real-demand terms ('flooring installation [city]', 'flooring installers near me').
- Map-Pack lead-share figure dropped (CORRECTED): The research's '40-60% of flooring lead volume from the map pack' is an unsourced agency assertion conflating CTR share (~32-44%) with total lead share, and is increasingly stale (AI local packs + growing ad units). The plan does not rely on it; it advises the client to track real call/form attribution and diversify (LSAs, reviews, referrals).
- Single-page 'cannot rank' softened to 'cannot rank COMPETITIVELY' (CORRECTED): A page can technically rank for many queries; the current one-pager is severely handicapped (no unique indexable URLs, thin per-topic depth) but the root fix is dedicated unique URLs + content + GBP, not merely replacing anchor links. Expectations set: meaningful organic gains ~3–6 months, competitive '[material] flooring [city]' terms 6–12 months.
- Material/service page depth is conditional (REINFORCED): Dedicated per-material/per-service pages are the #1 local-organic factor (Whitespark 2026) ONLY if each is genuinely deep and differentiated (~600–1,000+ words, real specifics/photos). The plan sets per-page word-count targets and forbids spun near-duplicate boilerplate across materials/services/cities, which can rank WORSE than one strong page.

## Sitewide / technical changes

- Repoint placeholder anchors: the 12 '#flooring' links (5 'Explore' cards + footer Flooring column) → real /flooring/<material>/ pages; the 8 service-area city links (currently #estimate) → /service-area/<city>/ (only when each page is live; otherwise to /service-area/ hub); the ~15 '#estimate' CTAs → /free-estimate/. Keep tel:+17752973236 links as-is.
- REMOVE the FAQPage JSON-LD block from index.html <head> (lines ~98–153). FAQ rich results were restricted to gov/health in Aug 2023 and fully DEPRECATED for everyone on May 7, 2026 — the markup earns no SERP feature. Keep the on-page FAQ accordion as visible HTML (still useful for users + AI/answer engines). Do NOT add FAQPage schema to any new page.
- Build the global header nav + footer that expose the silos (Flooring ▸, Installation ▸, Service Area ▸, Guides, Commercial, About, Contact) so no page is orphaned; reuse existing styles.css patterns.
- Add a self-referencing <link rel=canonical> (absolute https, consistent TRAILING SLASH e.g. https://landmarkflooringusa.com/flooring/carpet/) to every page. Pick the folder/index.html trailing-slash convention and enforce it; avoid the same content resolving at both /x and /x/.
- Implement BreadcrumbList JSON-LD on every non-home page + a matching visible breadcrumb (≥2 ListItems with absolute item URLs).
- Keep the existing HomeAndConstructionBusiness/Store @id=#business node on home + reference the SAME @id on /contact/ and all Service nodes (provider → #business). Do NOT mint a second LocalBusiness per city. Add WebSite (#website) on home.
- Add Service schema (serviceType + provider #business + areaServed) on every installation, material, segment, and city page. Use Product/Product+Service ONLY where a real product image + real price/offer is shown.
- Do NOT add Review/AggregateRating schema anywhere on the site (self-controlled reviews are ineligible for review stars per Google's policy reaffirmed Dec 2025, and risk manual action). Surface real reviews as on-page text/embeds; drive review volume to the Google Business Profile.
- Create /sitemap.xml (absolute canonical trailing-slash <loc> + <lastmod>) listing only LIVE indexable pages; submit in Google Search Console and resubmit on changes. Do NOT list unbuilt Tier-2/3 city pages.
- Add /robots.txt with 'Sitemap: https://landmarkflooringusa.com/sitemap.xml'; allow crawling of CSS/JS and all new directories.
- Add a custom 404.html and keep internal-link hygiene; once pages launch, fix any remaining anchor links that now have real destinations.
- Per-page unique <title> (~51–60 chars) and <meta description> (~150–158 chars) with city/material/service intent; one unique H1 per page; title/H1/first-paragraph keyword coherence; no duplicate titles across the city set.
- Image SEO: descriptive filenames + alt text on every real project photo (material + city/context); compress to WebP; set width/height to protect CLS; lazy-load below-fold media. Replace any stock used as 'our work' with real Landmark project photos.
- Ensure NAP consistency sitewide and against GBP/citations; standardize the footer NAP block (2085 East William St, Suite 10, Carson City, NV 89701 / (775) 297-3236 / Mon–Fri 9am–5pm) on every page; embed Google Map on home + /contact/ + city pages.
- Core Web Vitals targets (p75): LCP < 2.5s, INP < 200ms, CLS < 0.1; mobile-first responsive; readable tap targets (most local flooring traffic is mobile).
- OFF-SITE (flag to client, out of HTML scope but the real Map-Pack lever): optimize the Google Business Profile (primary category 'Flooring contractor'/'Carpet store', services, products, photos, hours), build review quantity + velocity, and maintain citation/NAP consistency. City pages are an ORGANIC play only — a single Carson City showroom will not proximity-rank in Reno/Sparks/Tahoe Maps.
- Add OpenGraph/Twitter meta per page (reuse existing pattern) with page-specific title/description/image.

## DO NOT INVENT (client-supplied facts only)

- Nevada contractor license number — required next to 'Licensed, bonded & insured' on home, /about/, /installation/, and inside any licensing FAQ answer. Leave the existing TODO placeholders until the client supplies it; never fabricate a number.
- Real Google rating value + review count — do NOT add aggregateRating/Review schema until a live GBP rating exists, and even then do not self-mark-up reviews on Landmark's own site (ineligible + policy risk). Replace the three placeholder homepage testimonials and the /reviews/ wall with REAL reviews only; never invent quotes, names, ratings, or counts.
- Financing APR, lender/partner name, and specific terms — keep generic 'financing available' wording on /financing/ and the homepage strip until the client confirms real terms; never invent APR or promo offers.
- Specific customer names, project addresses, and testimonials on city/segment pages — use only real, client-supplied projects/photos/reviews. Tier-2/3 city pages (Lake Tahoe, Virginia City, Fallon) stay UNBUILT until real local proof exists; do not fabricate local projects to fill them.
- Cost figures in guides and on product pages — present the industry ranges (e.g. LVP ~$3.50–9/sf) explicitly LABELED as estimates, not as Landmark's quotes; do not state Landmark's actual prices unless the client provides them.
- Manufacturer/brand names carried (Shaw, Mohawk, Stanton, Armstrong, etc.) — list specific brands on material pages ONLY when the client confirms which lines Landmark actually stocks.
- Years in business / 'since [year]', project counts, and any numeric trust stats — add to the trust band / About only with real client-supplied data.
- Search-volume numbers — keyword priorities here are based on intent + corroborated industry guidance; any volume estimates must come from a named tool (Keyword Planner/Ahrefs/SEMrush) and be labeled as estimates.
- Official Landmark Flooring logo (assets/logo.png referenced in JSON-LD/footer) — supply the real logo before launch; do not ship a placeholder mark as the brand logo.

## Internal-linking model

Hub-and-spoke / siloed model. Goal: every informational page has a path to a money page; money pages sit within ~2 clicks of home; no orphans.

GLOBAL NAV (every page): Flooring ▸ (carpet, luxury-vinyl, laminate, hardwood, custom-rugs) · Installation ▸ (hub + 5 spokes) · Service Area ▸ (hub + live city pages) · Guides · Commercial · About · Contact. Plus sticky Free Estimate + click-to-call. Breadcrumb trail on every non-home page (matches BreadcrumbList JSON-LD). Footer: full NAP block + Flooring/Company/Visit columns repointed to real pages.

FLOORING SILO: Home → /flooring/ hub → each material page. Each material page links DOWN to its matching install spoke (carpet → /installation/carpet/, luxury-vinyl → /installation/luxury-vinyl/, etc.), ACROSS to relevant guides and to relevant city pages where offered, and UP to /flooring/. Repoint the 5 homepage 'Explore' cards (currently #flooring) here.

INSTALLATION SILO: Home → /installation/ hub → each service spoke. Each spoke links to its matching material page and to /free-estimate/. Hub links to /commercial/ + /property-management/.

CITY SILO: Home service-area band (currently 8 #estimate links) → /service-area/<city>/ (live pages only). Each city page links to the materials/services relevant there, to /free-estimate/, and UP to /service-area/. Cities link contextually to 1–2 neighboring cities (e.g. Reno↔Sparks, Minden↔Gardnerville) but DO NOT carry an 8-city footer cross-link block (that pattern reads as doorway scaffolding). The /service-area/ hub is the single place that lists all cities.

GUIDES SILO (topical-authority + AI-citation engine, NOT a money-page ranking lever): /guides/ hub → each guide. Every guide links with descriptive anchor text to its matching money page(s) AND to /free-estimate/ — this is the ONLY mechanism by which guides assist conversions. Examples: cost guide → all 4 material pages + estimate + financing; LVP-vs-laminate-vs-hardwood → the three material pages + climate guide; climate guide → hardwood + LVP + Tahoe city page; best-for-pets → LVP; refinish-vs-replace → /installation/hardwood-refinishing/; best-for-rentals → /property-management/.

CONVERSION CLUSTER: /free-estimate/ is the destination for all CTAs sitewide. /contact/ (showroom NAP/map) links to /free-estimate/ and /service-area/carson-city/. /financing/ linked from every material page + homepage strip + ROI guide. /reviews/ linked from home + about + install; its 'leave a review' CTA points to the Google Business Profile (drives Map-Pack-relevant review velocity).

ANCHOR TEXT: descriptive/keyword (e.g. 'luxury vinyl plank installation in Carson City'), never 'click here'. Keep all money pages ≤2 clicks from home via nav + in-content links.

## Build order

1. `/`
2. `/free-estimate/`
3. `/contact/`
4. `/flooring/luxury-vinyl/`
5. `/flooring/carpet/`
6. `/flooring/hardwood/`
7. `/installation/`
8. `/installation/hardwood-refinishing/`
9. `/service-area/carson-city/`
10. `/service-area/reno/`
11. `/service-area/sparks/`
12. `/flooring/laminate/`
13. `/flooring/custom-rugs/`
14. `/installation/luxury-vinyl/`
15. `/installation/carpet/`
16. `/installation/hardwood/`
17. `/installation/laminate/`
18. `/commercial/`
19. `/property-management/`
20. `/about/`
21. `/service-area/`
22. `/guides/`
23. `/guides/flooring-cost-carson-city-northern-nevada/`
24. `/guides/lvp-vs-laminate-vs-hardwood/`
25. `/guides/best-flooring-for-northern-nevada-climate/`
26. `/guides/best-flooring-for-pets-and-kids/`
27. `/guides/refinish-vs-replace-hardwood-floors/`
28. `/financing/`
29. `/reviews/`
30. `/service-area/minden/`
31. `/service-area/gardnerville/`
32. `/guides/lvp-flooring-cost-northern-nevada/`
33. `/guides/hardwood-flooring-cost-nevada/`
34. `/guides/carpet-installation-cost-northern-nevada/`
35. `/guides/how-to-choose-flooring/`
36. `/guides/best-flooring-for-rental-properties/`
37. `/guides/how-to-prepare-for-flooring-installation/`
38. `/guides/does-new-flooring-increase-home-value/`
39. `/service-area/lake-tahoe/`
40. `/service-area/virginia-city/`
41. `/service-area/fallon/`

---

# Per-page blueprints

Priority: **P0** = build first (highest value, fully defensible) · **P1** = build next · **P2** = backlog / gated.

## `/` — P0 · Homepage (rebuild of existing single page)

- **File:** `index.html`
- **Primary keyword:** flooring store Carson City NV
- **Secondary keywords:** flooring installation Carson City, flooring store near me, Carson City flooring & installation, Northern Nevada flooring
- **Search intent:** Transactional/brand — local store + installer discovery; primary conversion + silo root.
- **Title tag:** `Flooring Store & Installation in Carson City, NV | Landmark`
- **Meta description:** Carson City flooring store & licensed installer: carpet, luxury vinyl, laminate, hardwood & custom rugs. Free estimates & financing. Call (775) 297-3236.
- **H1:** Flooring Store & Professional Installation in Carson City, NV
- **Schema:** HomeAndConstructionBusiness (LocalBusiness subtype, single canonical @id node #business), WebSite (#website)
- **Word-count target:** 600–1,000 words unique body copy (hub, not long-read)
- **Internal links out:** /flooring/carpet/, /flooring/luxury-vinyl/, /flooring/laminate/, /flooring/hardwood/, /flooring/custom-rugs/, /installation/, /commercial/, /property-management/, /service-area/, /free-estimate/, /financing/, /reviews/, /about/, /contact/
- **Notes:** Keep the existing HomeAndConstructionBusiness/Store JSON-LD @id=#business (it is correct and well-built). ACTION: delete the FAQPage JSON-LD block (lines ~98–153 in current index.html) per refuted FAQ-rich-result verdict; on-page FAQ stays. Self-referencing canonical https://landmarkflooringusa.com/ already present. NAP exactly matches GBP. Do not invent license #, rating, or financing terms.

  **Section outline:**
  - **Sticky header w/ NAP + click-to-call + Free Estimate CTA** — tel:+17752973236; rebuild nav to expose real silos: Flooring ▸, Installation ▸, Service Area ▸, Guides, Commercial, About, Contact. Replace current #flooring/#why/#area anchor nav.
  - **Hero: H1 + value prop (store AND installer) + dual CTA** — Keep existing hero photo. CTAs: Get a Free Estimate (→ /free-estimate/) and Call. Repoint hero #estimate to /free-estimate/.
  - **Trust band** — Licensed/bonded/insured (add NV license # when client supplies — do not invent), free in-home & showroom estimates, financing, The Landmark Guarantee. Reuse existing trust band markup.
  - **Flooring materials grid (5 cards)** — Carpet, Luxury Vinyl, Laminate, Hardwood, Custom Rugs — each card links to its OWN /flooring/<material>/ page. CRITICAL: repoint the 5 'Explore' links from #flooring to real pages.
  - **Services overview block** — Short blurb + link to /installation/ hub and top service spokes (hardwood refinishing, LVP install, carpet install).
  - **Customer segments block** — Residential / Property Management / Commercial — link Property Management → /property-management/ and Commercial → /commercial/. Reuse existing 3-up 'Who we serve'.
  - **Why Landmark / The Landmark Guarantee** — Warrantied products + warrantied in-house labor; high-desert/Tahoe climate angle. Reuse existing split sections; link 'See it, feel it' CTA to /contact/ (showroom).
  - **How it works (3 steps)** — Estimate → choose (showroom/visualizer/financing) → guaranteed install. Reuse existing.
  - **Service-area band (8 cities)** — Each city links to /service-area/<city>/. CRITICAL: repoint 8 links from #estimate to real city pages. Only link cities whose pages are actually built; for unbuilt Tier-2/3 cities, link to /service-area/ hub until live.
  - **Reviews snippet + link to /reviews/** — Use REAL Google reviews only. Current placeholders must be replaced before launch. Do NOT add aggregateRating schema.
  - **Financing strip → /financing/** — Repoint 'Ask about financing' to /financing/.
  - **FAQ accordion (general, visible HTML)** — Keep as visible HTML for users + AI engines. REMOVE the FAQPage JSON-LD currently in <head> (FAQ rich results deprecated May 2026 — no value, see corrections).
  - **Final CTA + footer w/ full NAP, hours, map embed, service-area list** — Footer Flooring column links to real /flooring/<material>/ pages; Company column to /about/, /installation/, /service-area/, /reviews/. Embed Google Map of showroom.

## `/flooring/luxury-vinyl/` — P0 · Material / product page

- **File:** `flooring/luxury-vinyl/index.html`
- **Primary keyword:** luxury vinyl plank flooring Carson City
- **Secondary keywords:** LVP flooring near me, waterproof vinyl flooring, LVT flooring Carson City NV, waterproof flooring for kitchens, vinyl plank flooring Northern Nevada
- **Search intent:** Commercial — buyer choosing a waterproof material; top money page (fastest-growing category).
- **Title tag:** `Luxury Vinyl Flooring (LVP/LVT) in Carson City, NV | Landmark`
- **Meta description:** Waterproof luxury vinyl plank & tile, sold and installed in Carson City & Northern NV. Pet- & kid-proof, wood-look styles. Free estimate: (775) 297-3236.
- **H1:** Luxury Vinyl Flooring (LVP/LVT) in Carson City, NV
- **Schema:** Service (serviceType 'Luxury Vinyl Flooring Installation', provider → #business, areaServed), BreadcrumbList
- **Word-count target:** 900–1,500 words unique
- **Internal links out:** /flooring/, /installation/luxury-vinyl/, /guides/lvp-flooring-cost-northern-nevada/, /guides/lvp-vs-laminate-vs-hardwood/, /guides/best-flooring-for-pets-and-kids/, /flooring/laminate/, /free-estimate/, /financing/
- **Notes:** Use Product/Product+Service multi-type ONLY if a real product image + real price/offer is shown (Product rich result requires image + price/review). Default to Service. The 'waterproof' angle is the strongest differentiator — lead with it. Lead money page; build first among materials.

  **Section outline:**
  - **Breadcrumb: Home > Flooring > Luxury Vinyl** — Visible breadcrumb matching BreadcrumbList JSON-LD.
  - **Intro (material + city in first sentence)** — State waterproof LVP/LVT sold AND installed by Landmark's own crews across Northern NV.
  - **What is LVP/LVT & key benefits** — 100% waterproof, rigid-core, 20-mil+ wear layer, scratch/dent resistance, quiet/warm underfoot. Tie to high-desert climate stability vs solid wood.
  - **Styles & looks (with gallery of REAL installs)** — Wood-look, stone/tile-look, plank widths. Use real Landmark project photos w/ descriptive alt + filenames; do not use stock as 'our work'.
  - **Is LVP right for you? (pros/cons, room suitability)** — Best for kitchens/baths/basements/whole-home, pets & kids, rentals. Captures comparison intent; link to vs-guide.
  - **Cost & pricing guidance** — Ranges + cost factors (subfloor, removal, stairs); link to /guides/lvp-flooring-cost-northern-nevada/. Label any figures as estimates.
  - **Our installation process + The Landmark Guarantee** — Warrantied product + warrantied in-house labor; link to /installation/luxury-vinyl/.
  - **Premium & budget options + in-store visualizer** — Both tiers; mention showroom visualizer; brands carried (add real brand names when client confirms).
  - **FAQ (LVP-specific, visible HTML only)** — No FAQPage schema. Q&A on waterproof vs water-resistant, pets, install over existing floor.
  - **CTA block (free estimate + financing) + NAP + click-to-call** — Link CTAs to /free-estimate/ and /financing/.

## `/flooring/carpet/` — P0 · Material / product page

- **File:** `flooring/carpet/index.html`
- **Primary keyword:** carpet store Carson City NV
- **Secondary keywords:** carpet near me, stain resistant carpet, carpet for bedrooms, best carpet for living room, carpet Carson City
- **Search intent:** Commercial — buyer shopping carpet to buy + install; top head-term category.
- **Title tag:** `Carpet Store in Carson City, NV — Sold & Installed | Landmark`
- **Meta description:** Plush, stain-resistant carpet sold and installed in Carson City & Northern NV. Styles for every room and budget. Free estimate: (775) 297-3236.
- **H1:** Carpet Sales & Installation in Carson City, NV
- **Schema:** Service (serviceType 'Carpet Installation', provider → #business, areaServed), BreadcrumbList
- **Word-count target:** 900–1,400 words unique
- **Internal links out:** /flooring/, /installation/carpet/, /flooring/custom-rugs/, /guides/carpet-installation-cost-northern-nevada/, /guides/best-flooring-for-pets-and-kids/, /free-estimate/, /financing/
- **Notes:** 'Carpet stores near me' is a top head term and Landmark sells + installs — own both buy and install intent. Build in first material wave.

  **Section outline:**
  - **Breadcrumb: Home > Flooring > Carpet** — Visible + schema.
  - **Intro (carpet + city first sentence)** — Soft, warm, quiet; sold and installed by in-house crews.
  - **Carpet types & fibers** — Cut pile, loop/Berber, frieze; nylon vs polyester vs triexta; stain-resistant lines. Real install photos.
  - **Best rooms for carpet** — Bedrooms, family rooms, stairs; comfort + sound. Note alternatives for pets via cross-link.
  - **Durability, stain resistance & pets** — Traffic ratings, pet-friendly options; link to best-for-pets guide.
  - **Cost & pricing guidance** — Ranges + pad/removal factors; link to carpet cost guide.
  - **Our installation process + Landmark Guarantee** — Stretch-in/seams/haul-away; link /installation/carpet/.
  - **Custom rugs cross-sell** — Note carpet can be bound into custom area rugs; link /flooring/custom-rugs/.
  - **FAQ (carpet-specific, visible HTML)** — No FAQPage schema.
  - **CTA + NAP + click-to-call** — → /free-estimate/, /financing/.

## `/flooring/hardwood/` — P0 · Material / product page

- **File:** `flooring/hardwood/index.html`
- **Primary keyword:** hardwood flooring Carson City
- **Secondary keywords:** hardwood flooring near me, engineered hardwood flooring, hardwood flooring Reno, solid vs engineered hardwood, hardwood flooring cost
- **Search intent:** Commercial — high job-value buyer choosing wood; lucrative even at modest volume.
- **Title tag:** `Hardwood Flooring in Carson City, NV — Sold & Installed | Landmark`
- **Meta description:** Solid & engineered hardwood flooring, sold and installed in Carson City & Northern NV. Built for our dry climate. Free estimate: (775) 297-3236.
- **H1:** Hardwood Flooring in Carson City, NV
- **Schema:** Service (serviceType 'Hardwood Flooring Installation', provider → #business, areaServed), BreadcrumbList
- **Word-count target:** 1,000–1,500 words unique
- **Internal links out:** /flooring/, /installation/hardwood/, /installation/hardwood-refinishing/, /guides/hardwood-flooring-cost-nevada/, /guides/best-flooring-for-northern-nevada-climate/, /guides/refinish-vs-replace-hardwood-floors/, /guides/lvp-vs-laminate-vs-hardwood/, /free-estimate/
- **Notes:** Climate angle (gapping in dry Carson/Reno valleys) is defensible local E-E-A-T no national page can match. Build in first material wave.

  **Section outline:**
  - **Breadcrumb: Home > Flooring > Hardwood** — Visible + schema.
  - **Intro (hardwood + city first sentence)** — Timeless warmth + lasting home value; sold and installed.
  - **Solid vs engineered (climate angle)** — High-desert dryness causes solid-wood gapping/cupping → engineered often recommended; acclimation matters. Strong local-authority differentiator; link climate guide.
  - **Species, finishes & looks** — Oak/maple/hickory, site- vs pre-finished; real install photos.
  - **Refinishing option** — Note Landmark refinishes; link /installation/hardwood-refinishing/ and refinish-vs-replace guide.
  - **Cost & pricing guidance** — Highest avg job value; ranges + factors. Link hardwood cost guide. Label estimates.
  - **Our installation process + Landmark Guarantee** — Subfloor prep, acclimation; warrantied labor; link /installation/hardwood/.
  - **FAQ (hardwood-specific, visible HTML)** — No FAQPage schema. e.g. 'Does hardwood survive Nevada's dry climate?'
  - **CTA + NAP + click-to-call** — → /free-estimate/, /financing/.

## `/flooring/laminate/` — P1 · Material / product page

- **File:** `flooring/laminate/index.html`
- **Primary keyword:** laminate flooring Carson City
- **Secondary keywords:** laminate flooring near me, waterproof laminate flooring, best laminate flooring, laminate flooring cost, laminate vs vinyl flooring
- **Search intent:** Commercial — budget-conscious wood-look buyer; supports 'budget options' differentiator.
- **Title tag:** `Laminate Flooring in Carson City, NV — Sold & Installed | Landmark`
- **Meta description:** Durable, budget-friendly laminate flooring with a realistic wood look, sold and installed in Carson City & Northern NV. Free estimate: (775) 297-3236.
- **H1:** Laminate Flooring in Carson City, NV
- **Schema:** Service (serviceType 'Laminate Flooring Installation', provider → #business, areaServed), BreadcrumbList
- **Word-count target:** 800–1,300 words unique
- **Internal links out:** /flooring/, /installation/laminate/, /flooring/luxury-vinyl/, /guides/lvp-vs-laminate-vs-hardwood/, /guides/flooring-cost-carson-city-northern-nevada/, /free-estimate/
- **Notes:** Differentiate hard from the LVP page (intent overlaps) — laminate = budget wood-look in dry rooms; route waterproof seekers to LVP. Second material wave.

  **Section outline:**
  - **Breadcrumb: Home > Flooring > Laminate** — Visible + schema.
  - **Intro (laminate + city first sentence)** — Crisp wood look for less; durable for busy homes.
  - **What is laminate & how it differs from LVP** — AC ratings, core, water-resistant vs waterproof; link LVP-vs-laminate guide.
  - **Styles & looks** — Wood-look range, textures, bevels; real install photos.
  - **Where laminate works best** — Living/dining/bedrooms, dry rooms; budget angle.
  - **Cost & pricing guidance** — Budget category ranges; link cost guide. Label estimates.
  - **Our installation process + Landmark Guarantee** — Floating install, underlayment; link /installation/laminate/.
  - **FAQ (laminate-specific, visible HTML)** — No FAQPage schema.
  - **CTA + NAP + click-to-call** — → /free-estimate/, /financing/.

## `/flooring/custom-rugs/` — P2 · Material / product page

- **File:** `flooring/custom-rugs/index.html`
- **Primary keyword:** custom rugs Carson City
- **Secondary keywords:** custom area rugs near me, custom rug binding, bound carpet rugs, area rugs from carpet remnants Reno
- **Search intent:** Commercial — niche, low-competition long-tail; differentiator + carpet cross-sell.
- **Title tag:** `Custom Rugs & Rug Binding in Carson City, NV | Landmark Flooring`
- **Meta description:** Custom area rugs made to your size, color & binding in Carson City & Northern NV. Turn carpet into a finished rug. Free quote: (775) 297-3236.
- **H1:** Custom Rugs & Rug Binding in Carson City, NV
- **Schema:** Service (serviceType 'Custom Rug Fabrication', provider → #business, areaServed), BreadcrumbList
- **Word-count target:** 600–1,000 words unique
- **Internal links out:** /flooring/, /flooring/carpet/, /flooring/hardwood/, /free-estimate/, /contact/
- **Notes:** Low-competition long-tail most flooring competitors ignore — easy win, but keep genuinely unique (real rug photos) so it's not thin. Second material wave.

  **Section outline:**
  - **Breadcrumb: Home > Flooring > Custom Rugs** — Visible + schema.
  - **Intro (custom rugs + city first sentence)** — Made to size/color/binding; anchors any room.
  - **How custom rugs work** — Choose carpet → size → edge binding/serging; remnants into rugs.
  - **Styles, edges & materials** — Wool/synthetic, binding colors/widths; real photos of finished rugs.
  - **Use cases** — Over hardwood/LVP, area definition, runners; cross-link carpet + hardwood.
  - **FAQ (rug-specific, visible HTML)** — No FAQPage schema. Sizing, turnaround, can-you-bind-my-carpet.
  - **CTA + NAP + click-to-call** — → /free-estimate/ (or /contact/ for in-showroom rug consult).

## `/installation/` — P0 · Service pillar (installation hub)

- **File:** `installation/index.html`
- **Primary keyword:** flooring installation Carson City
- **Secondary keywords:** flooring installers near me, flooring contractors Carson City, licensed flooring installer Northern Nevada, professional flooring installation
- **Search intent:** Transactional — buyer wants an installer (not just a store); anchors the service cluster. Place licensed/bonded/insured + warranty as trust copy ON this page, not as a keyword target.
- **Title tag:** `Flooring Installation in Carson City, NV | Landmark Flooring`
- **Meta description:** Professional flooring installation in Carson City & Northern NV — licensed, bonded & insured with warrantied in-house labor. Free estimate: (775) 297-3236.
- **H1:** Professional Flooring Installation in Carson City, NV
- **Schema:** Service (serviceType 'Flooring Installation', provider → #business, areaServed = 8 cities + Northern Nevada), BreadcrumbList
- **Word-count target:** 800–1,200 words unique
- **Internal links out:** /installation/carpet/, /installation/luxury-vinyl/, /installation/laminate/, /installation/hardwood/, /installation/hardwood-refinishing/, /flooring/, /commercial/, /property-management/, /free-estimate/
- **Notes:** Highest-intent service money page — captures 'installer near me' that store pages miss. Build alongside the first material wave.

  **Section outline:**
  - **Breadcrumb: Home > Installation** — Visible + schema.
  - **Intro (installation + city first sentence)** — Landmark installs every floor it sells with its OWN warrantied crews — key differentiator.
  - **The Landmark Guarantee + credentials (trust block)** — Licensed/bonded/insured (NV license # when client supplies), warrantied products + warrantied labor, no finger-pointing. This is E-E-A-T/conversion copy, not keyword targeting.
  - **Services we install (links to spokes)** — Cards linking to /installation/carpet/, /installation/luxury-vinyl/, /installation/laminate/, /installation/hardwood/, /installation/hardwood-refinishing/.
  - **Our process (measure → choose → prep → install → haul-away)** — Subfloor prep, acclimation, cleanup; what to expect.
  - **In-house crews, never random subs** — Parallels Campbell's positioning; reinforces warranty.
  - **Pricing factors + free estimate** — Removal, subfloor, stairs, square footage; link cost guides + /free-estimate/.
  - **Who we serve** — Residential / property management / commercial links.
  - **FAQ (install-specific, visible HTML)** — No FAQPage schema.
  - **CTA + NAP + click-to-call** — → /free-estimate/.

## `/installation/hardwood-refinishing/` — P0 · Service page (spoke)

- **File:** `installation/hardwood-refinishing/index.html`
- **Primary keyword:** hardwood floor refinishing Carson City
- **Secondary keywords:** hardwood floor refinishing near me, hardwood floor refinishing Reno, wood floor refinishing, sand and refinish hardwood
- **Search intent:** Transactional — high-margin in-house labor service; distinct high-intent query from install.
- **Title tag:** `Hardwood Floor Refinishing in Carson City, NV | Landmark`
- **Meta description:** Sand & refinish your hardwood floors in Carson City & Northern NV. Licensed, warrantied in-house crews. Refresh instead of replace. Call (775) 297-3236.
- **H1:** Hardwood Floor Refinishing in Carson City, NV
- **Schema:** Service (serviceType 'Hardwood Floor Refinishing', provider → #business, areaServed), BreadcrumbList
- **Word-count target:** 700–1,200 words unique
- **Internal links out:** /installation/, /flooring/hardwood/, /guides/refinish-vs-replace-hardwood-floors/, /guides/hardwood-floor-refinishing-cost-northern-nevada/, /free-estimate/
- **Notes:** Confirm with client that refinishing IS offered before publishing. Distinct, high-intent, high-margin service query. P0 spoke. NOTE: keep distinct from /flooring/hardwood/ (service/process vs product selection).

  **Section outline:**
  - **Breadcrumb: Home > Installation > Hardwood Refinishing** — Visible + schema.
  - **Intro (service + city first sentence)** — Refinishing restores worn floors for a fraction of replacement.
  - **Signs you need refinishing** — Scratches, gray/worn finish, gaps, water marks; every 7–10 yrs.
  - **Refinish vs replace (cost & decision)** — Refinish materially cheaper than replace; link refinish-vs-replace guide. Label cost estimates.
  - **Our refinishing process** — Sand, stain options, seal/finish, dust control, dry/cure time.
  - **Can engineered hardwood be refinished?** — Depends on wear-layer thickness; ties to engineered content.
  - **Credentials + Landmark Guarantee** — Warrantied labor; licensed/bonded/insured.
  - **Project gallery (before/after) + testimonial** — Real before/after only.
  - **FAQ (refinishing-specific, visible HTML)** — No FAQPage schema.
  - **CTA + NAP + click-to-call** — → /free-estimate/.

## `/installation/luxury-vinyl/` — P1 · Service page (spoke)

- **File:** `installation/luxury-vinyl/index.html`
- **Primary keyword:** luxury vinyl plank installation Carson City
- **Secondary keywords:** LVP installation near me, vinyl plank flooring installation, LVT installer Reno, waterproof vinyl installation
- **Search intent:** Transactional — buyer ready to install LVP.
- **Title tag:** `Luxury Vinyl (LVP/LVT) Installation in Carson City, NV | Landmark`
- **Meta description:** Expert LVP & LVT installation in Carson City & Northern NV. Licensed, warrantied in-house crews. Waterproof floors done right. Call (775) 297-3236.
- **H1:** Luxury Vinyl Plank (LVP/LVT) Installation in Carson City, NV
- **Schema:** Service (serviceType 'Luxury Vinyl Flooring Installation', provider → #business, areaServed), BreadcrumbList
- **Word-count target:** 700–1,100 words unique
- **Internal links out:** /installation/, /flooring/luxury-vinyl/, /guides/lvp-flooring-cost-northern-nevada/, /free-estimate/
- **Notes:** Pair page to /flooring/luxury-vinyl/ (product) — link bidirectionally; keep copy on process/scope, not product selection, to avoid duplication. Second service wave.

  **Section outline:**
  - **Breadcrumb: Home > Installation > Luxury Vinyl** — Visible + schema.
  - **Intro (service + city first sentence)** — Professional LVP/LVT install across Northern NV.
  - **What's included (measure, remove old, subfloor prep, install, trim, haul-away)** — Scope + timeline.
  - **Why install matters for waterproof performance** — Flat subfloor, transitions, expansion gaps.
  - **Credentials + Landmark Guarantee** — Warrantied labor.
  - **Pricing factors + free estimate** — Link LVP cost guide.
  - **Project gallery + testimonial** — Real photos only.
  - **FAQ (visible HTML)** — No FAQPage schema. Install over existing floor, subfloor needs.
  - **CTA + NAP + click-to-call** — → /flooring/luxury-vinyl/ and /free-estimate/.

## `/installation/carpet/` — P1 · Service page (spoke)

- **File:** `installation/carpet/index.html`
- **Primary keyword:** carpet installation Carson City
- **Secondary keywords:** carpet installers near me, carpet installation near me, carpet installation cost, carpet installer Reno
- **Search intent:** Transactional — buyer ready to install carpet.
- **Title tag:** `Carpet Installation in Carson City, NV | Landmark Flooring`
- **Meta description:** Professional carpet installation in Carson City & Northern NV. Licensed, bonded & insured with warrantied labor. Free estimate: (775) 297-3236.
- **H1:** Professional Carpet Installation in Carson City, NV
- **Schema:** Service (serviceType 'Carpet Installation', provider → #business, areaServed), BreadcrumbList
- **Word-count target:** 700–1,100 words unique
- **Internal links out:** /installation/, /flooring/carpet/, /guides/carpet-installation-cost-northern-nevada/, /free-estimate/
- **Notes:** 'Carpet installers near me' is a top head term. Second service wave.

  **Section outline:**
  - **Breadcrumb: Home > Installation > Carpet** — Visible + schema.
  - **Intro (service + city first sentence)** — Carpet install across Northern NV.
  - **What's included (measure, remove old, pad, stretch-in, seams, haul-away)** — Scope + timeline.
  - **Why proper carpet install matters** — Power-stretch vs kick, seam placement, pad quality.
  - **Credentials + Landmark Guarantee** — Warrantied labor.
  - **Pricing factors + free estimate** — Link carpet cost guide.
  - **Project gallery + testimonial** — Real photos only.
  - **FAQ (visible HTML)** — No FAQPage schema.
  - **CTA + NAP + click-to-call** — → /flooring/carpet/ and /free-estimate/.

## `/installation/hardwood/` — P1 · Service page (spoke)

- **File:** `installation/hardwood/index.html`
- **Primary keyword:** hardwood floor installation Carson City
- **Secondary keywords:** hardwood floor installation near me, wood floor installation Reno, engineered hardwood installation, hardwood installer Northern Nevada
- **Search intent:** Transactional — buyer ready to install wood.
- **Title tag:** `Hardwood Floor Installation in Carson City, NV | Landmark`
- **Meta description:** Expert hardwood floor installation in Carson City & Northern NV. Solid & engineered, acclimated for our dry climate. Warrantied labor. Call (775) 297-3236.
- **H1:** Hardwood Floor Installation in Carson City, NV
- **Schema:** Service (serviceType 'Hardwood Flooring Installation', provider → #business, areaServed), BreadcrumbList
- **Word-count target:** 700–1,100 words unique
- **Internal links out:** /installation/, /flooring/hardwood/, /installation/hardwood-refinishing/, /guides/hardwood-flooring-cost-nevada/, /guides/best-flooring-for-northern-nevada-climate/, /free-estimate/
- **Notes:** Second service wave. Keep distinct from product page (process vs selection).

  **Section outline:**
  - **Breadcrumb: Home > Installation > Hardwood** — Visible + schema.
  - **Intro (service + city first sentence)** — Hardwood install across Northern NV.
  - **What's included (measure, acclimate, subfloor prep, install, finish, haul-away)** — Scope + timeline.
  - **Acclimation & the dry-climate factor** — Why acclimation/humidity control prevents gapping; local-authority angle; link climate guide.
  - **Solid vs engineered install differences** — Nail/glue/float; subfloor type.
  - **Credentials + Landmark Guarantee** — Warrantied labor.
  - **Pricing factors + free estimate** — Link hardwood cost guide.
  - **Project gallery + testimonial** — Real photos only.
  - **FAQ (visible HTML)** — No FAQPage schema.
  - **CTA + NAP + click-to-call** — → /flooring/hardwood/, /installation/hardwood-refinishing/, /free-estimate/.

## `/installation/laminate/` — P2 · Service page (spoke)

- **File:** `installation/laminate/index.html`
- **Primary keyword:** laminate flooring installation Carson City
- **Secondary keywords:** laminate installation near me, laminate floor installer Reno, floating floor installation
- **Search intent:** Transactional — buyer ready to install laminate.
- **Title tag:** `Laminate Flooring Installation in Carson City, NV | Landmark`
- **Meta description:** Professional laminate flooring installation in Carson City & Northern NV. Warrantied in-house crews, budget-friendly. Free estimate: (775) 297-3236.
- **H1:** Laminate Flooring Installation in Carson City, NV
- **Schema:** Service (serviceType 'Laminate Flooring Installation', provider → #business, areaServed), BreadcrumbList
- **Word-count target:** 600–1,000 words unique
- **Internal links out:** /installation/, /flooring/laminate/, /guides/flooring-cost-carson-city-northern-nevada/, /free-estimate/
- **Notes:** Lower-priority spoke; build only after higher-intent services. Third service wave.

  **Section outline:**
  - **Breadcrumb: Home > Installation > Laminate** — Visible + schema.
  - **Intro (service + city first sentence)** — Laminate install across Northern NV.
  - **What's included (measure, remove old, underlayment, floating install, trim, haul-away)** — Scope + timeline.
  - **Credentials + Landmark Guarantee** — Warrantied labor.
  - **Pricing factors + free estimate** — Link cost guide.
  - **Project gallery + testimonial** — Real photos only.
  - **FAQ (visible HTML)** — No FAQPage schema.
  - **CTA + NAP + click-to-call** — → /flooring/laminate/, /free-estimate/.

## `/commercial/` — P1 · Segment page (B2B commercial)

- **File:** `commercial/index.html`
- **Primary keyword:** commercial flooring Northern Nevada
- **Secondary keywords:** commercial flooring contractor Reno, office flooring installation, commercial LVT flooring, commercial carpet tile Carson City
- **Search intent:** Commercial/B2B — distinct buyer vocabulary (durability, downtime, project management).
- **Title tag:** `Commercial Flooring in Carson City & Northern NV | Landmark`
- **Meta description:** Commercial flooring sales & installation across Northern Nevada — durable LVT, carpet tile & more, on schedule & budget. Free quote: (775) 297-3236.
- **H1:** Commercial Flooring Sales & Installation in Northern Nevada
- **Schema:** Service (serviceType 'Commercial Flooring Installation', provider → #business, areaServed = Northern Nevada), BreadcrumbList
- **Word-count target:** 700–1,100 words unique
- **Internal links out:** /flooring/luxury-vinyl/, /flooring/carpet/, /installation/, /property-management/, /free-estimate/
- **Notes:** Needs real proof or reads thin — avoid near-copy of residential pages. Different search vocabulary + higher deal value justify a dedicated page.

  **Section outline:**
  - **Breadcrumb: Home > Commercial** — Visible + schema.
  - **Intro (segment + region first sentence)** — Commercial flooring for offices, retail, etc. across Northern NV.
  - **B2B value prop** — Durability, project management, minimal downtime, scheduling around operations.
  - **Materials best for commercial** — Commercial LVT, carpet tile, sheet; link material pages.
  - **Our B2B process (estimate → spec → schedule → install)** — How commercial projects run.
  - **Credentials + Landmark Guarantee** — Licensed/bonded/insured critical for B2B; warrantied labor.
  - **Project types / client types** — Real examples only; if none yet, describe capabilities honestly without fabricating clients.
  - **FAQ (commercial-specific, visible HTML)** — No FAQPage schema.
  - **B2B CTA (request a quote) + NAP + click-to-call** — → /free-estimate/ or dedicated B2B contact.

## `/property-management/` — P1 · Segment page (B2B property management)

- **File:** `property-management/index.html`
- **Primary keyword:** property management flooring Northern Nevada
- **Secondary keywords:** rental property flooring, apartment turn flooring Reno, flooring for property managers, durable LVP for rentals, fast flooring installation for rentals
- **Search intent:** Commercial/B2B — recurring turn work; values speed, durability, volume pricing, warranty.
- **Title tag:** `Property Management & Rental Turn Flooring | Landmark Flooring`
- **Meta description:** Fast, budget-friendly flooring for rental turns & property managers in Northern NV. Durable LVP, volume pricing, quick turnaround. Call (775) 297-3236.
- **H1:** Flooring for Property Managers & Rental Turns in Northern Nevada
- **Schema:** Service (serviceType 'Property Management Flooring', provider → #business, areaServed = Northern Nevada), BreadcrumbList
- **Word-count target:** 700–1,100 words unique
- **Internal links out:** /flooring/luxury-vinyl/, /flooring/carpet/, /installation/, /commercial/, /guides/best-flooring-for-rental-properties/, /free-estimate/
- **Notes:** Low-competition lucrative B2B intent (model: AFB Floors). Pitch waterproof LVP + warrantied labor + fast turns. Keep distinct from commercial + residential.

  **Section outline:**
  - **Breadcrumb: Home > Property Management** — Visible + schema.
  - **Intro (segment + region first sentence)** — Flooring built for rentals/turns across Northern NV.
  - **Why property managers choose Landmark** — Speed, budget options, durability, warranty, scheduling around tenants.
  - **Best flooring for rentals** — Waterproof rigid-core LVP for durability/turns; link LVP page + best-for-rentals guide.
  - **Turn / volume program** — Quick turnaround, bulk pricing, 1 unit to many; honest about real capabilities.
  - **Our process for managers (account, scheduling)** — How repeat work is handled.
  - **Credentials + Landmark Guarantee** — Warrantied labor; licensed/bonded/insured.
  - **FAQ (PM-specific, visible HTML)** — No FAQPage schema.
  - **B2B CTA (set up an account / request a quote) + NAP + click-to-call** — → /free-estimate/.

## `/service-area/` — P1 · Service-area hub

- **File:** `service-area/index.html`
- **Primary keyword:** Northern Nevada flooring service area
- **Secondary keywords:** flooring service area Carson City, flooring Reno Sparks Carson City, areas we serve flooring
- **Search intent:** Navigational/transactional — silo root for city pages; contains the doorway cluster under one parent.
- **Title tag:** `Service Area — Flooring Across Northern Nevada | Landmark`
- **Meta description:** Landmark Flooring serves Carson City, Reno, Sparks, Minden, Gardnerville & beyond from our Carson City showroom. Find your area. Call (775) 297-3236.
- **H1:** Where We Install Flooring Across Northern Nevada
- **Schema:** BreadcrumbList
- **Word-count target:** 400–700 words unique
- **Internal links out:** /service-area/carson-city/, /service-area/reno/, /service-area/sparks/, /service-area/minden/, /service-area/gardnerville/, /free-estimate/
- **Notes:** Containing all city pages under /service-area/ keeps the doorway cluster clearly scoped. Update the city grid as each Tier is built; never link to unbuilt pages.

  **Section outline:**
  - **Breadcrumb: Home > Service Area** — Visible + schema.
  - **Intro** — Serving Northern NV from the 2085 East William St Carson City showroom; we travel for free in-home estimates.
  - **City grid (links to built city pages)** — Link only LIVE city pages. Group by region (Carson Valley, Truckee Meadows, Tahoe). Avoid a footer-style cross-link block on every page (reads as doorway scaffolding) — this hub is the right place to list them.
  - **How we serve the region (logistics)** — Drive-time framing from showroom; honest service-area-business framing (one showroom, we come to you).
  - **CTA + NAP + click-to-call** — → /free-estimate/.

## `/service-area/carson-city/` — P0 · City / location page (HOME market)

- **File:** `service-area/carson-city/index.html`
- **Primary keyword:** flooring Carson City NV
- **Secondary keywords:** flooring store Carson City, carpet Carson City NV, flooring installation Carson City, flooring installer Carson City
- **Search intent:** Transactional — home-city organic + supports brand/local relevance. Strongest, most defensible city page.
- **Title tag:** `Flooring & Installation in Carson City, NV | Landmark Flooring`
- **Meta description:** Your local Carson City flooring store & installer: carpet, luxury vinyl, laminate & hardwood, sold and installed. Free in-home estimates. (775) 297-3236.
- **H1:** Flooring Sales & Installation in Carson City, NV
- **Schema:** Service (areaServed = Carson City, provider → #business), BreadcrumbList
- **Word-count target:** 600–1,000 words GENUINELY UNIQUE
- **Internal links out:** /service-area/, /flooring/carpet/, /flooring/luxury-vinyl/, /flooring/laminate/, /flooring/hardwood/, /installation/, /contact/, /free-estimate/
- **Notes:** Wave 1 city. The ONLY city where Landmark can realistically win the Map Pack (showroom proximity). Overlaps the homepage intent — differentiate (home = brand hub; this = Carson City landing). Do NOT create a separate fake LocalBusiness node; reference single #business @id.

  **Section outline:**
  - **Breadcrumb: Home > Service Area > Carson City** — Visible + schema.
  - **Intro (city in first sentence) + we're local here** — Showroom IS in Carson City at 2085 East William St — strongest proximity story; this is home base.
  - **Local context (neighborhoods/landmarks/climate)** — Name real areas (historic west side, ranch homes) + high-desert dry-climate flooring implications. Must read like a real local crew.
  - **Materials offered (links)** — Link all 5 material pages.
  - **Services offered (links)** — Link installation hub + spokes.
  - **Local proof (real Carson City projects/reviews)** — Real local job photos + city-specific testimonials only.
  - **The Landmark Guarantee + credentials** — Trust block.
  - **Showroom: visit us (map, hours, directions)** — Embed Google Map; Mon–Fri 9–5.
  - **City FAQ (visible HTML)** — No FAQPage schema.
  - **CTA + NAP + click-to-call** — → /free-estimate/ + /contact/.

## `/service-area/reno/` — P1 · City / location page

- **File:** `service-area/reno/index.html`
- **Primary keyword:** flooring Reno NV
- **Secondary keywords:** carpet store Reno, flooring installation Reno, hardwood flooring Reno, LVP flooring Reno, flooring contractors Reno
- **Search intent:** Transactional — ORGANIC (not Map Pack) visibility in the largest nearby market.
- **Title tag:** `Flooring & Installation in Reno, NV | Landmark Flooring`
- **Meta description:** Carpet, luxury vinyl, laminate & hardwood sold and installed in Reno, NV by your Carson City flooring pros. Free in-home estimates. (775) 297-3236.
- **H1:** Flooring Sales & Installation in Reno, NV
- **Schema:** Service (areaServed = Reno, provider → #business), BreadcrumbList
- **Word-count target:** 600–1,200 words GENUINELY UNIQUE
- **Internal links out:** /service-area/, /service-area/sparks/, /flooring/carpet/, /flooring/luxury-vinyl/, /flooring/hardwood/, /installation/, /free-estimate/
- **Notes:** Wave 1 (highest-value outer city — ~9x Carson City population, defended by Frankful/National Wholesale/FCI). Set expectation with client: this is an ORGANIC play; a Carson City showroom will NOT crack the Reno Map Pack. Gate on real Reno project proof.

  **Section outline:**
  - **Breadcrumb: Home > Service Area > Reno** — Visible + schema.
  - **Intro (Reno in first sentence) + how we serve from Carson City** — Honest: one showroom in Carson City serving Reno — do NOT imply a Reno office. Note drive/coverage.
  - **Local context (neighborhoods/landmarks/climate)** — Name real areas (Midtown, Old Southwest, Somersett); Reno valley dry-climate gapping angle. Differentiate from Carson City + Sparks copy.
  - **Materials offered (links)** — Link material pages.
  - **Services offered (links)** — Link install hub + spokes.
  - **Local proof (real Reno projects/reviews)** — Real Reno job photos + Reno testimonials. If none yet, this page is Wave 2 — do not ship thin.
  - **Free in-home estimate (we travel to Reno)** — Key conversion hook for a service-area business.
  - **Credentials + Landmark Guarantee** — Trust block.
  - **City FAQ (e.g. 'Do you travel to Reno for estimates?', visible HTML)** — No FAQPage schema.
  - **CTA + showroom NAP + click-to-call** — → /free-estimate/.

## `/service-area/sparks/` — P1 · City / location page

- **File:** `service-area/sparks/index.html`
- **Primary keyword:** flooring Sparks NV
- **Secondary keywords:** carpet Sparks NV, flooring installation Sparks, LVP flooring Sparks, flooring installer Sparks NV
- **Search intent:** Transactional — ORGANIC visibility in the second-largest nearby market.
- **Title tag:** `Flooring & Installation in Sparks, NV | Landmark Flooring`
- **Meta description:** Carpet, luxury vinyl, laminate & hardwood sold and installed in Sparks, NV by your Carson City flooring pros. Free in-home estimates. (775) 297-3236.
- **H1:** Flooring Sales & Installation in Sparks, NV
- **Schema:** Service (areaServed = Sparks, provider → #business), BreadcrumbList
- **Word-count target:** 600–1,200 words GENUINELY UNIQUE
- **Internal links out:** /service-area/, /service-area/reno/, /flooring/carpet/, /flooring/luxury-vinyl/, /installation/, /free-estimate/
- **Notes:** Wave 1 (large adjacent market). Same Map-Pack caveat as Reno. Gate on real Sparks proof; new-build subdivisions are a genuine local differentiator.

  **Section outline:**
  - **Breadcrumb: Home > Service Area > Sparks** — Visible + schema.
  - **Intro (Sparks in first sentence) + serve from Carson City** — Honest service-area framing.
  - **Local context (neighborhoods/landmarks/climate)** — Name real areas (Spanish Springs, Wingfield Springs, Victorian Square); newer subdivisions/new-build angle. Differentiate from Reno copy.
  - **Materials offered (links)** — Link material pages.
  - **Services offered (links)** — Link install hub + spokes.
  - **Local proof (real Sparks projects/reviews)** — Real Sparks job photos + testimonials, else Wave 2.
  - **Free in-home estimate (we travel to Sparks)** — Conversion hook.
  - **Credentials + Landmark Guarantee** — Trust block.
  - **City FAQ (visible HTML)** — No FAQPage schema.
  - **CTA + showroom NAP + click-to-call** — → /free-estimate/.

## `/service-area/minden/` — P1 · City / location page

- **File:** `service-area/minden/index.html`
- **Primary keyword:** flooring Minden NV
- **Secondary keywords:** carpet Minden NV, flooring installation Minden, Carson Valley flooring, flooring installer Minden
- **Search intent:** Transactional — ORGANIC visibility in nearby Carson Valley market.
- **Title tag:** `Flooring & Installation in Minden, NV | Landmark Flooring`
- **Meta description:** Carpet, luxury vinyl, laminate & hardwood sold and installed in Minden & the Carson Valley by your Carson City flooring pros. Free estimates. (775) 297-3236.
- **H1:** Flooring Sales & Installation in Minden, NV
- **Schema:** Service (areaServed = Minden, provider → #business), BreadcrumbList
- **Word-count target:** 600–1,000 words GENUINELY UNIQUE
- **Internal links out:** /service-area/, /service-area/gardnerville/, /flooring/luxury-vinyl/, /flooring/carpet/, /installation/, /free-estimate/
- **Notes:** Wave 2. Minden + Gardnerville are adjacent twin towns — risk of near-duplicate copy. EITHER write genuinely distinct local copy for each OR consolidate into one richer /service-area/minden-gardnerville/ page if real proof is limited (consolidation is the safer anti-doorway move).

  **Section outline:**
  - **Breadcrumb: Home > Service Area > Minden** — Visible + schema.
  - **Intro (Minden in first sentence) + serve from Carson City** — Short drive south down US-395; honest framing.
  - **Local context (Carson Valley, ranch/rural homes, climate)** — Carson Valley ag/ranch character, larger lots, dry-climate wood considerations. Differentiate from Gardnerville copy (they're adjacent — make each genuinely distinct or consider a single combined Minden/Gardnerville page if proof is thin).
  - **Materials offered (links)** — Link material pages.
  - **Services offered (links)** — Link install hub.
  - **Local proof (real Minden projects/reviews)** — Real photos/testimonials, else delay.
  - **Free in-home estimate (we travel to Minden)** — Conversion hook.
  - **Credentials + Landmark Guarantee** — Trust block.
  - **City FAQ (visible HTML)** — No FAQPage schema.
  - **CTA + showroom NAP + click-to-call** — → /free-estimate/.

## `/service-area/gardnerville/` — P1 · City / location page

- **File:** `service-area/gardnerville/index.html`
- **Primary keyword:** flooring Gardnerville NV
- **Secondary keywords:** carpet Gardnerville NV, flooring installation Gardnerville, Carson Valley flooring, flooring installer Gardnerville
- **Search intent:** Transactional — ORGANIC visibility in nearby Carson Valley market.
- **Title tag:** `Flooring & Installation in Gardnerville, NV | Landmark Flooring`
- **Meta description:** Carpet, luxury vinyl, laminate & hardwood sold and installed in Gardnerville & the Carson Valley by your Carson City flooring pros. (775) 297-3236.
- **H1:** Flooring Sales & Installation in Gardnerville, NV
- **Schema:** Service (areaServed = Gardnerville, provider → #business), BreadcrumbList
- **Word-count target:** 600–1,000 words GENUINELY UNIQUE
- **Internal links out:** /service-area/, /service-area/minden/, /flooring/luxury-vinyl/, /flooring/carpet/, /installation/, /free-estimate/
- **Notes:** Wave 2. See Minden note — consolidate into a combined Minden/Gardnerville page if you cannot make BOTH genuinely unique with real proof. Elevated Flooring (Gardnerville & Carson City) is the closest installer-side competitor.

  **Section outline:**
  - **Breadcrumb: Home > Service Area > Gardnerville** — Visible + schema.
  - **Intro (Gardnerville in first sentence) + serve from Carson City** — Honest framing; note Elevated Flooring competes here directly.
  - **Local context (Carson Valley, historic ranching town, climate)** — Differentiate from Minden — distinct neighborhoods/landmarks (Historic downtown, Ranchos). Must not be a city-swap of Minden.
  - **Materials offered (links)** — Link material pages.
  - **Services offered (links)** — Link install hub.
  - **Local proof (real Gardnerville projects/reviews)** — Real photos/testimonials, else delay/consolidate.
  - **Free in-home estimate (we travel to Gardnerville)** — Conversion hook.
  - **Credentials + Landmark Guarantee** — Trust block.
  - **City FAQ (visible HTML)** — No FAQPage schema.
  - **CTA + showroom NAP + click-to-call** — → /free-estimate/.

## `/service-area/lake-tahoe/` — P2 · City / location page (Tier 2 — build only with real proof)

- **File:** `service-area/lake-tahoe/index.html`
- **Primary keyword:** flooring Lake Tahoe NV
- **Secondary keywords:** carpet installation Lake Tahoe, Incline Village flooring, Tahoe cabin flooring, flooring installer Lake Tahoe
- **Search intent:** Transactional — ORGANIC visibility; distinct cabin/snow use case.
- **Title tag:** `Flooring & Installation at Lake Tahoe, NV | Landmark Flooring`
- **Meta description:** Durable flooring for Lake Tahoe homes & cabins, sold and installed by Northern NV pros. Built for snow & moisture. Free estimates. (775) 297-3236.
- **H1:** Flooring Sales & Installation at Lake Tahoe, NV
- **Schema:** Service (areaServed = Lake Tahoe, provider → #business), BreadcrumbList
- **Word-count target:** 600–1,000 words GENUINELY UNIQUE
- **Internal links out:** /service-area/, /flooring/luxury-vinyl/, /flooring/hardwood/, /installation/, /guides/best-flooring-for-northern-nevada-climate/, /free-estimate/
- **Notes:** Tier 2 / Wave 3 — DO NOT BUILD until Landmark has real Tahoe projects, photos, or reviews. Climate/cabin angle is genuinely unique, which makes this defensible IF proof exists. Until then leave unbuilt and do not link from the service-area grid.

  **Section outline:**
  - **Breadcrumb: Home > Service Area > Lake Tahoe** — Visible + schema.
  - **Intro (Lake Tahoe in first sentence) + serve from Carson City** — Honest framing; drive up the mountain noted.
  - **Local context (lakefront cabins, snow/moisture, second homes, Incline Village)** — Tahoe's snow/moisture and cabin use cases genuinely differ from valley homes — strong unique angle; recommend waterproof LVP for moisture, mudrooms.
  - **Materials offered (links, Tahoe-weighted)** — Lead with LVP/engineered for moisture; link material pages.
  - **Services offered (links)** — Link install hub.
  - **Local proof (real Tahoe projects/reviews)** — REQUIRED before publishing — Tahoe is Tier 2; ship only with real Tahoe jobs/photos.
  - **Free in-home estimate (we travel to Tahoe)** — Conversion hook.
  - **Credentials + Landmark Guarantee** — Trust block.
  - **City FAQ (visible HTML)** — No FAQPage schema.
  - **CTA + showroom NAP + click-to-call** — → /free-estimate/.

## `/service-area/virginia-city/` — P2 · City / location page (Tier 2 — build only with real proof)

- **File:** `service-area/virginia-city/index.html`
- **Primary keyword:** flooring Virginia City NV
- **Secondary keywords:** carpet Virginia City NV, flooring installation Virginia City, historic home flooring Comstock
- **Search intent:** Transactional — ORGANIC visibility; small market, distinct historic-home angle.
- **Title tag:** `Flooring & Installation in Virginia City, NV | Landmark Flooring`
- **Meta description:** Flooring sales & installation for Virginia City's historic & modern homes, from your Carson City pros. Free in-home estimates. (775) 297-3236.
- **H1:** Flooring Sales & Installation in Virginia City, NV
- **Schema:** Service (areaServed = Virginia City, provider → #business), BreadcrumbList
- **Word-count target:** 500–900 words GENUINELY UNIQUE
- **Internal links out:** /service-area/, /flooring/hardwood/, /flooring/luxury-vinyl/, /installation/, /free-estimate/
- **Notes:** Tier 2 / Wave 3 — small population; lowest priority. DO NOT BUILD until real local proof exists. Historic-home angle is unique but only credible with real project photos. Consider folding into a regional page if proof never materializes.

  **Section outline:**
  - **Breadcrumb: Home > Service Area > Virginia City** — Visible + schema.
  - **Intro (Virginia City in first sentence) + serve from Carson City** — Short drive; honest framing.
  - **Local context (historic Comstock-era buildings, restoration sensitivity, climate)** — Genuinely unique angle: working in historic homes; period-appropriate looks. Must read like real local work.
  - **Materials offered (links)** — Link material pages.
  - **Services offered (links)** — Link install hub.
  - **Local proof (real Virginia City projects/reviews)** — REQUIRED before publishing — Tier 2.
  - **Free in-home estimate** — Conversion hook.
  - **Credentials + Landmark Guarantee** — Trust block.
  - **City FAQ (visible HTML)** — No FAQPage schema.
  - **CTA + showroom NAP + click-to-call** — → /free-estimate/.

## `/service-area/fallon/` — P2 · City / location page (Tier 2 — build only with real proof)

- **File:** `service-area/fallon/index.html`
- **Primary keyword:** flooring Fallon NV
- **Secondary keywords:** carpet Fallon NV, flooring installation Fallon, flooring installer Fallon NV
- **Search intent:** Transactional — ORGANIC visibility; outlying market east of Carson City.
- **Title tag:** `Flooring & Installation in Fallon, NV | Landmark Flooring`
- **Meta description:** Carpet, luxury vinyl, laminate & hardwood sold and installed in Fallon, NV by your Carson City flooring pros. Free in-home estimates. (775) 297-3236.
- **H1:** Flooring Sales & Installation in Fallon, NV
- **Schema:** Service (areaServed = Fallon, provider → #business), BreadcrumbList
- **Word-count target:** 500–900 words GENUINELY UNIQUE
- **Internal links out:** /service-area/, /flooring/luxury-vinyl/, /property-management/, /installation/, /free-estimate/
- **Notes:** Tier 2 / Wave 3 — farthest market; build last and ONLY with real Fallon proof. NAS Fallon rental-turn angle is a genuine differentiator and ties to the property-management page. Leave unbuilt + unlinked until proof exists.

  **Section outline:**
  - **Breadcrumb: Home > Service Area > Fallon** — Visible + schema.
  - **Intro (Fallon in first sentence) + serve from Carson City** — Note the longer drive east on US-50; honest about coverage/scheduling.
  - **Local context (Naval Air Station families, ag community, climate)** — Genuinely unique angle: military/rental turnover near NAS Fallon, ag-town homes. Differentiate fully.
  - **Materials offered (links)** — Link material pages.
  - **Services offered (links)** — Link install hub + property-management (NAS rentals).
  - **Local proof (real Fallon projects/reviews)** — REQUIRED before publishing — Tier 2.
  - **Free in-home estimate** — Conversion hook; note scheduling for the drive.
  - **Credentials + Landmark Guarantee** — Trust block.
  - **City FAQ (visible HTML)** — No FAQPage schema.
  - **CTA + showroom NAP + click-to-call** — → /free-estimate/.

## `/free-estimate/` — P0 · Conversion / lead-capture landing page

- **File:** `free-estimate/index.html`
- **Primary keyword:** free flooring estimate Carson City
- **Secondary keywords:** free in-home flooring estimate, flooring quote Carson City, flooring measurement and estimate, in-home flooring consultation
- **Search intent:** Transactional — bottom-of-funnel conversion; real destination for the ~15 existing #estimate CTAs.
- **Title tag:** `Get a Free Flooring Estimate in Carson City, NV | Landmark`
- **Meta description:** Request your free in-home or showroom flooring estimate in Carson City & Northern NV. No pressure, no charge. Call (775) 297-3236 or book online.
- **H1:** Get Your Free Flooring Estimate
- **Schema:** BreadcrumbList, (optional) Service 'Free Flooring Estimate' provider → #business
- **Word-count target:** 300–600 words (conversion page, intentionally lean)
- **Internal links out:** /, /financing/, /contact/, /installation/
- **Notes:** Primarily conversion, not ranking. Differentiate from /contact/ (estimate = lead form; contact = NAP/showroom/map). CRITICAL sitewide change: repoint all ~15 #estimate CTAs here (keep tel: links as-is). Build in Wave 1 so CTAs have a real home.

  **Section outline:**
  - **Breadcrumb: Home > Free Estimate** — Visible + schema.
  - **Intro + what 'free estimate' includes** — In-home OR showroom; measure, advise, quote at no charge, no pressure.
  - **Lead form** — Name, phone, email, address/city, material interest, message. Primary conversion. (Static site — wire to a form handler/email service.)
  - **Click-to-call alternative** — Prominent tel:+17752973236.
  - **What to expect (3 steps)** — Mirror How-It-Works; reduce friction.
  - **Why Landmark (trust mini-block)** — Licensed/bonded/insured, Landmark Guarantee, financing.
  - **Showroom info + map + hours** — NAP + map embed; Mon–Fri 9–5.
  - **CTA repeat + NAP** — Form + call.

## `/contact/` — P0 · Contact / showroom page

- **File:** `contact/index.html`
- **Primary keyword:** flooring showroom Carson City
- **Secondary keywords:** Landmark Flooring Carson City, flooring store hours Carson City, flooring showroom near me, 2085 East William St flooring
- **Search intent:** Transactional/navigational — canonical on-site NAP source matching GBP; map + directions + hours.
- **Title tag:** `Contact & Showroom — Carson City, NV | Landmark Flooring`
- **Meta description:** Visit the Landmark Flooring showroom at 2085 East William St, Suite 10, Carson City, NV. Open Mon–Fri 9am–5pm. Call (775) 297-3236.
- **H1:** Visit Our Carson City Flooring Showroom
- **Schema:** LocalBusiness/HomeAndConstructionBusiness reference (same #business @id, NOT a duplicate node), BreadcrumbList
- **Word-count target:** 300–600 words
- **Internal links out:** /, /free-estimate/, /service-area/carson-city/, /about/
- **Notes:** NAP must EXACTLY match GBP + citations — any inconsistency dilutes local ranking. This is the canonical on-site NAP page. Wave 1 (needed for the showroom CTA + map). Reference the single #business node; do not mint a second LocalBusiness.

  **Section outline:**
  - **Breadcrumb: Home > Contact** — Visible + schema.
  - **NAP block (top of page)** — Name, full address (2085 East William St, Suite 10, Carson City, NV 89701), tel:+17752973236 — EXACTLY matching GBP.
  - **Embedded Google Map + directions** — Map of showroom; link to GBP.
  - **Hours** — Mon–Fri 9am–5pm (matches GBP + OpeningHoursSpecification).
  - **In-store visualizer + samples** — What to expect in the showroom; experience signal.
  - **Request an estimate (link to form)** — Link to /free-estimate/ rather than duplicating the form.
  - **What to bring / how to prepare** — Room dimensions, photos, budget.
  - **CTA + click-to-call** — Call + Get Free Estimate.

## `/about/` — P1 · About / E-E-A-T page

- **File:** `about/index.html`
- **Primary keyword:** about Landmark Flooring Carson City
- **Secondary keywords:** licensed bonded insured flooring Carson City, local flooring company Northern Nevada, The Landmark Guarantee, flooring company Carson City
- **Search intent:** Trust/E-E-A-T — establishes experience, credentials, guarantee, team; linked from money pages.
- **Title tag:** `About Landmark Flooring — Carson City, NV | Local Experts`
- **Meta description:** Meet Landmark Flooring: Carson City's local flooring store & installer. Licensed, bonded & insured, warrantied in-house labor, The Landmark Guarantee.
- **H1:** About Landmark Flooring
- **Schema:** BreadcrumbList, AboutPage (optional), reference #business @id
- **Word-count target:** 500–900 words unique
- **Internal links out:** /, /installation/, /reviews/, /contact/, /free-estimate/
- **Notes:** Make it specific (real people, real credentials, license #). Generic copy adds little E-E-A-T. Wave 2.

  **Section outline:**
  - **Breadcrumb: Home > About** — Visible + schema.
  - **Who we are (local store + installer)** — Local showroom AND installer, not a big-box counter. Add founding year/history when client supplies.
  - **The Landmark Guarantee** — Warrantied products + warrantied in-house labor; both floor and work covered.
  - **Credentials (licensed/bonded/insured)** — Add NV contractor license # when client supplies — do not invent. Trust signal, not keyword target.
  - **In-house crews + craftsmanship** — Own crews, never random subs (parallels Campbell's).
  - **Local climate expertise** — High-desert/Tahoe materials knowledge; ties to E-E-A-T 'experience'.
  - **Showroom + visualizer** — Real samples + in-store visualizer; link /contact/.
  - **Team / real people** — Add real people/photos when available — generic 'we're passionate' adds little.
  - **CTA + NAP + click-to-call** — → /free-estimate/, /contact/.

## `/reviews/` — P2 · Reviews / testimonials page

- **File:** `reviews/index.html`
- **Primary keyword:** Landmark Flooring reviews Carson City
- **Secondary keywords:** flooring company reviews Carson City, flooring reviews Northern Nevada, Carson City flooring testimonials
- **Search intent:** Trust/conversion — aggregates real reviews + project outcomes; prominence signal.
- **Title tag:** `Reviews & Testimonials | Landmark Flooring, Carson City NV`
- **Meta description:** Read what Northern Nevada homeowners say about Landmark Flooring — real reviews and completed projects across Carson City, Reno & beyond. (775) 297-3236.
- **H1:** What Northern Nevada Homeowners Say About Landmark Flooring
- **Schema:** BreadcrumbList
- **Word-count target:** 300–700 words + review content
- **Internal links out:** /, /installation/, /flooring/luxury-vinyl/, /free-estimate/
- **Notes:** CRITICAL do-not-invent: current site reviews are PLACEHOLDERS — replace with real reviews before publishing. Do NOT add Review/AggregateRating schema on Landmark's own site (self-serving rule makes it ineligible for review stars and risks manual action). Surface reviews as on-page social proof; drive volume to GBP. Wave 2/3, after real reviews are collected.

  **Section outline:**
  - **Breadcrumb: Home > Reviews** — Visible + schema.
  - **Intro** — Real customer experiences across the service area.
  - **Review wall (real reviews only)** — Embed/quote REAL Google/Facebook reviews; attribute by first name + city. Prompt customers for recent, service-specific reviews.
  - **Project outcomes / gallery** — Real before/after with material + city tags; links to relevant material pages.
  - **Leave-us-a-review CTA** — Link to GBP review URL (drives Map-Pack-relevant review velocity).
  - **CTA + NAP + click-to-call** — → /free-estimate/.

## `/financing/` — P2 · Financing detail page

- **File:** `financing/index.html`
- **Primary keyword:** flooring financing Carson City
- **Secondary keywords:** flooring financing near me, buy now pay later flooring, flooring payment plans, 0% flooring financing Northern Nevada
- **Search intent:** Commercial — real transactional demand; removes budget friction; full explainer for homepage strip.
- **Title tag:** `Flooring Financing in Carson City, NV | Landmark Flooring`
- **Meta description:** Finance your new floors in Carson City & Northern NV — flexible options so you can install now and pay over time. Ask us how. Call (775) 297-3236.
- **H1:** Flooring Financing Options
- **Schema:** BreadcrumbList
- **Word-count target:** 400–800 words
- **Internal links out:** /, /flooring/luxury-vinyl/, /flooring/hardwood/, /free-estimate/
- **Notes:** Do-not-invent: keep claims accurate to the actual lender/terms; replace generic 'financing available' only when client supplies APR/partner. Repoint homepage financing strip here. Wave 2/3.

  **Section outline:**
  - **Breadcrumb: Home > Financing** — Visible + schema.
  - **Intro** — Financing makes premium floors affordable; install now, pay over time.
  - **How financing works / how to apply** — General steps. Add real lender/partner, APR, and terms ONLY when client confirms — do not invent.
  - **What financing can cover** — Materials + installation across all categories.
  - **Budget vs premium options** — Both tiers; link material pages.
  - **Financing FAQ (visible HTML)** — No FAQPage schema. Flesh out so the page isn't one sentence.
  - **CTA + NAP + click-to-call** — → /free-estimate/.

## `/guides/` — P1 · Resource hub root

- **File:** `guides/index.html`
- **Primary keyword:** flooring guides Northern Nevada
- **Secondary keywords:** flooring buying guide, flooring cost guide Nevada, how to choose flooring
- **Search intent:** Navigational — hub for cost/comparison/best-for guides; topical-authority + AI-citation engine. NOT a money-page ranking lever (see corrections).
- **Title tag:** `Flooring Guides & Cost Resources | Landmark Flooring`
- **Meta description:** Flooring cost guides, material comparisons & buying advice for Northern Nevada homeowners — from your Carson City flooring experts. (775) 297-3236.
- **H1:** Flooring Guides & Buying Resources
- **Schema:** BreadcrumbList, (optional) CollectionPage
- **Word-count target:** 300–500 words + guide links
- **Internal links out:** /guides/flooring-cost-carson-city-northern-nevada/, /guides/lvp-vs-laminate-vs-hardwood/, /guides/best-flooring-for-northern-nevada-climate/, /guides/best-flooring-for-pets-and-kids/, /guides/refinish-vs-replace-hardwood-floors/, /free-estimate/
- **Notes:** Each guide must link to its matching money page with descriptive anchor text — that is how (and the ONLY way) the hub assists conversions. Measure on assisted conversions / brand visibility / AI citations, not money-page rankings.

  **Section outline:**
  - **Intro** — Expert guides to help you choose and budget; funnels to estimate.
  - **Guide categories** — Cost, comparisons, best-for/use-case, climate, refinishing, care. Link cornerstone guides.
  - **Featured cornerstone guides** — Cost-in-NN, LVP-vs-laminate-vs-hardwood, climate, best-for-pets-kids, refinish-vs-replace.
  - **CTA** — → /free-estimate/.

## `/guides/flooring-cost-carson-city-northern-nevada/` — P1 · Guide (cost — flagship)

- **File:** `guides/flooring-cost-carson-city-northern-nevada/index.html`
- **Primary keyword:** flooring cost Carson City
- **Secondary keywords:** flooring installation cost Northern Nevada, how much does flooring cost Nevada, flooring prices Reno, flooring cost calculator Nevada
- **Search intent:** Commercial-investigation (localized cost) — leans commercial; funnel to estimate.
- **Title tag:** `Flooring Cost in Carson City & Northern NV (2026 Guide) | Landmark`
- **Meta description:** What flooring really costs in Carson City & Northern Nevada in 2026 — carpet, LVP, laminate & hardwood price ranges plus what affects your quote.
- **H1:** How Much Does Flooring Cost in Carson City & Northern Nevada? (2026 Price Guide)
- **Schema:** BreadcrumbList, Article
- **Word-count target:** 1,200–1,800 words
- **Internal links out:** /guides/, /flooring/carpet/, /flooring/luxury-vinyl/, /flooring/laminate/, /flooring/hardwood/, /free-estimate/, /financing/
- **Notes:** Highest-intent commercial-investigation guide; the flagship. Localized 'cost in [city]' leans commercial and funnels to /free-estimate/. Strong CTA. Wave 2 (first guide built).

  **Section outline:**
  - **Breadcrumb: Home > Guides > Flooring Cost** — Visible + schema.
  - **Intro + how to use this guide** — Local price ranges; label all figures as estimates, not quotes.
  - **Installed price ranges by material** — Carpet ~$3–11/sf, LVP ~$3.50–9/sf, laminate ~$3–13/sf, hardwood ~$9–23/sf (2025–26 sources). Label as estimates; localize framing.
  - **What affects your quote** — Subfloor, removal/haul-away, stairs, transitions, square footage, material grade.
  - **Budget vs premium** — Landmark offers both; link material pages.
  - **Get an exact number (free estimate)** — Strong CTA — guide's own conversion path.
  - **Related guides** — Link per-material cost guides + comparison guide.

## `/guides/lvp-vs-laminate-vs-hardwood/` — P1 · Guide (comparison — flagship)

- **File:** `guides/lvp-vs-laminate-vs-hardwood/index.html`
- **Primary keyword:** LVP vs laminate vs hardwood
- **Secondary keywords:** luxury vinyl vs laminate, hardwood vs laminate, engineered vs solid hardwood, which flooring is right for me
- **Search intent:** Commercial-investigation (mid-funnel) — buyer comparing right before choosing; treat as conversion-oriented, not blog filler.
- **Title tag:** `LVP vs. Laminate vs. Hardwood: Which Flooring Is Right? | Landmark`
- **Meta description:** LVP vs. laminate vs. hardwood compared — waterproofing, durability, cost & best rooms — so Northern Nevada homeowners can choose with confidence.
- **H1:** LVP vs. Laminate vs. Hardwood: Which Flooring Is Right for Your Home?
- **Schema:** BreadcrumbList, Article
- **Word-count target:** 1,200–1,800 words
- **Internal links out:** /guides/, /flooring/luxury-vinyl/, /flooring/laminate/, /flooring/hardwood/, /guides/best-flooring-for-northern-nevada-climate/, /free-estimate/
- **Notes:** Most-searched flooring comparison; mid-funnel commercial-investigation — give it stronger CTAs + direct money-page links than pure informational content. Internal-link hub off it. Wave 2.

  **Section outline:**
  - **Breadcrumb: Home > Guides > LVP vs Laminate vs Hardwood** — Visible + schema.
  - **Quick-answer recommendation** — Lead with a clear recommendation by use case (commercial-investigation intent rewards a direct answer + AI-citation friendly).
  - **Comparison table** — Waterproof, durability, cost, look, lifespan, best rooms, refinishable.
  - **When to choose LVP** — Waterproof/pets/kids/basements; link /flooring/luxury-vinyl/.
  - **When to choose laminate** — Budget wood-look, dry rooms; link /flooring/laminate/.
  - **When to choose hardwood** — Value, timeless; engineered for dry climate; link /flooring/hardwood/.
  - **Northern Nevada climate note** — Dry-climate gapping favors engineered/LVP; link climate guide.
  - **CTA (free estimate)** — Strong CTA + financing link.

## `/guides/best-flooring-for-northern-nevada-climate/` — P1 · Guide (local climate — flagship local-authority)

- **File:** `guides/best-flooring-for-northern-nevada-climate/index.html`
- **Primary keyword:** best flooring for dry climate Nevada
- **Secondary keywords:** hardwood floor gaps Reno, flooring high desert Nevada, flooring acclimation Nevada, best flooring Lake Tahoe home
- **Search intent:** Top-of-funnel informational with strong local E-E-A-T; differentiator no national page can match.
- **Title tag:** `Best Flooring for Northern Nevada's Dry, High-Desert Climate | Landmark`
- **Meta description:** Northern Nevada's dry, high-desert climate makes solid wood gap. See which floors (engineered wood, LVP) hold up in Carson City, Reno & Tahoe.
- **H1:** Best Flooring for Northern Nevada's Dry, High-Desert Climate
- **Schema:** BreadcrumbList, Article
- **Word-count target:** 1,000–1,600 words
- **Internal links out:** /guides/, /flooring/hardwood/, /flooring/luxury-vinyl/, /installation/hardwood/, /service-area/lake-tahoe/, /free-estimate/
- **Notes:** Genuine local-authority differentiator (validated by regional hardwood specialists). Strong AI-Overview citation candidate. Wave 2/3.

  **Section outline:**
  - **Breadcrumb: Home > Guides > Best Flooring for NN Climate** — Visible + schema.
  - **Why climate matters here** — Low humidity, big swings; solid wood shrinks/gaps. Defensible local angle.
  - **What works in the high desert** — Engineered hardwood, waterproof LVP; acclimation; link material pages.
  - **Tahoe vs valley differences** — Snow/moisture cabins vs dry valleys; link Tahoe city page.
  - **Acclimation & humidity control** — Why proper install prevents problems; link install pages.
  - **CTA (free estimate)** — Funnel to estimate; we recommend the right material for your home.

## `/guides/best-flooring-for-pets-and-kids/` — P1 · Guide (use-case — commercial-investigation)

- **File:** `guides/best-flooring-for-pets-and-kids/index.html`
- **Primary keyword:** best flooring for pets and kids
- **Secondary keywords:** best flooring for dogs, scratch resistant flooring, waterproof flooring for families, most durable flooring for pets
- **Search intent:** Commercial-investigation (mid-funnel) — high volume; clean push to LVP. Treat as conversion-oriented.
- **Title tag:** `Best Flooring for Homes with Pets & Kids | Landmark Flooring`
- **Meta description:** The best flooring for pets and kids: waterproof, scratch-resistant rigid-core LVP and other durable options for busy Northern Nevada homes.
- **H1:** Best Flooring for Homes with Pets and Kids
- **Schema:** BreadcrumbList, Article
- **Word-count target:** 1,000–1,500 words
- **Internal links out:** /guides/, /flooring/luxury-vinyl/, /flooring/laminate/, /flooring/carpet/, /free-estimate/
- **Notes:** Reclassified from top-of-funnel to commercial-investigation per verdict — stronger CTA, direct LVP link. Maps to Landmark's waterproof differentiator. Wave 2/3.

  **Section outline:**
  - **Breadcrumb: Home > Guides > Best Flooring for Pets & Kids** — Visible + schema.
  - **Quick recommendation** — Lead with rigid-core waterproof LVP (20-mil+ wear layer) as top pick.
  - **What to look for** — Waterproof, scratch/dent resistance, easy clean, comfort/sound.
  - **Best options ranked** — LVP, then laminate/carpet trade-offs; link material pages.
  - **What to avoid & why** — Soft solid woods, certain carpets for accidents.
  - **CTA (free estimate)** — Strong CTA to LVP page + estimate.

## `/guides/refinish-vs-replace-hardwood-floors/` — P1 · Guide (service economics — high-margin)

- **File:** `guides/refinish-vs-replace-hardwood-floors/index.html`
- **Primary keyword:** refinish vs replace hardwood floors
- **Secondary keywords:** should I refinish or replace hardwood, cost to refinish vs replace hardwood, signs hardwood needs refinishing, hardwood refinishing cost
- **Search intent:** Commercial-investigation — captures hardwood-owner demand; justifies refinishing service.
- **Title tag:** `Refinish vs. Replace Hardwood Floors: Which to Choose | Landmark`
- **Meta description:** Refinish or replace your hardwood floors? Compare cost, signs of wear & what to choose — from Northern Nevada's flooring & refinishing pros.
- **H1:** Refinish vs. Replace Hardwood Floors: Cost, Signs & What to Choose
- **Schema:** BreadcrumbList, Article
- **Word-count target:** 1,000–1,500 words
- **Internal links out:** /guides/, /installation/hardwood-refinishing/, /flooring/hardwood/, /free-estimate/
- **Notes:** Converts a high-margin in-house labor service. Build with the refinishing service page. Wave 2/3.

  **Section outline:**
  - **Breadcrumb: Home > Guides > Refinish vs Replace** — Visible + schema.
  - **Quick decision framework** — Refinish if structurally sound + enough wear layer; replace if damaged/too thin.
  - **Cost comparison** — Refinish ~$3–8/sf vs replace ~$6–25/sf installed (2025–26). Label estimates.
  - **Signs you need refinishing** — 2+ wear signs; every 7–10 yrs.
  - **Can engineered be refinished?** — Wear-layer dependent.
  - **CTA (free estimate)** — Link /installation/hardwood-refinishing/ + estimate.

## `/guides/lvp-flooring-cost-northern-nevada/` — P2 · Guide (per-material cost)

- **File:** `guides/lvp-flooring-cost-northern-nevada/index.html`
- **Primary keyword:** LVP flooring cost per square foot
- **Secondary keywords:** luxury vinyl plank cost, LVP installation cost Reno, vinyl plank flooring cost Nevada
- **Search intent:** Commercial-investigation — localized LVP cost; funnel to LVP + estimate.
- **Title tag:** `LVP Flooring Cost in Reno & Carson City (2026) | Landmark`
- **Meta description:** Luxury vinyl plank flooring cost in Northern Nevada — materials plus installation price ranges and what drives your LVP quote in 2026.
- **H1:** LVP Flooring Cost Guide: Materials + Installation in Northern Nevada
- **Schema:** BreadcrumbList, Article
- **Word-count target:** 800–1,200 words
- **Internal links out:** /guides/, /flooring/luxury-vinyl/, /installation/luxury-vinyl/, /free-estimate/
- **Notes:** Localized commercial-investigation cost query. Wave 3.

  **Section outline:**
  - **Breadcrumb: Home > Guides > LVP Cost** — Visible + schema.
  - **LVP price ranges** — ~$3.50–9/sf installed; material vs labor. Label estimates.
  - **What affects LVP cost** — Wear layer/mil, rigid vs flexible core, subfloor, removal.
  - **Is LVP worth it?** — Durability/ROI; link LVP page.
  - **CTA (free estimate)** — Funnel to estimate.

## `/guides/hardwood-flooring-cost-nevada/` — P2 · Guide (per-material cost)

- **File:** `guides/hardwood-flooring-cost-nevada/index.html`
- **Primary keyword:** hardwood flooring cost Nevada
- **Secondary keywords:** hardwood flooring cost per square foot, solid vs engineered hardwood cost, wood floor installation cost Reno
- **Search intent:** Commercial-investigation — localized hardwood cost; funnel to hardwood + estimate.
- **Title tag:** `Hardwood Flooring Cost in Nevada (2026): Solid vs Engineered | Landmark`
- **Meta description:** Hardwood flooring cost in Northern Nevada — solid vs engineered price breakdown plus installation factors and 2026 ranges from local pros.
- **H1:** Hardwood Flooring Cost in 2026: Solid vs. Engineered Price Breakdown
- **Schema:** BreadcrumbList, Article
- **Word-count target:** 800–1,200 words
- **Internal links out:** /guides/, /flooring/hardwood/, /installation/hardwood/, /guides/best-flooring-for-northern-nevada-climate/, /free-estimate/
- **Notes:** Highest avg job value category. Wave 3.

  **Section outline:**
  - **Breadcrumb: Home > Guides > Hardwood Cost** — Visible + schema.
  - **Hardwood price ranges** — ~$9–23/sf installed; solid vs engineered. Label estimates.
  - **What affects hardwood cost** — Species, finish, subfloor, acclimation, stairs.
  - **Solid vs engineered value** — Climate angle; link hardwood + climate guide.
  - **CTA (free estimate)** — Funnel to estimate.

## `/guides/carpet-installation-cost-northern-nevada/` — P2 · Guide (per-material cost)

- **File:** `guides/carpet-installation-cost-northern-nevada/index.html`
- **Primary keyword:** carpet installation cost Reno
- **Secondary keywords:** carpet installation cost per square foot, carpet cost Northern Nevada, cost to carpet a room Carson City
- **Search intent:** Commercial-investigation — localized carpet cost; funnel to carpet + estimate.
- **Title tag:** `Carpet Installation Cost in Northern Nevada (2026) | Landmark`
- **Meta description:** What carpet installation really costs in Northern Nevada — per-square-foot ranges, pad, removal and what affects your carpet quote in 2026.
- **H1:** Carpet Installation Cost in Northern Nevada: What You'll Actually Pay
- **Schema:** BreadcrumbList, Article
- **Word-count target:** 800–1,200 words
- **Internal links out:** /guides/, /flooring/carpet/, /installation/carpet/, /free-estimate/
- **Notes:** Wave 3.

  **Section outline:**
  - **Breadcrumb: Home > Guides > Carpet Cost** — Visible + schema.
  - **Carpet price ranges** — ~$3–11/sf installed; material + pad + labor. Label estimates.
  - **What affects carpet cost** — Fiber, pad, stairs, removal, room shape.
  - **Budget vs premium carpet** — Both tiers; link carpet page.
  - **CTA (free estimate)** — Funnel to estimate.

## `/guides/how-to-choose-flooring/` — P2 · Guide (room-by-room buying guide)

- **File:** `guides/how-to-choose-flooring/index.html`
- **Primary keyword:** how to choose flooring
- **Secondary keywords:** best flooring for each room, best kitchen flooring, best bathroom flooring, best basement flooring
- **Search intent:** Top-of-funnel informational — room-by-room feeder to product pages.
- **Title tag:** `How to Choose the Right Flooring for Your Home | Landmark`
- **Meta description:** A complete room-by-room guide to choosing flooring — kitchen, bath, bedroom & basement — from Northern Nevada's flooring experts.
- **H1:** How to Choose the Right Flooring for Your Home: A Complete Guide
- **Schema:** BreadcrumbList, Article
- **Word-count target:** 1,000–1,500 words
- **Internal links out:** /guides/, /flooring/luxury-vinyl/, /flooring/laminate/, /flooring/hardwood/, /flooring/carpet/, /free-estimate/
- **Notes:** Top-of-funnel; expect AI-Overview displacement — measure on brand/assisted conversions. Wave 3.

  **Section outline:**
  - **Breadcrumb: Home > Guides > How to Choose Flooring** — Visible + schema.
  - **Start with the room & lifestyle** — Moisture, traffic, pets, budget framework.
  - **Best flooring by room** — Kitchen/bath/basement → LVP/tile; living/bedroom → hardwood/carpet; link material pages.
  - **5 questions to ask before buying** — Practical checklist.
  - **CTA (free estimate / showroom)** — Funnel to estimate + visualizer.

## `/guides/best-flooring-for-rental-properties/` — P2 · Guide (B2B segment feeder)

- **File:** `guides/best-flooring-for-rental-properties/index.html`
- **Primary keyword:** best flooring for rental properties
- **Secondary keywords:** best flooring for landlords, durable flooring for rentals, flooring for property managers, best flooring for apartment turns
- **Search intent:** Commercial-investigation (B2B) — feeds property-management page.
- **Title tag:** `Best Flooring for Rental Properties & Turns | Landmark Flooring`
- **Meta description:** The best flooring for rentals and turns: durable, budget-friendly waterproof LVP that survives tenants. Guidance for Northern Nevada landlords & PMs.
- **H1:** Best Flooring for Rental Properties & Turns
- **Schema:** BreadcrumbList, Article
- **Word-count target:** 900–1,300 words
- **Internal links out:** /guides/, /property-management/, /flooring/luxury-vinyl/, /free-estimate/
- **Notes:** B2B feeder to the property-management money page. Wave 3.

  **Section outline:**
  - **Breadcrumb: Home > Guides > Best Flooring for Rentals** — Visible + schema.
  - **What landlords need** — Durability, cost, fast turns, easy repair.
  - **Top pick: waterproof rigid-core LVP** — Why it wins for turns; link LVP + PM page.
  - **Budget vs premium for rentals** — Where to spend/save.
  - **CTA (request a quote / set up account)** — Funnel to /property-management/ + estimate.

## `/guides/how-to-prepare-for-flooring-installation/` — P2 · Guide (process / how-to-prepare)

- **File:** `guides/how-to-prepare-for-flooring-installation/index.html`
- **Primary keyword:** how to prepare for flooring installation
- **Secondary keywords:** flooring installation process, what to expect flooring installation day, do installers move furniture, flooring installation checklist
- **Search intent:** Middle-funnel informational — reduces friction; reinforces in-house-labor/Guarantee.
- **Title tag:** `How to Prepare for Flooring Installation | Landmark Flooring`
- **Meta description:** How to prepare your home for flooring installation — furniture, subfloor, timeline and what to expect on install day, from Northern Nevada's pros.
- **H1:** How to Prepare Your Home for Flooring Installation
- **Schema:** BreadcrumbList, Article
- **Word-count target:** 800–1,200 words
- **Internal links out:** /guides/, /installation/, /free-estimate/
- **Notes:** Reinforces the in-house-labor / Landmark Guarantee differentiator. Wave 3.

  **Section outline:**
  - **Breadcrumb: Home > Guides > Prepare for Installation** — Visible + schema.
  - **Before install day (checklist)** — Clear rooms, furniture, pets, access.
  - **Subfloor prep & why it matters** — Lasting floor; link install hub.
  - **What to expect on install day** — Timeline, dust, haul-away.
  - **Our in-house process + Guarantee** — Reinforce warranty differentiator.
  - **CTA (free estimate)** — Funnel to estimate.

## `/guides/does-new-flooring-increase-home-value/` — P2 · Guide (ROI / investment)

- **File:** `guides/does-new-flooring-increase-home-value/index.html`
- **Primary keyword:** does new flooring increase home value
- **Secondary keywords:** flooring ROI, best flooring for resale value, flooring before selling home, affordable flooring options
- **Search intent:** Bottom-ish informational — ROI angle; funnels to hardwood/LVP + financing.
- **Title tag:** `Does New Flooring Increase Home Value? ROI Guide | Landmark`
- **Meta description:** Does new flooring increase home value? See which floors add the most ROI before selling in Northern Nevada — and how to finance the upgrade.
- **H1:** Does New Flooring Increase Home Value? What Adds the Most ROI
- **Schema:** BreadcrumbList, Article
- **Word-count target:** 800–1,200 words
- **Internal links out:** /guides/, /flooring/hardwood/, /flooring/luxury-vinyl/, /financing/, /free-estimate/
- **Notes:** ROI angle ties to financing money page. Wave 3 (lowest guide priority).

  **Section outline:**
  - **Breadcrumb: Home > Guides > Flooring & Home Value** — Visible + schema.
  - **Flooring & resale value** — What buyers want; hardwood/LVP appeal.
  - **Highest-ROI choices** — Link hardwood + LVP pages.
  - **Spend vs save before selling** — Budget framing; link financing.
  - **CTA (free estimate)** — Funnel to estimate + financing.
