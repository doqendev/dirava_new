/**
 * 3D Preview Configuration Types
 *
 * Each customizable product can define a preview config
 * that controls how the 3D preview is rendered.
 */

export type PreviewType = 'text-extrusion' | 'svg-extrusion' | 'composite-sign' | 'dragonball-sign' | 'bleach-sign' | 'model-with-text' | 'engraving'

export interface LayerConfig {
  color: string
  depth: number
  bevelEnabled?: boolean
  bevelSize?: number
  bevelThickness?: number
  metalness?: number
  roughness?: number
  offsetZ?: number
  /** Emissive color for LED-lit look (hex string). Falls back to `color` if intensity > 0 and emissive is omitted. */
  emissive?: string
  /** Emissive strength (default 0). Set > 0 to make the layer appear self-lit. */
  emissiveIntensity?: number
  /** Uniform stroke width to expand the layer outward (in scene units, e.g. 0.2) */
  strokeWidth?: number
  /** Corner join behaviour for the stroke expansion. Defaults to 'round'.
   *  Use 'miter' for text strokes that should preserve the glyph's
   *  pointy outline (e.g. spiky display fonts). */
  strokeJoinType?: 'round' | 'miter' | 'square'
  /** When true, inner contours (letter counters / SVG hole paths) are
   *  stripped from this layer before extruding so it renders as a
   *  solid silhouette. Useful for back-stroke layers where the inner
   *  counter shouldn't be cut through. */
  stripHoles?: boolean
  /** SVG fill color to match when using svg-extrusion (e.g. '#000000') */
  svgColor?: string
  /** 'extrude' (default) renders solid geometry; 'cut' subtracts holes from other layers */
  mode?: 'extrude' | 'cut'
  /** If true, this layer is not affected by any cut layers */
  noCut?: boolean
  /** Named cut group — cut layers with a cutGroup only affect normal layers with the same cutGroup.
   *  Layers/cuts without cutGroup belong to the default group. */
  cutGroup?: string
  /** If true on a cut layer, this cut is applied to all non-`noCut` layers, including the base layer. */
  cutThroughAll?: boolean
  /** Use face normals instead of averaged vertex normals. The default smooth
   *  shading averages normals at the front-face/side-wall seam, producing a
   *  bright rim at the silhouette outline that bleeds past an overlaid decal.
   *  Flat shading makes each face uniformly lit and kills the rim ring. */
  flatShading?: boolean
  /** Render this layer with MeshBasicMaterial (unlit, no specular / Fresnel).
   *  Useful for a silhouette base hidden behind a painted decal: PBR materials
   *  produce a 4 % Fresnel reflection at glancing angles even at metalness 0,
   *  which shows as a thin bright rim around the decal. Unlit black eliminates
   *  that entirely. The layer no longer reacts to scene lighting. */
  unlit?: boolean
}

/**
 * Optional planar overlay rendered on the front face of an svg-extrusion
 * sign. The decal is a single PNG/WebP authored from the same artboard as
 * the silhouette SVG, so the painted artwork (gradients, character art,
 * multi-colour shading) sits flush against the matte 3D-printed body.
 *
 * Used to mirror the real product's UV-painted front face — colour fidelity
 * the per-fill paint-layer pipeline can't reach.
 */
export interface FrontDecalConfig {
  /** Public path to the decal image (PNG/WebP). Must be authored against
   *  the same bounds as the corresponding SVG silhouette so it overlays 1:1. */
  texture: string
  /** Z position in SVG units. Should be ≥ the base silhouette's depth so
   *  the decal sits flush on the front face. Default 12.05. */
  zOffset?: number
  /** Multiplier applied to the decal's color when the LED is "on". Values
   *  above 1 push bright pixels into HDR territory so the bloom pass
   *  spreads them as a stronger glow. Default 1 (full texture color). */
  lightIntensity?: number
  /** Standard PBR knobs. Defaults tuned for a UV-painted look. */
  roughness?: number          // default 0.35
  metalness?: number          // default 0
  clearcoat?: number          // default 0.4
  clearcoatRoughness?: number // default 0.3
  /** When set, paints the decal with an emissive map driven by the texture
   *  itself. Lets bright pixels self-light without the dark areas glowing. */
  emissive?: string           // default '#ffffff' when emissiveIntensity > 0
  emissiveIntensity?: number  // default 0
  /** Optional generated soft-light layer derived from the same texture.
   *  It isolates non-black pixels, blurs them, and renders them additively
   *  above the painted face to mimic a diffused internal LED panel. */
  internalGlow?: {
    opacity?: number
    intensity?: number
    blur?: number
    threshold?: number
    scale?: number
    zOffset?: number
    warmth?: number
  }
  /** Alpha threshold for transparent edges. Default 0.01. */
  alphaTest?: number
  /** Multiplier on plane size relative to the SVG bounds (default 1). */
  scale?: number
  /** SVG-unit X/Y offset applied after centering on SVG bounds (default 0/0). */
  offsetX?: number
  offsetY?: number
}

export interface PreviewSceneConfig {
  /** Optional studio treatment for products that need more than the
   *  default neutral floor. */
  variant?: 'default' | 'lightbox'
  ambientColor?: string
  ambientIntensity?: number
  keyColor?: string
  keyIntensity?: number
  fillColor?: string
  fillIntensity?: number
  rimColor?: string
  rimIntensity?: number
  floorColor?: string
  floorEmissive?: string
  floorEmissiveIntensity?: number
  wallColor?: string
  wallEmissive?: string
  wallEmissiveIntensity?: number
  accentColor?: string
  ledGlowColor?: string
  ledGlowIntensity?: number
  ledGlowDistance?: number
  floorSize?: [number, number]
  wallSize?: [number, number]
  wallZ?: number
  groundPadding?: number
  shadowOpacity?: number
  fogColor?: string
  fogNear?: number
  fogFar?: number
}

export interface CameraConfig {
  position: [number, number, number]
  fov?: number
  near?: number
  far?: number
  autoRotate?: boolean
  autoRotateSpeed?: number
}

export interface PreviewConfig {
  type: PreviewType
  /** Font file path for text-extrusion type */
  font?: string
  layers: LayerConfig[]
  camera: CameraConfig
  maxChars?: number
  scale?: number
  background?: string
  scene?: PreviewSceneConfig
  model?: string
  /** SVG file path for svg-extrusion type (single SVG) */
  svg?: string
  /** Map variant option value → SVG file path (for variant-specific SVGs) */
  variantSvgs?: Record<string, string>
  /** Optional front-face painted decal for svg-extrusion signs. */
  frontDecal?: FrontDecalConfig
  /** Per-variant front decal overrides (variant name → decal config). */
  variantFrontDecals?: Record<string, FrontDecalConfig>
  /** Map variant option value → thumbnail image path (for visual variant selector) */
  variantImages?: Record<string, string>
  /** Bar SVG paths for composite-sign type */
  barParts?: {
    start: string
    middle: string
    final: string
    top: string
  }
  /** Layer configs for bar elements (separate from main layers used for jolly roger) */
  barLayers?: LayerConfig[]
  /** Layer configs for the custom text between bars */
  textLayers?: LayerConfig[]
  /** Font size for composite-sign text (in SVG units, default 150) */
  textFontSize?: number
  /** Number of middle bar tiles (default 3) */
  tileCount?: number
  /** Scale factor for bar elements relative to the scene (default 1) */
  barScale?: number
  /** Per-variant jolly roger layer overrides (variant name → layers) */
  variantLayers?: Record<string, LayerConfig[]>
  /** Per-variant bar layer overrides (variant name → layers) */
  variantBarLayers?: Record<string, LayerConfig[]>
  /** Per-variant text color overrides (variant name → { text, special, stroke? }) */
  variantTextColors?: Record<string, { text: string; special: string; stroke?: string }>
  /** Per-variant jolly roger scale overrides */
  variantJollyScale?: Record<string, number>
  /** Per-variant jolly roger X position offsets (negative moves left) */
  variantJollyOffsetX?: Record<string, number>
  /** Per-variant jolly roger Y position offsets (positive moves down in SVG space) */
  variantJollyOffsetY?: Record<string, number>
  /** Per-variant text X offsets in composite-sign (positive moves text right) */
  variantTextOffsetX?: Record<string, number>
  /** Force text input to uppercase (defaults to true) */
  forceUppercase?: boolean
  /** Capitalize only the first letter, leave the rest as typed (defaults to false) */
  capitalizeFirst?: boolean
  /** Ratio of SVG width the text should fill (0-1, default 0.8). Text font size
   *  auto-scales so text width matches svgWidth * this ratio. */
  textMaxWidthRatio?: number
  /** When using nameplateBox, ratio of the box height the text is allowed to
   *  consume (default 0.9). Prevents short names from scaling until they
   *  exceed the box vertically. */
  textMaxHeightRatio?: number
  /** Additional overlap between letters for text-extrusion (fraction of font size, default 0.1). */
  textCharOverlap?: number
  /** Text spacing strategy for text-extrusion. `advance` uses glyph advance widths (combo-independent). */
  textSpacingMode?: 'shape-overlap' | 'advance'
  /** Extra letter spacing in font-size units when textSpacingMode is `advance` (e.g. 0.05). */
  textLetterSpacing?: number
  /**
   * For products where the personalised text sits *inside* the artwork (e.g.
   * a lightbox with a nameplate plate), declare the nameplate rectangle in
   * native SVG coordinates. When set, the text is centered in this box and
   * `textMaxWidthRatio` scales against the box width instead of the SVG width.
   */
  nameplateBox?: {
    x: number
    y: number
    width: number
    height: number
  }
  /**
   * Optional wider text box used automatically when the name length
   * exceeds `nameplateBoxExpandAfter`. Lets long names escape the tight
   * primary box and stretch closer to the SVG edges before adaptive
   * letter spacing has to squeeze characters together.
   */
  nameplateBoxExpanded?: {
    x: number
    y: number
    width: number
    height: number
  }
  /** Character count above which the expanded nameplate box kicks in (default 7). */
  nameplateBoxExpandAfter?: number
  /**
   * Per-variant overrides for the primary nameplate box, keyed by the
   * variant option value (e.g. "Zoro"). When a variant is selected and
   * has an entry here, it replaces `nameplateBox` for that variant only.
   * Lets two variants exported at slightly different SVG scales each use
   * coordinates that fit their own plate, without affecting the others.
   */
  variantNameplateBoxes?: Record<string, { x: number; y: number; width: number; height: number }>
  /** Per-variant overrides for the expanded nameplate box. */
  variantNameplateBoxesExpanded?: Record<string, { x: number; y: number; width: number; height: number }>
  /**
   * When true, the scene auto-centres the nameplate on the bounding box
   * of the SVG's `#0000ff` marker path. Width/height are still taken
   * from `nameplateBox`, only the X/Y centre is overridden — so a product
   * with many variants whose plates sit at slightly different SVG
   * positions can share one tuned width/height.
   */
  autoCenterNameplateOnBlueMarker?: boolean
  /**
   * Enables a post-processing bloom pass so layers with
   * `emissiveIntensity > ~1` visibly glow (light bleed) instead of
   * just rendering a brighter colour. Meant for products that need
   * an LED-lit look. Opt-in because the extra render pass has a
   * small perf cost.
   */
  postprocessingBloom?: boolean | {
    intensity?: number
    luminanceThreshold?: number
    luminanceSmoothing?: number
  }
  /**
   * Once the name length exceeds this threshold, the font size floor is
   * relaxed so long names can shrink below the base size and fit cleanly
   * without overlapping. Undefined disables shrinking entirely.
   */
  textShrinkAfter?: number
  /**
   * Minimum font size ratio relative to `textFontSize` when shrinking
   * kicks in (default 0.85 = text can shrink to 85% of base).
   */
  textShrinkFloorRatio?: number
  /**
   * Per-length overrides of `textShrinkFloorRatio`. Lets you keep most
   * lengths at the default behaviour while relaxing (or disabling) the
   * shrink floor for specific lengths that otherwise overflow.
   * Example: `{ 9: 0.65, 12: 0.35 }` lets 9-char names shrink to 65%
   * of base and 12-char names to 35%, regardless of `textShrinkAfter`.
   */
  textShrinkFloorByLength?: Record<number, number>
  /**
   * Lower clamp for the adaptive letter spacing (default -0.1). Raise
   * toward 0 to prevent letters from overlapping when the name is long
   * — the scene will shrink the font instead. Lower (more negative) to
   * allow tighter overlap before the font starts to shrink.
   */
  textMinLetterSpacing?: number
  /**
   * Per-character size overrides (keyed by character — uppercased when
   * `forceUppercase`). Value is a scale multiplier applied to the glyph
   * at render time (e.g. `{ Q: 0.82 }` renders Q at 82% of the font size).
   * Useful for fonts where a specific glyph has a runaway descender or
   * cap-height that throws the bbox-centered text off vertically.
   * Baseline stays at y=0 so the scaled glyph still sits on the baseline.
   */
  textCharScale?: Record<string, number>
  /**
   * Characters excluded from the text-centering reference bbox. Their
   * shapes still render, but they don't influence where the other
   * characters land. Use this when a specific glyph has an outlier
   * bbox (e.g. a Q with an oversized descender) that would otherwise
   * drag the whole text block off-position when the name contains it.
   */
  textCharCenterExclude?: string[]
  /**
   * Per-character Y offset (in font-size units). Applied AFTER
   * per-character scaling and BEFORE centering. Positive = down in
   * opentype coords (toward descender). Use together with
   * `textCharCenterExclude` when you need to manually nudge the
   * excluded glyph into its final visual position.
   */
  textCharOffsetY?: Record<string, number>
  /**
   * Multiplier applied to this character's advance width when the
   * cursor moves to the next glyph (default 1). Use < 1 to tighten
   * spacing after a glyph whose path bbox extends past its visual
   * right edge (e.g. a Q with a long tail swirl) — the next character
   * slides closer without the glyph itself shrinking.
   */
  textCharAdvanceScale?: Record<string, number>
  /**
   * Per-character Y-only scale (default 1). Shrinks/stretches the
   * glyph vertically around its own vertical centre, so the visual
   * position stays put while height changes. Width is untouched.
   */
  textCharScaleY?: Record<string, number>

  // --- dragonball-sign only ----------------------------------------
  /** Base relief layer (black silhouette that gets stroke-expanded). */
  baseLayer?: LayerConfig
  /** Paint layer for the first (yellow) half of the text. */
  firstHalfLayer?: LayerConfig
  /** Paint layer for the second (red) half of the text. */
  secondHalfLayer?: LayerConfig
  /** Paint layers matched against the mid-sprite SVG by `svgColor`. */
  ballLayers?: LayerConfig[]
  /** Per-character horizontal width factor applied on top of the taper. */
  letterWidthAdjustments?: Record<string, number>
  /** Pair-kerning table (key = two chars, value = gap in font-size units). */
  kerningTable?: Record<string, number>
  /** Characters that get horizontally mirrored when they land in the first (yellow) half. */
  letterFlipFirstHalf?: string[]
  /** Characters that get horizontally mirrored when they land in the second (red) half. */
  letterFlipSecondHalf?: string[]
  /** Per-letter scale decrement as distance from the midpoint grows (default 0.05). */
  centerOutwardTaper?: number
  /** Lower clamp on the center-outward taper scale (default 0.5). */
  centerOutwardTaperFloor?: number
  /** Mid-sprite width expressed as a fraction of font size (default 0.425). */
  midSpriteSize?: number
  /** Horizontal spacing around the mid-sprite as a fraction of font size (default -0.3 = overlap). */
  midSpriteSpacing?: number
  /** Vertical offset of the mid-sprite as a fraction of font size (default 0). */
  midSpriteOffsetY?: number
  /**
   * When set, the scene renders a second copy of the text mirrored
   * underneath — the classic Hunter x Hunter two-row composition. The
   * reflection sits below the main text by `reflectionOffsetY * fontSize`
   * and is painted with this layer's material.
   */
  reflectionLayer?: LayerConfig
  /**
   * Gap between the main text baseline and the reflection baseline, as
   * a fraction of font size (default 0.3 ≈ the legacy 58 / 200 px).
   * Only consulted when `reflectionLayer` is also set.
   */
  reflectionOffsetY?: number
  /**
   * How the mid sprite (ball / X) is laid out horizontally.
   *   'between-halves' (default) — sprite sits between two halves of the
   *                                 text, which split at the ball slot.
   *                                 The colour split follows the sprite.
   *   'overlay'                 — text renders as one continuous run;
   *                                 the sprite overlays on top at a
   *                                 fixed fraction of the text width
   *                                 (centred for short names, pushed
   *                                 rightward for longer ones).
   *                                 Yellow/red halves no longer apply.
   */
  midSpriteMode?: 'between-halves' | 'overlay'
  /**
   * Extra margin (in scene units) added around the ball silhouette
   * when it is CSG-subtracted from the text paint. A positive value
   * carves a slightly larger hole than the sprite, leaving a visible
   * ring of base colour between the sprite and the surrounding paint.
   * Default 0 (tight cut). Only consulted when the scene actually
   * applies the CSG cut.
   */
  midSpriteCutMargin?: number

  // --- bleach-sign only ----------------------------------------------
  /**
   * Frame parts for the bleach-sign scene: 5 SVGs assembled
   * horizontally as left + expander + middle + expander + right.
   * The two expanders stretch along X to fit the personalised text.
   */
  bleachFrameSvgs?: {
    left: string
    expander: string
    middle: string
    right: string
  }
  /** Scene units per SVG pixel for the frame artwork (default 0.025). */
  bleachFrameScale?: number
  /** Horizontal padding (in font-size units) between the text and each expander. */
  bleachTextPad?: number
  /**
   * Vertical offset for the bleach text, in font-size units. Negative
   * pushes the text upward in world space (above the frame's central
   * horizontal stripes), matching the legacy layout. Default -0.6.
   */
  textOffsetY?: number
}
