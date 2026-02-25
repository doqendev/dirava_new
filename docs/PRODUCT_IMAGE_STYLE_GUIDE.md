# Product Image Style Guide

Art direction and production rules for product photos/renders used across Mizoke.

## 1) Visual North Star

Mizoke product imagery should feel like "premium loot drop" with clear purchase trust.

- Mood: dark, cinematic, neon-accented, high contrast.
- Goal: excitement first, clarity always.
- Rule: stylized atmosphere around the product, never on top of product details.

## 2) Brand Visual DNA (from current UI)

- Base backgrounds: `#0a0a12`, `#0d0d1a`.
- Accent neons:
  - cyan `#00f5ff`
  - pink `#ff2d6a`
  - orange `#ff8c00`
  - green `#00ff88`
- Keep glows soft and directional, not blown out.
- Match existing "glass + neon + holographic" language from UI cards.

## 3) Universe Color Mapping

Use one dominant accent + one neutral fill light.

- One Piece: cyan accent, cool fill, portal-like haze.
- Demon Slayer: pink/red accent, ember texture, deeper shadows.
- Dragon Ball: orange/gold accent, high-energy contrast, spark/lightning hints.
- Hunter x Hunter: green accent, cleaner edges, subtle energy arcs.
- Attack on Titan: orange accent, smoky/industrial atmosphere.
- Digimon: cyan accent, digital-grid texture and scanline hints.

## 4) Core Shot System (Per Product)

Each product should ship with this minimum set:

1. Hero shot (stylized, campaign-ready).
2. Front clean shot (truth shot).
3. Back or alternate-angle shot.
4. Detail macro (material/print/stitch/finish).
5. In-context shot (worn or lifestyle surface).
6. Scale/fit reference (on model or measured context).

For premium items (collectibles/signs), add:

7. Packaging/unboxing shot.
8. Glow/lighting-off-vs-on comparison when relevant.

## 5) Composition Rules

- Product occupies 70-85% of frame in primary listing images.
- Keep silhouette clean against darker backgrounds.
- Maintain straight horizon and verticals unless intentional dynamic angle.
- Use negative space for overlays in marketing variants.
- Avoid cluttered props; 1-2 props max, always universe-relevant.

## 6) Framing and Aspect Ratios

Current storefront favors square image containers (`aspect-square`) on cards and gallery.

- Master crop: `1:1` (required for product pages and listing consistency).
- Secondary crop: `4:5` (social/ads).
- Wide crop: `16:9` (hero banners/editorial modules only).
- Keep product centered enough that square crop never clips key features.

## 7) Lighting Blueprint

Use a 3-light setup baseline:

- Key light: soft, 35-45 degrees, neutral white.
- Fill light: low-intensity, cool neutral to preserve blacks.
- Rim light: universe accent color (cyan/pink/orange/green).

Optional FX lights:

- Ground reflection card for metallic/print sheen.
- Back haze or particle pass for hero shots only.

Hard constraints:

- Never color-cast the product to the point of inaccurate real color.
- Keep logo/print textures readable at thumbnail size.

## 8) Background and FX Guidelines

- Preferred backgrounds: dark gradient, smoke, faint particles, subtle holographic texture.
- Keep FX opacity low; product remains focal anchor.
- Use directional glow behind product, not all-around bloom.
- Do not use pure black void unless product edge separation is strong.

## 9) Category-Specific Direction

### Apparel (tees, hoodies)
- Show drape and fabric weight; avoid over-smoothing.
- Include one folded flat-lay and one worn shot.
- Macro: print texture, embroidery, seam detail.

### Accessories (keychains, mugs, etc.)
- Include one hand-held scale shot.
- Use tighter framing to emphasize material finish.
- Keep reflection control tight for glossy surfaces.

### Collectibles/Figures
- Add low-angle hero to improve presence.
- Show base/stand clearly in at least one image.
- Include 360 sequence source frames when feasible.

### Customizable/3D-preview products
- Include one "blank" base product and one personalized example.
- Ensure personalized text area is clearly visible.
- Keep framing aligned with in-app 3D preview expectations.

## 10) Color Grade and Retouch

- Contrast: medium-high with preserved shadow detail.
- Saturation: controlled; accents can pop, base product stays truthful.
- Sharpening: local sharpening on texture/print only.
- Grain: very subtle, cinematic, consistent across a set.
- Chromatic aberration: minimal and only for hero creatives.

Retouch don'ts:

- No heavy skin/plastic smoothing on apparel fibers.
- No fake glow that obscures edges.
- No inconsistent white balance across product variants.

## 11) UI Fit Requirements

Because cards and gallery use square media blocks:

- Verify readability at 320px wide viewport.
- Verify legibility in thumbnails (`64x64` equivalent contexts).
- Ensure first image is the cleanest, highest-conversion frame.
- Reserve stylized extremes for image 2+ (not image 1).

## 12) File Specs and Naming

- Preferred format: WebP for delivery, PNG for alpha needs.
- Source archive: lossless PNG/TIFF/RAW where available.
- Target export sizes:
  - square master: `2000x2000`
  - square web: `1200x1200`
  - thumb source: `800x800`
- Color space: sRGB for web exports.

Naming convention:

`{product-handle}__{universe}__{shot-type}__v{n}.webp`

Examples:

- `akatsuki-hoodie__demon-slayer__hero__v1.webp`
- `akatsuki-hoodie__demon-slayer__front-clean__v1.webp`
- `akatsuki-hoodie__demon-slayer__macro-print__v1.webp`

## 13) Shot-Type Definitions (Controlled Vocabulary)

Use these values consistently:

- `hero`
- `front-clean`
- `back-clean`
- `angle-45`
- `macro-material`
- `macro-print`
- `in-context`
- `fit-reference`
- `packaging`
- `comparison-glow`

## 14) Prompt Template (for AI-assisted imagery)

Use this when generating concept frames before final retouch:

"Premium anime merch product photo of [PRODUCT], dark cinematic studio, [UNIVERSE_COLOR] rim light, subtle [UNIVERSE_EFFECT], clean silhouette, high texture detail, realistic material, controlled glow, ecommerce-ready, centered composition, sharp product edges, minimal props, no text overlays, sRGB look"

Negative prompt guidance:

- "blurry texture, overbloom, washed colors, noisy shadows, warped logos, extra limbs/hands, unreadable details, busy background"

## 15) Production Workflow

1. Plan shot list using section 4.
2. Capture or generate master frames.
3. Color-match to universe palette.
4. Export required crops and sizes.
5. QA against checklist below.
6. Upload with canonical naming.

## 16) QA Checklist (Pass/Fail)

- Product color accurate to real item.
- First image is clean and conversion-friendly.
- Universe accent visible but not overpowering.
- Details readable at card size.
- No clipping in square crop.
- Consistent grade across all images in same SKU.
- Background/FX support product, do not distract.
- File names and formats follow section 12.

## 17) Quick Starter Pack by SKU

For every new SKU, deliver at least:

- 1x `hero`
- 1x `front-clean`
- 1x `back-clean` or `angle-45`
- 1x `macro-material` or `macro-print`
- 1x `in-context`

Total minimum: 5 images per SKU (square masters).
