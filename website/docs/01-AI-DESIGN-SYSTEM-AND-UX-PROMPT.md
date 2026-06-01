# InspectionWale — AI Design System & UI/UX Master Prompt

> **Purpose of this document**
> This is an AI-consumable design specification. Any AI tool (or human developer) can read this document and reproduce, extend, or restyle the InspectionWale website while preserving an identical visual identity, layout language, component behavior, and user experience. Treat every value here as a design token / hard constraint unless a section explicitly says it is a guideline.
>
> **How to use this as a prompt:** "You are building/editing a page for InspectionWale. Adhere to the design system defined below. Use the exact color tokens, fonts, radii, shadows, spacing scale, breakpoints, and component patterns. Match the existing visual language for trust-focused conversion. Do not introduce new fonts, new accent colors, or new radius/shadow scales without mapping them to the tokens here."

---

## 1. Design Philosophy & Brand Positioning

**Product:** InspectionWale (inspectionwale.com) — a professional **pre-purchase car inspection** service + a **C2C used-car marketplace** for the Mumbai Metropolitan Region (Mumbai, Navi Mumbai, Thane, Kalyan, Dombivli, Pune).

**Brand promise:** "The Hassle-Free Car Buying Experience." Tagline support line: *Repair Estimate | Price Advice Neutral | Uncomplicated | Comprehensive.* Hero headline pattern: **"Safety starts with inspection."**

**Design philosophy:**
1. **Trust-first.** This is a high-consideration, money-on-the-line purchase decision. Every screen should radiate credibility: certified inspectors, 160+ point checks, same-day reports, real ratings, verified listings.
2. **Calm authority.** Deep navy as the anchor color signals institutional reliability; a single confident red accent drives action without feeling "salesy."
3. **Clarity over decoration.** Generous whitespace, clean cards, restrained motion. Decoration (gradients, dust animation) is subtle and never competes with content.
4. **Conversion-focused.** Primary CTAs ("Book Inspection", "List Your Car", "Reserve", "Test Drive") are visually dominant, repeated at natural decision points, and always use the red accent.
5. **Mobile-equal.** The product is used on phones in showrooms/parking lots (inspectors and buyers). Mobile is a first-class layout, not a shrink-down.

**Visual identity guidelines:**
- The logo is a **blue "license-plate badge"** wordmark reading `inspectionwale` (white "inspection" + dark-navy "wale" on a blue plate with a white rounded border and two rivet screws). It must always appear on a transparent background so it sits cleanly on both light navbars and dark navy footers. **Never** apply `filter:brightness(0) invert(1)` to it (turns it into a white box). Render it as-is with `mix-blend-mode:normal; filter:none`.
- Logo file: `Images/brand_logo_new_1.png` (transparent, ~819×199, ratio ≈ 4.12). Header/footer use `height` + `width:auto`.
- Square app icon: `Images/logo.png` (1024×1024) — used only in inspector/admin portal headers in a 30×30 slot, and as PWA icon.

---

## 2. Color Palette & Color Combinations

### 2.1 Core brand tokens
| Token | Hex | Role |
|---|---|---|
| Navy (primary brand) | `#0B2154` | Headers, footers, brand text, dark surfaces, trust anchor |
| Navy alt | `#14213d` | Email templates, alt dark surfaces |
| Red (primary action) | `#D81324` | Primary CTAs, links, active states, accent bars |
| Red alt / hover | `#c0392b` → hover `#b00f1e` / `#c8102e` | Section accents, gradient CTAs |
| Light gray | `#F2F2F2` | Light section backgrounds |
| Near-black | `#111111` | Body text on light |
| Body text | `#333333` | Default paragraph text |

> **CSS variables** (`css/style.css`): `--primary:#D81324; --secondary:#0B2154; --light:#F2F2F2; --dark:#111111; --text-color:#333333;`

### 2.2 Marketplace surface tokens (`car-marketplace/index.html`)
| Token | Value | Role |
|---|---|---|
| `--iw-navy` | `#0B2154` | Brand |
| `--iw-red` | `#D81324` | Action |
| `--iw-slate` | `#5C6377` | Secondary text |
| `--mp-bg` | `#f5f2ec` | Marketplace off-white page background |
| `--mp-surface` | `rgba(255,255,255,0.72)` | Glassy card surface |
| `--mp-surface-strong` | `rgba(255,255,255,0.9)` | Stronger card surface |
| `--mp-ink` | `#111827` | Primary text |
| `--mp-ink-soft` | `#667085` | Muted text |
| `--mp-line` | `rgba(17,24,39,0.08)` | Hairline borders |
| `--mp-blue-start` → `--mp-blue-end` | `#163d8f` → `#3a7dff` | Banner/CTA gradient |
| `--mp-blue-glow` | `rgba(58,125,255,0.18)` | Glow halo |

### 2.3 Secondary / utility accents
- **Teal** `#26a69a` (hover `#1e8e82`): marketplace secondary buttons, focus rings, active filter chips, "verified/seller" affordances. Focus ring: `0 0 0 3px rgba(38,166,154,0.1)`.
- **Amber** `#ff9f43`: "Featured" badges, dealer badges.
- **Admin orange** `#ff6600` (dark `#e55a00`): admin dashboard only — do **not** use on customer-facing pages.
- **Inspector portal teal-navy** `#0b556b`: inspector form theme color + PWA `theme_color`.

### 2.4 Semantic status colors (forms & toasts)
| State | Background | Text | Border |
|---|---|---|---|
| Success | `#dcfce7` | `#166534` | — |
| Error | `#fee2e2` | `#991b1b` | invalid input border `#ef4444`, bg `#fef2f2` |
| Info pill | `#e2e8f0` | `#1a202c` | — |

### 2.5 Approved color combinations
- **Navy bg + white text + red CTA** → footers, dark CTA bands.
- **White card + navy heading + red accent bar (4px top)** → info/feature cards.
- **Off-white `#f5f2ec` page + glassy white cards + navy text + teal/red actions** → marketplace.
- **White input + navy focus ring** (`rgba(36,68,141,0.28)` border, `0 0 0 4px rgba(36,68,141,0.08)` glow) → forms.

---

## 3. Typography, Fonts & Hierarchy

### 3.1 Font families (Google Fonts)
- **Montserrat** (300–800) — **primary**: headings, brand, navbar, most UI. Default stack: `'Montserrat', Arial, sans-serif`.
- **Lato** — body/paragraph and marketplace card titles (16px).
- **Inter** (400–700) — small labels, eyebrows, inspector form fields.
- **Poppins** (600–700) — heavy headings in inspector/admin portals.

### 3.2 Type scale & hierarchy
| Element | Size | Weight | Notes |
|---|---|---|---|
| Homepage H1 (hero) | `1.75rem` (mobile `1.5rem`) | 700 | letter-spacing `-0.01em`; e.g. "Safety starts with inspection." |
| Marketplace H1 | `clamp(2.5rem, 5vw, 4.6rem)` | 700 | letter-spacing `-0.04em` |
| H2 section titles | ~`1.45rem`–`1.75rem` | 700 | navy |
| H3 / CTA headings | ~`1.1rem`–`1.25rem` | 600–700 | |
| Eyebrow / small caps label | `0.75rem` | 600 | Inter, letter-spacing `0.16em`, uppercase |
| Navbar links | `15px` | 500 | uppercase, italic on light navbar |
| Body | `0.95rem`–`1rem` | 400 | Lato, color `#333` |
| Car card title (marketplace) | `16px` | 400 | Lato |
| Car spec row | `13px` | 400 | color `#4f5772` |
| Form label | `12px` | 700 | color `#5d6880`, letter-spacing `0.01em` |
| Form input text | `14px` desktop / **`16px` mobile** | 400 | 16px on mobile prevents iOS zoom-on-focus |
| Button text | `0.85rem`–`16px` | 500–700 | uppercase for nav/CTA |

**Rules:**
- Exactly **one `<h1>` per page**, keyword-bearing.
- Maintain descending H1→H2→H3 order; never use heading tags for visual sizing of non-heading content (e.g., do **not** wrap a price in `<h2>`; use a styled `<div>`/`<span>`).
- Letter-spacing tightens as size grows (`-0.01em` to `-0.04em`); small caps labels open up (`+0.16em`).

---

## 4. Spacing, Layout & Grid System

### 4.1 Spacing scale (observed, use as the canonical scale)
`6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 22 · 24 · 26 · 28 · 30 · 32 · 34 · 36 · 40` (px). Prefer these step values for padding/margin/gap.

- Section vertical padding: **28–34px** top/bottom (mobile keeps 28–30px). Examples: featured section `28px 0 26px`; info block `32px 0`; services `30px 0 32px`; reviews `34px 0 40px`.
- Card padding: `22px 20px` (service items), `26px 24px` (compact cards), `22px 26px` (stepper rows).
- Input padding: `12px 14px`.
- Common gaps: cards row `22px`; stepper items `14px`; banner icons `10–25px` (desktop) / `15px` (mobile).

### 4.2 Containers
- Max content width: **1200px**, centered (`margin: 0 auto`).
- Page gutters via Bootstrap container; cards use full-width inside their column.

### 4.3 Grid system
- **Bootstrap 5** grid is the base (12-col, `row`/`col-*`).
- Marketplace car grid + form grids use **CSS Grid**:
  - Inspector form field grid: `repeat(4, minmax(0,1fr))` → `repeat(2,…)` ≤1050px → `1fr` ≤650px, gap `10px`.
  - Feature/service rows: 3–4 column flex/grid that collapse to 2 then 1.

---

## 5. Responsive Breakpoints & Strategy

**Breakpoints (max-width):**
| BP | Width | Use |
|---|---|---|
| XS | `575.98px` | phones |
| SM | `767.98px` | large phones / small tablets; **hero contact card hidden**, gallery stacks |
| MD | `991.98px` | navbar collapses to hamburger; modals go full-screen |
| Custom | `1050px` | form grid 4→2 col; marketplace modal fixes |
| Custom | `650px` | form grid →1 col |

**Mobile strategy:**
1. **Always ship a real viewport:** `<meta name="viewport" content="width=device-width, initial-scale=1">`. (Never hardcode `width=1280` — that forces desktop layout on phones. This was a real bug on the inspector form.)
2. **Stack, don't shrink.** Multi-column grids collapse to single column; side-by-side media+aside become vertical.
3. **Reorder by priority on mobile** using flex `order` (and `display:contents` to dissolve wrapper columns so children from separate columns can be interleaved). Canonical car-detail mobile order: **Car Images → Price/Verified-Listing → Vehicle Details → Comments → Seller Contact → Book-Inspection CTA.**
4. **Full-screen modals** ≤991px: `border-radius:0`, `min-height:90vh`, fixed bottom action bar, buttons `min-height:48px`, `flex:1 1 180px`.
5. **Touch targets ≥44–48px**; inputs `font-size:16px` on mobile.
6. **Reduce chrome:** smaller paddings, smaller hero text, hide non-essential decorative panels (e.g., hero contact card) below SM.

---

## 6. Cards, Buttons, Badges & Components

### 6.1 Border-radius scale (canonical)
`999px` (pills/badges/round buttons) · `32px` (hero/control shells) · `24px` (search/header cards) · `20px` (filter bars) · `16px` (standard content cards) · `15px` (modals) · `14px` (inputs, buttons) · `12px` (small inputs/modals) · `10px` · `8px` (small CTAs/panels) · `6px` (overlay badges) · `2px` (square buttons).

### 6.2 Box-shadow scale (canonical)
- **Hero/premium:** `0 30px 70px rgba(11,33,84,0.1)`, `0 28px 70px rgba(15,23,42,0.12)`, nav `0 12px 35px rgba(7,17,48,0.35)`.
- **Card:** `0 4px 16px rgba(11,33,84,0.08)` → hover `0 20px 60px rgba(38,166,154,0.15)`.
- **Service:** `0 4px 18px rgba(20,33,61,0.05)` → hover `0 16px 34px rgba(20,33,61,0.13)`.
- **Subtle UI:** `0 2px 10px rgba(0,0,0,0.05)`; modal footer `0 -4px 12px rgba(0,0,0,0.15)`.
- **Focus rings:** navy `0 0 0 4px rgba(36,68,141,0.08)`; teal `0 0 0 3px rgba(38,166,154,0.1)`.

### 6.3 Cards
**Standard content card pattern:**
```css
background:#fff; border:1px solid rgba(20,33,61,0.07);
border-radius:16px; box-shadow:0 6px 22px rgba(20,33,61,0.06);
padding:26px 24px; transition:transform .22s ease, box-shadow .22s ease;
```
- **Red accent bar variant** (feature/info cards): `::before` a 4px top bar `linear-gradient(90deg,#c0392b,#d35f52)`.
- **Hover:** `translateY(-5px)` + elevated shadow. Cursor `pointer` when the whole card is clickable.
- **Disabled/sold variant:** `cursor:not-allowed`, hover transform disabled, optional "SOLD" ribbon (`box-shadow:0 8px 25px rgba(0,0,0,0.4), inset 0 2px 3px rgba(255,255,255,0.3)`).
- **Marketplace car card:** white, `border:1px solid #e8ebf5`, radius 16px, `0 4px 16px rgba(11,33,84,0.08)`, full-height flex column; image header (180–200px) with overlay badges.

### 6.4 Buttons
| Variant | Style |
|---|---|
| **Primary red CTA** | bg `#D81324`, white text, radius 8px, weight 700; hover `#b00f1e`. |
| **Gradient pill CTA** ("List Your Car") | `linear-gradient(135deg,#D81324,#c8102e)`, radius 50px, padding `12px 28px`, shadow `0 4px 15px rgba(216,19,36,0.4)`; hover lifts `-2px`; optional `pulse-red` animation. |
| **Marketplace primary** | teal `#26a69a`, white, radius 12px, weight 600; hover `#1e8e82` + lift + teal glow. |
| **Secondary/outline** | white bg, red border + red text (CTA band) OR `#f3f6fb` bg with hairline border (neutral). |
| **Social (footer)** | 35×35 circle, 1px white border, transparent; hover icon → red. |
| Disabled | `opacity:0.7; cursor:not-allowed`. |

### 6.5 Badges & chips
- **Featured:** amber `#ff9f43`, white, pill (999px), `4px 10px`, `0.7rem` 600, top-left absolute.
- **Seller-type:** teal `rgba(38,166,154,0.9)` (dealer = amber `rgba(255,159,67,0.9)`), white, radius 6px, uppercase, top-right.
- **Location:** `rgba(0,0,0,0.7)`, white, radius 6px, bottom-left.
- **Car spec chip:** bg `#eef2ff`, text `#3c4a9a`, pill, `0.7rem` 600.
- **Filter/city chip:** `#f5f5f5` + 2px `#d0d0d0` border, pill, `8px 18px`; **active** → teal fill + white.
- **Offline/status pill:** `#e2e8f0` bg, `#1a202c`, pill 999px, `12px` 900.

### 6.6 Icons
- **Font Awesome 6** throughout (and FA5 in some footers). Inline SVG only where needed.
- Icon tile pattern: 46px square, radius 12px, brand-tinted background that intensifies on hover.

---

## 7. Navigation & Footer

### 7.1 Header / navigation
- **Hero pages (home, marketplace):** transparent `.top-banner` absolutely positioned over the hero (`position:absolute; top0; z-index:1050; padding:15px 0`). Logo left (height 55px desktop / 40px mobile), action icons right (user, location, language) with `gap:25px` desktop / `15px` mobile; icon hover → red.
- **Light/utility pages (terms, careers):** solid white sticky navbar, `box-shadow:0 2px 10px rgba(0,0,0,0.1)`.
- **Sticky behavior:** navbar hides (`top:-100px`) past 300px scroll then re-pins (JS in `main.js`).
- **Collapse:** ≤991px → hamburger; links stack vertically with reduced padding.
- **Dropdowns:** animate from `top:150%`→`100%`, fade `opacity 0→1`, `transition:.5s`.

### 7.2 Footer
- **Customer footer:** dark — navy `#0B2154` (homepage uses a darkened photo overlay `linear-gradient(rgba(0,0,0,.9),…)`). White link text (`15px`, capitalize) each prefixed with a FA chevron-right; hover → red. Social buttons as 35px circles. Logo shown as-is (no filter).
- **Marketplace footer:** `.marketplace-site-footer` solid `#0B2154`, white, Montserrat.

---

## 8. Forms & Input Styling

**Canonical input:**
```css
width:100%; border:1px solid rgba(15,23,42,0.12); border-radius:14px;
padding:12px 14px; font-size:14px; background:#fff; color:#15233c;
transition:border-color .2s ease, box-shadow .2s ease;
/* focus */ border-color:rgba(36,68,141,0.28); box-shadow:0 0 0 4px rgba(36,68,141,0.08);
```
**Label:** `12px`/700, color `#5d6880`, `margin-bottom:8px`. Required marker: `.form-label-required::after { content:" *"; color:#D81324; }`.

**Shared form theming classes:** `.iw-sleek-form` (form body) and `.iw-sleek-modal-shell` (modal wrapper, `#f4f5f7` bg). Used by List-Car, Reserve, Test-Drive, and booking forms for a unified look.

**Marketplace filter inputs:** radius 12px, 2px border `#dfe3f1`, focus → teal border + `0 0 0 3px rgba(38,166,154,0.1)`.

**Validation UX:**
- Bootstrap `.needs-validation` + HTML5 (`required`, `pattern`, `min/max`, `type`). Phone pattern `^0?\d{10}$`.
- Invalid field: `data-invalid="true"` → border `#ef4444`, bg `#fef2f2`.
- Status banners: `.ok` (green) / `.bad` (red). Toasts: bottom-center pill, `.ok`/`.bad` color variants.
- Mobile inputs use `font-size:16px`.

**Image uploads (List-Car / inspector form):** capture-from-phone with client-side compression (`MAX 1280×960`, JPEG quality `0.80`), 7 required slots + optional RC doc; helper text + action buttons (`.btn-small`, `13px`).

---

## 9. Imagery Rules

- Logo on transparent bg, sized by `height` + `width:auto`; bust caches with `?v=YYYY` when replaced.
- Prefer **next-gen formats** (`.avif`/`.webp`) with JPEG fallback via `<picture>`. Available: `banner_new.avif`, `marketplace_banner.webp`.
- **Always set `width`/`height`** (or `aspect-ratio`) to prevent CLS. Thumbnails should be square: `aspect-ratio:1/1; object-fit:cover; border-radius:8px`.
- `loading="lazy"` on all below-the-fold images; `loading="eager" fetchpriority="high"` on the LCP hero/logo.
- Card image headers: fixed height (180–200px), `object-fit:cover`, overlay badges absolutely positioned.

---

## 10. Animation, Transition & Micro-interaction

**Durations:** standard `0.2–0.22s` (cards/inputs), `0.3s` (links/hover), `0.5s` (nav/overlays). Easing: `ease` / `ease-in-out`.

**Keyframes:**
- `dust-drift` (18s infinite): faint drifting texture on `#what-checked`, `#about-section` (opacity 0.06→0.09). Decorative, very subtle.
- `pulse-red` (2s infinite): box-shadow pulse on the "List Your Car" CTA.
- `shimmer` (1.5s infinite): skeleton loading placeholder for images.

**Micro-interactions:** card hover lift `translateY(-5px)`; button hover lift `-2px` + glow; team overlay `scale(0)→scale(1)`; testimonial center-slide recolors to brand red; nav dropdown fade-down. Respect `prefers-reduced-motion` (recommended) by disabling non-essential motion.

---

## 11. Content Hierarchy & Trust/Conversion Patterns

**Homepage section order (and intent):**
1. Hero (headline + value prop + hero contact/booking card) — instant CTA.
2. Trust strip / "What is checked" (160+ point) — credibility.
3. Services + "How it works" stepper (numbered 40px red-gradient circles) — reduce friction.
4. Marketplace showcase (verified cars) — cross-sell.
5. Testimonials / reviews + `aggregateRating` — social proof.
6. CTA band (white→`#faf3f1` gradient, red primary + outline secondary) — final push.

**Trust-building elements:** certified-inspector language, "160+ point", same-day reports, verified/inspected badges, star ratings, real city coverage, aggregate rating, professional report PDF preview.

**Conversion elements:** repeated red CTAs at each decision point; sticky/pulsing "List Your Car"; low-friction lead forms (name + mobile minimum); reserve/test-drive modals one tap from a listing; price shown prominently with clear next action.

**Marketplace & inspection workflow UX:** browse → filter (city chips, dropdowns) → card grid → car detail modal (gallery, price, specs, comments, seller contact) → Reserve / Test-Drive / Book-Inspection. Inspector workflow (portal): login → sectioned form (Report, Inspection, Vehicle, Ratings, Flags, panel-by-panel condition, images) → submit → server-generated PDF report. Offline-first with sync queue + status bar.

---

## 12. Accessibility (WCAG 2.1 AA targets)

- **Contrast:** navy/white and red/white combos meet AA for normal text; verify red `#D81324` on white for small text (it passes ~AA for ≥ normal weight — keep CTA text ≥14px/600). Never put light gray text on white below AA.
- **Semantics:** one H1; logical heading order; `<nav>`, `<main>`, `<footer>` landmarks; lists for link groups.
- **Forms:** every input has a `<label>`; required state conveyed by text/`aria-required`, not color alone; error messages announced (`aria-live` on status banners/toasts).
- **Focus:** visible focus rings (the navy/teal glow doubles as focus indicator — keep it on `:focus-visible`).
- **Targets:** ≥44×44px tap targets on mobile.
- **Images:** meaningful `alt` (logo alt "inspectionWale"); decorative images `alt=""`.
- **Motion:** honor `prefers-reduced-motion`.
- **Modals:** trap focus, `aria-modal`, ESC to close, return focus to trigger.

---

## 13. Reusable AI Build Directives (checklist)

When generating any new InspectionWale page/component, the AI MUST:
- [ ] Use Montserrat (UI/headings) + Lato (body); Inter/Poppins only for portal contexts.
- [ ] Use only the navy `#0B2154` / red `#D81324` brand pair + teal `#26a69a` utility + amber `#ff9f43` badges. No new accent hues.
- [ ] Pick radii/shadows from the canonical scales (§6.1–6.2).
- [ ] Use the spacing scale (§4.1) and 1200px max container.
- [ ] Ship `width=device-width` viewport; provide SM/MD breakpoints; stack + reorder by priority on mobile.
- [ ] Build CTAs in red, repeated at decision points; one H1; trust signals near CTAs.
- [ ] Use `.iw-sleek-form`/`.iw-sleek-modal-shell` for forms; full-screen modals on mobile with fixed bottom action bar.
- [ ] Set image dimensions, lazy-load below fold, prefer webp/avif, transparent logo as-is.
- [ ] Meet WCAG AA: labels, contrast, focus, reduced-motion, 44px targets.
- [ ] When replacing cached assets, bump `sw.js` `CACHE_NAME` and `?v=` query (see Architecture doc §Caching).
