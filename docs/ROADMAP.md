# Mizoke – Implementation Roadmap

This document outlines the phased development approach for building the Mizoke e-commerce platform.

---

## Overview

| Phase | Focus | Estimated Scope |
|-------|-------|-----------------|
| Phase 1 | Foundation & Layout | Core setup, navigation, basic structure |
| Phase 2 | Home Page & Universe Cards | Landing page, universe selection |
| Phase 3 | Product Pages & Cart | Product display, cart functionality |
| Phase 4 | Effects & Animations | Visual polish, special effects |
| Phase 5 | Polish & Optimization | Performance, testing, deployment |

---

## Phase 1: Foundation & Layout

**Goal:** Establish the project foundation with working navigation and layout structure.

### Tasks

- [x] Project scaffolding
  - [x] Initialize Next.js 14 with App Router
  - [x] Configure TypeScript strict mode
  - [x] Set up Tailwind CSS with custom theme
  - [x] Configure fonts (Orbitron, Inter, JetBrains Mono)

- [x] Design system setup
  - [x] Define CSS variables for colors, spacing
  - [x] Create Tailwind config with custom colors
  - [x] Set up glow effects and animations
  - [x] Create utility classes (cn, formatPrice)

- [x] Layout components
  - [x] Root layout with font providers
  - [x] Header component (logo, search, cart icons)
  - [x] Bottom navigation (mobile)
  - [x] Cart drawer (slide-out)

- [x] Shopify integration setup
  - [x] Configure Storefront API client
  - [x] Create GraphQL queries and mutations
  - [x] Set up cart store with Zustand
  - [x] UI state store

### Deliverables

- Working development environment
- Responsive header and bottom navigation
- Cart drawer (UI only, not connected)
- Type definitions for Shopify data

---

## Phase 2: Home Page & Universe Cards

**Goal:** Build the landing page with immersive universe selection cards.

### Tasks

- [x] Home page components
  - [x] Hero section ("Choose Your World")
  - [x] Universe grid layout (2 columns mobile)
  - [x] Individual universe cards with theming

- [ ] Universe card effects
  - [ ] Themed border colors and glows
  - [ ] Hover animations (lift, glow increase)
  - [ ] Corner accent decorations
  - [ ] Background gradient effects

- [x] Drop Runway carousel
  - [x] Horizontal scroll with snap
  - [x] Product cards with holographic effect
  - [x] Quick add button
  - [x] Progress indicator

- [ ] Data fetching
  - [ ] Fetch collections from Shopify
  - [ ] Map collections to universes
  - [ ] Fetch drop products
  - [ ] Loading skeletons

### Deliverables

- Complete home page layout
- Interactive universe selection cards
- Working product carousel
- Connected to Shopify (with demo fallback)

---

## Phase 3: Product Pages & Cart

**Goal:** Implement product browsing, detail pages, and full cart functionality.

### Tasks

- [ ] Universe/Collection pages
  - [ ] Create `/worlds/[universe]` route
  - [ ] Product grid layout
  - [ ] Filter/sort functionality
  - [ ] Pagination/infinite scroll

- [ ] Product components
  - [ ] Product card (grid version)
  - [ ] Product card hover states
  - [ ] Quick add functionality

- [ ] Product detail page
  - [ ] Create `/worlds/[universe]/[product]` route
  - [ ] Image gallery with zoom
  - [ ] Variant selector (size, color pills)
  - [ ] Quantity selector
  - [ ] Add to cart button
  - [ ] Product description
  - [ ] Related products

- [ ] Cart functionality
  - [ ] Connect cart drawer to Zustand store
  - [ ] Add to cart mutations
  - [ ] Update quantity
  - [ ] Remove items
  - [ ] Checkout redirect
  - [ ] Cart persistence (localStorage)

- [ ] Full cart page
  - [ ] Create `/cart` route
  - [ ] Full cart item list
  - [ ] Subtotal calculation
  - [ ] Checkout button

### Deliverables

- Browsable universe product pages
- Complete product detail pages
- Fully functional cart system
- Shopify checkout integration

---

## Phase 4: Effects & Animations

**Goal:** Add the immersive visual effects that make the experience feel premium.

### Tasks

- [ ] Universe card special effects
  - [ ] Portal effect (One Piece) - Three.js rotating ring
  - [ ] Ember particles (Demon Slayer) - CSS/Canvas particles
  - [ ] Lightning effect (Dragon Ball) - SVG animations
  - [ ] Nen pattern (Hunter x Hunter) - Geometric animations

- [ ] Page transitions
  - [ ] Route change animations
  - [ ] Staggered content reveal
  - [ ] Exit animations

- [ ] Micro-interactions
  - [ ] Button hover/tap effects
  - [ ] Card hover lift
  - [ ] Icon hover glow
  - [ ] Cart badge pop animation
  - [ ] Success feedback animations

- [ ] Loading states
  - [ ] Skeleton screens with shimmer
  - [ ] Image blur-up loading
  - [ ] Pulsing glow effects
  - [ ] Spinner animations

- [ ] Scroll-based animations
  - [ ] Parallax effects on desktop
  - [ ] Reveal on scroll
  - [ ] Header transparency change

### Deliverables

- All special visual effects implemented
- Polished micro-interactions
- Smooth page transitions
- Beautiful loading states

---

## Phase 5: Polish & Optimization

**Goal:** Ensure production-ready quality, performance, and accessibility.

### Tasks

- [ ] Performance optimization
  - [ ] Bundle analysis and optimization
  - [ ] Image optimization (WebP, lazy loading)
  - [ ] Code splitting verification
  - [ ] Lighthouse audit (target: 90+)
  - [ ] Core Web Vitals check

- [ ] Accessibility
  - [ ] Keyboard navigation testing
  - [ ] Screen reader testing
  - [ ] Focus indicators
  - [ ] Color contrast verification
  - [ ] ARIA labels audit
  - [ ] Reduced motion support

- [ ] Testing
  - [ ] Unit tests for utilities
  - [ ] Component tests for UI
  - [ ] E2E tests for critical paths
  - [ ] Cross-browser testing
  - [ ] Mobile device testing

- [ ] Additional pages
  - [ ] Search page with filters
  - [ ] Profile page (auth integration)
  - [ ] Order history
  - [ ] 404 page
  - [ ] Error boundary

- [ ] SEO & Analytics
  - [ ] Meta tags for all pages
  - [ ] Open Graph images
  - [ ] Sitemap generation
  - [ ] Analytics integration (optional)

- [ ] Deployment
  - [ ] Vercel project setup
  - [ ] Environment variables configuration
  - [ ] Domain configuration
  - [ ] Preview deployments
  - [ ] Production deployment

### Deliverables

- Production-ready application
- 90+ Lighthouse scores
- WCAG 2.1 AA compliance
- Comprehensive test coverage
- Deployed and live application

---

## Development Guidelines

### Git Workflow

1. Main branch: `main` (protected)
2. Feature branches: `feature/component-name`
3. Bug fixes: `fix/bug-description`
4. Pull requests for all changes

### Code Standards

- TypeScript strict mode enabled
- ESLint + Prettier formatting
- Component files named in PascalCase
- Utilities named in camelCase
- CSS classes via Tailwind (avoid inline styles)

### Testing Requirements

| Type | Coverage Target |
|------|-----------------|
| Unit (utils) | 100% |
| Component | 80% |
| Integration | Key flows |
| E2E | Critical paths |

### Performance Budgets

| Metric | Budget |
|--------|--------|
| Initial JS | < 200KB |
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |

---

## Progress Tracking

### Phase 1 Status: Complete

- [x] Project initialized
- [x] Design system configured
- [x] Layout components created
- [x] Shopify client set up

### Phase 2 Status: In Progress

- [x] Home page structure
- [x] Universe cards (basic)
- [x] Drop runway
- [ ] Universe card effects (pending)
- [ ] Data connection verified (pending)

### Phase 3 Status: Not Started

### Phase 4 Status: Not Started

### Phase 5 Status: Not Started

---

## Quick Start Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint

# Type check
pnpm type-check
```

---

## Key Files Reference

| Purpose | File Path |
|---------|-----------|
| Root Layout | `src/app/layout.tsx` |
| Home Page | `src/app/page.tsx` |
| Header | `src/components/layout/Header.tsx` |
| Bottom Nav | `src/components/layout/BottomNav.tsx` |
| Cart Drawer | `src/components/layout/CartDrawer.tsx` |
| Universe Card | `src/components/home/UniverseCard.tsx` |
| Shopify Client | `src/lib/shopify/client.ts` |
| Cart Store | `src/stores/cartStore.ts` |
| UI Store | `src/stores/uiStore.ts` |
| Constants | `src/lib/utils/constants.ts` |

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Shopify Storefront API](https://shopify.dev/api/storefront)
- [Zustand](https://github.com/pmndrs/zustand)
- [Three.js](https://threejs.org/docs/)

