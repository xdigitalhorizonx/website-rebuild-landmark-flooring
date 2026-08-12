# Content audit — live site vs. rebuild

**Date:** 2026-08-12 · **Live:** landmarkflooringusa.com (WordPress/Bricks) · **Rebuild:** 30 static pages

Method: crawled the live `sitemap_index.xml` (4 sub-sitemaps) and every internal
link on all 40 reachable live pages, extracted titles/headings/body word counts,
then diffed topic-by-topic against the rebuild. Redirect handling is in
`REDIRECT-MAP.md`.

## Scoreboard

| | Live | Rebuild |
| --- | --- | --- |
| Indexable pages | 40 (+~150 `/tag/` archives) | 30 |
| Median words/page | ~500 | ~1,270 |
| Deep money pages (>1,000w) | 3 | 22 |
| Working lead form | ✅ 2 | ❌ 0 |
| Analytics / pixel | ✅ Meta Pixel + Ahrefs | ❌ none |
| Floor-care content | ✅ ~3,300 words | ❌ none |
| Brands shown | ✅ 6 | ❌ none |

The rebuild is a large net upgrade on depth — the money pages are 2–3× the live
site's. The holes below are all **things the live site does that the rebuild
currently doesn't**, so they are regressions at cutover, not missing nice-to-haves.

---

## 1. Launch blockers

### 1.1 No form actually submits anywhere
`/free-estimate/` has the only form on the site and it posts to `action="#"` —
the code carries its own `TODO (pre-publish)` admitting there is no backend.
`/contact/` has **no form at all**, while the live `/contact/` has one.

The live site captures leads three ways today: the "Message Us" form on `/contact/`,
a sitewide footer form on every page, and an embedded Google Form at
`/project-discovery/`. All three disappear at cutover.

**Every form fill on day one is a lost lead.** Wire a handler (Formspree, Vercel
form endpoint, or a plain `mailto:` fallback) before DNS moves.

### 1.2 No analytics or conversion tracking
Live runs the **Meta Pixel** (`1083311986909751`) and Ahrefs analytics on every
page. The rebuild ships neither, and no GA4 was found on either site.

Cutting over as-is means zero attribution from day one and a broken Meta audience.
Worth fixing the underlying gap too: there is no GA4 property firing on the live
site, so there is currently no organic-traffic baseline to measure the rebuild against.
**Stand up GA4 before launch** so the before/after comparison exists.

### 1.3 No Privacy Policy or Terms
The live footer links to both — and both already 404 (`/?page_id=4911`,
`/?page_id=4914`). The rebuild has neither page.

This is not just tidiness: the site runs a Meta Pixel and collects name/phone/email
through a lead form. Meta's advertising terms require an accessible privacy policy,
and Nevada's NRS 603A.340 requires one for commercial sites collecting personal
information from Nevada residents. Two short pages close it.

---

## 2. Financing — the biggest single content hole

The live `/financing/` page publishes a **real, specific offer**:

- Lender: **Synchrony**, via the **Mohawk Flooring Synchrony HOME™ credit card**
- **No interest if paid in full within 6 months**
- **No interest if paid in full within 12 months** on purchases of $5,000+
- Full disclosure block: 34.99% purchase APR, 39.99% penalty APR, $2 minimum
  interest charge, 2% promo fee on 18-month-plus equal-payment plans, "as of 07/16/2024"
- A live **Apply Now** button → `https://www.synchrony.com/mmc/MI235043200?sitecode=ac0lpi0e6`

The rebuild's `/financing/` (936 words) says only "financing is subject to credit
approval… ask our team for the current details." That was the right call while the
terms were unknown — but they aren't unknown. **The client already publishes them
under their own name**, so carrying them over is transcription, not invention.

Two things are lost right now: the offer itself (the "no interest for 12 months"
hook is the reason this page converts) and the working application link — the only
place on the site where a customer can self-serve into a financed sale.

Carry the disclosure text **verbatim**; Synchrony requires the exact wording, and
re-confirm the "as of" date with the client since it is two years old.

---

## 3. Floor care & maintenance — ~3,300 words, zero equivalent

Six live URLs, nothing on the rebuild:

| Live URL | Words |
| --- | --- |
| `/how-to-keep-hardwood-lvp-and-laminate-floors-clean-in-carson-city-reno-and-lake-tahoe/` | 1,486 |
| `/laminate-floor-care-northern-nevada/` | 636 |
| `/benchmark-commercial-cleaning-educates-…/` | 526 |
| `/laminate-care/` | 302 |
| `/lvt-lvp-care/` | 198 |
| `/carpet-care/` | 149 |

The three short `-care/` pages are linked from the **live footer under "Information"** —
they are permanent reference content customers return to after the sale, not blog filler.
The content is specific and non-generic (hot-water extraction every 12–18 months;
1:10 bleach dilution for LVP spot stains; acetone for laminate scuffs; never wet-mop
laminate).

That last one matters commercially: the live laminate care page warns that wet-mopping
"could cause swelling, warping, delamination, and joint-line separation, **and void the
warranty**." Landmark warranties its labor. Dropping published care instructions while
keeping a labor warranty removes the documentation that defends against a
misuse-driven warranty claim.

**Recommended:** a `/guides/floor-care/` hub with four spokes (carpet, luxury vinyl,
laminate, hardwood), each linked from its matching product page. Combined, this is
the single largest recoverable content asset on the old site.

---

## 4. Missing pages

### 4.1 `/residential/` — no landing page for the largest segment
Live has a 786-word residential page. The rebuild has `/commercial/` and
`/property-management/` but nothing for homeowners — the segment that drives the
most revenue. It currently redirects to `/flooring/`, which is a product index,
not a segment pitch.

The live copy also carries operational promises that appear nowhere on the rebuild
and are strong differentiators: *"our expert team… will leave your home clean,"*
*"we can also help move your furniture if necessary,"* and *"clear, easy, and detailed
proposals with our free estimates that outline the entire project."* (Tear-out and
haul-away are already covered on the rebuild.) Re-word the team references to match
the locked installer wording in `CLAUDE.md` before reuse.

### 4.2 Brands carried — 6 confirmed, 0 shown
The live home page runs a brand logo strip: **Shaw Floors, Mohawk, Mannington,
Couristan, Stanton, Engineered Floors**. Mohawk is separately confirmed by the
financing page. Product photography across the live site is manufacturer SKU imagery
(Shaw style codes `SW676`, `HW639`, `ZZ059`, `SL081`…).

`CLAUDE.md` says to list only brands the client confirms. **The live site is that
confirmation** — this is published, client-owned content. Brand names are a
significant local-organic and trust signal ("Shaw dealer Carson City" is a real query
pattern), and the rebuild has zero brand mentions on any page.

### 4.3 Virginia City & Lake Tahoe
Both exist live — Virginia City is a genuinely good 814-word page on historic homes,
uneven subfloors and elevation; Lake Tahoe is 447 words. Both are deliberately unbuilt
per `CLAUDE.md` (Tahoe held by the client on 2026-07-01 pending a real Tahoe project).

That decision predates knowing these pages exist and rank. Both currently redirect to
`/service-area/`. **This needs a client call before launch** — retiring live, indexed
city content is a different decision from declining to build new city content.
The Virginia City page in particular is already the kind of "earns unique local value"
page the SEO plan calls for.

### 4.4 Top-of-funnel guides with no equivalent
- `/reno-carson-city-flooring-store-guide/` (812w) — why shop local vs. buy flooring
  online. No rebuild equivalent; a strong showroom-driver and a natural AI-citation target.
- `/flooring-makeover-ideas/` (597w) — design/inspiration angle (herringbone, chevron,
  wide-plank, large-format tile). The rebuild has no design-inspiration content at all.

---

## 5. Smaller gaps

| Gap | Detail |
| --- | --- |
| **Roomvo visualizer** | Live has a paid Roomvo **dealer** integration (`roomvo.com/my/landmarkflooringusa`) — an online room visualizer, distinct from the in-store one the client removed on 2026-07-21. Confirm the online tool is also being dropped; if the dealer subscription is active, this is paid software going unused. |
| **Indoor/outdoor rugs** | Live `/rugs/` lists Area Rugs, Roll Runners **and Indoor/Outdoor Rugs**. The rebuild's `/flooring/custom-rugs/` covers area rugs, runners and binding but not indoor/outdoor as a product type. |
| **Photography** | Live references 309 distinct images; the rebuild ships 13. Real client assets worth pulling: `flooring-store*.jpg` (showroom), `Gardnerville4.jpg` (a real local project), the Capitol photo, and the six brand logos. |
| **Google Form intake** | `/project-discovery/` embeds a Google Form the client actively uses. Redirected to `/free-estimate/` — confirm whether that intake flow should be rebuilt or retired. |
| **`/tag/` bloat** | ~150 WordPress tag archives, none `noindex`, none carrying unique content. Wildcard-redirected to `/guides/`; this is a crawl-budget improvement, not a loss. |

## 6. Verified as already covered

Checked and confirmed present in the rebuild — no action needed:

- Carpet constructions — cut pile, loop, cut-and-loop, frieze ✅
- LVP core types — SPC, WPC, rigid core ✅
- Rug binding, area rugs, runners ✅
- Tear-out, haul-away, subfloor prep ✅
- NAP consistency, "The Landmark Guarantee", licensed/bonded/insured ✅
- Free-estimate messaging (30 pages) ✅

---

## Pre-launch checklist

**Must fix**
- [ ] Wire the `/free-estimate/` form to a real handler; add a form to `/contact/`
- [ ] Port the Meta Pixel (`1083311986909751`); stand up GA4 on live **now** for a baseline
- [ ] Write Privacy Policy + Terms; link from the footer
- [ ] Restore the real Synchrony/Mohawk financing terms + Apply Now link

**Should fix**
- [ ] Build `/guides/floor-care/` + 4 spokes (recovers ~3,300 words)
- [ ] Build `/residential/`, retarget its redirect
- [ ] Add the brand strip (Shaw, Mohawk, Mannington, Couristan, Stanton, Engineered Floors)
- [ ] Client decision on Virginia City + Lake Tahoe

**Nice to have**
- [ ] "Shop local vs. buy online" guide; design-ideas guide
- [ ] Pull real showroom/project photography off the live site
- [ ] Confirm Roomvo status; add indoor/outdoor rugs to `/flooring/custom-rugs/`

**At cutover**
- [ ] Verify all 83 redirects resolve (script in `REDIRECT-MAP.md` §9)
- [ ] Submit the new sitemap in Search Console; watch 404s for two weeks
- [ ] Export any live Google Search Console image data before the WP host is torn down
