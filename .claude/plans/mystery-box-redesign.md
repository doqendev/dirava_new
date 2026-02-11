# Mystery Box System Redesign

## Overview

Redesign the mystery box system to work like CS:GO cases:
- **Themed boxes** (not tiers) - Each box has its own theme, items, and odds
- **Digital tokens** - Purchase generates a redeemable code
- **Giftable** - Codes can be shared/gifted
- **Address at claim** - Shipping info collected after reveal, not at purchase

---

## User Flow

```
1. BROWSE     /gacha                    → See all available mystery boxes
2. INSPECT    /gacha/[handle]           → View box contents, items by rarity, odds
3. PURCHASE   Shopify checkout          → Digital product, no shipping required
4. RECEIVE    Email                     → Get unique redemption code + link
5. REVEAL     /reveal/[code]            → Watch animation, see prize
6. CLAIM      Enter shipping address    → Fulfillment order created
7. SHIP       Warehouse                 → Item shipped to recipient
```

---

## Example Boxes

| Box | Price | Theme | Items |
|-----|-------|-------|-------|
| Devil Fruit Collection | €29.99 | One Piece Devil Fruits | 5 hoodies (Gomu Gomu, Mera Mera, etc.) |
| Anime Villains | €34.99 | Iconic Villains | 6 items across villains |
| Shonen Heroes | €24.99 | Main characters | 8 items |

Each box has its OWN odds configured in its metafield:
```json
{
  "odds": { "legendary": 5, "epic": 15, "rare": 30, "common": 50 },
  "items": [
    { "productHandle": "gomu-gomu-hoodie", "variantId": "...", "rarity": "legendary" },
    { "productHandle": "mera-mera-hoodie", "variantId": "...", "rarity": "epic" },
    ...
  ]
}
```

---

## Data Model

### Shopify Products (Mystery Boxes)

Each mystery box is a Shopify product with:
- **Type**: Digital (uncheck "This is a physical product")
- **Handle**: `mystery-box-devil-fruit`
- **Metafields**:
  - `gacha.loot_pool` (JSON) - Items with rarities
  - `gacha.theme` (JSON) - Colors, display name, description

### Redemption Codes (Database)

Need persistent storage for codes. Options:

| Option | Pros | Cons |
|--------|------|------|
| **Vercel KV** | Simple, serverless, fast | Limited querying |
| **Supabase** | Full Postgres, free tier | External dependency |
| **PlanetScale** | MySQL, generous free tier | External dependency |
| **Shopify Metaobjects** | No external DB | Complex, rate limits |

**Recommended: Vercel KV** for simplicity, or **Supabase** for full flexibility.

**Code Schema:**
```typescript
interface RedemptionCode {
  code: string              // Unique 12-char code (e.g., "DFRT-X7K2-9MPL")
  boxHandle: string         // Which mystery box
  purchaseOrderId: string   // Original Shopify order
  purchaserEmail: string    // Who bought it
  status: 'unused' | 'revealed' | 'claimed' | 'shipped'

  // After reveal
  revealedProductHandle?: string
  revealedVariantId?: string
  revealedRarity?: Rarity
  revealedAt?: string
  seed?: string             // For audit trail

  // After claim
  shippingAddress?: ShippingAddress
  claimedAt?: string
  fulfillmentOrderId?: string

  createdAt: string
}
```

---

## Architecture

### Webhook Flow (Purchase → Code Generation)

```
Shopify Order Paid
       ↓
POST /api/webhooks/orders/paid
       ↓
Check if order contains mystery box products
       ↓
For each mystery box line item:
  - Generate unique code
  - Store in database
  - Send email with code (via Shopify or custom)
```

### Reveal Flow

```
User visits /reveal/[code]
       ↓
GET /api/gacha/codes/[code]
  - Validate code exists
  - Check status (must be 'unused')
  - Return box info for UI
       ↓
User clicks "Open Box"
       ↓
POST /api/gacha/reveal
  - Verify code is unused
  - Fetch loot pool from box metafield
  - Perform weighted random selection
  - Store result in database
  - Return revealed item
       ↓
Animation plays → Item revealed
```

### Claim Flow

```
After reveal, user clicks "Claim Prize"
       ↓
User enters shipping address
       ↓
POST /api/gacha/claim
  - Validate code is 'revealed'
  - Store shipping address
  - Create Shopify Draft Order with:
    - Revealed product/variant
    - Shipping address
    - $0 total (already paid)
  - Complete the draft order
  - Update code status to 'claimed'
       ↓
Order appears in Shopify for fulfillment
```

---

## Files to Create

### Types
```
src/types/gacha.ts              # Updated types (no tiers)
```

### Lib
```
src/lib/gacha/constants.ts      # Rarity config (remove tier stuff)
src/lib/gacha/codeGenerator.ts  # Generate unique codes
src/lib/gacha/queries.ts        # GraphQL queries
src/lib/gacha/randomSelection.ts # Keep as-is
src/lib/gacha/sounds.ts         # Keep as-is
src/lib/db/codes.ts             # Database operations for codes
```

### API Routes
```
src/app/api/webhooks/orders/paid/route.ts   # Generate codes on purchase
src/app/api/gacha/codes/[code]/route.ts     # GET code status
src/app/api/gacha/reveal/route.ts           # POST reveal (update for codes)
src/app/api/gacha/claim/route.ts            # POST claim with address
src/app/api/gacha/boxes/route.ts            # GET all mystery boxes
src/app/api/gacha/boxes/[handle]/route.ts   # GET box details + items
```

### Pages
```
src/app/gacha/page.tsx                      # Browse all boxes
src/app/gacha/[handle]/page.tsx             # Box detail + items preview
src/app/reveal/[code]/page.tsx              # Reveal page (code-based)
src/app/reveal/[code]/RevealClient.tsx      # Client component
src/app/reveal/[code]/ClaimForm.tsx         # Shipping address form
src/app/account/codes/page.tsx              # User's codes + status
```

### Components
```
src/components/gacha/
├── MysteryBoxCard.tsx          # Card for box listing (simplified)
├── BoxContentsPreview.tsx      # Show items grouped by rarity
├── OddsDisplay.tsx             # Keep as-is
├── RevealSequence.tsx          # Keep as-is
├── ClaimPrizeForm.tsx          # Shipping address form
├── CodeStatus.tsx              # Show code status badge
└── ... (keep animation components)
```

### Store
```
src/stores/gachaStore.ts        # Update for new flow
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/gacha.ts` | Remove MysteryBoxTier, add RedemptionCode types |
| `src/lib/gacha/constants.ts` | Remove TIER_*, keep RARITY_CONFIG |
| `src/app/gacha/test/page.tsx` | Update for new box structure |

---

## Database Setup (Vercel KV)

```bash
pnpm add @vercel/kv
```

```typescript
// src/lib/db/codes.ts
import { kv } from '@vercel/kv'

export async function createCode(code: RedemptionCode) {
  await kv.set(`code:${code.code}`, code)
  // Also index by email for "my codes" page
  await kv.sadd(`codes:${code.purchaserEmail}`, code.code)
}

export async function getCode(code: string) {
  return kv.get<RedemptionCode>(`code:${code}`)
}

export async function updateCode(code: string, updates: Partial<RedemptionCode>) {
  const existing = await getCode(code)
  if (!existing) throw new Error('Code not found')
  await kv.set(`code:${code}`, { ...existing, ...updates })
}

export async function getUserCodes(email: string) {
  const codes = await kv.smembers(`codes:${email}`)
  return Promise.all(codes.map(c => getCode(c)))
}
```

---

## Shopify Setup (Manual)

### 1. Create Mystery Box Products
For each themed box:
- Create product (e.g., "Devil Fruit Mystery Box")
- Uncheck "This is a physical product"
- Set price
- Add metafield `gacha.loot_pool` with JSON

### 2. Configure Webhook
In Shopify Admin → Settings → Notifications → Webhooks:
- Event: Order paid
- URL: `https://yoursite.com/api/webhooks/orders/paid`
- Format: JSON

### 3. Product Metafield Definition
Create metafield definition for products:
- Namespace: `gacha`
- Key: `loot_pool`
- Type: JSON

---

## Implementation Phases

### Phase 1: Database + Types
1. Set up Vercel KV (or chosen DB)
2. Update `src/types/gacha.ts` - new types
3. Create `src/lib/db/codes.ts` - code operations
4. Create `src/lib/gacha/codeGenerator.ts`

### Phase 2: Webhook + Code Generation
1. Create `/api/webhooks/orders/paid` - generate codes
2. Test with Shopify webhook

### Phase 3: Box Browsing
1. Update `/gacha` page - list all boxes
2. Create `/gacha/[handle]` - box detail with contents
3. Create `BoxContentsPreview` component

### Phase 4: Reveal Flow (Code-based)
1. Update `/api/gacha/reveal` - work with codes
2. Create `/api/gacha/codes/[code]` - get code status
3. Update `/reveal/[code]` page
4. Keep animation components as-is

### Phase 5: Claim Flow
1. Create `ClaimPrizeForm` component
2. Create `/api/gacha/claim` - create fulfillment order
3. Integrate into reveal page

### Phase 6: User Dashboard
1. Create `/account/codes` - view purchased codes
2. Show status: unused → revealed → claimed → shipped

---

## Questions to Confirm

1. **Database choice**: Vercel KV (simple) or Supabase (more features)?

2. **Code format**:
   - Short: `DFRT-X7K2` (8 chars)
   - Medium: `DFRT-X7K2-9MPL` (12 chars)
   - UUID: `a1b2c3d4-e5f6-...` (36 chars)

3. **Email delivery**:
   - Use Shopify's order confirmation (add code to order notes)?
   - Custom email via Resend/SendGrid?

4. **Multiple codes per order**: If someone buys 3 boxes, do they get 3 separate codes or 1 code for 3 reveals?

5. **Code expiration**: Should codes expire after X days/months?

6. **Inventory**: When is inventory decremented?
   - At purchase (reserve stock)?
   - At reveal (might run out)?
   - At claim?
