'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, PresentationControls, Html } from '@react-three/drei'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg'
import { StudioLighting } from './StudioLighting'
import { Preview3DLoadingIndicator } from './LoadingSpinner'
import { expandShapes } from '@/lib/preview/expandShapes'
import type { PreviewConfig, LayerConfig } from '@/lib/preview/types'
import { getPreviewDisplayText } from '@/lib/preview/textTransform'

interface DragonballSignSceneProps {
  text: string
  config: PreviewConfig
  /**
   * Slot index in [0, text.length] where the dragon ball sits.
   * 0 = before the first letter, text.length = after the last. When
   * undefined, the scene falls back to the midpoint so legacy behaviour
   * is preserved.
   */
  ballPosition?: number
}

// Scene-unit per mm (matches the other scenes, keeps the relief feeling tuned the same).
const DEPTH_SCALE = 0.08
const FONT_SIZE = 5

type Cmd = {
  type: string
  x?: number
  y?: number
  x1?: number
  y1?: number
  x2?: number
  y2?: number
}

type OpentypeFont = {
  getPath: (text: string, x: number, y: number, fontSize: number) => { commands: Cmd[] }
  getAdvanceWidth: (text: string, fontSize: number) => number
}

// Transform every x/y/x1/y1/x2/y2 in a command list. Keeps the original
// command types (M/L/Q/C) intact; only points move.
function transformCmds(cmds: Cmd[], fn: (x: number, y: number) => [number, number]): Cmd[] {
  return cmds.map((cmd) => {
    const out: Cmd = { ...cmd }
    if (out.x !== undefined && out.y !== undefined) {
      const [nx, ny] = fn(out.x, out.y)
      out.x = nx
      out.y = ny
    }
    if (out.x1 !== undefined && out.y1 !== undefined) {
      const [nx, ny] = fn(out.x1, out.y1)
      out.x1 = nx
      out.y1 = ny
    }
    if (out.x2 !== undefined && out.y2 !== undefined) {
      const [nx, ny] = fn(out.x2, out.y2)
      out.x2 = nx
      out.y2 = ny
    }
    return out
  })
}

/** Convert opentype.js path commands into properly nested THREE.Shapes. */
function cmdsToShapes(cmds: Cmd[]): THREE.Shape[] {
  if (cmds.length === 0) return []
  const contours: Cmd[][] = []
  let cur: Cmd[] = []
  for (const cmd of cmds) {
    if (cmd.type === 'M' && cur.length > 0) {
      contours.push(cur)
      cur = []
    }
    cur.push(cmd)
  }
  if (cur.length > 0) contours.push(cur)

  const contourData = contours
    .map((c) => {
      const p = new THREE.Path()
      for (const cmd of c) {
        switch (cmd.type) {
          case 'M':
            p.moveTo(cmd.x!, cmd.y!)
            break
          case 'L':
            p.lineTo(cmd.x!, cmd.y!)
            break
          case 'Q':
            p.quadraticCurveTo(cmd.x1!, cmd.y1!, cmd.x!, cmd.y!)
            break
          case 'C':
            p.bezierCurveTo(cmd.x1!, cmd.y1!, cmd.x2!, cmd.y2!, cmd.x!, cmd.y!)
            break
        }
      }
      const points = p.getPoints(24)
      const bb = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
      for (const pt of points) {
        if (pt.x < bb.minX) bb.minX = pt.x
        if (pt.y < bb.minY) bb.minY = pt.y
        if (pt.x > bb.maxX) bb.maxX = pt.x
        if (pt.y > bb.maxY) bb.maxY = pt.y
      }
      return { points, area: Math.abs(THREE.ShapeUtils.area(points)), bounds: bb }
    })
    .filter((c) => c.points.length > 0)

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
      if (!bboxContained) continue
      let inside = false
      const polygon = cj.points
      for (let pi = 0, pj = polygon.length - 1; pi < polygon.length; pj = pi++) {
        const a = polygon[pi]!
        const b = polygon[pj]!
        if (
          a.y > testPoint.y !== b.y > testPoint.y &&
          testPoint.x < ((b.x - a.x) * (testPoint.y - a.y)) / (b.y - a.y) + a.x
        ) {
          inside = !inside
        }
      }
      if (inside) {
        nestingDepth[i]!++
        if (immediateParent[i] === -1) immediateParent[i] = j
      }
    }
  }

  const outShapes: THREE.Shape[] = []
  const shapeByIndex = new Map<number, THREE.Shape>()
  for (let i = 0; i < contourData.length; i++) {
    if ((nestingDepth[i] ?? 0) % 2 === 0) {
      const s = new THREE.Shape(contourData[i]!.points)
      outShapes.push(s)
      shapeByIndex.set(i, s)
    }
  }
  for (let i = 0; i < contourData.length; i++) {
    if ((nestingDepth[i] ?? 0) % 2 === 1) {
      let parent: number = immediateParent[i] ?? -1
      while (parent !== -1 && ((nestingDepth[parent] ?? 0) % 2 !== 0)) {
        parent = immediateParent[parent] ?? -1
      }
      if (parent !== -1) {
        const ps = shapeByIndex.get(parent)
        if (ps) ps.holes.push(new THREE.Path(contourData[i]!.points))
      }
    }
  }
  return outShapes
}

/** Extrude a set of shapes into a centered mesh, using the supplied layer. */
function extrudedMesh(
  shapes: THREE.Shape[] | null,
  layer: LayerConfig,
  depthScale: number,
  /** If provided, centers against this bbox instead of the geometry's own bbox. */
  centerBounds: { minX: number; maxX: number; minY: number; maxY: number } | null,
  /** Optional geometry to CSG-subtract from this layer (e.g. ball silhouette). */
  subtractGeometry?: THREE.BufferGeometry | null,
): THREE.Mesh | null {
  if (!shapes || shapes.length === 0) return null
  const working = layer.strokeWidth ? expandShapes(shapes, layer.strokeWidth) : shapes
  if (working.length === 0) return null
  let geo: THREE.BufferGeometry = new THREE.ExtrudeGeometry(working, {
    depth: layer.depth * depthScale,
    bevelEnabled: false,
    steps: 1,
  })
  let cx: number
  let cy: number
  if (centerBounds) {
    cx = (centerBounds.minX + centerBounds.maxX) / 2
    cy = (centerBounds.minY + centerBounds.maxY) / 2
  } else {
    geo.computeBoundingBox()
    const bb = geo.boundingBox!
    cx = (bb.min.x + bb.max.x) / 2
    cy = (bb.min.y + bb.max.y) / 2
  }
  // offsetZ lets paint layers sit on top of the base (same convention as
  // the other scenes). Without this, every layer stacked at z=0 and the
  // paint was buried inside the base.
  const offsetZ = (layer.offsetZ ?? 0) * depthScale
  geo.translate(-cx, -cy, offsetZ)

  // Optional CSG subtraction. Both meshes must sit in the SAME world
  // coordinates for three-bvh-csg to do the right thing — the caller is
  // responsible for pre-translating the subtract geometry to match
  // (same center offsets, same offsetZ).
  if (subtractGeometry) {
    try {
      const baseBrush = new Brush(geo)
      baseBrush.updateMatrixWorld()
      const cutBrush = new Brush(subtractGeometry.clone())
      cutBrush.updateMatrixWorld()
      const evaluator = new Evaluator()
      const result = evaluator.evaluate(baseBrush, cutBrush, SUBTRACTION)
      geo = result.geometry
    } catch (e) {
      console.warn('CSG subtract failed in dragonball scene, using original:', e)
    }
  }
  geo.computeVertexNormals()
  const mat = new THREE.MeshStandardMaterial({
    color: layer.color,
    metalness: layer.metalness ?? 0.1,
    roughness: layer.roughness ?? 0.7,
    emissive:
      (layer.emissiveIntensity ?? 0) > 0
        ? new THREE.Color(layer.emissive ?? layer.color)
        : new THREE.Color(0, 0, 0),
    emissiveIntensity: layer.emissiveIntensity ?? 0,
  })
  return new THREE.Mesh(geo, mat)
}

export function DragonballSignScene({ text, config, ballPosition }: DragonballSignSceneProps) {
  const [font, setFont] = useState<OpentypeFont | null>(null)
  const [svgData, setSvgData] = useState<ReturnType<SVGLoader['parse']> | null>(null)
  const [loading, setLoading] = useState(true)

  const groupRef = useRef<THREE.Group>(null)
  const introProgressRef = useRef(0)
  const introFinishedRef = useRef(false)
  const hasPlayedIntroRef = useRef(false)

  // Load the font
  useEffect(() => {
    if (!config.font) return
    let cancelled = false
    ;(async () => {
      try {
        const opentype = await import('opentype.js')
        const fontPath = config.font!.replace('.json', '.ttf')
        const response = await fetch(fontPath)
        const arrayBuffer = await response.arrayBuffer()
        const loaded = opentype.parse(arrayBuffer) as unknown as OpentypeFont
        if (!cancelled) setFont(loaded)
      } catch (error) {
        console.error('Failed to load font:', error)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [config.font])

  // Load the ball SVG
  useEffect(() => {
    if (!config.svg) return
    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch(config.svg!)
        const svgText = await response.text()
        const loader = new SVGLoader()
        const data = loader.parse(svgText)
        if (!cancelled) setSvgData(data)
      } catch (error) {
        console.error('Failed to load SVG:', error)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [config.svg])

  // Flip loading off once both assets resolve (or either errors out — we
  // still want to render something rather than hanging).
  useEffect(() => {
    if (font && svgData) setLoading(false)
  }, [font, svgData])

  const displayText = useMemo(
    () => getPreviewDisplayText(text, config, 'Name'),
    [text, config],
  )

  // Layout + shape generation. This is where the legacy liquid logic lives:
  //   - measure each glyph
  //   - apply per-letter width factor and center-outward taper
  //   - pair-kern
  //   - stash the ball at the midpoint
  //   - per-letter horizontal flip in the right half
  const layout = useMemo(() => {
    if (!font || !svgData) return null

    const n = displayText.length
    if (n === 0) return null

    const fontSize = FONT_SIZE
    const midSpriteSize = (config.midSpriteSize ?? 0.425) * fontSize
    const midSpriteSpacing = (config.midSpriteSpacing ?? -0.3) * fontSize
    const taper = config.centerOutwardTaper ?? 0.05
    const taperFloor = config.centerOutwardTaperFloor ?? 0.5
    const widthAdjustments = config.letterWidthAdjustments ?? {}
    const kerningTable = config.kerningTable ?? {}
    const flipFirst = new Set(config.letterFlipFirstHalf ?? [])
    const flipSecond = new Set(config.letterFlipSecondHalf ?? [])

    // numYellow = how many letters sit to the LEFT of the ball. Driven
    // by the explicit ballPosition prop when given (clamped into range),
    // otherwise falls back to the legacy "halfway through the name" rule.
    const defaultMid = n % 2 === 0 ? n / 2 : Math.ceil(n / 2)
    const numYellow = typeof ballPosition === 'number'
      ? Math.max(0, Math.min(n, ballPosition))
      : defaultMid

    // Per-character measurement data (raw glyph metrics at fontSize)
    const letterData: { cmds: Cmd[]; minX: number; maxX: number; minY: number; maxY: number }[] = []
    for (let i = 0; i < n; i++) {
      const ch = displayText[i]!
      const cmds = font.getPath(ch, 0, 0, fontSize).commands
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity
      for (const cmd of cmds) {
        if (cmd.x !== undefined) {
          minX = Math.min(minX, cmd.x)
          maxX = Math.max(maxX, cmd.x)
        }
        if (cmd.y !== undefined) {
          minY = Math.min(minY, cmd.y)
          maxY = Math.max(maxY, cmd.y)
        }
        if (cmd.x1 !== undefined) {
          minX = Math.min(minX, cmd.x1)
          maxX = Math.max(maxX, cmd.x1)
        }
        if (cmd.y1 !== undefined) {
          minY = Math.min(minY, cmd.y1)
          maxY = Math.max(maxY, cmd.y1)
        }
        if (cmd.x2 !== undefined) {
          minX = Math.min(minX, cmd.x2)
          maxX = Math.max(maxX, cmd.x2)
        }
        if (cmd.y2 !== undefined) {
          minY = Math.min(minY, cmd.y2)
          maxY = Math.max(maxY, cmd.y2)
        }
      }
      if (minX === Infinity) {
        minX = 0
        maxX = 0
        minY = 0
        maxY = 0
      }
      letterData.push({ cmds, minX, maxX, minY, maxY })
    }

    // Pass 1: compute cumulative X positions, ball insertion gap included
    let cursorX = 0
    const positions: {
      ch: string
      index: number
      isYellow: boolean
      scale: number
      widthFactor: number
      flip: boolean
      xStart: number
      measuredWidth: number
      data: (typeof letterData)[number]
    }[] = []
    let ballX = 0
    // Ball is only rendered when there's text AND paint layers to draw
    // it with. Setting ballLayers to [] in a config hides the sprite
    // completely (useful for debugging the text layout).
    const hasBallPaint = (config.ballLayers?.length ?? 0) > 0
    let ballPresent = n > 0 && hasBallPaint
    const overlayMode = config.midSpriteMode === 'overlay'

    // If the customer placed the ball before the first letter, insert
    // it here — the in-loop insertion hook only fires after a letter.
    // In overlay mode the text flow doesn't reserve room for the
    // sprite, so skip this branch entirely.
    if (!overlayMode && ballPresent && numYellow === 0) {
      ballX = cursorX + midSpriteSpacing / 2
      cursorX += midSpriteSize + midSpriteSpacing
    }

    const baseLetterSpacing = (config.textLetterSpacing ?? 0) * fontSize
    for (let i = 0; i < n; i++) {
      if (i > 0) {
        // Global inter-letter gap applied before every letter, then
        // adjusted by the pair-specific kerning override.
        cursorX += baseLetterSpacing
        const pair = displayText[i - 1]! + displayText[i]!
        if (kerningTable[pair] !== undefined) cursorX += kerningTable[pair]! * fontSize
      }
      const ch = displayText[i]!
      const d = Math.min(i, n - 1 - i)
      const scaleFactor = Math.max(1 - d * taper, taperFloor)
      const widthFactor = widthAdjustments[ch] ?? 1
      const data = letterData[i]!
      const measured = (data.maxX - data.minX) * widthFactor * scaleFactor
      const isYellow = i < numYellow
      const flip = isYellow ? flipFirst.has(ch) : flipSecond.has(ch)
      positions.push({
        ch,
        index: i,
        isYellow,
        scale: scaleFactor,
        widthFactor,
        flip,
        xStart: cursorX,
        measuredWidth: measured,
        data,
      })
      cursorX += measured
      if (!overlayMode && i === numYellow - 1 && ballPresent) {
        // Ball sits between halves: its left edge starts at cursorX + spacing/2,
        // and the next letter picks up at cursorX + midSpriteSize + spacing
        // (the spacing is negative so the ball overlaps the adjacent letters).
        ballX = cursorX + midSpriteSpacing / 2
        cursorX += midSpriteSize + midSpriteSpacing
      }
    }
    // Ball is always present whenever there's any text — position is
    // explicit now, so there's no "no between halves" edge case.

    const totalWidth = cursorX
    const centerOffset = -totalWidth / 2

    // Overlay mode: X doesn't break the text, it sits on top at a
    // fixed fraction of the total text width. Short names (≤ 4 letters)
    // centre it; longer names push it to the 60% mark, matching the
    // legacy 2D preview's layout.
    if (overlayMode && ballPresent) {
      const fraction = n <= 4 ? 0.5 : 0.6
      ballX = fraction * totalWidth - midSpriteSize / 2
    }

    // Pass 2: build per-letter shapes at their final transform
    const yellowShapes: THREE.Shape[] = []
    const redShapes: THREE.Shape[] = []
    let yMinY = Infinity
    let yMaxY = -Infinity
    for (const pos of positions) {
      const { data, scale, widthFactor, flip, xStart, isYellow } = pos
      const glyphXStart = centerOffset + xStart
      // X: translate char's minX to 0, then scale by widthFactor*scale, then
      // optionally flip around the glyph's own mid-X, then translate to
      // glyphXStart.
      // Y: scale around the glyph's baseline (y=0) by scale.
      const localWidth = (data.maxX - data.minX) * widthFactor * scale
      const transformed = transformCmds(data.cmds, (x, y) => {
        let lx = (x - data.minX) * widthFactor * scale
        if (flip) lx = localWidth - lx
        const ly = y * scale
        return [glyphXStart + lx, ly]
      })
      const shapes = cmdsToShapes(transformed)
      if (isYellow) yellowShapes.push(...shapes)
      else redShapes.push(...shapes)
      // Track Y extents of rendered text for later vertical centering
      for (const s of shapes) {
        const pts = s.getPoints()
        for (const p of pts) {
          if (p.y < yMinY) yMinY = p.y
          if (p.y > yMaxY) yMaxY = p.y
        }
      }
      const halfHeightMin = data.minY * scale
      const halfHeightMax = data.maxY * scale
      if (halfHeightMin < yMinY) yMinY = halfHeightMin
      if (halfHeightMax > yMaxY) yMaxY = halfHeightMax
    }

    // Optional mirrored reflection below the main text (HxH-style
    // "two-row" composition). Pivot around the ACTUAL bottom of the
    // rendered text (yMaxY) rather than the font baseline — display
    // fonts often don't reach y=0 exactly, which would leave a gap
    // between the rows. The optional reflectionOffsetY still works as
    // an extra gap on top of that (0 = rows touch exactly).
    const reflectionGap = (config.reflectionOffsetY ?? 0.3) * fontSize
    const reflectionActive = !!config.reflectionLayer
    const reflectionShapes: THREE.Shape[] = []
    if (reflectionActive) {
      const pivotY = yMaxY + reflectionGap / 2
      const mirror = (shapes: THREE.Shape[]) => {
        for (const shape of shapes) {
          // Mirroring flips winding direction — reverse points to keep
          // the shape's "inside" on the intended side.
          const outer = shape.getPoints(24)
          const flippedOuter = outer
            .map((p) => new THREE.Vector2(p.x, 2 * pivotY - p.y))
            .reverse()
          const newShape = new THREE.Shape(flippedOuter)
          for (const hole of shape.holes) {
            const flippedHole = hole
              .getPoints(24)
              .map((p) => new THREE.Vector2(p.x, 2 * pivotY - p.y))
              .reverse()
            newShape.holes.push(new THREE.Path(flippedHole))
          }
          reflectionShapes.push(newShape)
        }
      }
      mirror(yellowShapes)
      mirror(redShapes)
    }

    // Build ball shapes grouped by SVG fill color so each color can be its
    // own paint layer. Match against `layer.svgColor ?? layer.color` like
    // the other SVG scenes. Also compute a single "silhouette" union for
    // the stroke-expanded base.
    const ballLayers = config.ballLayers ?? []
    const ballShapesByColor = new Map<string, THREE.Shape[]>()
    const ballSilhouette: THREE.Shape[] = []
    let ballBounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    if (ballPresent && svgData) {
      for (const path of svgData.paths) {
        const hex = '#' + path.color.getHexString()
        const matched = SVGLoader.createShapes(path)
        for (const s of matched) {
          const prev = ballShapesByColor.get(hex) ?? []
          prev.push(s)
          ballShapesByColor.set(hex, prev)
        }
      }
      // Bounding box of the raw SVG so we can scale+position the ball in
      // the same local coords as the text.
      for (const path of svgData.paths) {
        for (const sub of path.subPaths) {
          for (const pt of sub.getPoints()) {
            if (pt.x < ballBounds.minX) ballBounds.minX = pt.x
            if (pt.y < ballBounds.minY) ballBounds.minY = pt.y
            if (pt.x > ballBounds.maxX) ballBounds.maxX = pt.x
            if (pt.y > ballBounds.maxY) ballBounds.maxY = pt.y
          }
        }
      }
      const svgW = ballBounds.maxX - ballBounds.minX
      const ballScale = svgW > 0 ? midSpriteSize / svgW : 1
      const ballCx = (ballBounds.minX + ballBounds.maxX) / 2
      const ballCy = (ballBounds.minY + ballBounds.maxY) / 2
      const ballTargetCx = centerOffset + ballX + midSpriteSize / 2
      // Ball's vertical centre lands on the text's vertical centre (same
      // baseline system), with an optional manual nudge. When a
      // reflection is active, the ball instead sits on the mirror
      // axis between main and reflection rows (the same pivotY we
      // used for the mirror flip), so the X emblem bridges the two.
      const yOffsetRel = (config.midSpriteOffsetY ?? 0) * fontSize
      const textCy = (yMinY + yMaxY) / 2
      const mirrorAxisY = yMaxY + reflectionGap / 2
      const ballTargetCy = reflectionActive
        ? mirrorAxisY + yOffsetRel
        : textCy + yOffsetRel

      // Helper: scale each shape's points + holes from SVG space into the
      // text's local coord space.
      const transformBallShapes = (shapes: THREE.Shape[]): THREE.Shape[] => {
        return shapes.map((shape) => {
          const newOuter = shape.getPoints(24).map((pt) => {
            const lx = (pt.x - ballCx) * ballScale + ballTargetCx
            // SVG Y grows downward (same as opentype), so no flip here —
            // we center around ballCy and scale.
            const ly = (pt.y - ballCy) * ballScale + ballTargetCy
            return new THREE.Vector2(lx, ly)
          })
          const s = new THREE.Shape(newOuter)
          for (const hole of shape.holes) {
            const newHole = hole.getPoints(24).map((pt) => {
              const lx = (pt.x - ballCx) * ballScale + ballTargetCx
              const ly = (pt.y - ballCy) * ballScale + ballTargetCy
              return new THREE.Vector2(lx, ly)
            })
            s.holes.push(new THREE.Path(newHole))
          }
          return s
        })
      }

      for (const [hex, shapes] of Array.from(ballShapesByColor.entries())) {
        ballShapesByColor.set(hex, transformBallShapes(shapes))
      }

      // Silhouette: take the largest-area paint layer from ballLayers and
      // use *that* as the base. In practice this is the darkest/black
      // layer, which already covers the full ball. Fall back to unioning
      // every color if we can't pick one.
      const silhouetteColor = ballLayers[0]?.svgColor ?? ballLayers[0]?.color
      if (silhouetteColor) {
        const match = ballShapesByColor.get(silhouetteColor.toLowerCase())
        if (match && match.length > 0) ballSilhouette.push(...match)
      }
      if (ballSilhouette.length === 0) {
        for (const arr of Array.from(ballShapesByColor.values())) ballSilhouette.push(...arr)
      }
    }

    // Full bbox for centring the whole sign in the viewport
    const fullBB = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    const accBB = (s: THREE.Shape[]) => {
      for (const shape of s) {
        for (const pt of shape.getPoints()) {
          if (pt.x < fullBB.minX) fullBB.minX = pt.x
          if (pt.y < fullBB.minY) fullBB.minY = pt.y
          if (pt.x > fullBB.maxX) fullBB.maxX = pt.x
          if (pt.y > fullBB.maxY) fullBB.maxY = pt.y
        }
      }
    }
    // Centering bbox — text only. Keeping the ball out of this bbox
    // means the text position never shifts when the X is added or
    // resized. The X renders relative to this frame.
    accBB(yellowShapes)
    accBB(redShapes)
    accBB(reflectionShapes)

    return {
      yellowShapes,
      redShapes,
      reflectionShapes,
      ballShapesByColor,
      ballSilhouette,
      bounds: fullBB,
    }
  }, [
    font,
    svgData,
    displayText,
    config.midSpriteSize,
    config.midSpriteSpacing,
    config.midSpriteOffsetY,
    config.reflectionLayer,
    config.reflectionOffsetY,
    config.midSpriteMode,
    config.textLetterSpacing,
    config.centerOutwardTaper,
    config.centerOutwardTaperFloor,
    config.letterWidthAdjustments,
    config.kerningTable,
    config.letterFlipFirstHalf,
    config.letterFlipSecondHalf,
    config.ballLayers,
    ballPosition,
  ])

  // Build meshes. The base is a stroke-expanded union of all text + ball
  // silhouette shapes; paint layers ride on top at offsetZ. Y is flipped
  // once at the group level (opentype convention → three.js up convention).
  const meshes = useMemo(() => {
    if (!layout) return null
    const out: THREE.Mesh[] = []
    const { yellowShapes, redShapes, reflectionShapes, ballSilhouette, ballShapesByColor, bounds } = layout

    // Base: stroke-expanded union of every filled shape in the sign,
    // including the mirrored reflection so the red backing extends
    // under both rows.
    if (config.baseLayer) {
      const baseInput = [...yellowShapes, ...redShapes, ...reflectionShapes, ...ballSilhouette]
      const base = extrudedMesh(baseInput, config.baseLayer, DEPTH_SCALE, bounds)
      if (base) out.push(base)
    }

    // Ball silhouette cut geometry: a solid disc (all ball shapes with
    // holes stripped) extruded to fully span the paint Z range. Used to
    // CSG-subtract the ball footprint from the text paint, so the ball
    // visibly "cuts into" the yellow/red letters where they overlap — the
    // black base shows through the cut, framing the ball with its ring.
    let ballCutGeo: THREE.BufferGeometry | null = null
    const allBallShapes: THREE.Shape[] = []
    for (const arr of Array.from(ballShapesByColor.values())) allBallShapes.push(...arr)
    if (allBallShapes.length > 0) {
      const solid = allBallShapes
        .map((s) => {
          const pts = s.getPoints()
          return pts.length > 0 ? new THREE.Shape(pts) : null
        })
        .filter((s): s is THREE.Shape => s !== null)
      if (solid.length > 0) {
        // Span a little below and above the paint Z range so the cut
        // cleanly slices through. Derived from the actual layer config
        // rather than hardcoded so thickness tweaks propagate.
        const paintOffsetZ = config.firstHalfLayer?.offsetZ ?? config.baseLayer?.depth ?? 11
        const paintDepth = config.firstHalfLayer?.depth ?? 1
        const padMm = 2
        const baseZ = (paintOffsetZ - padMm) * DEPTH_SCALE
        const depth = (paintDepth + padMm * 2) * DEPTH_SCALE
        const geo = new THREE.ExtrudeGeometry(solid, {
          depth,
          bevelEnabled: false,
          steps: 1,
        })
        const cx = (bounds.minX + bounds.maxX) / 2
        const cy = (bounds.minY + bounds.maxY) / 2
        geo.translate(-cx, -cy, baseZ)
        ballCutGeo = geo
      }
    }

    // In overlay mode the X is a physical piece sitting IN FRONT of
    // the text (higher Z via the ball layers' offsetZ), like the
    // raised X on the physical HxH sign. So the letters keep their
    // full surface and we skip the CSG cut — nothing carves into the
    // paint. In between-halves mode the X is flush with the text, so
    // we still cut the ball shape out to avoid Z-fighting.
    const cutText = config.midSpriteMode === 'overlay' ? null : ballCutGeo

    // TEMP DEBUG
    if (typeof window !== 'undefined') {
      const counts = yellowShapes.map((s) => s.holes.length)
      // eslint-disable-next-line no-console
      console.log('[dragonball-sign] yellowShapes hole counts:', counts, 'total:', yellowShapes.length)
    }

    // Yellow paint layer (first half of text)
    if (config.firstHalfLayer) {
      const m = extrudedMesh(yellowShapes, config.firstHalfLayer, DEPTH_SCALE, bounds, cutText)
      if (m) {
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line no-console
          console.log('[dragonball-sign] paint mesh vertex count:', m.geometry.attributes.position.count)
        }
        out.push(m)
      }
    }
    // Red paint layer (second half of text)
    if (config.secondHalfLayer) {
      const m = extrudedMesh(redShapes, config.secondHalfLayer, DEPTH_SCALE, bounds, cutText)
      if (m) out.push(m)
    }
    // Mirrored reflection paint layer.
    if (config.reflectionLayer && reflectionShapes.length > 0) {
      const m = extrudedMesh(reflectionShapes, config.reflectionLayer, DEPTH_SCALE, bounds, cutText)
      if (m) out.push(m)
    }

    // Ball paints — match layer.svgColor (lowercased hex) to the parsed
    // SVG fill groups. Layers that don't match anything are silently
    // skipped so configs can list "optional" variants.
    if (config.ballLayers) {
      for (const layer of config.ballLayers) {
        const key = (layer.svgColor ?? layer.color).toLowerCase()
        const shapes = ballShapesByColor.get(key)
        if (!shapes || shapes.length === 0) continue
        const m = extrudedMesh(shapes, layer, DEPTH_SCALE, bounds)
        if (m) out.push(m)
      }
    }

    // Clean up the cut geometry — once extrudedMesh has consumed it (via
    // brush clones) it's safe to dispose the original.
    ballCutGeo?.dispose()

    return out
  }, [layout, config.baseLayer, config.firstHalfLayer, config.secondHalfLayer, config.reflectionLayer, config.ballLayers])

  // Dispose meshes when they change (stale ones would leak GPU memory)
  useEffect(() => {
    return () => {
      if (!meshes) return
      for (const m of meshes) {
        m.geometry.dispose()
        if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose())
        else m.material.dispose()
      }
    }
  }, [meshes])

  const baseScale = config.scale ?? 1
  // Shrink the whole sign as the name gets longer so it stays inside the
  // canvas, mirroring the One Piece sign behaviour. Up to 4 characters
  // the scale is untouched; each extra character shaves ~6% until a
  // floor of 55%. The mid ball adds ~1 character worth of width, so the
  // base of 4 already accounts for "NAME + ball".
  const lengthScale = Math.max(0.55, 1 - Math.max(0, displayText.length - 4) * 0.06)
  const scale = baseScale * lengthScale

  useEffect(() => {
    hasPlayedIntroRef.current = true
    introProgressRef.current = 1
    introFinishedRef.current = true
  }, [])

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    group.scale.set(scale, -scale, scale)
  })

  if (loading) {
    return (
      <>
        <color attach="background" args={[config.background || '#0a0a12']} />
        <StudioLighting />
        <Html center>
          <Preview3DLoadingIndicator label="Loading model..." />
        </Html>
      </>
    )
  }

  return (
    <>
      <color attach="background" args={[config.background || '#0a0a12']} />

      <StudioLighting />

      <PresentationControls
        global
        cursor
        speed={1}
        zoom={1}
        polar={[-0.35, 0.35]}
        azimuth={[-0.85, 0.85]}
      >
        <group
          ref={groupRef}
          // Y flipped so opentype's Y-down coords read right-side up.
          scale={[scale, -scale, scale]}
        >
          {meshes?.map((m, i) => (
            <primitive key={i} object={m} />
          ))}
        </group>
      </PresentationControls>

      <ContactShadows
        position={[0, -9.85, 0]}
        opacity={0.2}
        scale={60}
        blur={2.8}
        far={20}
      />

      <OrbitControls
        enablePan={false}
        enableRotate={false}
        minDistance={15}
        maxDistance={80}
        autoRotate={false}
        maxPolarAngle={Math.PI * 0.7}
        minPolarAngle={Math.PI * 0.3}
        target={[0, 0, 0]}
      />
    </>
  )
}
