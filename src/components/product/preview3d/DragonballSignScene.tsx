'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, PresentationControls, Html } from '@react-three/drei'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { StudioLighting } from './StudioLighting'
import { Preview3DLoadingIndicator } from './LoadingSpinner'
import { expandShapes } from '@/lib/preview/expandShapes'
import type { PreviewConfig, LayerConfig } from '@/lib/preview/types'
import { getPreviewDisplayText } from '@/lib/preview/textTransform'

interface DragonballSignSceneProps {
  text: string
  config: PreviewConfig
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
): THREE.Mesh | null {
  if (!shapes || shapes.length === 0) return null
  const working = layer.strokeWidth ? expandShapes(shapes, layer.strokeWidth) : shapes
  if (working.length === 0) return null
  const geo = new THREE.ExtrudeGeometry(working, {
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
  geo.translate(-cx, -cy, 0)
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

export function DragonballSignScene({ text, config }: DragonballSignSceneProps) {
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

    const numYellow = n % 2 === 0 ? n / 2 : Math.ceil(n / 2)

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
    let ballPresent = n > 1

    for (let i = 0; i < n; i++) {
      if (i > 0) {
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
      if (i === numYellow - 1 && ballPresent) {
        // Ball sits between halves: its left edge starts at cursorX + spacing/2,
        // and the next letter picks up at cursorX + midSpriteSize + spacing
        // (the spacing is negative so the ball overlaps the adjacent letters).
        ballX = cursorX + midSpriteSpacing / 2
        cursorX += midSpriteSize + midSpriteSpacing
      }
    }
    // Single-letter text has no ball (there's no "between halves")
    if (n === 1) ballPresent = false

    const totalWidth = cursorX
    const centerOffset = -totalWidth / 2

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
      // baseline system), with an optional manual nudge.
      const yOffsetRel = (config.midSpriteOffsetY ?? 0) * fontSize
      // Text baseline is y=0; caps run negative (above baseline) because
      // opentype Y grows downward. Visual vertical centre of text ≈
      // (yMinY + yMaxY) / 2.
      const textCy = (yMinY + yMaxY) / 2
      const ballTargetCy = textCy + yOffsetRel

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
    accBB(yellowShapes)
    accBB(redShapes)
    for (const arr of Array.from(ballShapesByColor.values())) accBB(arr)

    return {
      yellowShapes,
      redShapes,
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
    config.centerOutwardTaper,
    config.centerOutwardTaperFloor,
    config.letterWidthAdjustments,
    config.kerningTable,
    config.letterFlipFirstHalf,
    config.letterFlipSecondHalf,
    config.ballLayers,
  ])

  // Build meshes. The base is a stroke-expanded union of all text + ball
  // silhouette shapes; paint layers ride on top at offsetZ. Y is flipped
  // once at the group level (opentype convention → three.js up convention).
  const meshes = useMemo(() => {
    if (!layout) return null
    const out: THREE.Mesh[] = []
    const { yellowShapes, redShapes, ballSilhouette, ballShapesByColor, bounds } = layout

    // Base: stroke-expanded union of every filled shape in the sign.
    if (config.baseLayer) {
      const baseInput = [...yellowShapes, ...redShapes, ...ballSilhouette]
      const base = extrudedMesh(baseInput, config.baseLayer, DEPTH_SCALE, bounds)
      if (base) out.push(base)
    }

    // Yellow paint layer (first half of text)
    if (config.firstHalfLayer) {
      const m = extrudedMesh(yellowShapes, config.firstHalfLayer, DEPTH_SCALE, bounds)
      if (m) out.push(m)
    }
    // Red paint layer (second half of text)
    if (config.secondHalfLayer) {
      const m = extrudedMesh(redShapes, config.secondHalfLayer, DEPTH_SCALE, bounds)
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

    return out
  }, [layout, config.baseLayer, config.firstHalfLayer, config.secondHalfLayer, config.ballLayers])

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

  useEffect(() => {
    hasPlayedIntroRef.current = true
    introProgressRef.current = 1
    introFinishedRef.current = true
  }, [])

  useFrame(() => {
    const group = groupRef.current
    if (!group) return
    group.scale.set(baseScale, -baseScale, baseScale)
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
          scale={[baseScale, -baseScale, baseScale]}
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
