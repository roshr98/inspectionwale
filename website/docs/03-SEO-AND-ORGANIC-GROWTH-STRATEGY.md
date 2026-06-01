# InspectionWale — SEO, Search Console, Sitemap & Organic Growth Strategy

> **Purpose:** Implementation-ready SEO audit + roadmap. Every recommendation maps to a concrete file/line and a copy-paste-ready fix so developers, SEO specialists, or an AI can execute. Canonical domain: **https://www.inspectionwale.com** (www + HTTPS enforced, `en-IN`).

---

## 1. Executive Summary

**State today:** Homepage and marketplace are well-optimized (rich titles, descriptions, OG/Twitter, robots meta, AutoRepair JSON-LD, hreflang). The rest of the site has gaps: 5 pages missing meta description/canonical/social tags, two legacy URLs using masked 200 rewrites instead of 301s, a stale static sitemap with no automation, incomplete image optimization, and an inactive GA4 placeholder.

**Highest-impact fixes (do first):**
1. Convert `/Home` and `/Used-Car-Marketplace` rewrites from **200 → 301** (authority dilution / duplicate content).
2. Add meta description + canonical + OG/Twitter to the 5 incomplete pages.
3. Activate GA4 (replace `G-XXXXXXXXXX`).
4. Automate sitemap generation in the Amplify build (fresh `lastmod`, include marketplace listing URLs).
5. Add Product/Vehicle + Breadcrumb + Organization/Website/FAQ schema.
6. Complete image optimization (dimensions + lazy + `<picture>` webp/avif) for Core Web Vitals.

---

## 2. Technical SEO Audit (current state)

### 2.1 Titles & meta descriptions
| Page | Title | Description |
|---|---|---|
| `index.html` | ✅ Strong, keyword+location rich (160+ point, Mumbai/Navi Mumbai/Thane/Kalyan/Dombivli/Pune) | ✅ ~300 chars (trim to ≤160) |
| `car-marketplace/index.html` | ✅ "Buy Used Cars - inspectionWale" | ✅ present |
| `terms.html` | ✅ title | ❌ **missing** |
| `careers.html` | ✅ title | ❌ **missing** |
| `404.html` | ✅ title | ⚠️ empty `content=""` |
| `inspector-login.html` | ✅ title | ❌ missing (should `noindex`) |
| `inspector-form.html` | ✅ title | ❌ missing (should `noindex`) |

### 2.2 Canonical tags
Present only on `index.html` (line 15, `https://www.inspectionwale.com/`) and `car-marketplace/index.html` (line 12, trailing slash). **Missing on terms, careers, 404, inspector-login, inspector-form.**

### 2.3 Open Graph / Twitter
- Homepage: full OG (title/desc/image/url, `og:locale=en_IN`, `og:image:width/height 1200×630`) + Twitter `summary_large_image` (lines ~39–54).
- Marketplace: OG + Twitter present but **missing `og:locale`, `og:site_name`, `og:type`, image dimensions**.
- Terms/careers/404/inspector pages: **no OG/Twitter**.

### 2.4 Structured data
Only homepage has JSON-LD: **AutoRepair** (lines ~138–242) with telephone, address (Kalyan), geo (19.2403, 73.1305), opening hours, `areaServed` (6 cities w/ Wikipedia `sameAs`), `hasOfferCatalog` (2 services), `aggregateRating` 4.8/500. Marketplace + utility pages have **none**.

### 2.5 robots.txt (`/robots.txt`) — good
Allows `/`, declares sitemap, disallows `/admin/`, `/inspector-*.html$`, `/password-*.html$`, `/amplify/`, `/*.json$`, deploy scripts, `/*.md$`, `/img/`; explicitly allows `/css/ /js/ /lib/ /Images/`.

### 2.6 sitemap.xml (`/sitemap.xml`) — stale & incomplete
4 URLs (home 1.0/weekly, marketplace 0.9/daily, careers 0.6/monthly, terms 0.4/yearly), all `lastmod 2026-03-21`. **No automation, no per-listing URLs, no image sitemap.**

### 2.7 Redirects (`amplify-build-spec.yml`)
- ✅ `/car-marketplace` → **301** → `/car-marketplace/`.
- ❌ `/Home` → 200 rewrite (should 301 → `/`).
- ❌ `/Used-Car-Marketplace[/]` → 200 rewrite (should 301 → `/car-marketplace/`).
- Catch-all → `/index.html` (200) — fine for soft-routing but ensure true unknowns serve **404** (see §8).

### 2.8 Indexability, duplicates, broken links
- No accidental `noindex` on public pages. Inspector/admin correctly blocked in robots.
- Duplicate risk from 200-rewrite legacy URLs and catch-all → index. Footer has `href="#"` placeholders (fix or remove). GA4 placeholder active but harmless.

---

## 3. Sitemap Optimization

**Goal:** auto-generated, fresh, complete sitemap discovered on next crawl.

**3.1 Automate generation in Amplify build.** Add a build-phase Node/Python script that:
- Emits all static public pages with real `lastmod` (git commit date or file mtime).
- Pulls **approved** listings from `customer-listings` (or DynamoDB) and emits `/car-marketplace/?listing={id}` (or future clean per-listing URLs) with `changefreq:daily`, `priority:0.7`.
- Writes `sitemap.xml` (and a **sitemap index** if >50k URLs / >50MB).

**3.2 Recommended static entries** (priorities): `/` 1.0 weekly · `/car-marketplace/` 0.9 daily · `/careers.html` 0.6 monthly · `/terms.html` 0.4 yearly. Exclude inspector/admin/404.

**3.3 Image sitemap:** include `<image:image>` for hero + listing photos to aid Image search. **Video sitemap:** only if/when video added.

**3.4 Keep `robots.txt` sitemap line** pointing to `https://www.inspectionwale.com/sitemap.xml` (already correct).

---

## 4. Google Search Console (GSC) Plan

1. **Verify** the `www` property (DNS TXT preferred; or HTML file/tag — the repo already has a `googleXXXX.html` verification file).
2. **Submit** `sitemap.xml`; resubmit automatically on deploy.
3. **URL Inspection** for home + marketplace after each major change; "Request Indexing" for new/important URLs.
4. **Index coverage:** monitor Excluded/Errors; expect inspector/admin to be excluded by robots (OK).
5. **Core Web Vitals** report: track LCP/INP/CLS by device; prioritize mobile.
6. **Crawl stats:** watch for spikes from catch-all rewrite; ensure unknowns 404.
7. **Rich results / structured data** validation: fix AutoRepair, validate new Product/FAQ/Breadcrumb.
8. **Performance report:** track impressions/clicks/CTR/position by query; build content around rising queries.
9. **Mobile usability:** confirm no "content wider than screen" (the inspector-form viewport bug is fixed; re-check after changes).

---

## 5. Organic Search Optimization

**5.1 Keyword strategy (intent clusters):**
- *Transactional/local:* "car inspection Mumbai", "pre purchase car inspection Thane/Navi Mumbai/Kalyan/Dombivli/Pune", "used car inspection near me", "second hand car checkup".
- *Commercial:* "buy used cars from owner Mumbai", "verified used cars", "car inspection cost India".
- *Informational (blog/long-tail):* "checklist before buying used car", "how to check car engine condition", "RC transfer process Maharashtra", "is a used car accidental — how to tell".

**5.2 Page-level targets:** Home → "car inspection Mumbai + 160-point". Marketplace → "verified used cars Mumbai from owners". Add **city landing pages** (`/car-inspection-mumbai/`, `/car-inspection-thane/`, …) for local intent (each with unique H1, LocalBusiness schema, testimonials, map).

**5.3 Heading structure:** keep one H1/page. Fix marketplace price currently in `<h2>` (line ~5694) → use styled `<div>`/`<span>`; keep section `<h2>`s ("Available Cars", "Curated picks").

**5.4 Internal linking:** link home → city pages → marketplace → relevant blog posts; add contextual links from blog to booking CTA. Add breadcrumb nav (with schema) on marketplace/detail.

**5.5 Content clustering / topic authority:** build a **/blog/** hub: pillar "Used car buying guide (India)" linking to cluster posts (inspection checklist, paperwork, financing, insurance, RTO transfer). Drives informational traffic + internal authority to money pages.

**5.6 Local SEO:** Google Business Profile (NAP consistent with AutoRepair schema: phone +91-8238089600, Kalyan address), city pages, local citations, reviews. Verify `aggregateRating` is backed by real, schema-compliant reviews (avoid hardcoded ratings that can't be substantiated).

---

## 6. Structured Data / Schema Roadmap

Implement JSON-LD (add to `<head>`):
- **Organization** + **WebSite** (with `potentialAction` SearchAction) on all pages (site-wide).
- **LocalBusiness/AutoRepair** on home + city pages (already on home — extend per city).
- **BreadcrumbList** on marketplace + detail modals.
- **Product** + **Vehicle** for each listing (name, brand, model, modelDate/year, mileageFromOdometer, fuelType, vehicleTransmission, color, price `Offer` in INR, availability, images, seller). Enables rich car results.
- **FAQPage** on home/booking (common inspection questions).
- **Review/AggregateRating** only with genuine review data.
- **Article** schema for blog posts.

---

## 7. Performance & Crawl (Core Web Vitals)

**Current:** AVIF/WebP assets exist but not used via `<picture>`; many images lack dimensions (CLS risk); large `Car-1.jpg` (~1.4MB); GA deferred (good); SW cache-first (good); HTML 1h / assets 1y cache (good).

**Actions:**
- **LCP:** preload hero image/font; serve hero as AVIF/WebP; `fetchpriority="high"` on LCP; keep render-blocking CSS minimal.
- **CLS:** set explicit `width`/`height` or `aspect-ratio` on **all** images (esp. car cards/thumbnails — enforce `aspect-ratio:1/1`); reserve space for async content.
- **INP/FID:** `defer` non-critical JS (GA, monetization, partner) — partially done; avoid long tasks; debounce filter handlers.
- **Images:** wrap in `<picture>` (AVIF→WebP→JPEG); compress (target listing photos <200KB); `loading="lazy"` on every below-fold image; `decoding="async"`.
- **JS/CSS:** minify; split rarely-used JS; tree-shake; purge unused CSS (large inline blocks `iw-pro-polish`/`iw-mp-polish` are fine but audit dead rules).
- **CDN/edge:** front S3 listing photos with CloudFront; keep Amplify edge cache; immutable hashed asset names.
- **SSR/SSG:** site is already static (effectively SSG) — good for crawl; for dynamic listings consider pre-rendering per-listing HTML pages (better than client-only modals for indexing).

---

## 8. Crawl Budget & URL Hygiene

- Convert legacy 200 rewrites (`/Home`, `/Used-Car-Marketplace`) to **301**.
- Ensure genuinely unknown URLs return **404** (not 200→index) so Google doesn't index thin duplicates; keep intentional soft-routes explicit.
- **Canonicalize** filter/query states (`?city=`, `?fuel=`) to the base marketplace URL via `rel=canonical`; or pre-render key facets as indexable pages and `noindex` the rest.
- **Parameter management** in GSC for tracking params (`?v=`, `?_cb=`, utm). Disallow infinite faceted combinations.
- Keep robots disallows for admin/inspector/internal.

---

## 9. Mobile SEO

- Viewport now correct site-wide (`width=device-width`); the inspector-form `width=1280` bug is fixed — re-verify no horizontal scroll on key pages.
- Mobile-first indexing: ensure mobile DOM contains the same content/links as desktop (it does — responsive, not separate URLs).
- Tap targets ≥48px, inputs 16px (done), fast mobile LCP via AVIF + preload.

---

## 10. Page-by-page Fix Checklist (copy-paste tasks)

**`terms.html`, `careers.html`** — add to `<head>`:
```html
<meta name="description" content="<unique 150–160 char summary>">
<link rel="canonical" href="https://www.inspectionwale.com/terms.html">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="https://www.inspectionwale.com/Images/brand_logo_new_1.png">
<meta property="og:url" content="https://www.inspectionwale.com/terms.html">
<meta property="og:type" content="website"><meta property="og:locale" content="en_IN">
```
**`inspector-login.html`, `inspector-form.html`** — add `<meta name="robots" content="noindex,nofollow">` + canonical (already robots-blocked; belt-and-suspenders).
**`404.html`** — fill the empty description; confirm served with HTTP 404.
**`car-marketplace/index.html`** — add `og:locale`, `og:site_name`, `og:type`, image dims; add Breadcrumb + Product/Vehicle JSON-LD; fix price `<h2>`→`<div>`.
**`amplify-build-spec.yml`** — change `/Home` and `/Used-Car-Marketplace[/]?` statuses to **301**.
**`index.html`** — set real GA4 ID; trim meta description to ≤160; add Organization + WebSite + FAQ JSON-LD.

---

## 11. Monitoring, KPIs & Roadmap

**KPIs:** organic clicks/impressions/CTR/avg position (GSC); indexed pages vs submitted; Core Web Vitals pass rate (mobile); rich-result eligibility; conversions (bookings, listings, leads) from organic (GA4); local pack visibility for city queries.

**Monthly audit checklist:**
- [ ] GSC coverage errors = 0 unexpected; sitemap "Success".
- [ ] CWV (mobile) all "Good"; investigate regressions.
- [ ] Structured data: no errors in Rich Results test.
- [ ] New listings present in sitemap & indexable.
- [ ] No new broken links / 404 spikes / soft-404s.
- [ ] Titles/descriptions present & unique on all indexable pages.
- [ ] Top-query content refresh; publish ≥1 blog cluster post.

**Roadmap:**
- **Phase 1 (technical foundation):** §10 fixes, GA4, 301s, automated sitemap, image dims/lazy.
- **Phase 2 (rich results + local):** Product/Vehicle/Breadcrumb/FAQ schema, GBP, city landing pages.
- **Phase 3 (content authority):** /blog hub + clusters, internal linking, per-listing pre-rendered pages.
- **Phase 4 (scale + monitor):** sitemap index, CloudFront for images, CWV tuning, ongoing monthly audits.
