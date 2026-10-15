# Schema migration & additions — Landmark Flooring rebuild

> Companion to `URL-MAP-MIGRATION.xlsx`. Covers (1) preserving the old site's
> structured data through the provider switch, (2) due-diligence additions —
> including Chamber of Commerce membership markup — with ready-to-paste
> implementations. Governed by the structured-data rules in `CLAUDE.md`
> (single `#business` node, no `FAQPage`, no self-serve `Review`/`AggregateRating`).

## 1. Old-site schema — what we know and how to close the gap

The live site (`landmarkflooringusa.com`) returns **403 to all crawlers and
fetchers**, so its markup could not be read from this environment. What we can
infer and what to do:

- The old site is a WordPress build (URL patterns, `- Landmark Flooring` title
  suffix). WP + Yoast/RankMath defaults typically emit: `Organization`/
  `LocalBusiness`, `WebSite` (+`SearchAction`), `WebPage`, `BreadcrumbList`,
  and `Article` on posts.
- **Before launch (5 min, client or anyone with a normal browser):** open the
  old homepage, one product-ish page, and one blog post → View Source → copy
  every `<script type="application/ld+json">` block into
  `docs/seo/old-site-schema/` in this repo. That converts this section from
  inference to fact.
- Also check **GSC → Enhancements/Shopping reports** for which rich-result
  types Google currently credits the old site with — that's the parity bar.

### Preservation map (old → rebuild)

| Old (typical WP/Yoast) | Rebuild status | Action |
|---|---|---|
| `LocalBusiness`/`Organization` | ✅ Upgraded: `["HomeAndConstructionBusiness","Store"]` `@id: …/#business` on home | None — keep the stable `@id` forever |
| `WebSite` + `SearchAction` | ❌ **Missing** | Add `WebSite` node (§3.2); skip `SearchAction` (no site search) |
| `BreadcrumbList` | ✅ On all 28 sub-pages | None |
| `Article`/`BlogPosting` on posts | ✅ `Article` on all 4 guides + guides hub | None |
| `sameAs` social/profile links | ❌ **Missing on rebuild** | Add verified profiles (§3.3) |
| `FAQPage` | Intentionally absent | Keep absent — deprecated for rich results 2026-05-07 |
| `Review`/`AggregateRating` | Must stay absent | Policy-ineligible self-markup; GBP is the review surface |

Current rebuild inventory (verified in-repo, 2026-08-04): home =
`HomeAndConstructionBusiness`+`Store` with `OfferCatalog`; every material /
install / segment / city page = `Service` (provider → `#business`) +
`BreadcrumbList`; guides = `Article`; hubs = `ItemList`/`CollectionPage`;
`/contact/` = `ContactPage`, `/about/` = `AboutPage`.

## 2. Due diligence: Chamber of Commerce markup

**Membership is verified**: Landmark Flooring appears in the Carson City
Chamber of Commerce membership directory (contact: Matthew Phillips,
matt@landmarkflooringusa.com, 775-297-3236).

- Schema.org has **no `ChamberOfCommerce` type**, and Landmark's page should
  not pretend to be one. The correct modeling is the **`memberOf`** property
  on the existing `#business` node, pointing at the chamber as an
  `Organization`. This is a legitimate local-trust/E-E-A-T signal.
- Bonus (off-site, flag to client): the chamber member profile is a
  high-trust **citation + backlink**. Make sure the directory listing links to
  `https://landmarkflooringusa.com/` and shows the locked NAP exactly.
- Do **not** add `memberOf` for any other org (BBB accreditation, trade
  associations) until membership is confirmed the same way.

## 3. Implementation (paste-ready)

All edits go in the committed HTML of `index.html` — JSON-LD is intentionally
**not** Sanity-editable, so no CMS wiring is involved.

### 3.1 `memberOf` on the `#business` node

Add inside the existing `#business` JSON-LD object (e.g. after `"logo"`):

```json
"memberOf": {
  "@type": "Organization",
  "name": "Carson City Chamber of Commerce",
  "url": "https://carsoncitychamber.com/"
},
```

### 3.2 `WebSite` node (new, home page only)

Add as a second `<script type="application/ld+json">` in the home `<head>`
(already prescribed in `SEO-DECISIONS.md`, never implemented):

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://landmarkflooringusa.com/#website",
  "url": "https://landmarkflooringusa.com/",
  "name": "Landmark Flooring",
  "publisher": { "@id": "https://landmarkflooringusa.com/#business" }
}
```

### 3.3 `sameAs` on the `#business` node

Only profiles verified to be THIS business (Carson City, NV — not the
Illinois "Landmark Flooring"):

```json
"sameAs": [
  "https://www.facebook.com/LandmarkFlooringNV/",
  "https://www.yelp.com/biz/landmark-flooring-carson-city-2",
  "https://www.bbb.org/us/nv/carson-city/profile/flooring-contractors/landmark-flooring-1166-90036616",
  "https://www.buildzoom.com/contractor/landmark-flooring-llc"
],
```

TODO (client confirms before adding): Google Business Profile share link,
Instagram/Nextdoor if they exist, chamber member-profile URL (once known).

### 3.4 `geo` + `hasMap` — TODO (client-supplied)

Worth adding for a single-location store, but per the DO-NOT-INVENT rule the
coordinates and map URL must come from the client's GBP ("share location"
link + the lat/long GBP shows), not be guessed:

```json
"hasMap": "TODO-GBP-share-URL",
"geo": { "@type": "GeoCoordinates", "latitude": "TODO", "longitude": "TODO" },
```

### 3.5 Explicitly NOT being added

- `FAQPage` — rich results fully deprecated 2026-05-07; FAQs stay visible HTML.
- `Review` / `AggregateRating` — self-markup is ineligible + policy risk.
- Per-city `LocalBusiness` nodes — one `#business`, referenced everywhere.
- `foundingDate` / "since 2021" — public LLC-filing data exists but falls
  under the client-confirm rule before appearing anywhere.
- Brand names in `OfferCatalog` — only after the client confirms stocked brands.

## 4. Go-live verification

1. Validate home + one page of each template in the [Rich Results Test](https://search.google.com/test/rich-results) and [schema.org validator](https://validator.schema.org/).
2. Confirm `@id: https://landmarkflooringusa.com/#business` resolves identically on home, `/contact/`, and every `Service` provider reference (already true; keep it).
3. After DNS cutover, watch GSC → Enhancements for parity with the old site's report (breadcrumbs, etc.); any type the old site had credited and the new one loses is a regression to chase.
