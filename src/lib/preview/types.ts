/**
 * 3D Preview Configuration Types
 *
 * Each customizable product can define a preview config
 * that controls how the 3D preview is rendered.
 */

export type PreviewType = 'text-extrusion' | 'svg-extrusion' | 'composite-sign' | 'model-with-text' | 'engraving'

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
  model?: string
  /** SVG file path for svg-extrusion type (single SVG) */
  svg?: string
  /** Map variant option value → SVG file path (for variant-specific SVGs) */
  variantSvgs?: Record<string, string>
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
   * Lower clamp for the adaptive letter spacing (default -0.1). Raise
   * toward 0 to prevent letters from overlapping when the name is long
   * — the scene will shrink the font instead. Lower (more negative) to
   * allow tighter overlap before the font starts to shrink.
   */
  textMinLetterSpacing?: number
}
