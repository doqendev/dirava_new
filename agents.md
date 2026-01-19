# Neo-Stage Collective — AI Agent Instructions

> **Single Source of Truth for AI Coding Agents and Developers**
> Last Updated: January 2026

---

## TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Design System](#design-system)
5. [Component Specifications](#component-specifications)
6. [Shopify Integration](#shopify-integration)
7. [State Management](#state-management)
8. [Animation Guidelines](#animation-guidelines)
9. [Styling Guidelines](#styling-guidelines)
10. [Testing Requirements](#testing-requirements)
11. [Performance Guidelines](#performance-guidelines)
12. [Accessibility Requirements](#accessibility-requirements)
13. [Deployment Checklist](#deployment-checklist)
14. [Common Patterns](#common-patterns)

---

## PROJECT OVERVIEW

### What We're Building

**Neo-Stage Collective** is a premium anime merchandise e-commerce platform with an immersive, gaming-inspired UI. The platform sells apparel, collectibles, accessories, and limited "drops" organized by anime universes.

### Core Principles

1. **Mobile-First** — Design and build for mobile, then enhance for desktop
2. **Immersive Experience** — The site should feel like entering a gaming universe
3. **Performance** — Fast load times, smooth animations, minimal bundle size
4. **Accessibility** — WCAG 2.1 AA compliance despite dark theme
5. **Type Safety** — Strict TypeScript throughout

### Supported Universes

| Universe | Slug | Theme Color | Glow Effect |
|----------|------|-------------|-------------|
| One Piece | `one-piece` | `#00f5ff` (Cyan) | Underwater portal |
| Demon Slayer | `demon-slayer` | `#ff2d6a` (Pink) | Ember particles |
| Dragon Ball | `dragon-ball` | `#ff8c00` (Orange) | Lightning bolts |
| Hunter x Hunter | `hunter-hunter` | `#00ff88` (Green) | Nen pattern |

---

## TECH STACK

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x+ | Framework (App Router) |
| React | 18.x | UI Library |
| TypeScript | 5.x | Language (strict mode) |
| Tailwind CSS | 3.4+ | Styling |
| Framer Motion | 10.x+ | Animations |
| Three.js | 0.160+ | 3D Effects |
| @react-three/fiber | 8.x | React Three.js bindings |
| @react-three/drei | 9.x | Three.js helpers |
| Zustand | 4.x | State Management |
| graphql-request | 6.x | GraphQL Client |

### Package Manager

```bash
pnpm
```

### Node Version

```
>=18.17.0
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## PROJECT STRUCTURE

```
neo-stage-collective/
├── .env.local                    # Environment variables (git-ignored)
├── .env.example                  # Environment template
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
├── pnpm-lock.yaml               # Lock file
│
├── public/
│   ├── fonts/                    # Self-hosted fonts
│   │   ├── Orbitron/
│   │   ├── Inter/
│   │   └── JetBrainsMono/
│   ├── images/
│   │   ├── universes/           # Universe background images
│   │   └── icons/               # App icons
│   └── favicon.ico
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   ├── globals.css          # Global styles
│   │   ├── loading.tsx          # Root loading state
│   │   ├── error.tsx            # Root error boundary
│   │   ├── not-found.tsx        # 404 page
│   │   │
│   │   ├── worlds/
│   │   │   ├── page.tsx         # All universes
│   │   │   └── [universe]/
│   │   │       ├── page.tsx     # Universe products
│   │   │       └── [product]/
│   │   │           └── page.tsx # Product detail
│   │   │
│   │   ├── drops/
│   │   │   ├── page.tsx         # All drops
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # Drop detail
│   │   │
│   │   ├── cart/
│   │   │   └── page.tsx         # Cart page
│   │   │
│   │   ├── profile/
│   │   │   ├── page.tsx         # Profile
│   │   │   └── orders/
│   │   │       └── page.tsx     # Order history
│   │   │
│   │   └── search/
│   │       └── page.tsx         # Search results
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   └── PageTransition.tsx
│   │   │
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── UniverseGrid.tsx
│   │   │   ├── UniverseCard.tsx
│   │   │   └── DropRunway.tsx
│   │   │
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductQuickAdd.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   ├── ProductInfo.tsx
│   │   │   ├── VariantSelector.tsx
│   │   │   ├── QuantitySelector.tsx
│   │   │   └── AddToCartButton.tsx
│   │   │
│   │   ├── cart/
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   └── CartEmpty.tsx
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Icon.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   ├── effects/
│   │   │   ├── PortalEffect.tsx
│   │   │   ├── LightningEffect.tsx
│   │   │   ├── EmberParticles.tsx
│   │   │   ├── NenPattern.tsx
│   │   │   └── GlowBorder.tsx
│   │   │
│   │   └── search/
│   │       ├── SearchBar.tsx
│   │       ├── SearchResults.tsx
│   │       └── SearchFilters.tsx
│   │
│   ├── lib/
│   │   ├── shopify/
│   │   │   ├── client.ts        # Storefront API client
│   │   │   ├── queries.ts       # GraphQL queries
│   │   │   ├── mutations.ts     # GraphQL mutations
│   │   │   ├── types.ts         # Shopify types
│   │   │   └── utils.ts         # Helpers
│   │   │
│   │   ├── hooks/
│   │   │   ├── useCart.ts
│   │   │   ├── useProduct.ts
│   │   │   ├── useUniverse.ts
│   │   │   └── useMediaQuery.ts
│   │   │
│   │   └── utils/
│   │       ├── cn.ts            # className utility
│   │       ├── formatPrice.ts
│   │       └── constants.ts
│   │
│   ├── stores/
│   │   ├── cartStore.ts
│   │   └── uiStore.ts
│   │
│   └── types/
│       ├── shopify.ts
│       ├── universe.ts
│       └── common.ts
│
└── docs/
    ├── SHOPIFY_SETUP.md
    └── ROADMAP.md
```

---

## DESIGN SYSTEM

### Color Palette

```css
:root {
  /* Backgrounds */
  --bg-primary: #0a0a12;
  --bg-secondary: #0d0d1a;
  --bg-card: rgba(15, 15, 30, 0.8);
  --bg-gradient: linear-gradient(180deg, #0a0a12 0%, #0d1117 50%, #0a0a12 100%);

  /* Neon Accents */
  --neon-cyan: #00f5ff;
  --neon-pink: #ff2d6a;
  --neon-orange: #ff8c00;
  --neon-green: #00ff88;
  --neon-purple: #a855f7;
  --neon-yellow: #ffd700;

  /* Glow Effects */
  --glow-cyan: 0 0 20px rgba(0, 245, 255, 0.5), 0 0 40px rgba(0, 245, 255, 0.3);
  --glow-pink: 0 0 20px rgba(255, 45, 106, 0.5), 0 0 40px rgba(255, 45, 106, 0.3);
  --glow-orange: 0 0 20px rgba(255, 140, 0, 0.5), 0 0 40px rgba(255, 140, 0, 0.3);
  --glow-green: 0 0 20px rgba(0, 255, 136, 0.5), 0 0 40px rgba(0, 255, 136, 0.3);

  /* Text */
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-muted: rgba(255, 255, 255, 0.5);

  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.1);
  --border-radius-card: 12px;
  --border-radius-button: 8px;
  --border-radius-badge: 20px;
}
```

### Tailwind Extension

Add to `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0a12',
          secondary: '#0d0d1a',
          card: 'rgba(15, 15, 30, 0.8)',
        },
        neon: {
          cyan: '#00f5ff',
          pink: '#ff2d6a',
          orange: '#ff8c00',
          green: '#00ff88',
          purple: '#a855f7',
          yellow: '#ffd700',
        },
      },
      fontFamily: {
        display: ['var(--font-orbitron)', 'Rajdhani', 'sans-serif'],
        body: ['var(--font-inter)', 'Roboto', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 245, 255, 0.5), 0 0 40px rgba(0, 245, 255, 0.3)',
        'glow-pink': '0 0 20px rgba(255, 45, 106, 0.5), 0 0 40px rgba(255, 45, 106, 0.3)',
        'glow-orange': '0 0 20px rgba(255, 140, 0, 0.5), 0 0 40px rgba(255, 140, 0, 0.3)',
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.5), 0 0 40px rgba(0, 255, 136, 0.3)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'rotate-slow': 'rotate 20s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        rotate: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

### Typography Scale

| Token | Size | Use Case |
|-------|------|----------|
| `text-xs` | 12px | Badges, labels |
| `text-sm` | 14px | Secondary text, prices |
| `text-base` | 16px | Body text |
| `text-lg` | 18px | Emphasis |
| `text-xl` | 20px | Card titles |
| `text-2xl` | 24px | Section headers |
| `text-3xl` | 32px | Page titles |
| `text-4xl` | 40px | Hero headlines |
| `text-5xl` | 56px | Main headline |

### Spacing Scale

Use Tailwind's default spacing scale (4px base unit):
- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-6`: 24px
- `space-8`: 32px
- `space-12`: 48px
- `space-16`: 64px

---

## COMPONENT SPECIFICATIONS

### Header Component

**File:** `src/components/layout/Header.tsx`

```typescript
interface HeaderProps {
  className?: string
}
```

**Specifications:**
- Height: 64px mobile, 72px desktop
- Position: Fixed top, z-index 50
- Background: `bg-primary` with `backdrop-blur-md`
- Border-bottom: 1px `border-subtle`

**Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Profile]          NEO-STAGE                    [🔍] [🛒]  │
│                     COLLECTIVE                              │
└─────────────────────────────────────────────────────────────┘
```

**Implementation Notes:**
- Profile button: 40x40px, circular, cyan border, cyan glow on hover
- Logo: `font-display`, "NEO-STAGE" larger, "COLLECTIVE" smaller with 4px letter-spacing
- Icons: 24px, `text-muted` default, `neon-cyan` on hover
- Cart badge: Absolute positioned, `neon-cyan` background, black text

---

### BottomNav Component

**File:** `src/components/layout/BottomNav.tsx`

```typescript
interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
}

interface BottomNavProps {
  className?: string
}
```

**Specifications:**
- Height: 72px + safe area (env(safe-area-inset-bottom))
- Position: Fixed bottom, z-index 50
- Background: `bg-primary` with `backdrop-blur-xl`
- Border-top: 1px `border-subtle`
- Display: flex, justify-around, items-center
- Visible: Only on screens < 1024px

**Navigation Items:**
| Icon | Label | Route |
|------|-------|-------|
| House | HOME | `/` |
| Globe | WORLDS | `/worlds` |
| Box | DROPS | `/drops` |
| User | PROFILE | `/profile` |

**Active State:**
- Icon: `neon-cyan`
- Label: `neon-cyan`
- Underline: 24px wide, 3px height, `neon-cyan`, animated in

**Inactive State:**
- Icon: `text-muted`
- Label: `text-muted`

---

### UniverseCard Component

**File:** `src/components/home/UniverseCard.tsx`

```typescript
interface UniverseCardProps {
  universe: {
    slug: string
    name: string
    itemCount: number
    themeColor: 'cyan' | 'pink' | 'orange' | 'green'
    backgroundImage?: string
  }
  className?: string
}
```

**Specifications:**
- Aspect ratio: 3:4 (portrait)
- Border-radius: 12px
- Border: 2px solid (themed color)
- Box-shadow: themed glow
- Overflow: hidden
- Position: relative

**Internal Structure:**
```
┌──────────────────────────────┐
│      [Background Effect]      │
│                               │
│         UNIVERSE              │
│           NAME                │
│                               │
│        (X items)              │
│                               │
│        [ ENTER ]              │
└──────────────────────────────┘
```

**Theme Mapping:**

```typescript
const UNIVERSE_THEMES = {
  'one-piece': {
    color: 'cyan',
    borderColor: 'border-neon-cyan',
    glowClass: 'shadow-glow-cyan',
    bgEffect: 'PortalEffect',
  },
  'demon-slayer': {
    color: 'pink',
    borderColor: 'border-neon-pink',
    glowClass: 'shadow-glow-pink',
    bgEffect: 'EmberParticles',
  },
  'dragon-ball': {
    color: 'orange',
    borderColor: 'border-neon-orange',
    glowClass: 'shadow-glow-orange',
    bgEffect: 'LightningEffect',
  },
  'hunter-hunter': {
    color: 'green',
    borderColor: 'border-neon-green',
    glowClass: 'shadow-glow-green',
    bgEffect: 'NenPattern',
  },
} as const
```

**Hover Effects:**
- Card: `translateY(-4px)`, increased glow intensity
- Button: Scale 1.05, background opacity increase

---

### ProductCard Component

**File:** `src/components/product/ProductCard.tsx`

```typescript
interface ProductCardProps {
  product: {
    id: string
    handle: string
    title: string
    price: string
    compareAtPrice?: string
    image: {
      url: string
      altText: string
    }
    universe?: string
  }
  showQuickAdd?: boolean
  className?: string
}
```

**Specifications:**
- Width: 160px (in carousel), responsive in grid
- Border-radius: 12px
- Background: Holographic gradient effect
- Padding: 8px

**Image:**
- Aspect ratio: 1:1
- Border-radius: 8px
- Object-fit: cover

**Info:**
- Title: 14px, medium weight, white, single line with ellipsis
- Price: 14px, semibold, `neon-cyan`
- Compare price: 12px, `text-muted`, line-through

---

### DropRunway Component

**File:** `src/components/home/DropRunway.tsx`

```typescript
interface DropRunwayProps {
  products: Product[]
  title?: string
  className?: string
}
```

**Specifications:**
- Horizontal scroll with snap points
- Gap: 12px
- Padding: 16px horizontal
- Hide scrollbar
- Scroll-snap-type: x mandatory

**Header:**
- Title: "DROP RUNWAY", `font-display`, 14px, letter-spacing 3px
- Navigation arrows on right

**Progress Indicator:**
- Full width line below carousel
- Active segment fills based on scroll position

---

### CartDrawer Component

**File:** `src/components/layout/CartDrawer.tsx`

```typescript
interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}
```

**Specifications:**
- Type: Slide-in drawer from right
- Width: 100% mobile, 400px desktop
- Background: `bg-primary`
- z-index: 60
- Animation: Slide in 300ms ease-out

**Structure:**
```
┌──────────────────────────────────┐
│  YOUR CART (3)            [✕]   │
├──────────────────────────────────┤
│  ┌────┐                          │
│  │    │ Product Name             │
│  │    │ Size: M                  │
│  │    │ [-] 1 [+]      $29.99    │
│  └────┘                     [🗑] │
│  ─────────────────────────────── │
│  ...more items...                │
├──────────────────────────────────┤
│  Subtotal              $89.97    │
│                                  │
│  [ CONTINUE TO CHECKOUT ]        │
│                                  │
│      Continue Shopping →         │
└──────────────────────────────────┘
```

---

### Button Component

**File:** `src/components/ui/Button.tsx`

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  glow?: 'cyan' | 'pink' | 'orange' | 'green' | 'none'
  isLoading?: boolean
  children: React.ReactNode
}
```

**Variants:**

| Variant | Background | Border | Text |
|---------|------------|--------|------|
| primary | `neon-cyan` | none | black |
| secondary | transparent | 1px `neon-cyan` | `neon-cyan` |
| ghost | transparent | none | white |
| outline | `bg-card` | 1px `border-subtle` | white |

**Sizes:**

| Size | Padding | Font Size |
|------|---------|-----------|
| sm | 6px 12px | 12px |
| md | 8px 16px | 14px |
| lg | 12px 24px | 16px |

**States:**
- Hover: Scale 1.05, glow effect
- Active: Scale 0.95
- Disabled: Opacity 0.5, cursor not-allowed
- Loading: Spinner icon, disabled state

---

## SHOPIFY INTEGRATION

### Client Setup

**File:** `src/lib/shopify/client.ts`

```typescript
import { GraphQLClient } from 'graphql-request'

const endpoint = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`

export const shopifyClient = new GraphQLClient(endpoint, {
  headers: {
    'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
    'Content-Type': 'application/json',
  },
})
```

### Required Metafields

**Product Metafields (namespace: `neo_stage`):**

| Key | Type | Values |
|-----|------|--------|
| `universe` | `single_line_text` | `one-piece`, `demon-slayer`, `dragon-ball`, `hunter-hunter` |
| `is_drop` | `boolean` | `true`, `false` |
| `drop_date` | `date_time` | ISO 8601 |
| `drop_end_date` | `date_time` | ISO 8601 |
| `rarity` | `single_line_text` | `common`, `rare`, `legendary` |

**Collection Metafields (namespace: `neo_stage`):**

| Key | Type | Description |
|-----|------|-------------|
| `universe` | `single_line_text` | Universe slug |
| `theme_color` | `color` | Hex color |
| `card_background_image` | `file_reference` | Background image |

### GraphQL Queries

**File:** `src/lib/shopify/queries.ts`

```typescript
// Get all universes (collections)
export const GET_UNIVERSES = gql`
  query GetUniverses {
    collections(first: 10, query: "metafield.neo_stage.universe:*") {
      edges {
        node {
          id
          handle
          title
          description
          image {
            url
            altText
          }
          metafield(namespace: "neo_stage", key: "universe") {
            value
          }
          products(first: 1) {
            totalCount
          }
        }
      }
    }
  }
`

// Get products for universe
export const GET_UNIVERSE_PRODUCTS = gql`
  query GetUniverseProducts($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      id
      title
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            handle
            title
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url
              altText
            }
            metafield(namespace: "neo_stage", key: "rarity") {
              value
            }
          }
        }
      }
    }
  }
`

// Get single product
export const GET_PRODUCT = gql`
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
      metafields(identifiers: [
        { namespace: "neo_stage", key: "universe" },
        { namespace: "neo_stage", key: "rarity" }
      ]) {
        key
        value
      }
    }
  }
`

// Get drop products
export const GET_DROP_PRODUCTS = gql`
  query GetDropProducts($first: Int!) {
    products(first: $first, query: "metafield.neo_stage.is_drop:true") {
      edges {
        node {
          id
          handle
          title
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            url
            altText
          }
          metafield(namespace: "neo_stage", key: "drop_date") {
            value
          }
        }
      }
    }
  }
`
```

### GraphQL Mutations

**File:** `src/lib/shopify/mutations.ts`

```typescript
// Create cart
export const CREATE_CART = gql`
  mutation CreateCart {
    cartCreate {
      cart {
        id
        checkoutUrl
      }
    }
  }
`

// Add to cart
export const ADD_TO_CART = gql`
  mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

// Update cart line
export const UPDATE_CART_LINE = gql`
  mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

// Remove from cart
export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
            }
          }
        }
      }
    }
  }
`
```

---

## STATE MANAGEMENT

### Cart Store

**File:** `src/stores/cartStore.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartLine {
  id: string
  quantity: number
  merchandise: {
    id: string
    title: string
    price: { amount: string; currencyCode: string }
    product: {
      title: string
      handle: string
      featuredImage: { url: string; altText: string }
    }
  }
}

interface CartState {
  cartId: string | null
  checkoutUrl: string | null
  lines: CartLine[]
  totalQuantity: number
  subtotal: { amount: string; currencyCode: string } | null
  isLoading: boolean

  // Actions
  setCart: (cart: Partial<CartState>) => void
  addItem: (variantId: string, quantity: number) => Promise<void>
  updateItem: (lineId: string, quantity: number) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      checkoutUrl: null,
      lines: [],
      totalQuantity: 0,
      subtotal: null,
      isLoading: false,

      setCart: (cart) => set((state) => ({ ...state, ...cart })),

      addItem: async (variantId, quantity) => {
        // Implementation calls Shopify mutation
      },

      updateItem: async (lineId, quantity) => {
        // Implementation calls Shopify mutation
      },

      removeItem: async (lineId) => {
        // Implementation calls Shopify mutation
      },

      clearCart: () => set({
        cartId: null,
        checkoutUrl: null,
        lines: [],
        totalQuantity: 0,
        subtotal: null,
      }),
    }),
    {
      name: 'neo-stage-cart',
      partialize: (state) => ({ cartId: state.cartId }),
    }
  )
)
```

### UI Store

**File:** `src/stores/uiStore.ts`

```typescript
import { create } from 'zustand'

interface UIState {
  isCartOpen: boolean
  isSearchOpen: boolean
  isMobileMenuOpen: boolean
  activeUniverse: string | null

  // Actions
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  openSearch: () => void
  closeSearch: () => void
  setActiveUniverse: (universe: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isSearchOpen: false,
  isMobileMenuOpen: false,
  activeUniverse: null,

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  setActiveUniverse: (universe) => set({ activeUniverse: universe }),
}))
```

---

## ANIMATION GUIDELINES

### Framer Motion Defaults

```typescript
// src/lib/utils/motion.ts

export const easings = {
  easeOut: [0.16, 1, 0.3, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
}

export const transitions = {
  fast: { duration: 0.15 },
  normal: { duration: 0.25 },
  slow: { duration: 0.4 },
  page: { duration: 0.3, ease: easings.easeOut },
}

export const variants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideRight: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
}
```

### Micro-interactions

| Element | Trigger | Animation |
|---------|---------|-----------|
| Button | hover | `scale: 1.05`, glow increase |
| Button | tap | `scale: 0.95` |
| Card | hover | `y: -4px`, shadow increase |
| Icon | hover | `scale: 1.1`, color to cyan |
| Nav item | active | underline slide-in |
| Cart badge | item added | pop scale (1.2 → 1) |

### Page Transitions

```typescript
// In layout or page component
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 10 }}
  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
>
  {children}
</motion.div>
```

### Reduced Motion

Always respect user preferences:

```typescript
import { useReducedMotion } from 'framer-motion'

function Component() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      animate={{ x: shouldReduceMotion ? 0 : 100 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
    />
  )
}
```

---

## STYLING GUIDELINES

### Class Naming Convention

Use Tailwind CSS with `cn()` utility for conditional classes:

```typescript
// src/lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Component Styling Pattern

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  className?: string
}

function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-lg font-medium transition-all',
        // Variant styles
        variant === 'primary' && 'bg-neon-cyan text-black hover:shadow-glow-cyan',
        variant === 'secondary' && 'border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10',
        // Custom classes
        className
      )}
      {...props}
    />
  )
}
```

### Global Styles

**File:** `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary: #0a0a12;
    --bg-secondary: #0d0d1a;
    --neon-cyan: #00f5ff;
    --neon-pink: #ff2d6a;
    --neon-orange: #ff8c00;
    --neon-green: #00ff88;
  }

  html {
    @apply bg-bg-primary text-white antialiased;
  }

  body {
    @apply min-h-screen;
  }

  /* Hide scrollbar but allow scrolling */
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
}

@layer utilities {
  .text-glow-cyan {
    text-shadow: 0 0 10px rgba(0, 245, 255, 0.5);
  }

  .text-glow-pink {
    text-shadow: 0 0 10px rgba(255, 45, 106, 0.5);
  }
}
```

---

## TESTING REQUIREMENTS

### Testing Stack

- **Unit Tests:** Vitest
- **Component Tests:** React Testing Library
- **E2E Tests:** Playwright

### Test Coverage Requirements

| Area | Coverage |
|------|----------|
| UI Components | 80% |
| Hooks | 90% |
| Utilities | 100% |
| Stores | 90% |

### Component Testing Pattern

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies primary variant styles by default', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-neon-cyan')
  })
})
```

---

## PERFORMANCE GUIDELINES

### Target Metrics

| Metric | Target |
|--------|--------|
| Lighthouse Performance | 90+ |
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| Initial JS Bundle | < 200KB |

### Optimization Techniques

1. **Image Optimization**
   - Use Next.js `<Image>` component
   - WebP format with fallbacks
   - Lazy loading below fold
   - Blur-up placeholders

2. **Code Splitting**
   - Dynamic imports for heavy components
   - Route-based splitting (automatic in App Router)

3. **Caching Strategy**
   - ISR for product pages (revalidate: 60)
   - Static generation for home page
   - SWR/React Query for client data

4. **Font Loading**
   - Self-host fonts
   - Use `next/font` for optimization
   - Subset fonts if possible

```typescript
// src/app/layout.tsx
import { Orbitron, Inter, JetBrains_Mono } from 'next/font/google'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})
```

---

## ACCESSIBILITY REQUIREMENTS

### WCAG 2.1 AA Compliance

1. **Color Contrast**
   - Normal text: 4.5:1 minimum
   - Large text: 3:1 minimum
   - UI components: 3:1 minimum

2. **Keyboard Navigation**
   - All interactive elements focusable
   - Logical tab order
   - Visible focus indicators
   - Skip links to main content

3. **Screen Readers**
   - Semantic HTML
   - ARIA labels for icons
   - Live regions for dynamic content
   - Meaningful alt text

4. **Focus Indicators**

```css
/* Styled focus that matches theme */
.focus-visible:focus-visible {
  @apply outline-none ring-2 ring-neon-cyan ring-offset-2 ring-offset-bg-primary;
}
```

5. **Reduced Motion**

```typescript
// Check user preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// In Tailwind
<div className="motion-safe:animate-pulse" />
```

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] All environment variables set in Vercel
- [ ] Shopify storefront access token configured
- [ ] Metafields created in Shopify
- [ ] Collections created and tagged
- [ ] Products tagged with universe metafield
- [ ] Drop products marked with is_drop metafield

### Vercel Configuration

- [ ] Node.js 18.x runtime
- [ ] Build command: `pnpm build`
- [ ] Output directory: `.next`
- [ ] Install command: `pnpm install`

### Performance Checks

- [ ] Lighthouse audit passed (90+ all categories)
- [ ] Bundle analyzer reviewed
- [ ] Images optimized
- [ ] Fonts preloaded

### Functionality Checks

- [ ] Cart operations working
- [ ] Checkout redirect working
- [ ] All universe pages loading
- [ ] Product pages loading
- [ ] Search working
- [ ] Mobile navigation working
- [ ] Responsive design verified

### SEO Checks

- [ ] Meta tags configured
- [ ] Open Graph tags
- [ ] Sitemap generated
- [ ] Robots.txt configured

---

## COMMON PATTERNS

### Data Fetching (Server Components)

```typescript
// app/worlds/[universe]/page.tsx
import { shopifyClient } from '@/lib/shopify/client'
import { GET_UNIVERSE_PRODUCTS } from '@/lib/shopify/queries'

interface Props {
  params: { universe: string }
}

export default async function UniversePage({ params }: Props) {
  const data = await shopifyClient.request(GET_UNIVERSE_PRODUCTS, {
    handle: params.universe,
    first: 12,
  })

  return <ProductGrid products={data.collection.products.edges} />
}
```

### Client Component with Store

```typescript
'use client'

import { useCartStore } from '@/stores/cartStore'
import { useUIStore } from '@/stores/uiStore'

export function AddToCartButton({ variantId }: { variantId: string }) {
  const { addItem, isLoading } = useCartStore()
  const { openCart } = useUIStore()

  const handleAdd = async () => {
    await addItem(variantId, 1)
    openCart()
  }

  return (
    <Button onClick={handleAdd} disabled={isLoading}>
      {isLoading ? 'Adding...' : 'Add to Cart'}
    </Button>
  )
}
```

### Universe Theming Hook

```typescript
// src/lib/hooks/useUniverse.ts
import { useMemo } from 'react'

const UNIVERSE_CONFIG = {
  'one-piece': {
    color: '#00f5ff',
    name: 'One Piece',
    glow: 'shadow-glow-cyan',
    border: 'border-neon-cyan',
  },
  'demon-slayer': {
    color: '#ff2d6a',
    name: 'Demon Slayer',
    glow: 'shadow-glow-pink',
    border: 'border-neon-pink',
  },
  // ... etc
} as const

export function useUniverse(slug: string) {
  return useMemo(() => {
    return UNIVERSE_CONFIG[slug as keyof typeof UNIVERSE_CONFIG] ?? null
  }, [slug])
}
```

### Price Formatting

```typescript
// src/lib/utils/formatPrice.ts
export function formatPrice(amount: string | number, currencyCode = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(typeof amount === 'string' ? parseFloat(amount) : amount)
}
```

---

## QUICK REFERENCE

### File Creation Checklist

When creating a new component:

1. Create the component file in appropriate directory
2. Define TypeScript interface for props
3. Add `'use client'` directive if using hooks/state
4. Import `cn` utility for conditional classes
5. Export component as named export
6. Add to barrel export if applicable

### Import Order

```typescript
// 1. React/Next imports
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// 2. Third-party imports
import { motion } from 'framer-motion'

// 3. Internal imports - absolute paths
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/stores/cartStore'
import { cn } from '@/lib/utils/cn'

// 4. Types
import type { Product } from '@/types/shopify'

// 5. Styles (if CSS modules)
import styles from './Component.module.css'
```

### Environment Variables

```env
# Required
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=xxxxx

# Optional
NEXT_PUBLIC_SITE_URL=https://neo-stage.com
NEXT_PUBLIC_SITE_NAME=Neo-Stage Collective
NEXT_PUBLIC_GA_ID=G-XXXXX
```

---

**END OF AGENTS.MD**
