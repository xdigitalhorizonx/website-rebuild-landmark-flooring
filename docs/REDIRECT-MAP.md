# Redirect map — landmarkflooringusa.com (WordPress) → rebuild

Every URL the current live site exposes, and where it lands on the new site.
Implemented as 301s in `vercel.json` (83 rules: 39 exact paths × 2 slash variants + 5 wildcard patterns).

Audited **2026-08-12** against the live site's `sitemap_index.xml` (post / page /
category / bricks_template sub-sitemaps) plus every internal `href` found by
crawling all 40 live HTML pages.

**Source of truth for the live inventory:** 40 reachable pages + 12 `/template/*`
URLs (already 301 → home) + ~150 `/tag/*` archives + 3 `/category/*` archives +
per-post `/feed/` URLs + `/wp-json/*`.

---

## 1. Same path on both sites — no redirect needed

These resolve straight to the new page. **Do not add redirect rules for them** —
a rule whose source equals a real page path creates a loop.

| Path | Note |
| --- | --- |
| `/` | Home |
| `/contact/` | |
| `/commercial/` | |
| `/property-management/` | |
| `/financing/` | ⚠ Content gap — see `CONTENT-AUDIT.md` §2 |

---

## 2. Product / material pages

| Live URL | → New URL |
| --- | --- |
| `/all-flooring-options/` | `/flooring/` |
| `/carpet-2/` | `/flooring/carpet/` |
| `/lvt-lvp/` | `/flooring/luxury-vinyl/` |
| `/laminate-2/` | `/flooring/laminate/` |
| `/wood/` | `/flooring/hardwood/` |
| `/rugs/` | `/flooring/custom-rugs/` |

### Legacy short URLs
Live currently 301s these to low-value targets. The new map points them at the
right page instead.

| Live URL | Today's 301 target | → New URL |
| --- | --- | --- |
| `/carpet/` | home | `/flooring/carpet/` |
| `/laminate/` | home | `/flooring/laminate/` |
| `/lvp/` | a Tahoe blog post | `/flooring/luxury-vinyl/` |
| `/hardwood/` | a climate blog post | `/flooring/hardwood/` |
| `/blog/` | `/blog-home/` | `/guides/` |
| `/flooring/` | home | *(now a real hub page — rule removed)* |

---

## 3. Segment, info and conversion pages

| Live URL | → New URL | Note |
| --- | --- | --- |
| `/residential/` | `/flooring/` | ⚠ **No residential page on the new site** |
| `/information/` | `/about/` | |
| `/project-discovery/` | `/free-estimate/` | Was an embedded Google Form |
| `/carpet-care/` | `/flooring/carpet/` | ⚠ **No care content on the new site** |
| `/lvt-lvp-care/` | `/flooring/luxury-vinyl/` | ⚠ **No care content** |
| `/laminate-care/` | `/flooring/laminate/` | ⚠ **No care content** |

---

## 4. City pages

| Live URL | → New URL | Note |
| --- | --- | --- |
| `/flooring-in-carson-city-nv/` | `/service-area/carson-city/` | |
| `/flooring-in-reno-nv/` | `/service-area/reno/` | |
| `/flooring-in-minden-gardnerville-nv/` | `/service-area/minden-gardnerville/` | |
| `/flooring-in-lake-tahoe/` | `/service-area/` | ⚠ Tahoe page deliberately held (see `CLAUDE.md`) |

New pages with no live predecessor — nothing to redirect, they are net-new:
`/service-area/sparks/`, `/service-area/dayton/`.

---

## 5. Blog → Guides

| Live URL | Words | → New URL | Equivalent content? |
| --- | --- | --- | --- |
| `/blog-home/` | 325 | `/guides/` | index |
| `/pet-kid-friendly-flooring-northern-nevada/` | 862 | `/guides/best-flooring-for-pets-and-kids/` | ✅ |
| `/flooringoptionsforpets/` | 746 | `/guides/best-flooring-for-pets-and-kids/` | ✅ |
| `/hardwood-floors-and-climate-northern-nevada/` | 687 | `/guides/best-flooring-for-northern-nevada-climate/` | ✅ |
| `/hardwoodfloorsandclimate/` | 691 | `/guides/best-flooring-for-northern-nevada-climate/` | ✅ |
| `/lvp-vs-hardwood-lake-tahoe-incline-village/` | 787 | `/guides/lvp-vs-laminate-vs-hardwood/` | ⚠ loses the Tahoe angle |
| `/benefits-of-carpet-in-your-carson-city-home/` | 832 | `/flooring/carpet/` | ✅ |
| `/benefitsofusingwoodflooring/` | 356 | `/flooring/hardwood/` | thin/placeholder source |
| `/flooringincarsonandreno/` | 742 | `/service-area/carson-city/` | ✅ |
| `/flooring-and-carpet-financing-benefits-reno-northern-nevada/` | 590 | `/financing/` | ✅ |
| `/how-to-keep-hardwood-lvp-and-laminate-floors-clean-in-carson-city-reno-and-lake-tahoe/` | **1,486** | `/guides/` | ❌ **nothing equivalent** |
| `/benchmark-commercial-cleaning-educates-…-last-for-years/` | 526 | `/guides/` | ❌ **nothing equivalent** |
| `/laminate-floor-care-northern-nevada/` | 636 | `/flooring/laminate/` | ❌ **nothing equivalent** |
| `/flooring-installations-in-virginia-city-nv/` | 814 | `/service-area/` | ❌ **city page unbuilt** |
| `/reno-carson-city-flooring-store-guide/` | 812 | `/guides/` | ❌ **nothing equivalent** |
| `/flooring-makeover-ideas/` | 597 | `/guides/` | ❌ **nothing equivalent** |
| `/hello-world-2/` | 320 | `/guides/` | WP default post, placeholder copy |

---

## 6. Wildcard patterns

Applied after the exact rules (Vercel matches in order, first match wins).

| Pattern | → | Covers |
| --- | --- | --- |
| `/blog-home/page/:n*` | `/guides/` | Blog pagination |
| `/tag/:slug*` | `/guides/` | ~150 WP tag archives — **all indexable today**, none carry unique content |
| `/category/:slug*` | `/guides/` | `/category/general/`, `/category/general/flooring/`, `/category/uncategorized/` |
| `/template/:slug*` | `/` | 12 Bricks builder templates (already 301 → home on live) |
| `/author/:slug*` | `/about/` | WP author archives |

---

## 7. Deliberately left to 404

No redirect — these have no user or search value, and a 404/410 is the correct
signal to stop crawling them.

| Pattern | Why |
| --- | --- |
| `/*/feed/`, `/feed/`, `/comments/feed/` | RSS feeds; no static equivalent |
| `/wp-json/*` | WordPress REST API |
| `/wp-admin/*`, `/wp-login.php`, `/xmlrpc.php` | WP internals |
| `/?page_id=4911`, `/?page_id=4914` | Privacy Policy / Terms links in the live footer — **already 404 on the live site today** (see `CONTENT-AUDIT.md` §5) |

---

## 8. Images — open item

The live site references **309 distinct `/wp-content/uploads/…` images**; the
rebuild ships 13. Any of the live URLs that Google Images has indexed will 404
after cutover.

Blanket-redirecting `/wp-content/uploads/*` to a placeholder is worse than a 404
(it serves the wrong image). Recommended instead:

1. Pull Google Search Console → Performance → **Search appearance: Image** to see
   which image URLs actually earn impressions.
2. Re-host only those under `/assets/` and add one-to-one redirects.
3. Let the rest 404.

Worth salvaging regardless of indexing — these are real client assets, not stock:

- `flooring-store*.jpg` — showroom photography
- `Gardnerville4.jpg` — a real local project photo
- `Nevada_State_Capitol_Building_-_Carson_City.jpg`
- Six brand logos: Shaw Floors, Mohawk, Mannington, Couristan, Stanton, Engineered Floors

---

## 9. Pre-launch verification

After DNS cutover, spot-check the map:

```bash
# every live URL should return 301 (or 200 for same-path pages), never 404
while read -r u; do
  p=${u#https://landmarkflooringusa.com}
  printf '%s %s\n' "$(curl -so /dev/null -w '%{http_code} -> %{redirect_url}' "https://landmarkflooringusa.com$p")" "$p"
done < live-urls.txt
```

Then in Google Search Console: submit the new `sitemap.xml`, and watch
**Pages → Not indexed → Not found (404)** for the first two weeks.
