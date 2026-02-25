# Shopify Setup Guide for Mizoke

This guide walks you through setting up your Shopify store for the Mizoke headless e-commerce platform.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Storefront API Setup](#storefront-api-setup)
3. [Create Metafield Definitions](#create-metafield-definitions)
4. [Collection Structure](#collection-structure)
5. [Product Organization](#product-organization)
6. [Testing Your Setup](#testing-your-setup)

---

## Prerequisites

Before starting, ensure you have:

- [ ] A Shopify store (Basic plan or higher)
- [ ] Admin access to your Shopify store
- [ ] Your store domain (e.g., `your-store.myshopify.com`)

---

## Storefront API Setup

### Step 1: Create a Custom App

1. Go to your Shopify Admin â†’ **Settings** â†’ **Apps and sales channels**
2. Click **Develop apps** (you may need to enable custom app development)
3. Click **Create an app**
4. Name it: `Mizoke Storefront`
5. Click **Create app**

### Step 2: Configure Storefront API Access

1. In your new app, go to **Configuration**
2. Under **Storefront API integration**, click **Configure**
3. Enable the following scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_read_product_tags`
   - `unauthenticated_read_selling_plans`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
   - `unauthenticated_read_content`
   - `unauthenticated_read_customer_tags`
   - `unauthenticated_read_metaobjects`

4. Click **Save**

### Step 3: Install and Get Credentials

1. Go to **API credentials** tab
2. Under **Storefront API access token**, click **Install app**
3. Copy the **Storefront API access token**
4. Save it securely - you'll need it for your `.env.local` file

### Step 4: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token
```

---

## Create Metafield Definitions

Metafields allow us to store custom data on products and collections. We'll create definitions for universe theming and drop functionality.

### Product Metafields

Go to **Settings** â†’ **Custom data** â†’ **Products** â†’ **Add definition**

#### 1. Universe Metafield

| Field | Value |
|-------|-------|
| Name | Universe |
| Namespace and key | `neo_stage.universe` |
| Description | The anime universe this product belongs to |
| Type | Single line text |
| Validation | One of: `one-piece`, `demon-slayer`, `dragon-ball`, `hunter-hunter` |

**Steps:**
1. Click **Add definition**
2. Fill in the fields above
3. Under **Validation**, select "Limit to preset choices"
4. Add each universe slug as a choice
5. Click **Save**

#### 2. Is Drop Metafield

| Field | Value |
|-------|-------|
| Name | Is Drop |
| Namespace and key | `neo_stage.is_drop` |
| Description | Whether this is a limited drop item |
| Type | True or false |

#### 3. Drop Date Metafield

| Field | Value |
|-------|-------|
| Name | Drop Date |
| Namespace and key | `neo_stage.drop_date` |
| Description | When this drop goes live |
| Type | Date and time |

#### 4. Drop End Date Metafield

| Field | Value |
|-------|-------|
| Name | Drop End Date |
| Namespace and key | `neo_stage.drop_end_date` |
| Description | When this drop ends |
| Type | Date and time |

#### 5. Rarity Metafield

| Field | Value |
|-------|-------|
| Name | Rarity |
| Namespace and key | `neo_stage.rarity` |
| Description | Product rarity level |
| Type | Single line text |
| Validation | One of: `common`, `rare`, `legendary` |

### Collection Metafields

Go to **Settings** â†’ **Custom data** â†’ **Collections** â†’ **Add definition**

#### 1. Universe Metafield (Collection)

| Field | Value |
|-------|-------|
| Name | Universe |
| Namespace and key | `neo_stage.universe` |
| Description | The universe this collection represents |
| Type | Single line text |
| Validation | One of: `one-piece`, `demon-slayer`, `dragon-ball`, `hunter-hunter` |

#### 2. Theme Color Metafield

| Field | Value |
|-------|-------|
| Name | Theme Color |
| Namespace and key | `neo_stage.theme_color` |
| Description | Primary theme color for this universe |
| Type | Color |

#### 3. Card Background Image Metafield

| Field | Value |
|-------|-------|
| Name | Card Background Image |
| Namespace and key | `neo_stage.card_background_image` |
| Description | Background image for universe selection card |
| Type | File |
| Validation | Images only |

---

## Collection Structure

Create collections for each anime universe.

### Create Universe Collections

Go to **Products** â†’ **Collections** â†’ **Create collection**

#### One Piece Collection

| Field | Value |
|-------|-------|
| Title | One Piece |
| Handle | `one-piece` |
| Description | Explore the Grand Line with our One Piece collection |
| Collection type | Manual or Automated |

**Metafields:**
- Universe: `one-piece`
- Theme Color: `#00f5ff`

#### Demon Slayer Collection

| Field | Value |
|-------|-------|
| Title | Demon Slayer |
| Handle | `demon-slayer` |
| Description | Join the Demon Slayer Corps |
| Collection type | Manual or Automated |

**Metafields:**
- Universe: `demon-slayer`
- Theme Color: `#ff2d6a`

#### Dragon Ball Collection

| Field | Value |
|-------|-------|
| Title | Dragon Ball |
| Handle | `dragon-ball` |
| Description | Power up with Dragon Ball gear |
| Collection type | Manual or Automated |

**Metafields:**
- Universe: `dragon-ball`
- Theme Color: `#ff8c00`

#### Hunter x Hunter Collection

| Field | Value |
|-------|-------|
| Title | Hunter x Hunter |
| Handle | `hunter-hunter` |
| Description | Unlock your Nen potential |
| Collection type | Manual or Automated |

**Metafields:**
- Universe: `hunter-hunter`
- Theme Color: `#00ff88`

### Optional: Create Automated Collection Rules

For automated collections, use these conditions:

**Example: One Piece Automated Collection**
- Product tag is equal to `one-piece`

OR

- Product metafield `neo_stage.universe` is equal to `one-piece`

---

## Product Organization

### Adding Products with Metafields

When creating or editing products:

1. Go to **Products** â†’ Select or create a product
2. Scroll down to **Metafields** section
3. Fill in the Mizoke metafields:
   - **Universe**: Select the appropriate universe
   - **Rarity**: Set to `common`, `rare`, or `legendary`
   - **Is Drop**: Set to `true` for limited drops
   - **Drop Date/End Date**: Set dates for drop items

### Bulk Editing Metafields

For existing products:

1. Go to **Products** â†’ **All products**
2. Select multiple products
3. Click **Edit products**
4. Add the metafield columns you need
5. Fill in values for each product
6. Click **Save**

### Product Tags (Alternative Method)

You can also use tags for simpler organization:

- `one-piece` - One Piece universe
- `demon-slayer` - Demon Slayer universe
- `dragon-ball` - Dragon Ball universe
- `hunter-hunter` - Hunter x Hunter universe
- `drop` - Limited drop item
- `rare` / `legendary` - Rarity levels

---

## Testing Your Setup

### 1. Verify Storefront API Access

Use this GraphQL query in the Shopify GraphiQL app or your preferred GraphQL client:

```graphql
query TestConnection {
  shop {
    name
    primaryDomain {
      url
    }
  }
}
```

**Headers:**
```
X-Shopify-Storefront-Access-Token: your-token-here
Content-Type: application/json
```

### 2. Test Collection Query

```graphql
query TestCollections {
  collections(first: 10) {
    edges {
      node {
        id
        handle
        title
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
```

### 3. Test Product Query

```graphql
query TestProducts {
  products(first: 5) {
    edges {
      node {
        id
        handle
        title
        metafields(identifiers: [
          { namespace: "neo_stage", key: "universe" }
          { namespace: "neo_stage", key: "rarity" }
          { namespace: "neo_stage", key: "is_drop" }
        ]) {
          key
          value
        }
      }
    }
  }
}
```

### 4. Test Cart Creation

```graphql
mutation CreateCart {
  cartCreate {
    cart {
      id
      checkoutUrl
    }
    userErrors {
      field
      message
    }
  }
}
```

---

## Troubleshooting

### Common Issues

**1. "Access denied" error**
- Check your Storefront API token is correct
- Verify the required scopes are enabled in your app

**2. Metafields not appearing**
- Ensure metafield definitions are created with exact namespace and key
- Check that products have values set for the metafields

**3. Collections not filtering correctly**
- Verify collection handles match expected values
- Check automated collection rules if using automation

**4. Cart/Checkout issues**
- Ensure `unauthenticated_write_checkouts` scope is enabled
- Check that products are available for sale

### Getting Help

- [Shopify Storefront API Documentation](https://shopify.dev/api/storefront)
- [Shopify GraphQL Admin API Reference](https://shopify.dev/api/admin-graphql)
- [Shopify Community Forums](https://community.shopify.com/)

---

## Next Steps

Once your Shopify store is configured:

1. Run `pnpm install` to install dependencies
2. Copy `.env.example` to `.env.local` and add your credentials
3. Run `pnpm dev` to start the development server
4. Visit `http://localhost:3000` to see your store

---

## Quick Reference: Metafield Namespaces

| Namespace | Key | Type | Used On |
|-----------|-----|------|---------|
| `neo_stage` | `universe` | text | Products, Collections |
| `neo_stage` | `is_drop` | boolean | Products |
| `neo_stage` | `drop_date` | datetime | Products |
| `neo_stage` | `drop_end_date` | datetime | Products |
| `neo_stage` | `rarity` | text | Products |
| `neo_stage` | `theme_color` | color | Collections |
| `neo_stage` | `card_background_image` | file | Collections |

