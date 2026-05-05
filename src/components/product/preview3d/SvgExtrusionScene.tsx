'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, PresentationControls, Html } from '@react-three/drei'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { StudioLighting } from './StudioLighting'
import { SvgExtrudedLayer } from './SvgExtrudedLayer'
import { SvgFrontDecal } from './SvgFrontDecal'
import { ExtrudedTextLayer } from './ExtrudedTextLayer'
import { Preview3DLoadingIndicator } from './LoadingSpinner'
import { expandShapes } from '@/lib/preview/expandShapes'
import { useReducedMotion } from '@/lib/hooks/useMediaQuery'
import type { PreviewConfig } from '@/lib/preview/types'
import { getPreviewDisplayText } from '@/lib/preview/textTransform'

interface SvgExtrusionSceneProps {
  config: PreviewConfig
  svgPath: string
  text?: string
  /** Current variant option value (e.g. 'Luffy'). Used to pick per-variant
   *  nameplate box overrides for products exported at slightly different
   *  SVG scales across variants. */
  selectedVariantName?: string
  /** LED toggle — when false, emissive layers render unlit and bloom is disabled. */
  lightOn?: boolean
  /** Extra Y offset in scene units applied to the whole model. Used on
   *  mobile to nudge the sign a bit higher in the viewport. */
  yOffset?: number
}

type FontCommand = {
  type: string
  x?: number
  y?: number
  x1?: number
  y1?: number
  x2?: number
  y2?: number
}

type OpentypeFont = {
  getPath: (text: string, x: number, y: number, fontSize: number) => {
    commands: FontCommand[]
  }
  getAdvanceWidth: (text: string, fontSize: number) => number
}

const DEPTH_SCALE = 0.08
const INTRO_DURATION = 1.1
const INTRO_START_ROTATION: [number, number, number] = [0, 0, 0]
const INTRO_END_ROTATION: [number, number, number] = [0, 0, 0]
const INTRO_START_POSITION: [number, number, number] = [0, 0, 0]
const INTRO_END_POSITION: [number, number, number] = [0, 0, 0]
const INTRO_START_SCALE_MULTIPLIER = 1
const INTRO_END_SCALE_MULTIPLIER = 1
const PRESENTATION_BASE_ROTATION: [number, number, number] = [0, 0, 0]

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function easeOutBack(t: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export function SvgExtrusionScene({ config, svgPath, text, selectedVariantName, lightOn = true, yOffset = 0 }: SvgExtrusionSceneProps) {
  const [svgData, setSvgData] = useState<ReturnType<SVGLoader['parse']> | null>(null)
  // viewBox of the loaded SVG (in raw SVG units). Used by the front-face
  // decal so a PNG authored against the same artboard aligns with the
  // silhouette regardless of how much padding the path leaves around the
  // viewBox edges. `null` while the SVG is still loading or has no viewBox.
  const [svgViewBox, setSvgViewBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [font, setFont] = useState<OpentypeFont | null>(null)
  const [loading, setLoading] = useState(true)
  const groupRef = useRef<THREE.Group>(null)
  const introProgressRef = useRef(0)
  const introFinishedRef = useRef(false)
  const hasPlayedIntroRef = useRef(false)
  const shouldReduceMotion = useReducedMotion()

  // Load and parse the SVG file. When the variant changes and svgPath
  // changes, reset `loading` + clear the previous SVG so the scene
  // falls into its loading branch — otherwise the old model renders
  // until the new one finishes loading, which feels janky.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setSvgData(null)

    async function loadSvg() {
      try {
        const response = await fetch(svgPath)
        const svgText = await response.text()
        const loader = new SVGLoader()
        const data = loader.parse(svgText)

        // Pull viewBox out of the raw XML — SVGLoader doesn't surface it
        // and the front-face decal needs it to size itself against the
        // original artboard (which the painted PNG is exported from)
        // rather than against the path bbox.
        const vbMatch = svgText.match(/viewBox\s*=\s*["']\s*([\d.+-eE\s,]+)\s*["']/)
        let viewBox: { x: number; y: number; width: number; height: number } | null = null
        if (vbMatch && vbMatch[1]) {
          const parts = vbMatch[1].split(/[\s,]+/).map(Number).filter((n) => !Number.isNaN(n))
          if (parts.length >= 4 && parts[2]! > 0 && parts[3]! > 0) {
            viewBox = { x: parts[0]!, y: parts[1]!, width: parts[2]!, height: parts[3]! }
          }
        }

        if (!cancelled) {
          setSvgData(data)
          setSvgViewBox(viewBox)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load SVG:', error)
        if (!cancelled) setLoading(false)
      }
    }

    loadSvg()
    return () => { cancelled = true }
  }, [svgPath])

  // Load font for text layers (if configured)
  useEffect(() => {
    if (!config.font) return
    let cancelled = false

    async function loadFont() {
      try {
        const opentype = await import('opentype.js')
        const fontPath = config.font!.replace('.json', '.ttf')
        const response = await fetch(fontPath)
        const arrayBuffer = await response.arrayBuffer()
        const loadedFont = opentype.parse(arrayBuffer)
        if (!cancelled) setFont(loadedFont)
      } catch (error) {
        console.error('Failed to load font:', error)
      }
    }

    loadFont()
    return () => { cancelled = true }
  }, [config.font])

  // Compute the bounding box center and dimensions of all SVG paths
  const svgBounds = useMemo(() => {
    if (!svgData) return { center: new THREE.Vector2(250, 250), width: 500, height: 500 }

    const bbox = new THREE.Box2()
    for (const path of svgData.paths) {
      for (const subPath of path.subPaths) {
        const points = subPath.getPoints()
        for (const p of points) {
          bbox.expandByPoint(p)
        }
      }
    }

    const center = new THREE.Vector2()
    bbox.getCenter(center)
    const size = new THREE.Vector2()
    bbox.getSize(size)
    return { center, width: size.x, height: size.y }
  }, [svgData])

  const svgCenter = svgBounds.center

  // Display text for text layers
  const displayText = useMemo(() => {
    return getPreviewDisplayText(text, config, 'Name')
  }, [text, config])

  // Centre of the blue (`#0000ff`) marker in the current SVG, used
  // when `autoCenterNameplateOnBlueMarker` is enabled to snap the
  // nameplate onto each variant's actual plate regardless of slight
  // horizontal shifts in the artwork between characters.
  const detectedBlueCenter = useMemo(() => {
    if (!svgData) return null
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    let found = false
    for (const path of svgData.paths) {
      if ('#' + path.color.getHexString() !== '#0000ff') continue
      for (const sub of path.subPaths) {
        for (const p of sub.getPoints()) {
          if (p.x < minX) minX = p.x
          if (p.y < minY) minY = p.y
          if (p.x > maxX) maxX = p.x
          if (p.y > maxY) maxY = p.y
          found = true
        }
      }
    }
    if (!found) return null
    return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 }
  }, [svgData])

  // Pick the "active" nameplate box for the current variant + name
  // length. Per-variant overrides take precedence when configured; then
  // for long names (> nameplateBoxExpandAfter) the expanded box kicks
  // in; otherwise the primary box applies. When
  // `autoCenterNameplateOnBlueMarker` is enabled, the box is
  // re-centred on the detected blue marker — width/height stay from
  // config so the shopper's tuned size is preserved.
  const activeNameplateBox = useMemo(() => {
    const primary = (selectedVariantName && config.variantNameplateBoxes?.[selectedVariantName])
      || config.nameplateBox
    if (!primary) return undefined
    const expanded = (selectedVariantName && config.variantNameplateBoxesExpanded?.[selectedVariantName])
      || config.nameplateBoxExpanded
    const threshold = config.nameplateBoxExpandAfter ?? 7
    const chosen = expanded && displayText.length > threshold ? expanded : primary
    if (config.autoCenterNameplateOnBlueMarker && detectedBlueCenter) {
      return {
        x: detectedBlueCenter.cx - chosen.width / 2,
        y: detectedBlueCenter.cy - chosen.height / 2,
        width: chosen.width,
        height: chosen.height,
      }
    }
    return chosen
  }, [
    config.nameplateBox,
    config.nameplateBoxExpanded,
    config.nameplateBoxExpandAfter,
    config.variantNameplateBoxes,
    config.variantNameplateBoxesExpanded,
    config.autoCenterNameplateOnBlueMarker,
    selectedVariantName,
    displayText.length,
    detectedBlueCenter,
  ])

  // Pick the active painted-front decal for the current variant. Per-variant
  // overrides win; otherwise falls back to the global config.frontDecal.
  // Variants without a decal entry render the existing per-fill paint
  // layers as before.
  const activeFrontDecal = useMemo(() => {
    if (selectedVariantName && config.variantFrontDecals?.[selectedVariantName]) {
      return config.variantFrontDecals[selectedVariantName]
    }
    return config.frontDecal
  }, [config.frontDecal, config.variantFrontDecals, selectedVariantName])

  // Effective per-character step (in fontSize units).
  //
  // Defaults to a small negative overlap so naturally-kerned shapes touch;
  // a positive configured value adds visible gap between letters.
  //
  // Some products want the font to shrink rather than the letter spacing
  // to compress. In that mode this returns the configured spacing and the
  // measured-width font-size path handles overflow.
  //
  // When a nameplateBox is defined, we *adaptively reduce* the spacing for
  // long names so they still fit inside the plate at the base font size:
  // for short names the configured spacing wins, but if even the
  // base-size text would overrun the nameplate, spacing is reduced
  // exactly enough to fit (clamped at -0.1 so letters can't overlap
  // beyond the default contour-touching behaviour).
  const effectiveLetterSpacing = useMemo(() => {
    const configured = config.textLetterSpacing ?? -0.1
    const exactSpacing = config.textLetterSpacingByLength?.[displayText.length]
    if (exactSpacing !== undefined) return exactSpacing
    if (
      config.textLetterSpacingAfterLength !== undefined
      && config.textLetterSpacingAfterValue !== undefined
    ) {
      return displayText.length > config.textLetterSpacingAfterLength
        ? config.textLetterSpacingAfterValue
        : configured
    }
    if (config.textPreserveLetterSpacing) return configured
    if (!font || !activeNameplateBox || !config.textLayers) return configured

    const gapCount = Math.max(0, displayText.length - 1)
    if (gapCount === 0) return configured

    const baseFontSize = config.textFontSize ?? 150
    const naturalWidth = font.getAdvanceWidth(displayText, baseFontSize) as number
    if (!naturalWidth || naturalWidth <= 0) return configured

    const targetRatio = config.textMaxWidthRatio ?? 0.95
    const targetWidth = activeNameplateBox.width * targetRatio

    // Spacing that would make text exactly fill targetWidth at baseFontSize.
    // Positive → extra gap; negative → overlap.
    const fittingSpacing = (targetWidth - naturalWidth) / (gapCount * baseFontSize)

    // Never more than the configured spacing (short names keep the
    // desired inscription feel). Never below `textMinLetterSpacing`
    // (default -0.1). Raising the floor toward 0 stops long names from
    // overlapping and forces the font-size path to shrink instead.
    const minSpacing = config.textMinLetterSpacing ?? -0.1
    return Math.max(minSpacing, Math.min(configured, fittingSpacing))
  }, [
    font,
    displayText,
    config.textLetterSpacing,
    config.textLetterSpacingByLength,
    config.textLetterSpacingAfterLength,
    config.textLetterSpacingAfterValue,
    config.textPreserveLetterSpacing,
    config.textFontSize,
    config.textLayers,
    activeNameplateBox,
    config.textMaxWidthRatio,
    config.textMinLetterSpacing,
  ])

  // Auto-scale font size so text width fills a target ratio of the available
  // width — the nameplate box when defined, otherwise the full SVG width.
  // Letter spacing is factored in so names won't overrun the plate even
  // when the config adds extra per-character gap.
  const effectiveFontSize = useMemo(() => {
    const baseFontSize = config.textFontSize ?? 150
    if (!font || !config.textLayers) return baseFontSize

    const targetRatio = config.textMaxWidthRatio ?? 0.95
    const referenceWidth = activeNameplateBox?.width ?? svgBounds.width
    const targetWidth = referenceWidth * targetRatio

    // Measure text advance width at the base font size, then add the
    // per-letter spacing that the renderer will apply so the scale
    // reflects the actual drawn width.
    const naturalWidth = font.getAdvanceWidth(displayText, baseFontSize) as number
    if (!naturalWidth || naturalWidth <= 0) return baseFontSize
    const gapCount = Math.max(0, displayText.length - 1)
    const textWidth = naturalWidth + gapCount * baseFontSize * effectiveLetterSpacing

    // Scale font size proportionally
    const scaled = baseFontSize * (targetWidth / textWidth)

    // Floor the font at the base size so long names keep their weight
    // (no shrink-to-fit), cap at the nameplate height for short names so
    // they don't grow taller than the plate. Short names can exceed the
    // base size up to 5×; long names stay at exactly the base size.
    const maxHeight = activeNameplateBox?.height
    let heightRatio = config.textMaxHeightRatio ?? 0.9
    if (config.textMaxHeightRatioByLength) {
      const matchingLength = Object.keys(config.textMaxHeightRatioByLength)
        .map(Number)
        .filter((length) => length <= displayText.length)
        .sort((a, b) => b - a)[0]
      if (matchingLength !== undefined) {
        heightRatio = config.textMaxHeightRatioByLength[matchingLength] ?? heightRatio
      }
    }
    const heightCap = maxHeight ? maxHeight * heightRatio : Infinity

    if (config.textFixedFontSize) {
      return Math.min(baseFontSize, heightCap)
    }

    if (config.textShrinkToFit) {
      return Math.min(heightCap, Math.min(baseFontSize * 5, scaled))
    }

    // Size floor determines how small the font can get. Per-length
    // overrides (textShrinkFloorByLength) always win — use them to
    // relax the floor for specific name lengths that overflow without
    // affecting every other length. Otherwise, if the length exceeds
    // textShrinkAfter, use the default shrink ratio. Otherwise, the
    // font stays at (or above) the base size.
    const perLengthOverride = config.textShrinkFloorByLength?.[displayText.length]
    let sizeFloor = baseFontSize
    if (perLengthOverride !== undefined) {
      sizeFloor = baseFontSize * perLengthOverride
    } else {
      const shrinkAfter = config.textShrinkAfter ?? Infinity
      if (displayText.length > shrinkAfter) {
        const shrinkFloorRatio = config.textShrinkFloorRatio ?? 0.85
        sizeFloor = baseFontSize * shrinkFloorRatio
      }
    }

    return Math.min(
      heightCap,
      Math.max(sizeFloor, Math.min(baseFontSize * 5, scaled)),
    )
  }, [font, displayText, config.textFontSize, config.textLayers, config.textMaxWidthRatio, config.textMaxHeightRatio, config.textMaxHeightRatioByLength, config.textFixedFontSize, config.textShrinkAfter, config.textShrinkFloorRatio, config.textShrinkFloorByLength, config.textShrinkToFit, activeNameplateBox, svgBounds.width, effectiveLetterSpacing])

  const textHorizontalScale = useMemo(() => {
    if (!config.textSqueezeToFit || !font || !config.textLayers) return 1

    const targetRatio = config.textMaxWidthRatio ?? 0.95
    const referenceWidth = activeNameplateBox?.width ?? svgBounds.width
    const targetWidth = referenceWidth * targetRatio
    const naturalWidth = font.getAdvanceWidth(displayText, effectiveFontSize) as number
    if (!naturalWidth || naturalWidth <= 0) return 1

    const gapCount = Math.max(0, displayText.length - 1)
    const textWidth = naturalWidth + gapCount * effectiveFontSize * effectiveLetterSpacing
    if (textWidth <= targetWidth) return 1

    const minScale = config.textMinHorizontalScale ?? 0.7
    return Math.max(minScale, targetWidth / textWidth)
  }, [
    font,
    displayText,
    config.textSqueezeToFit,
    config.textLayers,
    config.textMaxWidthRatio,
    config.textMinHorizontalScale,
    activeNameplateBox,
    svgBounds.width,
    effectiveFontSize,
    effectiveLetterSpacing,
  ])

  // Compute text shapes ONCE using per-character contour classification.
  // Shared between textSubtractGeometry and ExtrudedTextLayer to avoid
  // redundant expensive computation on every text change.
  //
  // Returns both the full shape list AND a "centering bounds" bbox that
  // excludes characters listed in `textCharCenterExclude`. This lets us
  // centre the text block using only the "normal" glyphs, so an outlier
  // like Q — with an oversized descender — no longer drags the whole
  // text upward when someone adds it to their name.
  const textData = useMemo(() => {
    if (!font) return null

    const fontSize = effectiveFontSize
    const allShapes: THREE.Shape[] = []
    const excludeSet = new Set((config.textCharCenterExclude ?? []).map((c) => c.toUpperCase()))
    // Bbox of the shapes that should drive centering (excluded chars
    // don't influence it). Falls back to the full bbox later if every
    // character in the name happens to be excluded.
    const centerBB = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    const fullBB = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    let cursorX = 0

    for (let ci = 0; ci < displayText.length; ci++) {
      const char = displayText[ci]!
      const charUpper = char.toUpperCase()
      // Per-character size override: lets us shrink glyphs whose bbox
      // overshoots the rest (e.g. a Q with an oversized descender that
      // pushes the vertically-centred text block upward).
      const charScale = config.textCharScale?.[char] ?? config.textCharScale?.[charUpper] ?? 1
      const charOffsetY = (config.textCharOffsetY?.[char] ?? config.textCharOffsetY?.[charUpper] ?? 0) * fontSize
      const charAdvanceScale = config.textCharAdvanceScale?.[char] ?? config.textCharAdvanceScale?.[charUpper] ?? 1
      const charScaleY = config.textCharScaleY?.[char] ?? config.textCharScaleY?.[charUpper] ?? 1
      const isExcluded = excludeSet.has(charUpper)
      const charPath = font.getPath(char, 0, 0, fontSize * charScale)
      const charCmds = charPath.commands

      let minX = Infinity, maxX = -Infinity
      let minY = Infinity, maxY = -Infinity
      for (const cmd of charCmds) {
        if (cmd.x !== undefined) { minX = Math.min(minX, cmd.x); maxX = Math.max(maxX, cmd.x) }
        if (cmd.x1 !== undefined) { minX = Math.min(minX, cmd.x1); maxX = Math.max(maxX, cmd.x1) }
        if (cmd.x2 !== undefined) { minX = Math.min(minX, cmd.x2); maxX = Math.max(maxX, cmd.x2) }
        if (cmd.y !== undefined) { minY = Math.min(minY, cmd.y); maxY = Math.max(maxY, cmd.y) }
        if (cmd.y1 !== undefined) { minY = Math.min(minY, cmd.y1); maxY = Math.max(maxY, cmd.y1) }
        if (cmd.y2 !== undefined) { minY = Math.min(minY, cmd.y2); maxY = Math.max(maxY, cmd.y2) }
      }
      if (minX === Infinity) continue

      // Symmetric tightening: when advanceScale < 1, pull this glyph
      // back by half the "saved" width so neighbours on both sides
      // close in (pure after-shrink would only tighten the right side).
      const advanceShrink = (1 - charAdvanceScale) * (maxX - minX)
      if (advanceShrink !== 0) cursorX -= advanceShrink / 2

      const offsetX = cursorX - minX
      // Y-only scale pivots around the glyph's vertical centre so the
      // visual position stays put while the height changes. Width is
      // untouched. Identity when charScaleY === 1.
      const yCentre = minY === Infinity ? 0 : (minY + maxY) / 2
      const scaleAroundY = (y: number) => yCentre + (y - yCentre) * charScaleY
      const transformed: FontCommand[] = charCmds.map((cmd) => {
        const shifted: FontCommand = { ...cmd }
        if (shifted.x !== undefined) shifted.x += offsetX
        if (shifted.x1 !== undefined) shifted.x1 += offsetX
        if (shifted.x2 !== undefined) shifted.x2 += offsetX
        if (charScaleY !== 1) {
          if (shifted.y !== undefined) shifted.y = scaleAroundY(shifted.y)
          if (shifted.y1 !== undefined) shifted.y1 = scaleAroundY(shifted.y1)
          if (shifted.y2 !== undefined) shifted.y2 = scaleAroundY(shifted.y2)
        }
        if (charOffsetY !== 0) {
          if (shifted.y !== undefined) shifted.y += charOffsetY
          if (shifted.y1 !== undefined) shifted.y1 += charOffsetY
          if (shifted.y2 !== undefined) shifted.y2 += charOffsetY
        }
        return shifted
      })

      const charContours: FontCommand[][] = []
      let cur: FontCommand[] = []
      for (const cmd of transformed) {
        if (cmd.type === 'M' && cur.length > 0) { charContours.push(cur); cur = [] }
        cur.push(cmd)
      }
      if (cur.length > 0) charContours.push(cur)

      const contourData = charContours.map(cmds => {
        const p = new THREE.Path()
        for (const cmd of cmds) {
          switch (cmd.type) {
            case 'M': p.moveTo(cmd.x!, cmd.y!); break
            case 'L': p.lineTo(cmd.x!, cmd.y!); break
            case 'Q': p.quadraticCurveTo(cmd.x1!, cmd.y1!, cmd.x!, cmd.y!); break
            case 'C': p.bezierCurveTo(cmd.x1!, cmd.y1!, cmd.x2!, cmd.y2!, cmd.x!, cmd.y!); break
          }
        }
        const points = p.getPoints(24)
        const bb = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
        for (const pt of points) {
          if (pt.x < bb.minX) bb.minX = pt.x; if (pt.y < bb.minY) bb.minY = pt.y
          if (pt.x > bb.maxX) bb.maxX = pt.x; if (pt.y > bb.maxY) bb.maxY = pt.y
        }
        return { points, area: Math.abs(THREE.ShapeUtils.area(points)), bounds: bb }
      }).filter(c => c.points.length > 0)

      contourData.sort((a, b) => b.area - a.area)
      const nestingDepth = contourData.map(() => 0)
      const immediateParent = contourData.map(() => -1)
      const CONTAIN_TOL = 5

      for (let i = 1; i < contourData.length; i++) {
        const testPoint = contourData[i]!.points[0]
        if (!testPoint) continue
        for (let j = i - 1; j >= 0; j--) {
          const cj = contourData[j]!
          const ci2 = contourData[i]!
          const bboxContained =
            ci2.bounds.minX >= cj.bounds.minX - CONTAIN_TOL &&
            ci2.bounds.maxX <= cj.bounds.maxX + CONTAIN_TOL &&
            ci2.bounds.minY >= cj.bounds.minY - CONTAIN_TOL &&
            ci2.bounds.maxY <= cj.bounds.maxY + CONTAIN_TOL
          if (bboxContained) {
            let inside = false
            const polygon = cj.points
            for (let pi = 0, pj = polygon.length - 1; pi < polygon.length; pj = pi++) {
              const a = polygon[pi]!, b = polygon[pj]!
              if (((a.y > testPoint.y) !== (b.y > testPoint.y)) &&
                  (testPoint.x < (b.x - a.x) * (testPoint.y - a.y) / (b.y - a.y) + a.x)) {
                inside = !inside
              }
            }
            if (inside) {
              nestingDepth[i]!++
              if (immediateParent[i] === -1) immediateParent[i] = j
            }
          }
        }
      }

      // Even depth = outer, odd = hole
      const charShapeMap = new Map<number, THREE.Shape>()
      for (let i = 0; i < contourData.length; i++) {
        if ((nestingDepth[i] ?? 0) % 2 === 0) {
          const shape = new THREE.Shape(contourData[i]!.points)
          allShapes.push(shape)
          charShapeMap.set(i, shape)
        }
      }
      for (let i = 0; i < contourData.length; i++) {
        if ((nestingDepth[i] ?? 0) % 2 === 1) {
          let parent: number = immediateParent[i] ?? -1
          while (parent !== -1 && ((nestingDepth[parent] ?? 0) % 2 !== 0)) {
            parent = immediateParent[parent] ?? -1
          }
          if (parent !== -1) {
            const parentShape = charShapeMap.get(parent)
            if (parentShape) {
              parentShape.holes.push(new THREE.Path(contourData[i]!.points))
            }
          }
        }
      }

      // Track this character's aggregate bbox (from its outer contours
      // only — holes live inside those). Every char contributes to the
      // full bbox; only non-excluded chars contribute to the centering
      // bbox, so an outlier glyph (e.g. Q's descender) can't drag the
      // rest of the text off-centre.
      for (let i = 0; i < contourData.length; i++) {
        if ((nestingDepth[i] ?? 0) % 2 !== 0) continue
        const b = contourData[i]!.bounds
        if (b.minX < fullBB.minX) fullBB.minX = b.minX
        if (b.minY < fullBB.minY) fullBB.minY = b.minY
        if (b.maxX > fullBB.maxX) fullBB.maxX = b.maxX
        if (b.maxY > fullBB.maxY) fullBB.maxY = b.maxY
        if (!isExcluded) {
          if (b.minX < centerBB.minX) centerBB.minX = b.minX
          if (b.minY < centerBB.minY) centerBB.minY = b.minY
          if (b.maxX > centerBB.maxX) centerBB.maxX = b.maxX
          if (b.maxY > centerBB.maxY) centerBB.maxY = b.maxY
        }
      }

      // Advance cursor by this character's width, then apply the configured
      // letter spacing (negative = overlap to keep shapes touching,
      // positive = visible gap between letters). Subtract the remaining
      // half of the advance shrinkage so the full symmetric tighten
      // takes effect.
      cursorX = maxX + offsetX + fontSize * effectiveLetterSpacing - advanceShrink / 2
    }

    if (allShapes.length === 0) return null

    // Hybrid centering bbox: X comes from the full bbox (so the text
    // stays horizontally balanced when an excluded glyph like Q sits at
    // an edge), Y from the non-excluded bbox (so Q's descender can't
    // drag the text block upward). If nothing is excluded, both come
    // from the full bbox and behaviour matches the pre-exclusion code.
    const yRef = centerBB.minX !== Infinity ? centerBB : fullBB
    const centerBounds = {
      minX: fullBB.minX,
      maxX: fullBB.maxX,
      minY: yRef.minY,
      maxY: yRef.maxY,
    }
    return { shapes: allShapes, centerBounds }
  }, [font, displayText, effectiveFontSize, effectiveLetterSpacing, config.textCharScale, config.textCharCenterExclude, config.textCharOffsetY, config.textCharAdvanceScale, config.textCharScaleY])

  const textShapes = textData?.shapes ?? null
  const textCenterBounds = textData?.centerBounds ?? null

  // Generate 3D text stroke geometry for CSG subtraction from SVG layers.
  // Uses the shared textShapes (computed once above).
  const textSubtractGeometry = useMemo(() => {
    if (!textShapes || !config.textLayers) return null

    const strokeLayer = config.textLayers.find(l => l.strokeWidth)
    if (!strokeLayer) return null

    // Strip holes for solid subtraction outlines
    const solidShapes = textShapes
      .map(s => { const pts = s.getPoints(); return pts.length > 0 ? new THREE.Shape(pts) : null })
      .filter((s): s is THREE.Shape => s !== null)
    if (solidShapes.length === 0) return null

    const expanded = expandShapes(solidShapes, strokeLayer.strokeWidth!)
    if (expanded.length === 0) return null

    // Keep the cut aligned with the rendered text: prefer the
    // non-excluded-char bbox (same reference ExtrudedTextLayer uses for
    // centering) so Q's descender doesn't shift the cut relative to
    // the glyphs it's meant to carve out of.
    let textCenterX: number
    let textCenterY: number
    if (textCenterBounds) {
      textCenterX = (textCenterBounds.minX + textCenterBounds.maxX) / 2
      textCenterY = (textCenterBounds.minY + textCenterBounds.maxY) / 2
    } else {
      let bMinX = Infinity, bMinY = Infinity, bMaxX = -Infinity, bMaxY = -Infinity
      for (const shape of expanded) {
        for (const pt of shape.getPoints()) {
          if (pt.x < bMinX) bMinX = pt.x
          if (pt.y < bMinY) bMinY = pt.y
          if (pt.x > bMaxX) bMaxX = pt.x
          if (pt.y > bMaxY) bMaxY = pt.y
        }
      }
      textCenterX = (bMinX + bMaxX) / 2
      textCenterY = (bMinY + bMaxY) / 2
    }

    // Strip any remaining holes — solid fill for subtraction
    const finalShapes = expanded.map(shape => new THREE.Shape(shape.getPoints()))

    const maxSvgZ = Math.max(...config.layers.map(l => (l.offsetZ ?? 0) + l.depth))
    const cutDepth = (maxSvgZ + 4) * DEPTH_SCALE

    const geo = new THREE.ExtrudeGeometry(finalShapes, {
      depth: cutDepth,
      bevelEnabled: false,
      steps: 1,
    })

    geo.translate(-textCenterX, -textCenterY, -DEPTH_SCALE)
    geo.scale(textHorizontalScale, 1, 1)
    geo.translate(svgCenter.x, svgCenter.y, 0)
    return geo
  }, [textShapes, textCenterBounds, config.textLayers, config.layers, svgCenter, textHorizontalScale])

  // CSG subtraction geometry built from every `mode: 'cut'` layer.
  // Unlike the `shape.holes.push()` fallback (which is fragile when SVG
  // path winding is inconsistent), this does a real boolean subtract via
  // three-bvh-csg, so cut shapes reliably carve holes out of paint
  // layers regardless of how the cut path was drawn.
  const cutSubtractGeometry = useMemo(() => {
    if (!svgData) return null

    const shapes: THREE.Shape[] = []
    for (const layer of config.layers) {
      if (layer.mode !== 'cut') continue
      const matchHex = (layer.svgColor || layer.color).toLowerCase()
      for (const svgPath of svgData.paths) {
        if ('#' + svgPath.color.getHexString() === matchHex) {
          shapes.push(...SVGLoader.createShapes(svgPath))
        }
      }
    }
    if (shapes.length === 0) return null

    // Extrude deep enough to fully punch through every paint layer
    // stacked above the silhouette (offsetZ + depth). Bottom is nudged
    // slightly below z=0 so the cut also clears the silhouette's top
    // face if the shopper happens to see it.
    const maxSvgZ = Math.max(...config.layers.map(l => (l.offsetZ ?? 0) + l.depth))
    const cutDepth = (maxSvgZ + 4) * DEPTH_SCALE

    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: cutDepth,
      bevelEnabled: false,
      steps: 1,
    })
    geo.translate(0, 0, -DEPTH_SCALE)
    return geo
  }, [svgData, config.layers])

  // Merge text-stroke subtract and cut-shape subtract when both exist so
  // paint layers only need a single CSG subtract per extrusion.
  const combinedSubtractGeometry = useMemo(() => {
    const parts: THREE.BufferGeometry[] = []
    if (textSubtractGeometry) parts.push(textSubtractGeometry)
    if (cutSubtractGeometry) parts.push(cutSubtractGeometry)
    if (parts.length === 0) return null
    if (parts.length === 1) return parts[0]!
    return mergeGeometries(parts)
  }, [textSubtractGeometry, cutSubtractGeometry])

  const scale = config.scale ?? 0.02
  const groundY = yOffset - (svgBounds.height * scale) / 2 - (config.scene?.groundPadding ?? 0.15)
  const useCameraOrbit = config.scene?.variant === 'lightbox'
  const controlsTarget: [number, number, number] = [0, yOffset, 0]
  const shouldAnimateIntro = !shouldReduceMotion && !hasPlayedIntroRef.current
  const initialScaleMultiplier = shouldAnimateIntro ? INTRO_START_SCALE_MULTIPLIER : INTRO_END_SCALE_MULTIPLIER
  const initialRotation = shouldAnimateIntro ? INTRO_START_ROTATION : INTRO_END_ROTATION
  const initialPosition = shouldAnimateIntro ? INTRO_START_POSITION : INTRO_END_POSITION

  useEffect(() => {
    if (shouldReduceMotion) {
      hasPlayedIntroRef.current = true
      introProgressRef.current = 1
      introFinishedRef.current = true
      return
    }

    if (hasPlayedIntroRef.current) {
      introProgressRef.current = 1
      introFinishedRef.current = true
      return
    }

    introProgressRef.current = 0
    introFinishedRef.current = false
  }, [shouldReduceMotion])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return

    if (shouldReduceMotion) {
      group.rotation.set(...INTRO_END_ROTATION)
      group.position.set(...INTRO_END_POSITION)
      group.scale.set(scale, -scale, 1)
      return
    }

    if (introFinishedRef.current) return

    introProgressRef.current = Math.min(1, introProgressRef.current + delta / INTRO_DURATION)
    const t = introProgressRef.current
    const rotationT = easeOutCubic(t)
    const positionT = easeOutCubic(t)
    const scaleT = easeOutBack(t)

    group.rotation.set(
      THREE.MathUtils.lerp(INTRO_START_ROTATION[0], INTRO_END_ROTATION[0], rotationT),
      THREE.MathUtils.lerp(INTRO_START_ROTATION[1], INTRO_END_ROTATION[1], rotationT),
      THREE.MathUtils.lerp(INTRO_START_ROTATION[2], INTRO_END_ROTATION[2], rotationT),
    )
    group.position.set(
      THREE.MathUtils.lerp(INTRO_START_POSITION[0], INTRO_END_POSITION[0], positionT),
      THREE.MathUtils.lerp(INTRO_START_POSITION[1], INTRO_END_POSITION[1], positionT),
      THREE.MathUtils.lerp(INTRO_START_POSITION[2], INTRO_END_POSITION[2], positionT),
    )

    const scaleMultiplier = THREE.MathUtils.lerp(INTRO_START_SCALE_MULTIPLIER, INTRO_END_SCALE_MULTIPLIER, scaleT)
    group.scale.set(scale * scaleMultiplier, -scale * scaleMultiplier, 1)

    if (t >= 1) {
      introFinishedRef.current = true
      hasPlayedIntroRef.current = true
    }
  })

  // Dispose Three.js geometries/materials on unmount to prevent WebGL memory leaks
  useEffect(() => {
    return () => {
      if (groupRef.current) {
        groupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose()
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose())
            } else if (child.material) {
              child.material.dispose()
            }
          }
        })
      }
      // Also dispose the standalone textSubtractGeometry if present
      textSubtractGeometry?.dispose()
    }
  }, [textSubtractGeometry])

  if (loading || !svgData || (config.font && !font)) {
    return (
      <>
        <color attach="background" args={[config.background || '#0a0a12']} />
        <StudioLighting scene={config.scene} floorY={groundY} lightOn={lightOn} />
        <Html center>
          <Preview3DLoadingIndicator />
        </Html>
      </>
    )
  }

  return (
    <>
      <color attach="background" args={[config.background || '#0a0a12']} />

      <StudioLighting scene={config.scene} floorY={groundY} lightOn={lightOn} />

      {/* Scale SVG coords to scene units, flip Y, and center. Lightbox
          scenes keep the mesh fixed on the surface and orbit the camera
          instead, so the base cannot rotate through the floor. */}
      <group position={[0, yOffset, 0]}>
      <PresentationControls
        global
        cursor
        enabled={!useCameraOrbit}
        speed={1}
        zoom={1}
        rotation={PRESENTATION_BASE_ROTATION}
        polar={useCameraOrbit ? [0, 0] : [-0.35, 0.35]}
        azimuth={useCameraOrbit ? [0, 0] : [-0.85, 0.85]}
      >
        <group
          ref={groupRef}
          scale={[scale * initialScaleMultiplier, -scale * initialScaleMultiplier, 1]}
          rotation={initialRotation}
          position={initialPosition}
        >
          <group position={[-svgCenter.x, -svgCenter.y, 0]}>
            {config.layers
              .filter((layer) => layer.mode !== 'cut')
              .map((layer, index) => (
                <SvgExtrudedLayer
                  key={`${index}-${layer.color}`}
                  svgData={svgData}
                  matchColor={layer.svgColor || layer.color}
                  layer={layer}
                  depthScale={DEPTH_SCALE}
                  // Only paint layers (offsetZ > 0) receive CSG cuts —
                  // the base silhouette at offsetZ=0 stays intact so
                  // carved regions reveal solid black underneath.
                  subtractGeometry={
                    (layer.offsetZ ?? 0) > 0
                      ? combinedSubtractGeometry ?? undefined
                      : undefined
                  }
                  lightOn={lightOn}
                />
              ))}
            {/* Painted front decal — replaces the per-fill paint layers
                with a single PNG/WebP authored from the same artboard as
                the silhouette. Mirrors the real product's UV-painted face
                so gradients and character art render with full fidelity. */}
            {activeFrontDecal && (
              <SvgFrontDecal
                config={activeFrontDecal}
                viewBox={svgViewBox}
                depthScale={DEPTH_SCALE}
                lightOn={lightOn}
              />
            )}
          </group>

          {/* Text layers — centered on the SVG, or in the nameplate box
              (in SVG coords) when the product places text inside the art. */}
          {textShapes && config.textLayers && config.textLayers.length > 0 && (() => {
            const nb = activeNameplateBox
            // ExtrudedTextLayer renders the shape centered at (0,0) in its own
            // frame and flips Y with scale[1,-1,1]. The parent group below
            // positions that origin in SVG-space-relative-to-svg-center; Y is
            // SVG-down so we use (nbCenterY - svgCenter.y) directly (not
            // negated) because the outer group's -Y scale already flips.
            const localX = nb ? nb.x + nb.width / 2 - svgCenter.x : 0
            const localY = nb ? nb.y + nb.height / 2 - svgCenter.y : 0
            return (
              <group
                position={[localX, localY, 0.02]}
                scale={[textHorizontalScale, -1, 1]}
              >
                {config.textLayers.map((layer, index) => (
                  <ExtrudedTextLayer
                    key={`text-${index}-${layer.color}`}
                    shapes={textShapes}
                    layer={layer}
                    depthScale={DEPTH_SCALE}
                    lightOn={lightOn}
                    centerBounds={textCenterBounds}
                  />
                ))}
              </group>
            )
          })()}
        </group>
      </PresentationControls>
      </group>

      {!useCameraOrbit && (
        <ContactShadows
          position={[0, groundY + 0.05, 0]}
          opacity={config.scene?.shadowOpacity ?? 0.2}
          scale={60}
          blur={2.8}
          far={20}
        />
      )}

      <OrbitControls
        enablePan={false}
        enableRotate={useCameraOrbit}
        enableZoom={!useCameraOrbit}
        enableDamping={useCameraOrbit}
        dampingFactor={0.08}
        minDistance={useCameraOrbit ? 11 : 5}
        maxDistance={useCameraOrbit ? 15 : 40}
        autoRotate={false}
        autoRotateSpeed={0}
        maxPolarAngle={useCameraOrbit ? Math.PI * 0.53 : Math.PI * 0.7}
        minPolarAngle={useCameraOrbit ? Math.PI * 0.47 : Math.PI * 0.3}
        minAzimuthAngle={useCameraOrbit ? -0.25 : -Infinity}
        maxAzimuthAngle={useCameraOrbit ? 0.25 : Infinity}
        target={controlsTarget}
      />

      {/* Bloom post-processing — gives emissive layers true light-bleed
          so the product reads as LED-lit instead of just surface-tinted.
          Opt-in via config so flat-acrylic products don't pay the cost.
          Disabled when the LED toggle is off so the "unlit" look is clean. */}
      {config.postprocessingBloom && lightOn && (
        <EffectComposer>
          <Bloom
            intensity={
              typeof config.postprocessingBloom === 'object'
                ? config.postprocessingBloom.intensity ?? 1.2
                : 1.2
            }
            luminanceThreshold={
              typeof config.postprocessingBloom === 'object'
                ? config.postprocessingBloom.luminanceThreshold ?? 0.3
                : 0.3
            }
            luminanceSmoothing={
              typeof config.postprocessingBloom === 'object'
                ? config.postprocessingBloom.luminanceSmoothing ?? 0.9
                : 0.9
            }
            mipmapBlur
          />
        </EffectComposer>
      )}
    </>
  )
}
