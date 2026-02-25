# MASTER PROMPT: Mizoke â€” Complete Technical Specification Request

## PROJECT CONTEXT

I am building **Mizoke**, an anime merchandise e-commerce platform with an immersive, gaming-inspired UI. The platform sells apparel, collectibles, accessories, and limited "drops" organized by anime universes (One Piece, Demon Slayer, Dragon Ball, Hunter x Hunter, etc.).

I need you to generate a **complete, production-ready `agents.md`** file and full technical specification that will serve as the single source of truth for AI coding agents and developers building this project.

---

## TECH STACK (MANDATORY)

```
Frontend:        Next.js 14+ (App Router)
Commerce:        Shopify Headless (Storefront API + GraphQL)
Styling:         Tailwind CSS + CSS Variables for theming
Animations:      Framer Motion
3D/Effects:      Three.js (for portal effects), CSS for glows
State:           Zustand (cart, UI state)
Auth:            Shopify Customer Account API
Payments:        Shopify Checkout
Deployment:      Vercel
Package Manager: pnpm
Language:        TypeScript (strict mode)
```

---

## DESIGN SYSTEM SPECIFICATION

### Brand Identity
- **Name:** Mizoke
- **Tagline:** "Drops, bundles, and collectibles â€” tap a universe."
- **Aesthetic:** Cyberpunk/gaming meets anime culture. Neon glows, dark immersive backgrounds, card-based UI, portal/dimensional gateway motifs.

### Color Palette (Extract exact values)

```css
:root {
  /* Backgrounds */
  --bg-primary: #0a0a12;           /* Deep space black */
  --bg-secondary: #0d0d1a;         /* Slightly lighter black */
  --bg-card: rgba(15, 15, 30, 0.8); /* Card backgrounds with transparency */
  --bg-gradient: linear-gradient(180deg, #0a0a12 0%, #0d1117 50%, #0a0a12 100%);

  /* Neon Accent Colors */
  --neon-cyan: #00f5ff;            /* Primary accent - used for One Piece, active states */
  --neon-pink: #ff2d6a;            /* Secondary - Demon Slayer theme */
  --neon-orange: #ff8c00;          /* Tertiary - Dragon Ball theme */
  --neon-green: #00ff88;           /* Quaternary - Hunter x Hunter theme */
  --neon-purple: #a855f7;          /* Supporting accent */
  --neon-yellow: #ffd700;          /* Highlights, lightning effects */

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
  --border-glow: 2px solid;
  --border-radius-card: 12px;
  --border-radius-button: 8px;
  --border-radius-badge: 20px;
}
```

### Typography

```css
/* Font Stack */
--font-display: 'Orbitron', 'Rajdhani', sans-serif;  /* Headers, logo, universe titles */
--font-body: 'Inter', 'Roboto', sans-serif;          /* Body text, descriptions */
--font-mono: 'JetBrains Mono', monospace;            /* Prices, counts */

/* Scale */
--text-xs: 0.75rem;      /* 12px - badges, labels */
--text-sm: 0.875rem;     /* 14px - secondary text */
--text-base: 1rem;       /* 16px - body */
--text-lg: 1.125rem;     /* 18px - emphasis */
--text-xl: 1.25rem;      /* 20px - card titles */
--text-2xl: 1.5rem;      /* 24px - section headers */
--text-3xl: 2rem;        /* 32px - page titles */
--text-4xl: 2.5rem;      /* 40px - hero headlines */
--text-5xl: 3.5rem;      /* 56px - main headline "CHOOSE YOUR WORLD" */
```

### Spacing System

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

---

## UI COMPONENTS â€” EXACT SPECIFICATIONS

### 1. TOP NAVIGATION BAR (Header)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  [ðŸ‘¤]          MIZOKE                    [ðŸ”]  [ðŸ›’]     â”‚
â”‚                COLLECTIVE                                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Specifications:**
- **Height:** 64px (mobile), 72px (desktop)
- **Background:** `var(--bg-primary)` with subtle blur backdrop (`backdrop-filter: blur(10px)`)
- **Position:** Fixed top, z-index: 50
- **Padding:** 16px horizontal

**Left Section:**
- Profile avatar button
- Size: 40px Ã— 40px
- Border: 2px solid `var(--neon-cyan)`
- Border-radius: 50%
- Background: `var(--bg-secondary)`
- Icon: Generic user silhouette (cyan colored)
- Glow on hover: `var(--glow-cyan)`

**Center Section:**
- Logo text "MIZOKE" (primary, larger)
- Subtitle "COLLECTIVE" (smaller, letter-spaced)
- Font: `var(--font-display)`
- Color: `var(--neon-cyan)` with subtle text-shadow glow
- Letter-spacing: 4px on "COLLECTIVE"

**Right Section:**
- Search icon button (24px)
- Cart icon button (24px) with badge for item count
- Gap: 16px between icons
- Icons: Outlined style, cyan color
- Hover: Scale 1.1 + glow effect

---

### 2. BOTTOM NAVIGATION BAR (Mobile Tab Bar)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                                             â”‚
â”‚    ðŸ           ðŸŒ          ðŸ“¦          ðŸ‘¤                   â”‚
â”‚   HOME       WORLDS       DROPS      PROFILE      âœ¦        â”‚
â”‚   â”€â”€â”€â”€                                                      â”‚
â”‚  (active)                                                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Specifications:**
- **Height:** 72px + safe area padding for iOS
- **Background:** `var(--bg-primary)` with `backdrop-filter: blur(20px)`
- **Border-top:** 1px solid rgba(255, 255, 255, 0.1)
- **Position:** Fixed bottom, z-index: 50
- **Display:** Flex, justify-content: space-around, align-items: center

**Navigation Items (4 main + 1 floating accent):**

| Item | Icon | Label | Route |
|------|------|-------|-------|
| Home | House outline | HOME | `/` |
| Worlds | Globe/grid icon | WORLDS | `/worlds` |
| Drops | Box/package icon | DROPS | `/drops` |
| Profile | User outline | PROFILE | `/profile` |

**Active State:**
- Icon color: `var(--neon-cyan)`
- Label color: `var(--neon-cyan)`
- Underline indicator: 24px wide, 3px height, `var(--neon-cyan)`, positioned below label
- Subtle glow effect on icon

**Inactive State:**
- Icon color: `var(--text-muted)`
- Label color: `var(--text-muted)`

**Floating Accent Element:**
- Small decorative star/sparkle icon (âœ¦) positioned near Profile
- Color: `var(--text-muted)`
- Size: 16px
- Subtle floating animation

**Typography:**
- Labels: 10px, font-weight: 500, uppercase
- Letter-spacing: 0.5px

---

### 3. UNIVERSE CARDS (World Selection)

**Grid Layout:**
- 2 columns on mobile
- Gap: 16px
- Padding: 16px horizontal

**Individual Card Specs:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚                          â”‚ â”‚  â† Themed background
â”‚ â”‚      [PORTAL EFFECT]     â”‚ â”‚     (unique per universe)
â”‚ â”‚                          â”‚ â”‚
â”‚ â”‚      â•”â•â•â•â•â•â•â•â•â•â•â•â•—       â”‚ â”‚
â”‚ â”‚      â•‘  ONE      â•‘       â”‚ â”‚  â† Title (display font)
â”‚ â”‚      â•‘  PIECE    â•‘       â”‚ â”‚
â”‚ â”‚      â•šâ•â•â•â•â•â•â•â•â•â•â•â•       â”‚ â”‚
â”‚ â”‚                          â”‚ â”‚
â”‚ â”‚      (12 items)          â”‚ â”‚  â† Item count badge
â”‚ â”‚                          â”‚ â”‚
â”‚ â”‚      [ ENTER ]           â”‚ â”‚  â† CTA button
â”‚ â”‚                          â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚         GLOW BORDER          â”‚  â† Animated border glow
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Card Container:**
- Aspect ratio: 3:4 (portrait)
- Border-radius: 12px
- Border: 2px solid (themed color)
- Box-shadow: themed glow effect
- Overflow: hidden
- Position: relative

**Universe-Specific Themes:**

| Universe | Border Color | Glow Color | Background Effect |
|----------|--------------|------------|-------------------|
| One Piece | `var(--neon-cyan)` | `var(--glow-cyan)` | Underwater portal with golden ring, floating merch preview cards |
| Demon Slayer | `var(--neon-pink)` | `var(--glow-pink)` | Dark red/pink gradient, floating ember particles |
| Dragon Ball | `var(--neon-orange)` | `var(--glow-orange)` | Lightning bolts, energy aura effect |
| Hunter x Hunter | `var(--neon-green)` | `var(--glow-green)` | Geometric nen pattern, purple/green gradient |

**Title Treatment:**
- Font: `var(--font-display)`
- Size: 24px mobile, 32px desktop
- Weight: 700
- Color: white with subtle text-shadow
- Text-transform: uppercase
- May include small universe icon (e.g., skull and crossbones for One Piece)

**Item Count Badge:**
- Background: rgba(0, 0, 0, 0.6)
- Border: 1px solid themed color
- Border-radius: 20px
- Padding: 4px 12px
- Font-size: 12px
- Color: themed color

**Enter Button:**
- Background: themed color (semi-transparent, ~20% opacity)
- Border: 1px solid themed color
- Border-radius: 8px
- Padding: 8px 24px
- Font: `var(--font-display)`, 12px, uppercase, letter-spacing: 2px
- Color: themed color
- Hover: Background opacity increases, scale: 1.05

**Animation Requirements:**
- Card hover: Subtle lift (translateY: -4px) + increased glow
- Border: Animated gradient flow (optional)
- Background elements: Subtle parallax on mouse move (desktop)
- Portal effect (One Piece): Rotating ring animation

---

### 4. DROP RUNWAY (Horizontal Product Carousel)

```
DROP RUNWAY                                        < >
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ [IMAGE] â”‚ â”‚ [IMAGE] â”‚ â”‚ [IMAGE] â”‚ â”‚ [IMAGE] â”‚ ...
â”‚         â”‚ â”‚         â”‚ â”‚         â”‚ â”‚         â”‚
â”‚ Name    â”‚ â”‚ Name    â”‚ â”‚ Name    â”‚ â”‚ Name    â”‚
â”‚ $XX.XX  â”‚ â”‚ $XX.XX  â”‚ â”‚ $XX.XX  â”‚ â”‚ $XX.XX  â”‚
â”‚  +ADD   â”‚ â”‚         â”‚ â”‚         â”‚ â”‚         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
â•â•â•â•â•â•â•â•â•â•â•
(progress indicator)
```

**Section Header:**
- "DROP RUNWAY" - Font: `var(--font-display)`, 14px, letter-spacing: 3px
- Color: `var(--text-secondary)`
- Navigation arrows: `<` `>` on right side, 24px, outline style

**Carousel Container:**
- Horizontal scroll with snap points
- Gap: 12px
- Padding: 16px horizontal
- Hide scrollbar (styled for WebKit)
- Scroll-snap-type: x mandatory

**Product Cards:**
- Width: 160px fixed
- Border-radius: 12px
- Background: Linear gradient with iridescent/holographic effect (rainbow subtle shimmer)
- Padding: 8px
- Scroll-snap-align: start

**Product Image:**
- Aspect ratio: 1:1
- Border-radius: 8px
- Object-fit: cover
- Background: `var(--bg-secondary)`

**Product Info:**
- Name: 14px, font-weight: 500, white, single line with ellipsis
- Price: 14px, font-weight: 600, `var(--neon-cyan)`

**Quick Add Button (+ADD):**
- Appears on active/focused card
- Position: Absolute, top-right of image
- Background: `var(--neon-cyan)`
- Color: black
- Border-radius: 6px
- Padding: 4px 8px
- Font-size: 10px, font-weight: 700

**Progress Indicator:**
- Horizontal line below carousel
- Total width: Full container
- Active segment: `var(--neon-cyan)`, width proportional to scroll position
- Inactive: `var(--bg-secondary)`

---

### 5. PRODUCT DETAIL PAGE

**Layout:**
- Full-screen immersive view
- Dark gradient background matching universe theme
- Floating/layered design

**Components:**
- Back button (top-left)
- Product image gallery (swipeable, with zoom)
- Universe badge
- Product title
- Price (with original price if on sale)
- Variant selectors (size, color) - pill/chip style with glow on selected
- Quantity selector
- "Add to Cart" button - full width, themed glow
- "Buy Now" button - secondary style
- Product description (expandable)
- Related products carousel

---

### 6. CART DRAWER/MODAL

**Trigger:** Cart icon in header
**Type:** Slide-in drawer from right (mobile), modal (desktop)

**Components:**
- Header: "YOUR CART" + close button + item count
- Cart items list:
  - Product thumbnail (60px)
  - Name + variant
  - Quantity controls (+/-)
  - Line item price
  - Remove button
- Subtotal
- "Continue to Checkout" button (full width, cyan glow)
- "Continue Shopping" link

---

## PAGE STRUCTURE & ROUTES

```
/                           â†’ Home (Universe selection + Drop Runway)
/worlds                     â†’ All universes grid view
/worlds/[universe-slug]     â†’ Universe landing page (e.g., /worlds/one-piece)
/worlds/[universe]/[product]â†’ Product detail page
/drops                      â†’ Limited drops / new releases
/drops/[drop-slug]          â†’ Individual drop detail
/collections/[handle]       â†’ Shopify collection page
/products/[handle]          â†’ Product detail (alternate route)
/cart                       â†’ Full cart page (fallback for drawer)
/checkout                   â†’ Shopify checkout (redirect)
/profile                    â†’ User profile (requires auth)
/profile/orders             â†’ Order history
/profile/wishlist           â†’ Saved items
/search                     â†’ Search results page
/search?q=[query]           â†’ Search with query
```

---

## DATA MODELS & SHOPIFY INTEGRATION

### Shopify Metafields Required

**Product Metafields:**
```
namespace: neo_stage
- universe (single_line_text): "one-piece" | "demon-slayer" | "dragon-ball" | "hunter-hunter"
- is_drop (boolean): true/false
- drop_date (date_time): When the drop goes live
- drop_end_date (date_time): When drop ends (for countdown)
- rarity (single_line_text): "common" | "rare" | "legendary"
```

**Collection Metafields:**
```
namespace: neo_stage
- universe (single_line_text): Universe slug
- theme_color (color): Hex color for theming
- card_background_image (file_reference): Background for universe card
- description_long (multi_line_text): Extended description
```

### GraphQL Queries Needed

1. **Homepage Query:**
   - All collections with `neo_stage.universe` metafield
   - Latest 10 products with `neo_stage.is_drop: true`
   - Featured products

2. **Universe Page Query:**
   - Collection by handle
   - Products in collection (paginated, 12 per page)
   - Filters: product type, price range, availability

3. **Product Detail Query:**
   - Product by handle
   - Variants with inventory
   - Related products (same universe)
   - Metafields

4. **Cart Operations:**
   - Create cart
   - Add to cart
   - Update cart line
   - Remove from cart
   - Get cart

5. **Search Query:**
   - Predictive search
   - Full search with filters

---

## ANIMATION SPECIFICATIONS

### Micro-interactions

| Element | Trigger | Animation |
|---------|---------|-----------|
| Buttons | Hover | Scale 1.05, glow intensity increase |
| Buttons | Click/Tap | Scale 0.95, quick bounce back |
| Cards | Hover | translateY(-4px), shadow increase |
| Icons | Hover | Scale 1.1, color to cyan |
| Nav items | Active | Underline slides in, icon glows |
| Cart badge | Item added | Pop scale animation |
| Quick add | Success | Check mark morphs from plus |

### Page Transitions

- Route change: Fade + subtle slide (200ms ease-out)
- Modal open: Fade in + scale from 0.95 (250ms)
- Drawer open: Slide from right (300ms ease-out)
- Drawer close: Slide to right (200ms ease-in)

### Loading States

- Skeleton screens with shimmer effect (gradient animation)
- Universe cards: Pulsing glow while loading
- Images: Blur-up technique (tiny placeholder â†’ full image)

### Special Effects

**Portal Effect (One Piece card):**
- Golden ring: Continuous rotation (20s linear infinite)
- Inner swirl: Counter-rotation with opacity pulse
- Floating product cards: Gentle bob animation

**Lightning Effect (Dragon Ball card):**
- SVG lightning bolts with stroke-dasharray animation
- Random flicker timing
- Brief flash on card hover

**Ember Particles (Demon Slayer card):**
- Canvas or CSS particles floating upward
- Random sizes, speeds, opacity
- 15-20 particles active

**Nen Pattern (Hunter x Hunter card):**
- Geometric shapes with subtle pulse
- Color shift between green and purple
- Rotate on hover

---

## COMPONENT ARCHITECTURE

```
src/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ layout.tsx                 # Root layout with providers
â”‚   â”œâ”€â”€ page.tsx                   # Home page
â”‚   â”œâ”€â”€ worlds/
â”‚   â”‚   â”œâ”€â”€ page.tsx               # Worlds listing
â”‚   â”‚   â””â”€â”€ [universe]/
â”‚   â”‚       â”œâ”€â”€ page.tsx           # Universe products
â”‚   â”‚       â””â”€â”€ [product]/
â”‚   â”‚           â””â”€â”€ page.tsx       # Product detail
â”‚   â”œâ”€â”€ drops/
â”‚   â”‚   â”œâ”€â”€ page.tsx               # Drops listing
â”‚   â”‚   â””â”€â”€ [slug]/
â”‚   â”‚       â””â”€â”€ page.tsx           # Drop detail
â”‚   â”œâ”€â”€ cart/
â”‚   â”‚   â””â”€â”€ page.tsx               # Cart page
â”‚   â”œâ”€â”€ profile/
â”‚   â”‚   â”œâ”€â”€ page.tsx               # Profile
â”‚   â”‚   â””â”€â”€ orders/
â”‚   â”‚       â””â”€â”€ page.tsx           # Order history
â”‚   â””â”€â”€ search/
â”‚       â””â”€â”€ page.tsx               # Search results
â”‚
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ layout/
â”‚   â”‚   â”œâ”€â”€ Header.tsx             # Top navigation
â”‚   â”‚   â”œâ”€â”€ BottomNav.tsx          # Mobile bottom navigation
â”‚   â”‚   â”œâ”€â”€ CartDrawer.tsx         # Slide-out cart
â”‚   â”‚   â””â”€â”€ MobileMenu.tsx         # Mobile menu (if needed)
â”‚   â”‚
â”‚   â”œâ”€â”€ home/
â”‚   â”‚   â”œâ”€â”€ HeroSection.tsx        # "Choose Your World" header
â”‚   â”‚   â”œâ”€â”€ UniverseGrid.tsx       # Grid of universe cards
â”‚   â”‚   â”œâ”€â”€ UniverseCard.tsx       # Individual universe card
â”‚   â”‚   â””â”€â”€ DropRunway.tsx         # Horizontal product carousel
â”‚   â”‚
â”‚   â”œâ”€â”€ product/
â”‚   â”‚   â”œâ”€â”€ ProductCard.tsx        # Standard product card
â”‚   â”‚   â”œâ”€â”€ ProductQuickAdd.tsx    # Quick add button
â”‚   â”‚   â”œâ”€â”€ ProductGallery.tsx     # Image gallery
â”‚   â”‚   â”œâ”€â”€ ProductInfo.tsx        # Title, price, variants
â”‚   â”‚   â”œâ”€â”€ VariantSelector.tsx    # Size/color pills
â”‚   â”‚   â”œâ”€â”€ QuantitySelector.tsx   # +/- buttons
â”‚   â”‚   â””â”€â”€ AddToCartButton.tsx    # Add to cart CTA
â”‚   â”‚
â”‚   â”œâ”€â”€ cart/
â”‚   â”‚   â”œâ”€â”€ CartItem.tsx           # Individual cart line
â”‚   â”‚   â”œâ”€â”€ CartSummary.tsx        # Subtotal, checkout button
â”‚   â”‚   â””â”€â”€ CartEmpty.tsx          # Empty cart state
â”‚   â”‚
â”‚   â”œâ”€â”€ ui/
â”‚   â”‚   â”œâ”€â”€ Button.tsx             # Base button with variants
â”‚   â”‚   â”œâ”€â”€ Badge.tsx              # Count badges, labels
â”‚   â”‚   â”œâ”€â”€ Icon.tsx               # Icon wrapper
â”‚   â”‚   â”œâ”€â”€ Skeleton.tsx           # Loading skeleton
â”‚   â”‚   â”œâ”€â”€ Input.tsx              # Form inputs
â”‚   â”‚   â””â”€â”€ Modal.tsx              # Base modal
â”‚   â”‚
â”‚   â”œâ”€â”€ effects/
â”‚   â”‚   â”œâ”€â”€ PortalEffect.tsx       # Three.js portal animation
â”‚   â”‚   â”œâ”€â”€ LightningEffect.tsx    # SVG lightning
â”‚   â”‚   â”œâ”€â”€ EmberParticles.tsx     # Floating particles
â”‚   â”‚   â”œâ”€â”€ NenPattern.tsx         # Geometric pattern
â”‚   â”‚   â””â”€â”€ GlowBorder.tsx         # Animated glow border
â”‚   â”‚
â”‚   â””â”€â”€ search/
â”‚       â”œâ”€â”€ SearchBar.tsx          # Search input
â”‚       â”œâ”€â”€ SearchResults.tsx      # Results grid
â”‚       â””â”€â”€ SearchFilters.tsx      # Filter sidebar
â”‚
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ shopify/
â”‚   â”‚   â”œâ”€â”€ client.ts              # Storefront API client
â”‚   â”‚   â”œâ”€â”€ queries.ts             # GraphQL queries
â”‚   â”‚   â”œâ”€â”€ mutations.ts           # GraphQL mutations
â”‚   â”‚   â”œâ”€â”€ types.ts               # TypeScript types
â”‚   â”‚   â””â”€â”€ utils.ts               # Helper functions
â”‚   â”‚
â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”œâ”€â”€ useCart.ts             # Cart state and operations
â”‚   â”‚   â”œâ”€â”€ useProduct.ts          # Product data fetching
â”‚   â”‚   â”œâ”€â”€ useUniverse.ts         # Universe theming
â”‚   â”‚   â””â”€â”€ useMediaQuery.ts       # Responsive hooks
â”‚   â”‚
â”‚   â””â”€â”€ utils/
â”‚       â”œâ”€â”€ cn.ts                  # Class name utility
â”‚       â”œâ”€â”€ formatPrice.ts         # Currency formatting
â”‚       â””â”€â”€ constants.ts           # App constants
â”‚
â”œâ”€â”€ stores/
â”‚   â”œâ”€â”€ cartStore.ts               # Zustand cart store
â”‚   â””â”€â”€ uiStore.ts                 # UI state (drawers, modals)
â”‚
â”œâ”€â”€ styles/
â”‚   â”œâ”€â”€ globals.css                # Global styles, CSS variables
â”‚   â”œâ”€â”€ fonts.css                  # Font imports
â”‚   â””â”€â”€ animations.css             # Keyframe animations
â”‚
â””â”€â”€ types/
    â”œâ”€â”€ shopify.ts                 # Shopify types
    â”œâ”€â”€ universe.ts                # Universe types
    â””â”€â”€ common.ts                  # Common types
```

---

## ENVIRONMENT VARIABLES

```env
# Shopify Storefront API
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=xxxxx

# Shopify Admin API (for server-side operations if needed)
SHOPIFY_ADMIN_ACCESS_TOKEN=xxxxx

# App
NEXT_PUBLIC_SITE_URL=https://mizoke.store
NEXT_PUBLIC_SITE_NAME="Mizoke"

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXX
```

---

## PERFORMANCE REQUIREMENTS

- **Lighthouse Score:** 90+ on all metrics
- **Core Web Vitals:**
  - LCP: < 2.5s
  - FID: < 100ms
  - CLS: < 0.1
- **Bundle Size:** < 200KB initial JS
- **Image Optimization:** Next.js Image component, WebP format, lazy loading
- **Caching:** ISR for product pages (revalidate: 60), static for home

---

## ACCESSIBILITY REQUIREMENTS

- WCAG 2.1 AA compliance
- Keyboard navigation for all interactive elements
- Focus indicators (styled to match theme)
- Screen reader labels for icons
- Reduced motion support (`prefers-reduced-motion`)
- Color contrast ratios maintained despite dark theme
- Skip links for main content

---

## RESPONSIVE BREAKPOINTS

```css
--breakpoint-sm: 640px;   /* Small phones landscape */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Small laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large screens */
```

**Mobile-first approach. Bottom nav visible < 1024px. Desktop nav/sidebar > 1024px.**

---

## DELIVERABLES REQUESTED

Please generate the following in your response:

1. **Complete `agents.md` file** â€” A comprehensive instruction file for AI coding agents that includes:
   - Project overview and goals
   - Complete tech stack with versions
   - File-by-file implementation instructions
   - Component specifications with props and types
   - Styling guidelines and CSS architecture
   - Shopify integration patterns
   - State management patterns
   - Animation implementation details
   - Testing requirements
   - Deployment checklist

2. **Initial file scaffolding** â€” The exact files to create first and their contents

3. **Shopify setup instructions** â€” Step-by-step guide for:
   - Storefront API setup
   - Required metafields creation
   - Collection structure
   - Product organization

4. **Implementation phases** â€” Ordered development roadmap:
   - Phase 1: Core setup, layout, navigation
   - Phase 2: Home page, universe cards
   - Phase 3: Product pages, cart
   - Phase 4: Effects and animations
   - Phase 5: Polish, optimization, testing

---

## REFERENCE IMAGE

I have attached a design mockup showing the exact UI we need to replicate. Pay special attention to:
- The exact styling of the top navigation bar
- The exact styling of the bottom navigation bar
- The universe card designs with their unique themed borders and effects
- The "Drop Runway" horizontal carousel with holographic product cards
- The overall dark, neon-glow aesthetic

The implementation must match this design as closely as possible.

---

## ADDITIONAL NOTES

- Prioritize mobile experience (mobile-first)
- All interactions should feel premium and responsive
- The site should feel like entering a gaming universe, not a typical e-commerce store
- Loading states should be beautiful, not just functional
- Error states should be themed and helpful
- Empty states should encourage exploration

---

**Generate the complete `agents.md` now, structured for maximum clarity and usability by AI coding agents and human developers alike.**

