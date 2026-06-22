# InspectionWale — End-to-End Architecture & Functional Design

> **Purpose:** A single source of truth describing the InspectionWale platform from end to end — frontend, backend, data, storage, workflows, infrastructure, and full request lifecycles — detailed enough that a new developer, architect, product owner, or AI can understand the system without reading source code.

---

## 0. System Summary

InspectionWale is a **static, multi-page website** (vanilla HTML/CSS/JS + Bootstrap 5) hosted on **AWS Amplify**, backed by a fleet of **AWS Lambda functions** (Node.js) fronted by **Lambda Function URLs / API Gateway**, with **DynamoDB** for data, **S3** for files (PDF reports + listing photos), **SES** for transactional email, and **Razorpay** for payments. There is no SPA framework; "routing" is file-based + Amplify rewrite rules. A **service worker** provides offline support for the inspector tool (IndexedDB sync queue).

```
Browser (static HTML/JS, SW/IndexedDB)
   │  fetch() + Bearer tokens
Amplify hosting + rewrites/redirects + security headers + cache-control
   │
Lambda functions (Node.js)
   ├─ generate-report (Playwright→PDF, inspection CRUD)
   ├─ inspector-login (JWT issuance)
   ├─ admin-api (multi-resource admin)
   ├─ inspection-bookings (Razorpay link + webhook)
   ├─ customer-listings (presigned S3 uploads, reserve)
   ├─ listing-approval (email-link approve/reject)
   ├─ quote / car-value / c2c-inquiry / test-drive (lead capture)
   ├─ reviews / ads (content)
   └─ listing-comments (comments + email)  [NOT YET DEPLOYED]
        │ AWS SDK v3
   ┌────┼─────────┬──────────┐
DynamoDB   S3        SES       Razorpay
```

---

## 1. Frontend Architecture

### 1.1 Application structure (pages)
All under `/home/user/app/website/`:
| Page | Purpose | Key APIs called |
|---|---|---|
| `index.html` | Homepage: hero, what-checked, services, stepper, marketplace teaser, testimonials, CTA | `/api/car-value`, `/api/quote`, `/api/reviews` |
| `car-marketplace/index.html` | C2C marketplace: search/filter, car grid, detail modal, comments, reserve/test-drive | `/api/customer-listings`, `/api/listing-comments`, `/api/inspection-bookings`, `/api/quote` |
| `careers.html`, `terms.html` | Static content pages | — |
| `404.html` | Error page (full nav/footer) | — |
| `inspector-login.html` | Inspector portal login | `/api/inspector-login` |
| `inspector-form.html` | Inspection data capture (offline-first PWA) | generate-report Lambda (Bearer) |
| `admin/index.html` | Admin dashboard (noindex) | `/admin/*` |
| `pdf-template/.../index.html` | PDF report template rendered by Playwright | (data via localStorage injection) |

### 1.2 UI sections & user journeys
- **Buyer:** land on home → browse marketplace → open car detail → read comments → Reserve / Test-Drive / Book-Inspection (₹1399) → Razorpay → confirmation email.
- **Seller:** home → "List Your Car" → multi-field form + 7 photos → submission emailed to admin with approve/reject buttons → on approve, listing goes live + seller notified.
- **Inspector:** inspector-login (JWT) → inspector-form (sectioned, offline-capable) → submit → server renders branded PDF → stored in S3 + DynamoDB.
- **Admin:** admin login → dashboard → manage inspections/listings/payments/leads/reports; regenerate PDFs; presigned photo uploads.

### 1.3 State management
- No framework state library. State lives in: DOM, module-scoped JS variables (`main.js`), `sessionStorage` (auth tokens: `inspectorToken`, `adminToken`, `inspectorName/Username`), and **IndexedDB** (inspector offline queue via Dexie).
- `main.js` orchestrates listing fetch/render, the car-detail modal, forms, and comments. `monetization.js` and `partner-services.js` handle affiliate offers / partner leads. GTM/gtag dataLayer for events.

### 1.4 Routing & navigation
- File-based pages + Amplify rewrites (see §6.2). Marketplace filtering is client-side (query params/JS), not server routes.

### 1.5 Performance strategy
- Cache-control: HTML 1h must-revalidate; static assets 1y immutable.
- `defer` on non-critical JS (GA, monetization); DNS-prefetch/preconnect to fonts.
- Client-side image compression before upload (1280×960, q0.80).
- Service worker cache-first for shell assets; eager LCP hero/logo.
- Lazy-loading + (recommended) next-gen image formats.

### 1.6 Error boundaries & fallbacks
- No SPA error boundary; per-`fetch` try/catch with status toasts/banners (`.ok`/`.bad`).
- Offline: inspector form queues submissions in IndexedDB and retries with exponential backoff + jitter (cap 10 min) when connectivity returns; UI shows online/offline dot + queue modal.
- 404.html for unknown routes (note: catch-all currently rewrites to index — see SEO doc).

---

## 2. Design System (summary — see Doc 01 for full spec)
- **Fonts:** Montserrat (UI), Lato (body), Inter/Poppins (portals).
- **Colors:** navy `#0B2154`, red `#D81324`, teal `#26a69a`, amber `#ff9f43`; status green/red.
- **Tokens:** radius scale (999→2px), shadow scale (premium→subtle), spacing scale (6–40px), 1200px container.
- **Components:** `.iw-sleek-form` / `.iw-sleek-modal-shell` forms; cards with red 4px accent bar; pill badges; teal/red buttons.
- **Responsive:** breakpoints 575/767/991/1050/650; mobile stacks + reorders via flex `order` + `display:contents`; full-screen modals ≤991px.
- **Accessibility:** WCAG AA targets — labels, contrast, focus rings, reduced-motion, 44px targets.

---

## 3. Backend Architecture (AWS Lambda)

### 3.1 Function inventory
| Function | Trigger | Path/location | Purpose |
|---|---|---|---|
| **generate-report** | HTTP Lambda URL (Bearer) | `amplify/functions/generate-report/src/index.js` | Render inspection PDF (Playwright + @sparticuz/chromium), inspection CRUD, S3 upload, DynamoDB save |
| **inspector-login** | HTTP `/api/inspector-login` | `inspector-login/src/index.js` | Verify SHA-256 password hash → issue JWT (12h) |
| **admin-api** | HTTP `/admin/*` (Bearer, role=admin) | `admin-api/src/index.js` | Inspections, listings, payments, leads, reports CRUD; presigned uploads; regenerate PDF |
| **inspection-bookings** | HTTP `/api/inspection-bookings` + `/webhook` | `inspection-bookings/src/index.js` | Create booking, build Razorpay payment-page URL, handle webhook status |
| **customer-listings** | HTTP `/api/customer-listings` | `customer-listings/src/index.js` | List approved; requestUpload (presigned PUT); submitListing; reserve; approval-token email |
| **listing-approval** | HTTP Lambda URL `?token=` | `listing-approval/src/index.js` | Verify HMAC token → set approved/rejected → email seller → return HTML page |
| **quote** | HTTP `/api/quote` | `quote/src/index.js` | Multi-form lead capture (booking, marketplace-inquiry/inspection, partner-service-lead) → SES |
| **car-value** | HTTP `/api/car-value` | `car-value/src/index.js` | "Check car value" lead → DynamoDB + SES |
| **c2c-inquiry** | HTTP | `c2c-inquiry/index.js` | C2C inquiry → SES |
| **test-drive** | HTTP | `test-drive/src/index.js` | Test-drive booking → email |
| **reviews** | HTTP `/api/reviews` | `reviews/src/index.js` | Return reviews list |
| **ads** | HTTP `/api/ads` | `ads/src/index.js` | Ad data |
| **listing-comments** ⚠️ | HTTP Lambda URL (placeholder) | `listing-comments/src/index.js` | GET/POST comments + SES notify — **NOT YET DEPLOYED** |

### 3.2 API integrations & endpoints (from `amplify-build-spec.yml`)
```
/api/car-value         → https://565pfipvrdzny5ftic5htroshu0lltuf.lambda-url.us-east-1.on.aws/
/api/quote             → https://dnocsuec6aeok3oykcujglp2hq0bocso.lambda-url.us-east-1.on.aws/
/api/customer-listings → https://423cmvhw3g.execute-api.us-east-1.amazonaws.com/prod/customer-listings
/api/reviews           → https://cznea7cetynoa5eqim53crc2xq0scqec.lambda-url.us-east-1.on.aws/
/api/ads               → https://e5c4zwzl3vvb5t6fq3djkuhvjm0omhdm.lambda-url.us-east-1.on.aws/
/api/listing-comments  → PLACEHOLDER_LISTING_COMMENTS_LAMBDA_URL   (deploy pending)
/api/inspector-login, /admin/*, /api/inspection-bookings  → respective Lambdas
```

### 3.3 Authentication & authorization
- **Inspector:** POST username/password → DynamoDB scan → SHA-256 hash compare → **JWT (HS256)**, payload `{sub,username,name,role:'inspector',iat,exp}`, TTL 43200s (12h). Stored in `sessionStorage`. Secret `AUTH_TOKEN_SECRET` (fallback `inspectionwale-auth-secret-2026`).
- **Admin:** hardcoded `ADMIN_USERNAME`/`ADMIN_PASSWORD` (defaults `admin`/`inspectionwale2024` — **must override in prod**) → same JWT shape, `role:'admin'`. All `/admin/*` require `Authorization: Bearer`.
- **Listing approval:** HMAC-SHA256 signed token `base64url(listingId:action:timestamp:hash)`, 7-day expiry, secret `APPROVAL_SECRET_KEY` (fallback must be changed).
- **generate-report:** verifies inspector/admin JWT before accepting submissions.

### 3.4 Error handling, logging, monitoring
- Functions return JSON `{ok:false,error}` with appropriate HTTP codes; CloudWatch Logs capture stack traces (default Lambda logging). No central APM configured (recommend X-Ray/structured logs). Frontend surfaces errors via toasts/banners.

### 3.5 Security architecture
- Security headers via Amplify: HSTS (1y+subdomains), `X-Content-Type-Options:nosniff`, `X-Frame-Options:SAMEORIGIN`, `X-XSS-Protection`.
- S3 buckets use **BucketOwnerEnforced** (no public ACLs); access via presigned URLs / CDN.
- Secrets via Lambda env vars. Razorpay webhook validated via `X-Razorpay-Signature`.
- **Hardening TODO:** replace default admin creds + approval/JWT secrets; comment sanitization (max 800 chars) already present in listing-comments.

---

## 4. Data Architecture (DynamoDB)

> Region **us-east-1**. Tables referenced via env vars; names below are logical.

| Table | PK / SK | Key attributes | Notes |
|---|---|---|---|
| **Inspections** (`INSPECTIONS_TABLE`) | `reportId` / `timestamp` | `type`(INSPECTION/INSPECTION_INDEX), `data`(full payload), `registrationNumber`, `inspectorName`, `reportUrl`, timestamps | Special record `reportId=INSPECTION_INDEX, timestamp=LATEST` holds id list for pagination; historical timestamps = audit trail |
| **CarListings** (`LISTINGS_TABLE`) | `listingId` | `status`(pending/approved/rejected/sold/booked), `seller{}`, `car{}`, `photos{slot:{key,contentType,publicUrl,...}}`, `display{}`, `headline`, timestamps | Scanned for approved list; GetItem by id |
| **InspectionPayments** (`PAYMENTS_TABLE`) | `bookingId` (`IW-<ts>-<rand>`) | `status`, `paymentStatus`, `paymentMode`, `razorpayPaymentId`, customer + car fields, `amount`(1399), timestamps | Updated by Razorpay webhook |
| **inspectionwale-inspectors** (`INSPECTORS_TABLE`) | `username` | `passwordHash`(SHA-256), `name`, `status` | Scanned with filter on username |
| **ListingComments** ⚠️ | `listingId` / `commentId`(`<ISO>#<hex>`) | `name`, `comment`(≤800), `createdAt`(epoch), `listingTitle` | PAY_PER_REQUEST; query newest-first; **table not yet created** |
| **CarValueRequests** (`CAR_VALUE_TABLE`) | `requestId`(uuid) | `name,mobile,email,message,formSource,createdAt` | Lead capture only |
| **Quotes** (`QUOTES_TABLE`) | `id`(ts) | `name,mobile,email,make,model,city,ownership,formType,leadCategory,serviceLabel,extra,receivedAt` | Multi-form lead capture |

**CRUD patterns:** GetItem/Query by key; Scan + client sort (createdAt DESC) for admin lists; offset-cursor pagination for inspections via the INDEX record. **Indexing strategy:** currently key-based + scans; recommend GSIs on `status` (CarListings) and `createdAt` for scale. **Retention:** soft-delete via `deletedAt`; no TTL configured (recommend TTL on transient leads).

**Location/City attribute (standardized):** the customer-facing `location` (listings, bookings, leads) and partner-service `city` attributes are now populated from a **fixed dropdown** (values: Mumbai, Navi Mumbai, Thane, Kalyan, Dombivli, Badlapur, Kandivali, Borivali, Andheri, Bandra, Mira-Bhayandar, Vasai-Virar, Bhiwandi, Ambernath, Ulhasnagar, Panvel, Pune, Other). DynamoDB is **schemaless** so this is still stored as the same `String` attribute on the existing items (`CarListings.car`/`seller`, `InspectionPayments`, `Quotes.city`, `CarValueRequests`) — **no schema migration is required**. A verification/backfill helper (`scripts/verify-aws-schema.sh`) describes the relevant tables and confirms the attribute is captured before go-live (see §9).

---

## 5. Storage Architecture (S3)

**Buckets (env):** `REPORTS_BUCKET`/`IMAGES_BUCKET` (PDFs + inspection images), `LISTINGS_BUCKET`/`CAR_LISTINGS_BUCKET` (listing photos). Optional CloudFront via `CAR_LISTINGS_CDN`/`LISTINGS_CDN_URL`.

**Key structures:**
- Inspection images: `inspections/{inspectionId}/images/{ts}-{file}.{ext}`
- Reports: `reports/{registrationNumber}_{ts}.pdf`
- Listing photos: `submissions/{submissionId}/{slot}.{ext}` (slots: exteriorFront/Back/Left/Right, driverCabin, rearCabin, bootSpace, rcDocument, cngPlate)

**Upload flow (listings):** frontend → `POST /api/customer-listings?action=requestUpload` → Lambda returns presigned PUT URLs (15-min) → browser uploads directly to S3 (CORS) → `?action=submitListing` persists metadata. Inspection images use an analogous presign endpoint in admin-api/generate-report.

**Retrieval:** public via CDN or presigned GET (emails embed 7-day signed URLs). **Lifecycle:** none configured (recommend lifecycle rules to transition/expire old reports; keep PDFs long-term, expire raw temp uploads). **CDN/caching:** static assets immutable 1y; consider CloudFront for S3 photos.

---

## 6. Infrastructure & Deployment

### 6.1 Hosting & environments
- **AWS Amplify** hosts the static site from `website/`. Lambdas deployed as Amplify functions / standalone with Function URLs (+ one API Gateway stage `prod` for customer-listings). Region **us-east-1**.

### 6.2 Build spec / rewrites (`amplify-build-spec.yml`)
- API path rewrites (200) to Lambda URLs (§3.2).
- SPA-ish rewrites: `/admin`→`/admin/index.html`; `/car-marketplace`→301→`/car-marketplace/`; legacy `/Home`, `/Used-Car-Marketplace` currently **200 rewrites (should be 301)**; catch-all → `/index.html` (200).
- Headers: HSTS, nosniff, frame-options, XSS; cache-control (HTML 1h / assets 1y immutable).

### 6.3 Service worker & caching (operational gotcha)
- `sw.js` `CACHE_NAME` currently **`iw-shell-v3`**, cache-first for shell assets; navigations network-first. Has `skipWaiting()` + `clients.claim()`.
- **When replacing any cached asset (esp. images/logos): bump `CACHE_NAME` (v3→v4…) AND bump the `?v=YYYY` query on the asset URLs**, or stale copies serve forever.

### 6.4 Scalability, DR, observability
- **Scalability:** Lambda + DynamoDB (PAY_PER_REQUEST where set) scale horizontally; S3/CDN for static. Watch DynamoDB scans (move to GSIs/Query at higher volume).
- **DR:** rely on S3 durability + DynamoDB PITR (recommend enabling PITR + cross-region backup; version-control of site in git).
- **Observability:** CloudWatch Logs/metrics; recommend alarms on Lambda errors/throttles, SES bounce rate, and Razorpay webhook failures. GA4 placeholder (`G-XXXXXXXXXX`) must be set for product analytics.

---

## 7. Inspection Platform Workflows

### 7.1 Vehicle listing (seller)
1. Seller submits List-Car form (+7 photos compressed client-side).
2. `requestUpload` → presigned PUTs → browser uploads photos to S3.
3. `submitListing` → CarListings row `status:pending` → SES email to reviewers with **APPROVE/REJECT** links (HMAC tokens, signed photo URLs).
4. Reviewer clicks → `listing-approval` verifies token → sets `approved`/`rejected` → emails seller → returns confirmation HTML.
5. Approved listings appear in marketplace via `customer-listings` GET.

### 7.2 Vehicle inspection + report generation (inspector)
1. Inspector logs in (JWT).
2. Fills sectioned inspection form (Report, Inspection, Vehicle, Ratings 1–5, Flags, Front/RHS/LHS/Rear panels, Roof, Interior, Seats, Boot, Engine, Tyres, Structure, Performance, Images) — schema in `inspectionPlaceholders.js`. Offline-capable.
3. Submit (Bearer) → generate-report merges payload with placeholder defaults → launches headless Chromium → loads PDF template SPA → injects data via `localStorage.inspectionData` → waits for `data-report-ready="true"` → `page.pdf()` (A4, backgrounds, Devanagari font).
4. Upload PDF to S3 (`reports/...`) → save Inspections row (+ INDEX update) → respond with `reportId`, `reportUrl`, inline base64 (if <3.5MB).

### 7.3 Marketplace + booking
- Buyer opens detail modal → comments (GET/POST) → Reserve (`customer-listings?action=reserve` → admin email) / Test-Drive (modal → email) / **Book Inspection** (`inspection-bookings` → Razorpay payment page ₹1399 → webhook updates status → confirmation email).

### 7.4 Notification/communication flow (SES)
FROM `hello@inspectionwale.com`, TO `inspectionwale@zohomail.in` (+cc hello@). Triggers: new listing, listing approved/rejected (→ seller), new comment, inspection booking, car-value inquiry, generic quote/lead, C2C inquiry, marketplace inquiry/reservation. Templates are inline-CSS HTML branded navy/red.

---

## 8. End-to-End Flows (request lifecycles)

**8.1 User journey (buy):** visit home (Amplify static) → click marketplace → `GET /api/customer-listings` (API GW→Lambda→DynamoDB Scan approved) → render grid → open detail → `GET /api/listing-comments` → Book Inspection → `POST /api/inspection-bookings` (DynamoDB put + Razorpay URL) → redirect to Razorpay → pay → Razorpay → `POST /webhook` (verify signature → DynamoDB update) → SES confirmation.

**8.2 API request lifecycle:** browser `fetch('/api/x')` → Amplify rewrite → Lambda URL → handler parses event → AWS SDK calls (DynamoDB/S3/SES) → JSON response → frontend updates DOM / shows toast.

**8.3 Auth flow:** login form → `POST /api/inspector-login` → scan inspector + SHA-256 compare → JWT → `sessionStorage` → subsequent requests send `Authorization: Bearer` → server verifies signature + exp + role.

**8.4 Data persistence:** form → Lambda validates → DynamoDB Put/Update → (optional) SES notify → response.

**8.5 File upload:** request presigned PUT → browser PUT to S3 → metadata persisted in DynamoDB → retrieval via CDN/presigned GET (emails use 7-day signed URLs).

**8.6 Search/retrieval:** marketplace GET approved listings (Scan) → client-side filter (city chips, dropdowns) → detail GetItem by `listingId`.

**8.7 Inspection/reporting:** see §7.2 (form → generate-report → Chromium PDF → S3 + DynamoDB → response/email).

---

## 9. Key Files & Pending Items

**Key files:** `amplify-build-spec.yml`; `amplify/functions/*/src/index.js`; `generate-report/src/{inspectionPlaceholders.js, templateRenderer.js}`; `pdf-template/.../index.html`; `js/{main.js,monetization.js,partner-services.js}`; `sw.js`; page HTML files.

**Pending / action items:**
1. Deploy `listing-comments` Lambda + create `ListingComments` DynamoDB table (PAY_PER_REQUEST) + replace `PLACEHOLDER_LISTING_COMMENTS_LAMBDA_URL` → redeploy Amplify.
2. Override production secrets: `ADMIN_USERNAME/PASSWORD`, `AUTH_TOKEN_SECRET`, `APPROVAL_SECRET_KEY`.
3. Set GA4 Measurement ID (replace `G-XXXXXXXXXX`).
4. Convert `/Home` and `/Used-Car-Marketplace` rewrites to 301 (see SEO doc).
5. Enable DynamoDB PITR + S3 lifecycle; add CloudWatch alarms (Lambda errors, SES bounces, webhook failures).
6. Remember the **cache bump ritual** on asset replacement (`CACHE_NAME` + `?v=`).
