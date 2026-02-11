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
  /** Per-variant text color overrides (variant name → { text, special }) */
  variantTextColors?: Record<string, { text: string; special: string }>
}
