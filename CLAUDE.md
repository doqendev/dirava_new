# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mizoke** ("Your Anime Universe") is an anime merchandise e-commerce store with a gacha/mystery box system. Built by Neo Stage Collective. The store organizes products by anime "universes" (One Piece, Demon Slayer, Dragon Ball, Hunter x Hunter, Attack on Titan, Digimon), each with unique cyberpunk/neon theming.

## Commands

```bash
pnpm dev          # Start dev server (binds 0.0.0.0)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm type-check   # TypeScript strict check (tsc --noEmit)
pnpm test         # Unit tests (vitest)
pnpm test:e2e     # E2E tests (playwright)

# Run a single test file
pnpm test src/lib/utils/__tests__/validation.test.ts

# Run tests matching a name pattern
pnpm test -t "rate limit"
```

## Tech Stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript (strict mode)
- **Styling**: Tailwind CSS 3 with custom cyberpunk theme tokens
- **State**: Zustand with `persist` middleware (localStorage)
- **Data**: Shopify Storefront API (GraphQL via `graphql-request`) + Shopify Admin API for server-side ops
- **i18n**: `next-intl` v4 — 5 locales (en, de, fr, es, pt) with cookie-based detection
- **3D**: React Three Fiber + Drei for product preview (text/SVG extrusion scenes)
- **Animations**: Framer Motion + custom Tailwind keyframes (gacha effects)
- **Monitoring**: Sentry (wraps next config)
- **Analytics**: Vercel Analytics + Speed Insights
- **Package Manager**: pnpm 8

## Architecture

### Next.js Config Chain

`next.config.js` (CJS format) applies plugins in this order: `withSentryConfig(withNextIntl(nextConfig))`. Images are restricted to `cdn.shopify.com` via `remotePatterns`.

### Routing & Layout

Single root layout at `src/app/layout.tsx` wraps everything with `NextIntlClientProvider`, `LocaleProvider`, `Header`, `Footer`, `BottomNav` (mobile), `CartDrawer`, `SearchModal`, `QuickViewModal`, and `CookieConsent`. No middleware file — locale detection happens server-side in `src/i18n/request.ts` via cookies and geo-headers.

### Client Component Pattern

Pages that need client-side interactivity use a split pattern: `page.tsx` (server component) renders a `*Content.tsx` (client component with `'use client'`). Examples: `cart/CartContent.tsx`, `contact/ContactContent.tsx`, `gacha/reveal/[code]/RevealCodeContent.tsx`, `admin/gacha/AdminGachaContent.tsx`.

### Key Route Groups

| Route | Purpose |
|-------|---------|
| `/` | Homepage with universe grid |
| `/worlds/[universe]` | Collection page filtered by anime universe |
| `/worlds/[universe]/[product]` | Product detail (universe-scoped) |
| `/products/[handle]` | Product detail (direct) |
| `/gacha/*` | Mystery box browse, reveal, claim flows |
| `/account/*` | Auth (login/register/reset), dashboard, orders, addresses, wishlist, codes |
| `/bundles` | Product bundles |
| `/drops`, `/new`, `/sale` | Curated collections |
| `/search` | Search with filters |
| `/cart` | Full cart page |

### Shopify Integration (Two Clients)

- **Storefront API** (`src/lib/shopify/client.ts`): Public client using `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`. Used for product queries, cart operations, customer auth. API version `2024-01`.
- **Admin API** (`src/lib/shopify/adminClient.ts`): Server-only client using `SHOPIFY_ADMIN_ACCESS_TOKEN`. Used for metaobjects (gacha codes, reviews), webhooks, newsletter subscriptions.
- Queries/mutations split into: `queries.ts`, `mutations.ts`, `customerQueries.ts`, `customerMutations.ts`

### Zustand Stores (`src/stores/`)

| Store | Key Behavior |
|-------|-------------|
| `cartStore` | Persists `cartId` to localStorage, all operations go through Shopify Cart API. Supports bundles with auto-applied discount codes. |
| `gachaStore` | Manages reveal animation phases (`idle → intro → shake → open → rarity-reveal → item-reveal → celebration → complete`). Not persisted. |
| `authStore` | Customer authentication state |
| `wishlistStore` | Wishlist management |
| `recentlyViewedStore` | Product view tracking |
| `uiStore` | Drawer/modal open state |
| `localeStore` | Active locale and currency |
| `cookieConsentStore` | GDPR consent |

### Universe Theming System

Each anime universe has a color theme defined in `src/lib/utils/constants.ts` (`UNIVERSE_CONFIG`). Colors map to Tailwind tokens (`neon-cyan`, `neon-pink`, `neon-orange`, `neon-green`) with matching glow box-shadows and background effects (portal, embers, lightning, nen). Components receive a `UniverseSlug` and apply theme classes dynamically.

### Gacha / Mystery Box System

The gacha system uses Shopify Metaobjects to store redemption codes. Flow:
1. Customer purchases mystery box → webhook creates redemption codes
2. Customer enters code → `/gacha/reveal/[code]` triggers animated reveal
3. Reveal assigns a product based on loot pool odds (common/rare/epic/legendary)
4. Customer claims revealed product with shipping address → `/gacha/claim/[code]`

API routes: `src/app/api/gacha/` (reveal, claim, boxes, codes, setup, user-codes)
Admin routes: `src/app/api/admin/gacha/` (generate-codes)

### Other API Routes

| Route | Purpose |
|-------|---------|
| `/api/reviews` | Product reviews (CRUD via Shopify metaobjects) |
| `/api/reviews/[handle]` | Reviews for a specific product |
| `/api/reviews/setup` | Reviews metaobject setup |
| `/api/webhooks/orders/paid` | Order paid webhook handler |
| `/api/newsletter` | Newsletter subscription |
| `/api/wishlist` | Wishlist operations |
| `/api/upsells` | Upsell product recommendations |
| `/api/products/[handle]` | Single product fetch |

### Bundle System

Product bundles live in `src/app/bundles/`, with bundle definitions in `src/data/bundles.ts`, logic in `src/lib/bundles/`, types in `src/types/bundle.ts`, and UI components in `src/components/bundles/`. Cart store supports bundles with auto-applied discount codes.

### 3D Product Preview (`src/components/product/preview3d/`)

Customizable product previews using React Three Fiber. Config-driven via `src/lib/preview/configs.ts` — each product handle maps to a `PreviewConfig` specifying scene type (`text-extrusion`, `svg-extrusion`, `composite-sign`), layers (color, depth, bevel, metalness), camera settings, and per-variant overrides. Fonts go in `/public/fonts/preview/`, SVGs in `/public/svgs/preview/`.

### i18n Setup

- Config: `src/i18n/config.ts` (locales, currencies, country mappings)
- Detection: `src/i18n/request.ts` (cookie → geo-header → Accept-Language → default)
- Messages: `src/i18n/messages/` (one JSON per locale)
- Cookies: `mizoke-locale`, `mizoke-currency`

## TypeScript Configuration

Strict mode with extra checks: `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters`. Path alias: `@/*` → `./src/*`.

## Environment Variables

Required: `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`, `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`
Server-only: `SHOPIFY_ADMIN_ACCESS_TOKEN`, `SHOPIFY_WEBHOOK_SECRET`, `ADMIN_SECRET`
Optional: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `GACHA_SETUP_SECRET`

See `.env.example` for full list.

## Design Tokens

Background: `bg-primary` (#0a0a12), `bg-secondary` (#0d0d1a), `bg-card` (rgba)
Neon colors: `neon-cyan`, `neon-pink`, `neon-orange`, `neon-green`, `neon-purple`, `neon-yellow`
Glow shadows: `glow-cyan`, `glow-pink`, `glow-orange`, `glow-green` (full and `sm` variants)
Fonts: `font-display` (Orbitron), `font-body` (Inter), `font-mono` (JetBrains Mono)

## Production Audit (Feb 2025)

### CRITICAL — Must fix before launch

1. **No HTTP security headers** — `next.config.js` has zero headers. Missing CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. Add a `headers()` export.
2. **In-memory rate limiter useless in serverless** — `src/lib/utils/rateLimit.ts` uses a module-level `Map()`. On Vercel each invocation gets a fresh process. Replace with Upstash Redis (`@upstash/ratelimit`).
3. **No favicon or app icons** — No `favicon.ico`, `apple-icon.png`, or `manifest.json` anywhere. Blank browser tab.
4. **No `metadataBase` in root layout** — `src/app/layout.tsx` missing `metadataBase`. OG image URLs won't resolve correctly; Next.js warns at build.
5. **No canonical URLs on any page** — Same product accessible at `/products/[handle]` AND `/worlds/[universe]/[product]` creating duplicate content for Google.
6. **No `Cache-Control` headers on API routes** — Read routes (`/api/gacha/boxes`, `/api/upsells`, `/api/reviews/[handle]`) have no caching directives.

### HIGH — Should fix before launch

7. **Admin endpoint open when `ADMIN_SECRET` unset** — `src/app/api/admin/gacha/generate-codes/route.ts` has no auth in dev mode. If deployed without secret → fully open.
8. **No OG images for homepage/universe/gacha** — Social shares show blank cards for all non-product pages.
9. **Missing `error.tsx` for gacha routes** — `/gacha/reveal/[code]` and `/gacha/claim/[code]` are money-critical flows with no error boundary.
10. **No success toast on "Add to Cart"** — Toast system exists (`src/stores/toastStore.ts`, `src/components/ui/Toast.tsx`) but only fires on errors. Zero user confirmation when adding items.
11. **Contact form API is a stub** — `src/app/contact/ContactForm.tsx` uses `setTimeout(1500)` fake delay. No actual API call.
12. **Missing pages from sitemap** — `/worlds`, `/bundles`, `/gacha`, `/faq` not in `src/app/sitemap.ts`.
13. **`/search` page is indexable** — Should have `robots: {index: false}` — thin/duplicate content.
14. **Missing Imprint page (EU)** — Required in Germany/Austria/France. No `/policies/imprint`.
15. **No GDPR data deletion/export endpoints** — Privacy policy promises these but no API or UI exists.
16. **`console.log` with token substrings** — `src/stores/wishlistStore.ts` logs `accessToken.substring(0, 20)` in production.
17. **`opentype.js`/`fontkit`/`wawoff2` in devDependencies** — Used at runtime in 3D preview. Production install with `--prod` flag breaks.
18. **Organization JSON-LD references missing `/logo.png`** — Schema points to file that doesn't exist in `public/`.

### MEDIUM — Fix soon after launch

19. **No `middleware.ts`** — No edge auth for `/account/*`, no bot protection.
20. **`setState` during render in ProductGallery** — `src/components/product/ProductGallery.tsx` calls `setCurrentIndex(0)` in render body.
21. **3D components use `any` for font types** — `TextExtrusionScene`, `SvgExtrusionScene`, `CompositeSignScene` bypass strict mode.
22. **`forceUppercase`/`capitalizeFirst` config flags never applied** — `src/lib/preview/textTransform.ts` ignores these.
23. **Non-null assertions on metaobject fields** — `src/app/api/gacha/reveal/route.ts` uses `!` on `revealedRarity`, `revealedAt`, `seed`.
24. **Gacha & Account missing from BottomNav** — Mobile users can't reach core features.
25. **`maximumScale: 1` in viewport** — Prevents user zoom. WCAG 1.4.4 violation.
26. **Form labels not associated with inputs** — `ClaimContent` labels have no `htmlFor`/`id` pairing.
27. **No `vercel.json` timeout config** — Webhook/gacha routes may hit 10s default timeout.
28. **Hardcoded English strings** — Login page, worlds breadcrumbs, 3D preview hints, product detail sections.
29. **hreflang uses `?locale=` query params** — Weaker i18n signal than path-based URLs.
30. **Three.js geometries never `.dispose()`d** — WebGL memory leaks on re-renders.
31. **Cookie banner lacks vendor/cookie list** — Says "we use cookies" without specifics.
32. **Newsletter may lack double opt-in** — No confirmed flow visible.

### What's Already Good

- TypeScript strict mode passes with 0 errors
- Shopify integration properly separated (Storefront + Admin clients)
- i18n with 5 locales and proper detection chain
- GDPR cookie consent with granular preferences
- Accessibility basics: skip links, aria-labels, focus traps on CartDrawer
- Error boundaries on cart, account, worlds, product routes
- Custom 404 page with brand styling
- Product JSON-LD schema with reviews + BreadcrumbList
- robots.txt blocks admin/API/private routes
- Sitemap with dynamic product generation
- 100% `next/image` adoption (zero native `<img>` tags)
- Fonts via `next/font/google` (self-hosted, no CLS)
- Sentry configured across client/server/edge
- Analytics gated behind cookie consent
- 5 legal policy pages (privacy, terms, shipping, returns, accessibility)

### Recommended Fix Order

**Week 1 (Blocking):** Items 1-6 (security headers, rate limiter, favicon, metadataBase, canonicals, cache headers)
**Week 2 (Pre-marketing):** Items 7-13, 16-18 (admin auth, OG images, error boundaries, toasts, contact API, sitemap, console.log cleanup, deps fix)
**Week 3 (Polish):** Items 14-15, 19-32 (legal, middleware, React fixes, a11y, i18n hardcoded strings)
