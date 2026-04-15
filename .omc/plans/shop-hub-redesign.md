# Shop Hub Redesign — Revised Plan (v2)

**Route:** `/shop` (src/app/shop/page.tsx)
**Goal:** Replace the current icon+chevron category cards with a distinctive, imagery-driven hub that reuses UniverseCard motion primitives without duplicating their visual language.

---

## Changes from v1

Addresses all six deltas returned by Architect/Critic:

- **Delta 1 (motion primitives in-PR):** `Particles` and `BorderPulse` are extracted into `src/components/ui/neon/` with `amplitude` props in Step 1 of this PR. UniverseCard is refactored to consume them in the same PR. No two implementations ship. (Note: there is no discrete `CornerBrackets` component in UniverseCard today — just inline JSX at lines ~233 and ~388. We will extract that JSX into `CornerBrackets` as part of the same lift so both cards can reuse it.)
- **Delta 2 (collage 3 → 1):** Each CategoryCard renders ONE art-directed hero image. LCP image count on `/shop` drops from 15 (5 cards × 3) to 5.
- **Delta 3 (bespoke art blocker):** Explicit decision — **commission 5 bespoke 1600×1200 webp hero images as a ship-blocker.** Owner: design lead (Marcos). Target date: end of sprint. No interim crops. If art slips, we defer the redesign and ship the current `/shop` unchanged.
- **Delta 4 (distinct composition axis):** Chosen axis — **typographic-primary horizontal shelf**. Large extruded category wordmark on the left, product silhouette/hero on the right, asymmetric. UniverseCard is vertical/portrait and icon-led; this is horizontal/landscape and type-led. Documented in ADR below.
- **Delta 5 (CI gates):** New Playwright test `e2e/shop-hub-performance.spec.ts` asserts `LCP < 2500ms` on `/shop`. Lighthouse CI step (`@lhci/cli` via `scripts/lhci-shop.mjs`) asserts performance score delta ≥ −5pts vs `.lighthouseci/baseline-shop.json`. Both run in GitHub Actions on PRs touching `src/app/shop/**` or `src/components/shop/**` and block merge on failure.
- **Delta 6 (fallback provenance):** Fallback webps live at `public/images/shop/fallback/{type}.webp` (5 files, 1600×1200, ≤ 120KB each), produced by the design lead as part of the same Delta 3 commission. Trigger: `products.length < 1` for that category (Delta 2 made 3→1, so any product is sufficient).

Preserved from v1: Option A (live Shopify imagery), ISR caching, hero strip above grid, 5-locale i18n, measurable acceptance criteria.

Removed from v1: the 3-image collage, the "interim crops" fallback tier, the follow-up PR for primitive extraction, principle #5 (progressive enhancement — see RALPLAN-DR below).

---

## RALPLAN-DR

### Mode
SHORT (not deliberate). Single-route visual redesign; no data-model or payment-path changes. Risk is contained to `/shop`.

### Principles (4 — revalidated)
1. **Imagery over icons.** The current hub leans on lucide icons; category identity comes from merchandise. Ship real product imagery.
2. **Reuse the motion vocabulary, not the layout.** Share `Particles`/`BorderPulse`/`CornerBrackets` primitives with UniverseCard so the hub feels like the same world, but compose them on a different axis so it reads as a different surface.
3. **Performance is a product feature.** LCP and Lighthouse are gates, not aspirations. A prettier hub that ships slower is a regression.
4. **Art-blocker is acknowledged.** Bespoke hero imagery is the load-bearing asset of this redesign. If it slips, the redesign slips with it — we do not ship a compromised version.

*(Removed v1 principle "progressive enhancement" — it was aspirational filler that did not constrain any decision in Option A. Dropped per Critic feedback.)*

### Decision Drivers (top 3)
1. **Hub must not visually duplicate UniverseCard.** Users navigate from `/` (UniverseCard grid) to `/shop` (CategoryCard grid) in the same session. Same layout twice = wasted screen.
2. **LCP on `/shop` ≤ 2500ms.** `/shop` is an SEO landing target for type-queries (e.g. "anime hoodies"). Regressing LCP directly regresses search rank.
3. **5-locale coverage with no hardcoded strings.** All copy goes through `shopByType` namespace; bespoke images are text-free so they work across locales.

### Options

**Option A — Shopify-live + typographic-horizontal shelf (CHOSEN)**
- Server-fetch 1 featured product per type via Storefront API; render its image as the hero within a horizontal shelf card.
- Pros: real merchandise, updates automatically with catalog, reuses existing `getProductsByType` query path, horizontal axis differentiates from UniverseCard.
- Cons: quality depends on product photography; requires fallback path.

**Option B — Bespoke-only + isometric stack**
- Ship only the 5 hand-crafted webps, no live product data.
- Pros: perfect art direction, zero runtime Shopify calls on `/shop`.
- Cons: stale when catalog changes; duplicates "static marketing hub" surface that `/` already serves; loses the "shop by type" discovery signal.

**Option C (invalidated) — Defer redesign, patch current hub**
- Add subtle hover art to existing icon cards.
- Invalidated because: does not solve the "hub reads as placeholder" feedback; and does not justify a planning cycle.

Choosing **Option A**. Option B loses the dynamic merchandising that makes `/shop` worth visiting. The bespoke webps survive as the Delta-6 fallback, so we get Option B's art floor under Option A's ceiling.

---

## Plan

### Direction
Replace `src/app/shop/page.tsx`'s inline icon-card markup with a new `CategoryCard` component rendered in a horizontal-shelf grid. Each card = [large extruded wordmark] + [one hero product image] + [item count + chevron]. Data fetched server-side with ISR. Shared motion primitives live in `src/components/ui/neon/`.

### File Changes

**New:**
- `src/components/ui/neon/Particles.tsx` — extracted from UniverseCard lines 46–75. Adds `amplitude?: 'subtle' | 'standard' | 'intense'` prop (maps to count+speed). Default `'standard'`.
- `src/components/ui/neon/BorderPulse.tsx` — extracted from UniverseCard lines 78–100. Adds `amplitude?: 'subtle' | 'standard' | 'intense'` (maps to opacity range + blur).
- `src/components/ui/neon/CornerBrackets.tsx` — extracted from inline "Corner energy effects" JSX at UniverseCard line ~233 and "Corner accents" at ~388. Accepts `color`, `size?: 'sm' | 'md' | 'lg'`.
- `src/components/ui/neon/index.ts` — barrel.
- `src/components/shop/CategoryCard.tsx` — horizontal shelf card consuming the 3 primitives at `amplitude='subtle'`.
- `src/components/shop/CategoryHeroStrip.tsx` — above-grid hero strip (1 featured product carousel, 400px tall desktop, 260px mobile).
- `src/lib/shopify/shopHubQueries.ts` — `getFeaturedProductByType(type)` returning 1 product with 1 image, ISR-cached.
- `public/images/shop/fallback/{hoodies,tshirts,name-signs,keychains,magnets}.webp` — 5 bespoke 1600×1200 webps, ≤120KB each. Produced by design lead.
- `e2e/shop-hub-performance.spec.ts` — Playwright LCP assertion.
- `scripts/lhci-shop.mjs` — Lighthouse CI runner, reads `.lighthouseci/baseline-shop.json`.
- `.lighthouseci/baseline-shop.json` — baseline performance score captured pre-PR.

**Modified:**
- `src/components/home/UniverseCard.tsx` — replace internal `Particles`/`BorderPulse`/corner JSX with imports from `@/components/ui/neon`. UniverseCard consumes at `amplitude='intense'` to preserve current feel.
- `src/app/shop/page.tsx` — replace inline card loop with `<CategoryCard />` grid + `<CategoryHeroStrip />`. Add `export const revalidate = 3600`.
- `src/i18n/messages/{en,de,fr,es,pt}.json` — add `shopByType.heroStrip.*` keys, no hardcoded strings in new components.
- `.github/workflows/ci.yml` (or existing PR workflow) — add Lighthouse + Playwright-perf job gated on paths.

**Deleted:** none.

### Implementation Order

1. **Extract motion primitives + refactor UniverseCard** (Delta 1). Verify UniverseCard looks identical via Playwright visual snapshot before moving on.
2. **Add Shopify query + fallback webps land in repo** (Delta 3, Delta 6). Blocks on design-lead delivery.
3. **Build `CategoryCard` + `CategoryHeroStrip`** using the primitives at `amplitude='subtle'`, horizontal-shelf layout (Delta 4).
4. **Swap `src/app/shop/page.tsx`** to the new components; wire ISR.
5. **Add Playwright LCP test + Lighthouse CI script + baseline** (Delta 5). Wire into CI with path filter.
6. **i18n keys across 5 locales**; run `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm test:e2e`.

### Acceptance Criteria (measurable)
- `grep -r "function Particles\|function BorderPulse" src/components/home/UniverseCard.tsx` returns zero matches (primitives fully extracted).
- `src/components/ui/neon/` exports `Particles`, `BorderPulse`, `CornerBrackets`, each accepting an `amplitude` or `size` prop.
- UniverseCard visual snapshot on `/` matches pre-PR baseline within 1% pixel diff (Playwright `toHaveScreenshot`).
- `/shop` renders 5 `CategoryCard` instances, each with exactly 1 product image (Playwright count assertion).
- `/shop` LCP < 2500ms on 3G-fast throttle in CI (Playwright perf API).
- Lighthouse performance score delta ≥ −5pts vs `.lighthouseci/baseline-shop.json`.
- When Storefront returns `products.length < 1` for a type, the corresponding fallback webp renders (unit test with mocked query).
- All 5 bespoke webps present in `public/images/shop/fallback/`, each ≤ 120KB, dimensions 1600×1200.
- Zero hardcoded English strings in `CategoryCard`, `CategoryHeroStrip`, `src/app/shop/page.tsx` (grep for `>[A-Z][a-z]` JSX text returns only `{t(...)}` calls).
- 5 locale JSON files contain all new `shopByType.heroStrip.*` keys (diff-based assertion in CI).
- `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm test:e2e` all pass.

### Verification Steps
1. Local: `pnpm dev` → visit `/` and `/shop`, confirm UniverseCard unchanged and `/shop` shows horizontal-shelf cards with product imagery.
2. `pnpm test:e2e -- shop-hub-performance` → LCP assertion passes.
3. `node scripts/lhci-shop.mjs` → Lighthouse delta within gate.
4. Toggle Shopify mock to return empty product list → fallback webps render.
5. Switch locale cookie to `de`/`fr`/`es`/`pt` → all strings translate.
6. Visual snapshot job in CI matches baseline for `/` and matches newly-captured baseline for `/shop`.

### Risks & Mitigations
- **Risk:** Bespoke art slips schedule. **Mitigation:** Delta 3 decision — defer redesign entirely rather than ship crops. Current `/shop` stays live.
- **Risk:** Extracting primitives subtly changes UniverseCard animation timing. **Mitigation:** Step 1 Playwright snapshot + 1% pixel-diff gate catches it before Step 3.
- **Risk:** LCP gate fails intermittently on CI runners. **Mitigation:** Use a fixed throttle profile (`Fast 3G` equivalent) and run the assertion 3× with p75 reporting, not raw single-sample.
- **Risk:** Horizontal-shelf layout collides on narrow mobile. **Mitigation:** breakpoint-swap to stacked-vertical below 480px; snapshot tests at 375px, 768px, 1280px.

### i18n
All new copy in `shopByType.heroStrip.*` and existing `shopByType.types.*`. 5 locales. Bespoke webps contain no text, so a single asset serves all locales.

### Assets
5 bespoke webps in `public/images/shop/fallback/`. Owner: design lead. Spec: 1600×1200, ≤120KB, webp q=80, text-free, single hero product on theme-neutral cyberpunk backdrop with room for card gradient overlay.

---

## ADR

**Decision:** Redesign `/shop` as a typographic-horizontal-shelf grid of 5 `CategoryCard` components, each rendering one live Shopify-fetched hero product image, with bespoke webp fallbacks. Motion primitives extracted from UniverseCard into `src/components/ui/neon/` and shared.

**Drivers:**
1. Hub must not visually duplicate UniverseCard (same session, both grids visible).
2. `/shop` LCP must stay ≤ 2500ms (SEO landing for type-queries).
3. Full 5-locale coverage with text-free hero imagery.

**Alternatives considered:**
- *Option B — bespoke-only isometric stack:* loses dynamic merchandising; duplicates static-marketing role that `/` already fills.
- *Option C — defer redesign:* invalidated; doesn't address hub-reads-as-placeholder feedback.
- *v1 3-image collage:* invalidated by Delta 2; 15 LCP images, noise risk, inconsistent crops across products.
- *v1 interim-crop fallback tier:* invalidated by Delta 3; middle path produced worst-of-both outcomes.
- *v1 follow-up PR for primitive extraction:* invalidated by Delta 1; shipping two motion-primitive implementations was a correctness bug, not a scheduling choice.

**Why chosen:** Option A gives us live merchandising (Option B's weakness) with bespoke fallback (Option A's weakness) and a horizontal axis that differentiates from UniverseCard (Delta 4). Single-image LCP (Delta 2) keeps performance defensible. Primitive sharing (Delta 1) prevents visual drift between `/` and `/shop`.

**Consequences:**
- UniverseCard gains an external dependency on `@/components/ui/neon/*`. Future UniverseCard changes must not break CategoryCard and vice versa — Playwright visual snapshots on both routes become part of CI.
- `/shop` becomes blocked on design-lead asset delivery. Calendar dependency is explicit.
- CI adds ~90s for Lighthouse + perf Playwright. Acceptable; gated on path filter.
- Adds first use of `.lighthouseci/` in repo. Future perf-gated routes can reuse the pattern.

**Follow-ups:**
- After merge, capture a new Lighthouse baseline for `/shop` and commit it so subsequent PRs compare against the redesigned state.
- Consider extending `@/components/ui/neon/*` to other neon-accented surfaces (CartDrawer, QuickViewModal) in a separate PR.
- If `/shop` LCP trends near the 2500ms ceiling over time, investigate moving hero images to `priority` + `fetchpriority=high` and preloading the first two.
