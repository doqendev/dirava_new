# 3D Product Preview System — Implementation Plan

## Overview

Build a real-time 3D preview system for personalized/custom products. When a customer types their name in the personalization field, a 3D tab appears in the product gallery showing a live-rendered preview of their custom product.

**Starting product:** Attack on Titan Custom Logo — gothic blackletter text extruded in two layers (12mm black base + 1mm white top).

**Architecture goal:** Extensible system that supports different preview types per product (text extrusion, model + text combos, engravings, etc.)

---

## Architecture

### Preview Config System

Each customizable product defines its preview configuration via a **preview config map** (a TypeScript config file keyed by product handle). This avoids Shopify metafield complexity and keeps configs in code where they're versioned and type-safe.

```
src/lib/preview/
├── configs.ts          # Product handle → PreviewConfig map
├── types.ts            # PreviewConfig, LayerConfig, CameraConfig types
├── fonts/              # Font loading utilities
└── index.ts            # Public API
```

**PreviewConfig structure:**
```typescript
interface PreviewConfig {
  type: 'text-extrusion' | 'model-with-text' | 'engraving'  // extensible
  font: string                    // path to .ttf/.otf in /public/fonts/preview/
  layers: LayerConfig[]           // ordered bottom-to-top
  camera: CameraConfig            // default camera position/fov
  maxChars?: number               // character limit for preview
  scale?: number                  // global scale factor
  background?: string             // scene background color
}

interface LayerConfig {
  color: string                   // hex color
  depth: number                   // extrusion depth in mm
  bevelEnabled?: boolean
  bevelSize?: number
  bevelThickness?: number
  metalness?: number
  roughness?: number
  offsetZ?: number                // Z offset from previous layer
}

interface CameraConfig {
  position: [number, number, number]
  fov?: number
  near?: number
  far?: number
  autoRotate?: boolean
  autoRotateSpeed?: number
}
```

**Example config for AoT:**
```typescript
'attack-on-titan-custom-logo': {
  type: 'text-extrusion',
  font: '/fonts/preview/attack-on-titan.ttf',
  layers: [
    { color: '#1a1a1a', depth: 12, metalness: 0.1, roughness: 0.8 },
    { color: '#ffffff', depth: 1, metalness: 0.0, roughness: 0.6, offsetZ: 12 },
  ],
  camera: { position: [0, 0, 80], fov: 50 },
  maxChars: 15,
}
```

### Component Hierarchy

```
ProductGallery (modified)
├── Image slides (existing)
├── 3D Preview tab (new, shown when preview config exists + name entered)
│   └── Preview3DCanvas
│       └── TextExtrusionScene (for type: 'text-extrusion')
│           ├── ExtrudedTextLayer (per layer in config)
│           ├── StudioLighting
│           └── OrbitControls
└── Thumbnail strip (existing, with 3D tab indicator)
```

---

## Implementation Steps

### Step 1: Types & Config System
**Files:** `src/lib/preview/types.ts`, `src/lib/preview/configs.ts`, `src/lib/preview/index.ts`

- Define `PreviewConfig`, `LayerConfig`, `CameraConfig` types
- Create config map with AoT product as first entry
- Export `getPreviewConfig(handle: string)` utility function
- Export `hasPreviewConfig(handle: string)` boolean check

### Step 2: Font Setup
**Files:** `public/fonts/preview/attack-on-titan.ttf` (user provides)

- User places their .ttf font file in `public/fonts/preview/`
- Three.js needs fonts converted to TypeFace JSON format for TextGeometry
- Use `@react-three/drei`'s `<Text3D>` component which accepts .ttf/.otf directly via `font` prop (uses troika-three-text under the hood — no conversion needed)

**Important:** drei's `<Text3D>` requires the font in Three.js TypeFace JSON format. We'll use a build-time conversion script OR use the `facetype.js` online converter. The user will convert their .ttf to JSON and place it at `public/fonts/preview/attack-on-titan.json`.

### Step 3: Core 3D Preview Component
**Files:** `src/components/product/preview3d/Preview3DCanvas.tsx`

- Lazy-loaded React Three Fiber `<Canvas>` (code-split for bundle size)
- Accepts `config: PreviewConfig` and `text: string`
- Renders the appropriate scene based on `config.type`
- Loading state with skeleton/spinner while font loads
- Error boundary for WebGL failures (fallback to "preview not available")
- `Suspense` wrapper for async font loading

### Step 4: Text Extrusion Scene
**Files:** `src/components/product/preview3d/TextExtrusionScene.tsx`

- Uses `@react-three/drei` `<Text3D>` or Three.js `TextGeometry` + `ExtrudeGeometry`
- For each layer in `config.layers`:
  - Create extruded text geometry with specified depth
  - Apply material with color/metalness/roughness
  - Stack layers at correct Z offsets
- Auto-center the text group (compute bounding box, translate to center)
- Recalculate geometry when `text` changes (debounced ~300ms for performance)

### Step 5: Scene Environment
**Files:** `src/components/product/preview3d/StudioLighting.tsx`

- Three-point studio lighting (key, fill, rim)
- Subtle environment map for realistic reflections
- Ground shadow/contact shadow for grounding
- Dark background matching the site theme (#0a0a12)

### Step 6: OrbitControls & Camera
- `@react-three/drei` `<OrbitControls>` with:
  - `enablePan={false}` (prevent losing the model)
  - `minDistance` / `maxDistance` for zoom limits
  - `autoRotate={true}` with slow speed as default
  - `autoRotate` stops on user interaction, resumes after idle
  - Touch-friendly for mobile
- Camera positioned from config defaults

### Step 7: Gallery Integration
**Files:** Modify `src/components/product/ProductGallery.tsx`

- Accept new optional props: `previewConfig?: PreviewConfig`, `previewText?: string`
- When both exist and `previewText` is not empty:
  - Add a "3D" tab/thumbnail at the end of the thumbnail strip
  - When active, render `<Preview3DCanvas>` instead of the image slide
  - Use a cube/3D icon in the thumbnail
- Lazy-load the 3D canvas component (`dynamic(() => import(...), { ssr: false })`)

### Step 8: ProductDetailClient Integration
**Files:** Modify `src/components/product/ProductDetailClient.tsx`

- Import `getPreviewConfig` from preview lib
- Look up config using `product.handle`
- Pass `previewConfig` and `personalizationName` to `<ProductGallery>`
- The 3D tab auto-appears when user types in personalization field

### Step 9: Performance & Mobile
- **Code splitting:** The entire Three.js canvas is lazy-loaded (not in main bundle)
- **Debounced text updates:** 300ms debounce on text input to prevent re-rendering on every keystroke
- **Geometry caching:** Cache font and geometry when only text changes
- **Mobile detection:** Reduce pixel ratio on mobile (`dpr={[1, 1.5]}`)
- **Fallback:** If WebGL not supported, show a message instead of crashing
- **Memory cleanup:** Dispose geometries and materials on unmount

### Step 10: Polish & UX
- Smooth transition when switching between image gallery and 3D view
- Loading indicator while font/scene initializes
- "Rotate to preview" hint text on first view
- Thumbnail for 3D tab: a small cube icon with neon glow matching the universe theme
- Responsive: full-width canvas on mobile, contained on desktop

---

## File Structure (New Files)

```
src/
├── lib/preview/
│   ├── types.ts              # Type definitions
│   ├── configs.ts            # Product → PreviewConfig map
│   └── index.ts              # Public exports
├── components/product/preview3d/
│   ├── Preview3DCanvas.tsx   # Main canvas wrapper (lazy-loaded)
│   ├── TextExtrusionScene.tsx # Text extrusion renderer
│   ├── ExtrudedTextLayer.tsx  # Single layer component
│   ├── StudioLighting.tsx    # Lighting setup
│   └── index.ts              # Exports
public/
└── fonts/preview/
    └── attack-on-titan.json  # TypeFace JSON font (user converts from .ttf)
```

## Files Modified

```
src/components/product/ProductGallery.tsx    # Add 3D tab support
src/components/product/ProductDetailClient.tsx # Pass preview config
```

---

## Extensibility for Future Products

To add a new product preview (e.g., One Piece custom sign):

1. Add a new config entry in `configs.ts`:
```typescript
'one-piece-custom-sign': {
  type: 'model-with-text',
  font: '/fonts/preview/one-piece.json',
  model: '/models/jolly-roger-{variant}.glb', // template with variant placeholder
  layers: [{ color: '#ffffff', depth: 2 }],
  camera: { position: [0, 0, 100], fov: 45 },
}
```

2. Create a new scene component (`ModelWithTextScene.tsx`)
3. Register it in `Preview3DCanvas.tsx`'s type switch

The config system means adding new products requires:
- A font file
- A config entry (5-10 lines)
- Optionally a new scene type if the geometry is fundamentally different

---

## Dependencies

Already installed (no changes needed):
- `three@^0.160.0`
- `@react-three/fiber@^8.15.0`
- `@react-three/drei@^9.92.0`
- `@types/three@^0.160.0`

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Font rendering quality | Test with actual font file, adjust bevel settings |
| Mobile performance | Reduced DPR, simpler materials, geometry caching |
| WebGL not supported | Error boundary with graceful fallback message |
| Large bundle size | Code-split entire 3D module (only loads when needed) |
| Text too long | `maxChars` config limit, auto-scale text to fit |
| Special characters | Validate input, fallback for unsupported glyphs |

---

## Estimated Effort

| Step | Effort |
|------|--------|
| Types & Config | ~30 min |
| Font Setup | ~15 min (user converts font) |
| Core Canvas | ~1 hr |
| Text Extrusion Scene | ~2 hrs |
| Lighting & Environment | ~30 min |
| Gallery Integration | ~1 hr |
| ProductDetail Integration | ~30 min |
| Performance & Mobile | ~1 hr |
| Polish & UX | ~1 hr |
| **Total** | **~8 hrs** |
