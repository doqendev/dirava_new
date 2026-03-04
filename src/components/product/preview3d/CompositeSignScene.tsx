'use client'

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, Html, ContactShadows, PresentationControls } from '@react-three/drei'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import ClipperLib from 'clipper-lib'
import { StudioLighting } from './StudioLighting'
import { Preview3DLoadingIndicator } from './LoadingSpinner'
import { useReducedMotion } from '@/lib/hooks/useMediaQuery'
import { expandShapes } from '@/lib/preview/expandShapes'
import type { PreviewConfig, LayerConfig } from '@/lib/preview/types'
import { getPreviewDisplayText } from '@/lib/preview/textTransform'

interface CompositeSignSceneProps {
  config: PreviewConfig
  svgPath?: string
  text?: string
  selectedVariantName?: string
  sceneRef?: React.Ref<THREE.Group>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OpentypeFont = any

type ParsedSvg = ReturnType<SVGLoader['parse']>

const DEPTH_SCALE = 0.08
const TOP_BAR_VIEWBOX_WIDTH = 3112

// Independent bar positioning (SVG units)
const TOP_BAR_X = -160
const TOP_BAR_Y = -70
const BOTTOM_BAR_X = -160
const BOTTOM_BAR_Y = 250
// Overlap between tiled pieces — diagonal edges require significant overlap
const TILE_OVERLAP = 105
// Extra X nudge for the final piece
const FINAL_X_NUDGE = 95
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

function colorMatch(svgColor: THREE.Color, targetHex: string): boolean {
  return '#' + svgColor.getHexString() === targetHex.toLowerCase()
}

function extractShapes(path: ParsedSvg['paths'][number]): THREE.Shape[] {
  const direct = SVGLoader.createShapes(path)
  if (direct.length > 0) return direct

  // Fallback for paths where createShapes may return empty (complex/self-intersecting contours).
  const withToShapes = typeof path.toShapes === 'function'
    ? (path.toShapes(true) as THREE.Shape[])
    : []
  if (withToShapes.length > 0) return withToShapes

  const fromSubPaths: THREE.Shape[] = []
  for (const subPath of path.subPaths) {
    const pts = subPath.getPoints(48)
    if (pts.length >= 3) {
      fromSubPaths.push(new THREE.Shape(pts))
    }
  }
  return fromSubPaths
}

function getShapesForColor(svgData: ParsedSvg, colorHex: string): THREE.Shape[] {
  const shapes: THREE.Shape[] = []
  for (const path of svgData.paths) {
    if (colorMatch(path.color, colorHex)) {
      shapes.push(...extractShapes(path))
    }
  }
  return shapes
}

function expandBoundsWithGeometry(
  bounds: THREE.Box3,
  geometry: THREE.BufferGeometry,
  position: [number, number, number],
  scale: [number, number, number] = [1, 1, 1],
) {
  if (!geometry.boundingBox) geometry.computeBoundingBox()
  if (!geometry.boundingBox) return false

  const transformed = geometry.boundingBox.clone()
  const matrix = new THREE.Matrix4().compose(
    new THREE.Vector3(position[0], position[1], position[2]),
    new THREE.Quaternion(),
    new THREE.Vector3(scale[0], scale[1], scale[2]),
  )
  transformed.applyMatrix4(matrix)

  if (bounds.isEmpty()) {
    bounds.copy(transformed)
  } else {
    bounds.union(transformed)
  }
  return true
}

/** Compute the X-axis bounding box of all paths in an SVG */
function getSvgContentBounds(svgData: ParsedSvg) {
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity
  for (const path of svgData.paths) {
    for (const subPath of path.subPaths) {
      const points = subPath.getPoints()
      for (const p of points) {
        if (p.x < minX) minX = p.x
        if (p.x > maxX) maxX = p.x
        if (p.y < minY) minY = p.y
        if (p.y > maxY) maxY = p.y
      }
    }
  }
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY }
}

interface TilingMetrics {
  startOffset: number  // x offset for first middle piece
  middleStep: number   // x step between middles
  finalOffset: number  // x offset for final piece
  totalWidth: number   // total width of the composition
  middleYOffset: number // y adjustment to align middle baseline with start
  finalYOffset: number  // y adjustment to align final baseline with start
}

function computeTilingMetrics(
  parts: { start: ParsedSvg; middle: ParsedSvg; final: ParsedSvg },
  tileCount: number,
): TilingMetrics {
  const startBounds = getSvgContentBounds(parts.start)
  const middleBounds = getSvgContentBounds(parts.middle)
  const finalBounds = getSvgContentBounds(parts.final)

  // Use the actual content right edge of start as offset for first middle
  // Subtract middle's left margin and add overlap so pieces connect seamlessly
  const startOffset = startBounds.maxX - middleBounds.minX - TILE_OVERLAP
  // Use actual content width of middle for tiling step, with overlap
  const middleStep = middleBounds.width - TILE_OVERLAP
  // Final piece offset
  const finalOffset = startOffset + tileCount * middleStep - finalBounds.minX - TILE_OVERLAP + FINAL_X_NUDGE
  // Total width
  const totalWidth = finalOffset + finalBounds.maxX

  // Baseline alignment: align bottom edges (maxY) of all pieces to the start piece
  const baselineY = startBounds.maxY
  const middleYOffset = baselineY - middleBounds.maxY
  const finalYOffset = baselineY - finalBounds.maxY

  return { startOffset, middleStep, finalOffset, totalWidth, middleYOffset, finalYOffset }
}

function buildTiledBarGeometry(
  parts: { start: ParsedSvg; middle: ParsedSvg; final: ParsedSvg },
  colorHex: string,
  tileCount: number,
  metrics: TilingMetrics,
  extrudeSettings: THREE.ExtrudeGeometryOptions,
): THREE.BufferGeometry | null {
  const geos: THREE.BufferGeometry[] = []

  // Start piece (at x=0)
  const startShapes = getShapesForColor(parts.start, colorHex)
  if (startShapes.length > 0) {
    geos.push(new THREE.ExtrudeGeometry(startShapes, extrudeSettings))
  }

  // Middle pieces (tiled, baseline-aligned)
  const middleShapes = getShapesForColor(parts.middle, colorHex)
  if (middleShapes.length > 0) {
    for (let i = 0; i < tileCount; i++) {
      const geo = new THREE.ExtrudeGeometry(middleShapes, extrudeSettings)
      geo.translate(metrics.startOffset + i * metrics.middleStep, metrics.middleYOffset, 0)
      geos.push(geo)
    }
  }

  // Final piece (baseline-aligned)
  const finalShapes = getShapesForColor(parts.final, colorHex)
  if (finalShapes.length > 0) {
    const geo = new THREE.ExtrudeGeometry(finalShapes, extrudeSettings)
    geo.translate(metrics.finalOffset, metrics.finalYOffset, 0)
    geos.push(geo)
  }

  if (geos.length === 0) return null

  const merged = mergeGeometries(geos)
  for (const g of geos) g.dispose()

  if (merged) merged.computeVertexNormals()
  return merged
}

function SceneLoadingSpinner({ label }: { label: string }) {
  return (
    <Html center>
      <Preview3DLoadingIndicator label={label} />
    </Html>
  )
}

export function CompositeSignScene({ config, svgPath, text, selectedVariantName, sceneRef }: CompositeSignSceneProps) {
  const barParts = config.barParts
  const groupRef = useRef<THREE.Group>(null!)
  const introProgressRef = useRef(0)
  const introFinishedRef = useRef(false)
  const hasPlayedIntroRef = useRef(false)
  const shouldReduceMotion = useReducedMotion()
  const [barSvgs, setBarSvgs] = useState<{
    start: ParsedSvg; middle: ParsedSvg; final: ParsedSvg; top: ParsedSvg
  } | null>(null)
  const [jollyData, setJollyData] = useState<ParsedSvg | null>(null)
  const [font, setFont] = useState<OpentypeFont | null>(null)
  const [fontLoading, setFontLoading] = useState<boolean>(Boolean(config.font))
  const [barLoading, setBarLoading] = useState<boolean>(!!barParts)
  const [jollyLoading, setJollyLoading] = useState<boolean>(!!svgPath)

  // Dispose geometries/materials on unmount to prevent WebGL memory leaks
  useEffect(() => {
    return () => {
      const group = groupRef.current
      if (!group) return
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose())
          } else {
            child.material?.dispose()
          }
        }
      })
    }
  }, [])

  const setGroupRefs = useCallback((node: THREE.Group | null) => {
    if (node) {
      groupRef.current = node
    }
    if (!sceneRef) return
    if (typeof sceneRef === 'function') {
      sceneRef(node)
    } else {
      (sceneRef as React.MutableRefObject<THREE.Group | null>).current = node
    }
  }, [sceneRef])

  const barLayers = (selectedVariantName && config.variantBarLayers?.[selectedVariantName]) || config.barLayers || []
  const barBaseLayer = barLayers.find(l => (l.svgColor || l.color).toLowerCase() === '#000000')
  const textLayers = config.textLayers ?? []
  const variantTextColors = selectedVariantName ? config.variantTextColors?.[selectedVariantName] : undefined
  const jollyScale = selectedVariantName ? (config.variantJollyScale?.[selectedVariantName] ?? 1) : 1
  const jollyOffsetX = selectedVariantName ? (config.variantJollyOffsetX?.[selectedVariantName] ?? 0) : 0
  const jollyOffsetY = selectedVariantName ? (config.variantJollyOffsetY?.[selectedVariantName] ?? 0) : 0
  const textOffsetX = selectedVariantName ? (config.variantTextOffsetX?.[selectedVariantName] ?? 0) : 0
  const jollyX = -200 + jollyOffsetX
  const jollyY = -120 + jollyOffsetY
  const textX = 280 + textOffsetX
  const TEXT_SIZE_SCALE = 1.07 // larger to fill space between bars
  const textFontSize = (config.textFontSize ?? 150) * TEXT_SIZE_SCALE

  // Load font for custom text
  useEffect(() => {
    if (!config.font) {
      setFont(null)
      setFontLoading(false)
      return
    }
    let cancelled = false
    setFont(null)
    setFontLoading(true)

    async function loadFont() {
      try {
        const opentype = await import('opentype.js')
        const response = await fetch(config.font!)
        const arrayBuffer = await response.arrayBuffer()
        const loadedFont = opentype.parse(arrayBuffer)
        if (!cancelled) {
          setFont(loadedFont)
          setFontLoading(false)
        }
      } catch (err) {
        console.error('Failed to load font:', err)
        if (!cancelled) {
          // Keep rendering functional even if text font fails to load
          setFont(null)
          setFontLoading(false)
        }
      }
    }

    loadFont()
    return () => { cancelled = true }
  }, [config.font])

  // Load bar SVGs
  useEffect(() => {
    if (!barParts) {
      setBarSvgs(null)
      setBarLoading(false)
      return
    }
    let cancelled = false
    setBarLoading(true)

    async function load() {
      try {
        const loader = new SVGLoader()
        const [s, m, f, t] = await Promise.all([
          fetch(barParts!.start).then(r => r.text()),
          fetch(barParts!.middle).then(r => r.text()),
          fetch(barParts!.final).then(r => r.text()),
          fetch(barParts!.top).then(r => r.text()),
        ])
        if (!cancelled) {
          setBarSvgs({
            start: loader.parse(s),
            middle: loader.parse(m),
            final: loader.parse(f),
            top: loader.parse(t),
          })
          setBarLoading(false)
        }
      } catch (err) {
        console.error('Failed to load bar SVGs:', err)
        if (!cancelled) setBarLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [barParts])

  // Load jolly roger SVG separately
  useEffect(() => {
    if (!svgPath) {
      setJollyData(null)
      setJollyLoading(false)
      return
    }
    let cancelled = false
    setJollyData(null)
    setJollyLoading(true)

    async function loadJolly() {
      try {
        const response = await fetch(svgPath!)
        const text = await response.text()
        const loader = new SVGLoader()
        if (!cancelled) {
          setJollyData(loader.parse(text))
          setJollyLoading(false)
        }
      } catch (err) {
        console.error('Failed to load jolly roger SVG:', err)
        if (!cancelled) {
          setJollyData(null)
          setJollyLoading(false)
        }
      }
    }

    loadJolly()
    return () => { cancelled = true }
  }, [svgPath])

  // Build text geometries for custom name
  const displayText = useMemo(() => {
    return getPreviewDisplayText(text, config, 'Name')
  }, [text, config])

  // Parse text into classified contour shapes (shared between textData and textCutShapes)
  const textShapes = useMemo(() => {
    if (!font) return null

    // Per-character height scale factors (adjust visual height while keeping baseline)
    const HEIGHT_SCALE: Record<string, number> = {
      'A': 0.98,
      'C': 0.95,
      'E': 0.95,
      'G': 0.96,
      'I': 1.01,
      'J': 0.97,
      'S': 0.96,
      'O': 1.025,
    }
    // Per-character vertical offset (negative = move up in font coords)
    const Y_OFFSET: Record<string, number> = {
      'C': -8,
      'E': -5,
      'G': -5,
      'J': -5,
      'S': -5,
    }

    // Render each character individually, classify contours per-character to avoid
    // cross-character contamination when glyphs overlap at zero spacing
    type Cmd = { type: string; x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number }
    const allShapes: THREE.Shape[] = []
    const perCharShapes: THREE.Shape[][] = []
    let cursorX = 0

    for (let ci = 0; ci < displayText.length; ci++) {
      const char = displayText[ci]!
      const charPath = font.getPath(char, 0, 0, textFontSize)
      const charCmds = charPath.commands as Cmd[]
      const yScale = HEIGHT_SCALE[char.toUpperCase()] ?? 1
      const yOff = Y_OFFSET[char.toUpperCase()] ?? 0

      // Find visual bounding box of this character
      let minX = Infinity, maxX = -Infinity
      let minY = Infinity, maxY = -Infinity
      for (const cmd of charCmds) {
        if (cmd.x !== undefined) { minX = Math.min(minX, cmd.x); maxX = Math.max(maxX, cmd.x) }
        if (cmd.y !== undefined) { minY = Math.min(minY, cmd.y); maxY = Math.max(maxY, cmd.y) }
        if (cmd.x1 !== undefined) { minX = Math.min(minX, cmd.x1); maxX = Math.max(maxX, cmd.x1) }
        if (cmd.y1 !== undefined) { minY = Math.min(minY, cmd.y1); maxY = Math.max(maxY, cmd.y1) }
        if (cmd.x2 !== undefined) { minX = Math.min(minX, cmd.x2); maxX = Math.max(maxX, cmd.x2) }
        if (cmd.y2 !== undefined) { minY = Math.min(minY, cmd.y2); maxY = Math.max(maxY, cmd.y2) }
      }

      if (minX === Infinity) { perCharShapes.push([]); continue } // skip space or empty glyph

      // Transform commands: shift X + scale Y
      const offsetX = cursorX - minX
      const transformed: Cmd[] = []
      for (const cmd of charCmds) {
        const shifted: Cmd = { ...cmd }
        if (shifted.x !== undefined) shifted.x += offsetX
        if (shifted.x1 !== undefined) shifted.x1 += offsetX
        if (shifted.x2 !== undefined) shifted.x2 += offsetX
        if (yScale !== 1 || yOff !== 0) {
          if (shifted.y !== undefined) shifted.y = maxY + (shifted.y - maxY) * yScale + yOff
          if (shifted.y1 !== undefined) shifted.y1 = maxY + (shifted.y1 - maxY) * yScale + yOff
          if (shifted.y2 !== undefined) shifted.y2 = maxY + (shifted.y2 - maxY) * yScale + yOff
        }
        transformed.push(shifted)
      }

      // Split this character's commands into contours (M...Z sequences)
      const charContours: Cmd[][] = []
      let cur: Cmd[] = []
      for (const cmd of transformed) {
        if (cmd.type === 'M' && cur.length > 0) {
          charContours.push(cur)
          cur = []
        }
        cur.push(cmd)
      }
      if (cur.length > 0) charContours.push(cur)

      // Build contour data for this character only
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
        return { points, area: Math.abs(THREE.ShapeUtils.area(points)), bounds: getBBox(points) }
      }).filter(c => c.points.length > 0)

      // Nesting-based classification within this character's contours only
      // Requires both point-in-polygon AND bbox containment to avoid misclassifying
      // partial overlaps (e.g. Q tail) as holes
      contourData.sort((a, b) => b.area - a.area)
      const CONTAIN_TOL = 5

      const nestingDepth = contourData.map(() => 0)
      const immediateParent = contourData.map(() => -1)

      for (let i = 1; i < contourData.length; i++) {
        const ci = contourData[i]!
        const testPoint = ci.points[0]
        if (!testPoint) continue
        for (let j = i - 1; j >= 0; j--) {
          const cj = contourData[j]!
          // Both conditions: test point inside AND bbox fully contained
          const bboxContained =
            ci.bounds.minX >= cj.bounds.minX - CONTAIN_TOL &&
            ci.bounds.maxX <= cj.bounds.maxX + CONTAIN_TOL &&
            ci.bounds.minY >= cj.bounds.minY - CONTAIN_TOL &&
            ci.bounds.maxY <= cj.bounds.maxY + CONTAIN_TOL
          if (bboxContained && pointInPolygon(testPoint, cj.points)) {
            nestingDepth[i]!++
            if (immediateParent[i] === -1) {
              immediateParent[i] = j
            }
          }
        }
      }

      // Even depth = outer, odd = hole
      const charShapeMap = new Map<number, THREE.Shape>()
      const thisCharShapes: THREE.Shape[] = []
      for (let i = 0; i < contourData.length; i++) {
        if ((nestingDepth[i] ?? 0) % 2 === 0) {
          const shape = new THREE.Shape(contourData[i]!.points)
          allShapes.push(shape)
          thisCharShapes.push(shape)
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

      perCharShapes.push(thisCharShapes)
      cursorX = maxX + offsetX
    }

    return allShapes.length > 0 ? { all: allShapes, perChar: perCharShapes } : null
  }, [font, displayText, textFontSize])

  // Red letter logic: rightmost I wins, else rightmost E, else second-to-last letter
  const redLetterIndex = useMemo(() => {
    const upper = displayText.toUpperCase()
    let lastI = -1, lastE = -1
    for (let i = 0; i < upper.length; i++) {
      if (upper[i] === 'I') lastI = i
      if (upper[i] === 'E') lastE = i
    }
    if (lastI >= 0) return lastI
    if (lastE >= 0) return lastE
    // No E or I: color the second-to-last letter
    if (upper.length >= 2) return upper.length - 2
    return -1
  }, [displayText])

  // Compute exact text width from raw font commands (more accurate than discretized shape points)
  const textWidth = useMemo(() => {
    if (!font) return 0
    let cursorX = 0
    for (const char of displayText) {
      const charPath = font.getPath(char, 0, 0, textFontSize)
      const cmds = charPath.commands as { type: string; x?: number; x1?: number; x2?: number }[]
      let minX = Infinity, maxX = -Infinity
      for (const cmd of cmds) {
        if (cmd.x !== undefined) { minX = Math.min(minX, cmd.x); maxX = Math.max(maxX, cmd.x) }
        if (cmd.x1 !== undefined) { minX = Math.min(minX, cmd.x1); maxX = Math.max(maxX, cmd.x1) }
        if (cmd.x2 !== undefined) { minX = Math.min(minX, cmd.x2); maxX = Math.max(maxX, cmd.x2) }
      }
      if (minX === Infinity) continue
      cursorX = maxX + (cursorX - minX)
    }
    return cursorX
  }, [font, displayText, textFontSize])

  // Compute base tiling values from SVG piece bounds (independent of tile count)
  const tilingBase = useMemo(() => {
    if (!barSvgs) return null
    const startBounds = getSvgContentBounds(barSvgs.start)
    const middleBounds = getSvgContentBounds(barSvgs.middle)
    const finalBounds = getSvgContentBounds(barSvgs.final)

    const startOffset = startBounds.maxX - middleBounds.minX - TILE_OVERLAP
    const middleStep = middleBounds.width - TILE_OVERLAP
    // Total width with 0 middle tiles: start + final (overlap accounted for)
    const fixedWidth = startOffset - finalBounds.minX - TILE_OVERLAP + FINAL_X_NUDGE + finalBounds.maxX

    return { startOffset, middleStep, fixedWidth }
  }, [barSvgs])

  // Dynamic tile count: adjust bottom bar length to match text width
  const tileCount = useMemo(() => {
    if (!tilingBase || textWidth === 0) return config.tileCount ?? 3

    const strokeW = textLayers.find(l => l.strokeWidth)?.strokeWidth ?? 0
    const TEXT_PADDING = 20 // small padding beyond text+stroke right edge

    // Text right in parent space (text group at textX)
    const textRight = textX + textWidth + strokeW + TEXT_PADDING
    // Desired bar width in parent space (bar left = BOTTOM_BAR_X)
    const barWidthParent = textRight - BOTTOM_BAR_X
    // Convert to bar-local (bar has scale barScaleFactor)
    const bsf = config.barScale ?? 1
    const desiredBarLocal = barWidthParent / bsf

    // Solve: desiredBarLocal = fixedWidth + tileCount * middleStep
    // Use round (not ceil) so bar stays closest to text width
    const needed = (desiredBarLocal - tilingBase.fixedWidth) / tilingBase.middleStep
    return Math.max(1, Math.round(needed))
  }, [tilingBase, textWidth, textLayers, textX, config.barScale, config.tileCount])

  // Compute tiling metrics from actual SVG content bounds
  const metrics = useMemo(() => {
    if (!barSvgs) return null
    return computeTilingMetrics(
      { start: barSvgs.start, middle: barSvgs.middle, final: barSvgs.final },
      tileCount,
    )
  }, [barSvgs, tileCount])

  // X correction factor: fine-tune bar width to exactly match text (compensates for integer tile rounding)
  const barXCorrection = useMemo(() => {
    if (!metrics || textWidth === 0) return 1
    const strokeW = textLayers.find(l => l.strokeWidth)?.strokeWidth ?? 0
    const TEXT_PADDING = 20
    const textRight = textX + textWidth + strokeW + TEXT_PADDING
    const barWidthParent = textRight - BOTTOM_BAR_X
    const bsf = config.barScale ?? 1
    const desiredBarLocal = barWidthParent / bsf
    return desiredBarLocal / metrics.totalWidth
  }, [metrics, textWidth, textLayers, textX, config.barScale])

  // Build text mask geometry — black shape covering text+stroke area at overlay Z level
  // Sits between bar overlay (pushed back) and text white overlay (in front) via polygonOffset
  const textMaskGeo = useMemo(() => {
    if (!textShapes) return null

    const strokeLayer = textLayers.find(l => l.strokeWidth)
    if (!strokeLayer?.strokeWidth) return null

    const solidShapes = textShapes.all
      .map(s => { const pts = s.getPoints(); return pts.length > 0 ? new THREE.Shape(pts) : null })
      .filter((s): s is THREE.Shape => s !== null)
    if (solidShapes.length === 0) return null
    const expanded = expandShapes(solidShapes, strokeLayer.strokeWidth)

    // Re-apply shrunk holes so letter holes (O, A, R) remain see-through
    for (let i = 0; i < expanded.length && i < textShapes.all.length; i++) {
      const src = textShapes.all[i]
      const dst = expanded[i]
      if (!src || !dst) continue
      for (const hole of src.holes) {
        const shrunk = shrinkContour(hole.getPoints(), strokeLayer.strokeWidth)
        dst.holes.push(new THREE.Path(shrunk))
      }
    }

    if (expanded.length === 0) return null

    const OVERLAY_DEPTH = 1
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: OVERLAY_DEPTH * DEPTH_SCALE,
      bevelEnabled: false,
      steps: 1,
    }
    const geo = new THREE.ExtrudeGeometry(expanded, extrudeSettings)
    geo.computeVertexNormals()
    return geo
  }, [textShapes, textLayers])

  // Build bottom bar geometries — unified base (all colors) + colored overlays
  const bottomBarData = useMemo(() => {
    if (!barSvgs || !metrics) return []

    const activeLayers = barLayers.filter(layer => layer.mode !== 'cut')
    const allColors = Array.from(new Set(activeLayers.map(l => (l.svgColor || l.color).toLowerCase())))

    const BASE_DEPTH = 11
    const OVERLAY_DEPTH = 1
    const result: { geo: THREE.BufferGeometry; layer: LayerConfig }[] = []

    // 1. Base: merge ALL color shapes into one black geometry at BASE_DEPTH
    const baseGeos: THREE.BufferGeometry[] = []
    const baseExtrude: THREE.ExtrudeGeometryOptions = {
      depth: BASE_DEPTH * DEPTH_SCALE,
      bevelEnabled: false,
      steps: 1,
    }
    for (const colorHex of allColors) {
      const geo = buildTiledBarGeometry(
        { start: barSvgs.start, middle: barSvgs.middle, final: barSvgs.final },
        colorHex, tileCount, metrics, baseExtrude,
      )
      if (geo) baseGeos.push(geo)
    }
    if (baseGeos.length > 0) {
      const merged = mergeGeometries(baseGeos)
      for (const g of baseGeos) g.dispose()
      if (merged) {
        merged.computeVertexNormals()
        result.push({
          geo: merged,
          layer: {
            color: barBaseLayer?.color ?? '#111111',
            depth: BASE_DEPTH,
            metalness: barBaseLayer?.metalness ?? 0.1,
            roughness: barBaseLayer?.roughness ?? 0.8,
          },
        })
      }
    }

    // 2. Overlays: non-black layers extruded thin, sitting on top of the base
    for (const layer of activeLayers) {
      const colorHex = (layer.svgColor || layer.color).toLowerCase()
      if (colorHex === '#000000') continue

      const overlayExtrude: THREE.ExtrudeGeometryOptions = {
        depth: OVERLAY_DEPTH * DEPTH_SCALE,
        bevelEnabled: false,
        steps: 1,
      }
      const geo = buildTiledBarGeometry(
        { start: barSvgs.start, middle: barSvgs.middle, final: barSvgs.final },
        colorHex, tileCount, metrics, overlayExtrude,
      )
      if (geo) {
        result.push({
          geo,
          layer: { ...layer, depth: OVERLAY_DEPTH, offsetZ: BASE_DEPTH },
        })
      }
    }

    return result
  }, [barSvgs, barLayers, barBaseLayer, tileCount, metrics])

  // Build top bar geometries (scaled to match bottom bar width) — unified base + overlay
  const topBarData = useMemo(() => {
    if (!barSvgs || !metrics) return []

    const scaleX = metrics.totalWidth / TOP_BAR_VIEWBOX_WIDTH
    const topColors = ['#000000', '#0077f1']

    const BASE_DEPTH = 11
    const OVERLAY_DEPTH = 1
    const result: { geo: THREE.BufferGeometry; layer: LayerConfig }[] = []

    // 1. Base: merge all top bar color shapes into one black geometry
    const baseGeos: THREE.BufferGeometry[] = []
    const baseExtrude: THREE.ExtrudeGeometryOptions = {
      depth: BASE_DEPTH * DEPTH_SCALE,
      bevelEnabled: false,
      steps: 1,
    }
    for (const colorHex of topColors) {
      const shapes = getShapesForColor(barSvgs.top, colorHex)
      if (shapes.length === 0) continue
      const geo = new THREE.ExtrudeGeometry(shapes, baseExtrude)
      geo.scale(scaleX, 1, 1)
      baseGeos.push(geo)
    }
    if (baseGeos.length > 0) {
      const merged = mergeGeometries(baseGeos)
      for (const g of baseGeos) g.dispose()
      if (merged) {
        merged.computeVertexNormals()
        result.push({
          geo: merged,
          layer: {
            color: barBaseLayer?.color ?? '#111111',
            depth: BASE_DEPTH,
            metalness: barBaseLayer?.metalness ?? 0.1,
            roughness: barBaseLayer?.roughness ?? 0.8,
          },
        })
      }
    }

    // 2. Colored overlay on top of the base (resolve from barLayers for variant support)
    const overlayLayer = barLayers.find(l => (l.svgColor || l.color).toLowerCase() === '#0077f1')
    const overlayShapes = getShapesForColor(barSvgs.top, '#0077f1')
    if (overlayShapes.length > 0) {
      const overlayExtrude: THREE.ExtrudeGeometryOptions = {
        depth: OVERLAY_DEPTH * DEPTH_SCALE,
        bevelEnabled: false,
        steps: 1,
      }
      const geo = new THREE.ExtrudeGeometry(overlayShapes, overlayExtrude)
      geo.scale(scaleX, 1, 1)
      geo.computeVertexNormals()
      result.push({
        geo,
        layer: {
          color: overlayLayer?.color ?? '#339af0',
          depth: OVERLAY_DEPTH,
          offsetZ: BASE_DEPTH,
          metalness: overlayLayer?.metalness ?? 0.3,
          roughness: overlayLayer?.roughness ?? 0.4,
        },
      })
    }

    return result
  }, [barSvgs, barLayers, barBaseLayer, tileCount, metrics])

  // Build jolly roger geometries
  const jollyData_ = useMemo(() => {
    if (!jollyData) return []

    const activeLayers = (selectedVariantName && config.variantLayers?.[selectedVariantName]) || config.layers || []
    const jollyLayers = activeLayers.filter(l => l.mode !== 'cut')
    const cutLayers = activeLayers.filter(l => l.mode === 'cut')

    // Collect cut shapes grouped by cutGroup
    const cutShapesByGroup: Record<string, THREE.Shape[]> = {}
    const cutThroughAllShapes: THREE.Shape[] = []
    for (const cl of cutLayers) {
      const group = cl.cutGroup ?? '_default'
      const matchHex = (cl.svgColor || cl.color).toLowerCase()
      for (const svgPath of jollyData.paths) {
        if (colorMatch(svgPath.color, matchHex)) {
          const cutShapes = extractShapes(svgPath)
          if (cl.cutThroughAll) {
            cutThroughAllShapes.push(...cutShapes)
          } else {
            if (!cutShapesByGroup[group]) cutShapesByGroup[group] = []
            cutShapesByGroup[group]!.push(...cutShapes)
          }
        }
      }
    }

    return jollyLayers.map(layer => {
      const colorHex = (layer.svgColor || layer.color).toLowerCase()
      let shapes = getShapesForColor(jollyData, colorHex)
      if (shapes.length === 0) return null

      // Use Clipper polygon difference to subtract matching cut group shapes.
      // Group cuts affect overlays (offset layers), while "cutThroughAll" cuts also affect base layers.
      if (!layer.noCut && (layer.offsetZ ?? 0) > 0) {
        const group = layer.cutGroup ?? '_default'
        const cuts = cutShapesByGroup[group]
        if (cuts && cuts.length > 0) {
          shapes = clipDifference(shapes, cuts)
          if (shapes.length === 0) return null
        }
      }
      if (!layer.noCut && cutThroughAllShapes.length > 0) {
        shapes = clipDifference(shapes, cutThroughAllShapes)
        if (shapes.length === 0) return null
      }

      const extrudeSettings: THREE.ExtrudeGeometryOptions = {
        depth: layer.depth * DEPTH_SCALE,
        bevelEnabled: false,
        steps: 1,
      }
      const geo = new THREE.ExtrudeGeometry(shapes, extrudeSettings)
      geo.computeVertexNormals()
      return { geo, layer }
    }).filter(Boolean) as { geo: THREE.BufferGeometry; layer: LayerConfig }[]
  }, [jollyData, config.layers, config.variantLayers, selectedVariantName])

  // Build text geometries for rendering (colored letters + one special letter)
  const TEXT_COLOR_MAIN = variantTextColors?.text ?? '#339af0'
  const TEXT_COLOR_SPECIAL = variantTextColors?.special ?? '#cc0000'
  const TEXT_COLOR_STROKE = variantTextColors?.stroke
  const TEXT_MASK_COLOR = variantTextColors?.stroke ?? '#111111'

  const textData = useMemo(() => {
    if (!textShapes || textLayers.length === 0) return []

    const result: { geo: THREE.BufferGeometry; layer: LayerConfig; colorOverride?: string }[] = []

    for (const layer of textLayers) {
      if (layer.strokeWidth) {
        // Stroke layer: all shapes together, keep black
        const solidShapes = textShapes.all
          .map(s => { const pts = s.getPoints(); return pts.length > 0 ? new THREE.Shape(pts) : null })
          .filter((s): s is THREE.Shape => s !== null)
        if (solidShapes.length === 0) continue
        const expanded = expandShapes(solidShapes, layer.strokeWidth)
        for (let i = 0; i < expanded.length && i < textShapes.all.length; i++) {
          const src = textShapes.all[i]
          const dst = expanded[i]
          if (!src || !dst) continue
          for (const hole of src.holes) {
            const shrunk = shrinkContour(hole.getPoints(), layer.strokeWidth)
            dst.holes.push(new THREE.Path(shrunk))
          }
        }
        if (expanded.length === 0) continue
        const extrudeSettings: THREE.ExtrudeGeometryOptions = {
          depth: layer.depth * DEPTH_SCALE, bevelEnabled: false, steps: 1,
        }
        const geo = new THREE.ExtrudeGeometry(expanded, extrudeSettings)
        geo.computeVertexNormals()
        result.push({ geo, layer, colorOverride: TEXT_COLOR_STROKE })
      } else {
        // Fill layer: split into blue (normal) and red (special letter)
        const blueShapes: THREE.Shape[] = []
        const redShapes: THREE.Shape[] = []

        for (let ci = 0; ci < textShapes.perChar.length; ci++) {
          const charShapes = textShapes.perChar[ci]
          if (!charShapes) continue
          const valid = charShapes.filter(s => s.getPoints().length > 0)
          if (ci === redLetterIndex) {
            redShapes.push(...valid)
          } else {
            blueShapes.push(...valid)
          }
        }

        const extrudeSettings: THREE.ExtrudeGeometryOptions = {
          depth: layer.depth * DEPTH_SCALE, bevelEnabled: false, steps: 1,
        }

        if (blueShapes.length > 0) {
          const geo = new THREE.ExtrudeGeometry(blueShapes, extrudeSettings)
          geo.computeVertexNormals()
          result.push({ geo, layer, colorOverride: TEXT_COLOR_MAIN })
        }
        if (redShapes.length > 0) {
          const geo = new THREE.ExtrudeGeometry(redShapes, extrudeSettings)
          geo.computeVertexNormals()
          result.push({ geo, layer, colorOverride: TEXT_COLOR_SPECIAL })
        }
      }
    }

    return result
  }, [textShapes, textLayers, redLetterIndex, TEXT_COLOR_MAIN, TEXT_COLOR_SPECIAL, TEXT_COLOR_STROKE])

  // Compute text position: right of jolly roger, vertically between bars
  const textPosition = useMemo<[number, number, number]>(() => {
    // X: right of jolly roger (base at 280, plus per-variant offset)
    // Y: midpoint between top and bottom bars
    const textY = (TOP_BAR_Y + BOTTOM_BAR_Y) / 2 + 183
    return [textX, textY, 0]
  }, [textX])

  const scale = config.scale ?? 0.02
  const barScaleFactor = config.barScale ?? 1
  const compositionCenter = useMemo<[number, number]>(() => {
    const bounds = new THREE.Box3()

    for (const { geo, layer } of topBarData) {
      expandBoundsWithGeometry(
        bounds,
        geo,
        [TOP_BAR_X, TOP_BAR_Y, (layer.offsetZ ?? 0) * DEPTH_SCALE],
        [barScaleFactor * barXCorrection, barScaleFactor, 1],
      )
    }

    for (const { geo, layer } of bottomBarData) {
      expandBoundsWithGeometry(
        bounds,
        geo,
        [BOTTOM_BAR_X, BOTTOM_BAR_Y, (layer.offsetZ ?? 0) * DEPTH_SCALE],
        [barScaleFactor * barXCorrection, barScaleFactor, 1],
      )
    }

    for (const { geo, layer } of jollyData_) {
      expandBoundsWithGeometry(
        bounds,
        geo,
        [jollyX, jollyY, (layer.offsetZ ?? 0) * DEPTH_SCALE],
        [jollyScale, jollyScale, 1],
      )
    }

    if (textMaskGeo) {
      expandBoundsWithGeometry(
        bounds,
        textMaskGeo,
        [textPosition[0], textPosition[1], 11 * DEPTH_SCALE],
      )
    }

    for (const { geo, layer } of textData) {
      expandBoundsWithGeometry(
        bounds,
        geo,
        [textPosition[0], textPosition[1], (layer.offsetZ ?? 0) * DEPTH_SCALE],
      )
    }

    if (bounds.isEmpty()) return [0, 0]
    const center = bounds.getCenter(new THREE.Vector3())
    return [center.x, center.y]
  }, [
    topBarData,
    bottomBarData,
    jollyData_,
    textData,
    textMaskGeo,
    textPosition,
    jollyX,
    jollyY,
    jollyScale,
    barScaleFactor,
    barXCorrection,
  ])
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

  const requiresFontForText = Boolean(config.font) && textLayers.length > 0
  const sceneLoading =
    barLoading ||
    !barSvgs ||
    (Boolean(svgPath) && (jollyLoading || !jollyData)) ||
    (requiresFontForText && fontLoading)
  if (sceneLoading) {
    return (
      <>
        <color attach="background" args={[config.background || '#0a0a12']} />
        <StudioLighting />
        <SceneLoadingSpinner label="Loading..." />
      </>
    )
  }

  return (
    <>
      <color attach="background" args={[config.background || '#0a1022']} />
      <StudioLighting />

      <PresentationControls
        global
        cursor
        speed={1}
        zoom={1}
        rotation={PRESENTATION_BASE_ROTATION}
        polar={[-0.35, 0.35]}
        azimuth={[-0.85, 0.85]}
      >
        <group
          ref={setGroupRefs}
          scale={[scale * initialScaleMultiplier, -scale * initialScaleMultiplier, 1]}
          rotation={initialRotation}
          position={initialPosition}
        >
          <group position={[-compositionCenter[0], -compositionCenter[1], 0]}>

          {/* Top bar */}
          <group scale={[barScaleFactor * barXCorrection, barScaleFactor, 1]} position={[TOP_BAR_X, TOP_BAR_Y, 0]}>
            {topBarData.map(({ geo, layer }, i) => (
              <mesh
                key={`top-${i}`}
                geometry={geo}
                position={[0, 0, (layer.offsetZ ?? 0) * DEPTH_SCALE]}
                castShadow
                receiveShadow
              >
                <meshStandardMaterial
                  color={layer.color}
                  metalness={layer.metalness ?? 0.1}
                  roughness={layer.roughness ?? 0.7}
                  polygonOffset
                  polygonOffsetFactor={1}
                  polygonOffsetUnits={1}
                />
              </mesh>
            ))}
          </group>

          {/* Bottom bar */}
          <group scale={[barScaleFactor * barXCorrection, barScaleFactor, 1]} position={[BOTTOM_BAR_X, BOTTOM_BAR_Y, 0]}>
            {bottomBarData.map(({ geo, layer }, i) => (
              <mesh
                key={`bottom-${i}`}
                geometry={geo}
                position={[0, 0, (layer.offsetZ ?? 0) * DEPTH_SCALE]}
                castShadow
                receiveShadow
              >
                <meshStandardMaterial
                  color={layer.color}
                  metalness={layer.metalness ?? 0.1}
                  roughness={layer.roughness ?? 0.7}
                  polygonOffset
                  polygonOffsetFactor={1}
                  polygonOffsetUnits={1}
                />
              </mesh>
            ))}
          </group>

          {/* Jolly roger */}
          {jollyData_.length > 0 && (
            <group position={[jollyX, jollyY, 0]} scale={[jollyScale, jollyScale, 1]}>
              {jollyData_.map(({ geo, layer }, i) => (
                <mesh
                  key={`jolly-${i}`}
                  geometry={geo}
                  position={[0, 0, (layer.offsetZ ?? 0) * DEPTH_SCALE]}
                  castShadow
                  receiveShadow
                >
                  <meshStandardMaterial
                    color={layer.color}
                    metalness={layer.metalness ?? 0.1}
                    roughness={layer.roughness ?? 0.7}
                    polygonOffset
                    polygonOffsetFactor={0.3}
                    polygonOffsetUnits={0.3}
                  />
                </mesh>
              ))}
            </group>
          )}

          {/* Text mask */}
          {textMaskGeo && (
            <group position={textPosition}>
              <mesh
                geometry={textMaskGeo}
                position={[0, 0, 11 * DEPTH_SCALE]}
                castShadow
                receiveShadow
              >
                <meshStandardMaterial
                  color={TEXT_MASK_COLOR}
                  metalness={0.1}
                  roughness={0.8}
                  polygonOffset
                  polygonOffsetFactor={0.5}
                  polygonOffsetUnits={0.5}
                />
              </mesh>
            </group>
          )}

          {/* Custom text between bars */}
          {textData.length > 0 && (
            <group position={textPosition}>
              {textData.map(({ geo, layer, colorOverride }, i) => (
                <mesh
                  key={`text-${i}-${displayText}`}
                  geometry={geo}
                  position={[0, 0, (layer.offsetZ ?? 0) * DEPTH_SCALE]}
                  castShadow
                  receiveShadow
                >
                  <meshStandardMaterial
                    color={colorOverride ?? layer.color}
                    metalness={layer.metalness ?? 0.1}
                    roughness={layer.roughness ?? 0.7}
                  />
                </mesh>
              ))}
            </group>
          )}

          </group>
        </group>
      </PresentationControls>

      <ContactShadows
        position={[0, -9.85, 0]}
        opacity={0.2}
        scale={72}
        blur={2.8}
        far={20}
      />

      <OrbitControls
        enablePan={false}
        enableRotate={false}
        minDistance={5}
        maxDistance={40}
        autoRotate={false}
        autoRotateSpeed={0}
        maxPolarAngle={Math.PI * 0.7}
        minPolarAngle={Math.PI * 0.3}
        target={[0, 0, 0]}
      />
    </>
  )
}

/** Shrink a contour toward its centroid by a given amount (simple radial offset) */
function shrinkContour(points: THREE.Vector2[], amount: number): THREE.Vector2[] {
  let cx = 0, cy = 0
  for (const p of points) { cx += p.x; cy += p.y }
  cx /= points.length
  cy /= points.length

  return points.map(p => {
    const dx = p.x - cx
    const dy = p.y - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist === 0) return p.clone()
    const scale = Math.max(0, (dist - amount) / dist)
    return new THREE.Vector2(cx + dx * scale, cy + dy * scale)
  })
}


/** Ray-casting point-in-polygon test (even-odd rule) */
function pointInPolygon(point: THREE.Vector2, polygon: THREE.Vector2[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i]!, pj = polygon[j]!
    if (((pi.y > point.y) !== (pj.y > point.y)) &&
        (point.x < (pj.x - pi.x) * (point.y - pi.y) / (pj.y - pi.y) + pi.x)) {
      inside = !inside
    }
  }
  return inside
}

// Helpers for cut shape bounding box overlap
function getBBox(points: THREE.Vector2[]) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  return { minX, minY, maxX, maxY }
}

function bboxOverlap(
  a: { minX: number; minY: number; maxX: number; maxY: number },
  b: { minX: number; minY: number; maxX: number; maxY: number },
) {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY
}

const CLIPPER_SCALE = 1000

/** Convert THREE.Shape/Path points to Clipper integer path */
function toClipperPath(points: THREE.Vector2[]): ClipperLib.Path {
  return points.map(p => ({ X: Math.round(p.x * CLIPPER_SCALE), Y: Math.round(p.y * CLIPPER_SCALE) }))
}

/** Convert Clipper path back to THREE.Vector2 array */
function fromClipperPath(path: ClipperLib.Path): THREE.Vector2[] {
  return path.map(p => new THREE.Vector2(p.X / CLIPPER_SCALE, p.Y / CLIPPER_SCALE))
}

/**
 * Subtract cutShapes from overlayShapes using Clipper boolean difference.
 * Handles cases where cut shapes extend outside overlay shapes (which breaks
 * THREE.js ExtrudeGeometry hole-based approach since Earcut requires holes
 * to be fully contained within the outer shape).
 */
function clipDifference(overlayShapes: THREE.Shape[], cutShapes: THREE.Shape[]): THREE.Shape[] {
  if (cutShapes.length === 0) return overlayShapes

  // Pre-convert cut shapes to Clipper paths
  const clipPaths: ClipperLib.Paths = cutShapes.map(cs => toClipperPath(cs.getPoints(24)))

  const result: THREE.Shape[] = []

  for (const shape of overlayShapes) {
    const subjectOuter = toClipperPath(shape.getPoints(24))

    const cpr = new ClipperLib.Clipper()
    cpr.AddPath(subjectOuter, 0 /* ptSubject */, true)

    // Add existing holes as clip paths (subtract them too)
    for (const hole of shape.holes) {
      const holePath = toClipperPath(hole.getPoints(24))
      cpr.AddPath(holePath, 1 /* ptClip */, true)
    }

    // Add cut shapes as clip paths
    for (const cp of clipPaths) {
      cpr.AddPath(cp, 1 /* ptClip */, true)
    }

    const solution: ClipperLib.Paths = []
    cpr.Execute(2 /* ctDifference */, solution, 1 /* pftNonZero */, 1 /* pftNonZero */)

    if (solution.length === 0) continue

    // Separate outer contours (positive area) from holes (negative area)
    const outers: ClipperLib.Path[] = []
    const holes: ClipperLib.Path[] = []
    for (const path of solution) {
      if (ClipperLib.Clipper.Orientation(path)) {
        outers.push(path)
      } else {
        holes.push(path)
      }
    }

    // Create shapes from outer contours
    for (const outer of outers) {
      const pts = fromClipperPath(outer)
      if (pts.length < 3) continue
      const newShape = new THREE.Shape(pts)

      // Assign holes that are contained within this outer contour's bbox
      const outerBB = getBBox(pts)
      for (const hole of holes) {
        const holePts = fromClipperPath(hole)
        if (holePts.length < 3) continue
        const holeBB = getBBox(holePts)
        if (bboxOverlap(outerBB, holeBB)) {
          newShape.holes.push(new THREE.Path(holePts))
        }
      }

      result.push(newShape)
    }
  }

  return result
}
