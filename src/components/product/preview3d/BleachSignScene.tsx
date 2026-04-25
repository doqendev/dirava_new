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

interface BleachSignSceneProps {
  text: string
  config: PreviewConfig
}

const DEPTH_SCALE = 0.08
const DEFAULT_FONT_SIZE = 3

type Cmd = { type: string; x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number }
type OpentypeFont = {
  getPath: (text: string, x: number, y: number, fontSize: number) => { commands: Cmd[] }
  getAdvanceWidth: (text: string, fontSize: number) => number
}

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

/** Convert opentype path commands to nested THREE.Shape[] (with holes). */
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

  const data = contours
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

  data.sort((a, b) => b.area - a.area)
  const depth = data.map(() => 0)
  const parents = data.map(() => -1)
  const TOL = 5
  for (let i = 1; i < data.length; i++) {
    const tp = data[i]!.points[0]
    if (!tp) continue
    for (let j = i - 1; j >= 0; j--) {
      const cj = data[j]!
      const ci = data[i]!
      const inBox =
        ci.bounds.minX >= cj.bounds.minX - TOL &&
        ci.bounds.maxX <= cj.bounds.maxX + TOL &&
        ci.bounds.minY >= cj.bounds.minY - TOL &&
        ci.bounds.maxY <= cj.bounds.maxY + TOL
      if (!inBox) continue
      let inside = false
      const poly = cj.points
      for (let pi = 0, pj = poly.length - 1; pi < poly.length; pj = pi++) {
        const a = poly[pi]!
        const b = poly[pj]!
        if (
          a.y > tp.y !== b.y > tp.y &&
          tp.x < ((b.x - a.x) * (tp.y - a.y)) / (b.y - a.y) + a.x
        ) {
          inside = !inside
        }
      }
      if (inside) {
        depth[i]!++
        if (parents[i] === -1) parents[i] = j
      }
    }
  }
  const shapes: THREE.Shape[] = []
  const byIdx = new Map<number, THREE.Shape>()
  for (let i = 0; i < data.length; i++) {
    if ((depth[i] ?? 0) % 2 === 0) {
      const s = new THREE.Shape(data[i]!.points)
      shapes.push(s)
      byIdx.set(i, s)
    }
  }
  for (let i = 0; i < data.length; i++) {
    if ((depth[i] ?? 0) % 2 === 1) {
      let par = parents[i] ?? -1
      while (par !== -1 && (depth[par] ?? 0) % 2 !== 0) par = parents[par] ?? -1
      if (par !== -1) {
        const ps = byIdx.get(par)
        if (ps) ps.holes.push(new THREE.Path(data[i]!.points))
      }
    }
  }
  return shapes
}

function extrudedMesh(
  shapes: THREE.Shape[] | null,
  layer: LayerConfig,
  depthScale: number,
): THREE.Mesh | null {
  if (!shapes || shapes.length === 0) return null
  const working = layer.strokeWidth ? expandShapes(shapes, layer.strokeWidth) : shapes
  if (working.length === 0) return null
  const geo = new THREE.ExtrudeGeometry(working, {
    depth: layer.depth * depthScale,
    bevelEnabled: false,
    steps: 1,
  })
  geo.translate(0, 0, (layer.offsetZ ?? 0) * depthScale)
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

/** Transform a set of shapes by translating x/y. */
function translateShapes(shapes: THREE.Shape[], dx: number, dy: number, sx = 1): THREE.Shape[] {
  return shapes.map((shape) => {
    const outer = shape.getPoints(24).map((p) => new THREE.Vector2(p.x * sx + dx, p.y + dy))
    const s = new THREE.Shape(outer)
    for (const hole of shape.holes) {
      const hp = hole.getPoints(24).map((p) => new THREE.Vector2(p.x * sx + dx, p.y + dy))
      s.holes.push(new THREE.Path(hp))
    }
    return s
  })
}

/** Parse an SVG into a map of fill-color → shapes. */
function svgToShapesByColor(data: ReturnType<SVGLoader['parse']>): Map<string, THREE.Shape[]> {
  const result = new Map<string, THREE.Shape[]>()
  for (const path of data.paths) {
    const hex = '#' + path.color.getHexString()
    const shapes = SVGLoader.createShapes(path)
    const prev = result.get(hex) ?? []
    prev.push(...shapes)
    result.set(hex, prev)
  }
  return result
}

/** Compute the SVG bounding box width from drawn subpaths. */
function svgBBox(data: ReturnType<SVGLoader['parse']>): { width: number; height: number; minX: number; minY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const path of data.paths) {
    for (const sub of path.subPaths) {
      for (const pt of sub.getPoints()) {
        if (pt.x < minX) minX = pt.x
        if (pt.y < minY) minY = pt.y
        if (pt.x > maxX) maxX = pt.x
        if (pt.y > maxY) maxY = pt.y
      }
    }
  }
  return { width: maxX - minX, height: maxY - minY, minX, minY }
}

export function BleachSignScene({ text, config }: BleachSignSceneProps) {
  const [font, setFont] = useState<OpentypeFont | null>(null)
  const [svgs, setSvgs] = useState<{
    left: ReturnType<SVGLoader['parse']> | null
    expander: ReturnType<SVGLoader['parse']> | null
    middle: ReturnType<SVGLoader['parse']> | null
    right: ReturnType<SVGLoader['parse']> | null
  }>({ left: null, expander: null, middle: null, right: null })
  const [loading, setLoading] = useState(true)
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!config.font) return
    let cancelled = false
    ;(async () => {
      try {
        const opentype = await import('opentype.js')
        const fontPath = config.font!.replace('.json', '.ttf')
        const r = await fetch(fontPath)
        const ab = await r.arrayBuffer()
        const f = opentype.parse(ab) as unknown as OpentypeFont
        if (!cancelled) setFont(f)
      } catch (e) {
        console.error('Failed to load Bleach font:', e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [config.font])

  useEffect(() => {
    const sources = config.bleachFrameSvgs
    if (!sources) return
    let cancelled = false
    const load = async (path: string) => {
      const r = await fetch(path)
      const text = await r.text()
      return new SVGLoader().parse(text)
    }
    Promise.all([
      load(sources.left),
      load(sources.expander),
      load(sources.middle),
      load(sources.right),
    ])
      .then(([left, expander, middle, right]) => {
        if (!cancelled) setSvgs({ left, expander, middle, right })
      })
      .catch((e) => console.error('Failed to load Bleach frame SVGs:', e))
    return () => {
      cancelled = true
    }
  }, [config.bleachFrameSvgs])

  useEffect(() => {
    if (font && svgs.left && svgs.expander && svgs.middle && svgs.right) setLoading(false)
  }, [font, svgs])

  const displayText = useMemo(
    () => getPreviewDisplayText(text, config, 'Name'),
    [text, config],
  )

  // Build everything: text shapes + frame shapes per color, positioned.
  const composition = useMemo(() => {
    if (!font || !svgs.left || !svgs.expander || !svgs.middle || !svgs.right) return null

    const fontSize = config.textFontSize ?? DEFAULT_FONT_SIZE
    // Build text shapes — one per letter, advancing by glyph width.
    const textShapes: THREE.Shape[] = []
    let cursorX = 0
    for (let i = 0; i < displayText.length; i++) {
      const ch = displayText[i]!
      const cmds = font.getPath(ch, 0, 0, fontSize).commands
      let mnx = Infinity,
        mxx = -Infinity
      for (const cmd of cmds) {
        if (cmd.x !== undefined) {
          mnx = Math.min(mnx, cmd.x)
          mxx = Math.max(mxx, cmd.x)
        }
        if (cmd.x1 !== undefined) {
          mnx = Math.min(mnx, cmd.x1)
          mxx = Math.max(mxx, cmd.x1)
        }
        if (cmd.x2 !== undefined) {
          mnx = Math.min(mnx, cmd.x2)
          mxx = Math.max(mxx, cmd.x2)
        }
      }
      if (mnx === Infinity) continue
      const offsetX = cursorX - mnx
      const transformed = transformCmds(cmds, (x, y) => [x + offsetX, y])
      textShapes.push(...cmdsToShapes(transformed))
      cursorX = mxx + offsetX + fontSize * (config.textLetterSpacing ?? 0)
    }
    const textWidth = cursorX

    // Compute frame layout. Match the legacy 2D math: minPreviewWidth =
    // left + expander + middle + expander + right. If text exceeds the
    // inner area, both expanders stretch by diff/2 along X.
    const targetSvgPxToScene = (config.bleachFrameScale ?? 0.025)
    const leftBB = svgBBox(svgs.left)
    const expanderBB = svgBBox(svgs.expander)
    const middleBB = svgBBox(svgs.middle)
    const rightBB = svgBBox(svgs.right)
    const leftW = leftBB.width * targetSvgPxToScene
    const expanderW = expanderBB.width * targetSvgPxToScene
    const middleW = middleBB.width * targetSvgPxToScene
    const rightW = rightBB.width * targetSvgPxToScene
    const minPreview = leftW + expanderW + middleW + expanderW + rightW
    const innerNatural = minPreview - leftW - rightW
    const textPad = (config.bleachTextPad ?? 0.4) * fontSize
    const textInnerWidth = textWidth + textPad * 2
    let stretch = 0
    let leftExpW = expanderW
    let rightExpW = expanderW
    let totalWidth = minPreview
    if (textInnerWidth > innerNatural) {
      stretch = textInnerWidth - innerNatural
      leftExpW += stretch / 2
      rightExpW += stretch / 2
      totalWidth = minPreview + stretch
    }
    const startX = -totalWidth / 2

    // Each piece's start X (in scene coords).
    const leftX = startX
    const expanderLX = leftX + leftW
    const middleX = expanderLX + leftExpW
    const expanderRX = middleX + middleW
    const rightX = expanderRX + rightExpW

    // Frame Y: SVGs are 251 tall in their own px; centre vertically
    // around y=0 so they sit symmetric in the scene.
    const frameH = leftBB.height * targetSvgPxToScene
    const frameYOffset = -leftBB.minY * targetSvgPxToScene - frameH / 2

    const positionFrameShapes = (
      data: ReturnType<SVGLoader['parse']>,
      atX: number,
      stretchX = 1,
    ): Map<string, THREE.Shape[]> => {
      const grouped = svgToShapesByColor(data)
      const result = new Map<string, THREE.Shape[]>()
      for (const [color, shapes] of Array.from(grouped.entries())) {
        const moved = translateShapes(
          shapes,
          atX - svgBBox(data).minX * targetSvgPxToScene,
          frameYOffset,
          targetSvgPxToScene * stretchX,
        )
        // translateShapes scales x by sx; we already accounted for that
        // by passing targetSvgPxToScene * stretchX. But the dx given is
        // computed against unstretched width. The simpler approach is to
        // first scale, then compute the offset based on the stretched
        // bbox. Recompute: for stretched expander, the natural minX is
        // 0 so dx = atX, and points are scaled by sx. For unstretched
        // pieces (stretchX=1), same as before.
        result.set(color, moved)
      }
      return result
    }
    void positionFrameShapes // silence unused-var
    const positionPiece = (
      data: ReturnType<SVGLoader['parse']>,
      atX: number,
      stretchX = 1,
    ): Map<string, THREE.Shape[]> => {
      const grouped = svgToShapesByColor(data)
      const bb = svgBBox(data)
      const result = new Map<string, THREE.Shape[]>()
      const sx = targetSvgPxToScene * stretchX
      const sy = targetSvgPxToScene
      const dx = atX - bb.minX * sx
      const dy = frameYOffset
      for (const [color, shapes] of Array.from(grouped.entries())) {
        const moved = shapes.map((shape) => {
          const outer = shape.getPoints(24).map((p) => new THREE.Vector2(p.x * sx + dx, p.y * sy + dy))
          const s = new THREE.Shape(outer)
          for (const hole of shape.holes) {
            const hp = hole.getPoints(24).map((p) => new THREE.Vector2(p.x * sx + dx, p.y * sy + dy))
            s.holes.push(new THREE.Path(hp))
          }
          return s
        })
        result.set(color, moved)
      }
      return result
    }
    // stretchX = stretchedWidthInPx / naturalWidthInPx; passing
    // expanderBB.width * targetSvgPxToScene as natural, leftExpW as
    // stretched, ratio = leftExpW / expanderW.
    const leftExpStretch = leftExpW / expanderW
    const rightExpStretch = rightExpW / expanderW

    const piecePositions = [
      positionPiece(svgs.left, leftX),
      positionPiece(svgs.expander, expanderLX, leftExpStretch),
      positionPiece(svgs.middle, middleX),
      positionPiece(svgs.expander, expanderRX, rightExpStretch),
      positionPiece(svgs.right, rightX),
    ]
    // Merge frame shapes by color.
    const frameByColor = new Map<string, THREE.Shape[]>()
    for (const m of piecePositions) {
      for (const [color, shapes] of Array.from(m.entries())) {
        const prev = frameByColor.get(color) ?? []
        prev.push(...shapes)
        frameByColor.set(color, prev)
      }
    }

    // Position text inside the frame, centred horizontally between the
    // two expanders' inner edges.
    const textCx = (expanderLX + expanderRX + leftExpW + rightExpW * 0 + middleW) / 2
    // Simpler: centre between expander L start and expander R end.
    const textCenterX = (expanderLX + expanderRX + rightExpW) / 2
    const textTranslateX = textCenterX - textWidth / 2
    // Centre text vertically on its own bbox first, then nudge with a
    // config-driven offset (textOffsetY in font-size units, negative
    // pushes the text upward — matches the legacy layout where the
    // name sits in the upper half above the horizontal stripes).
    let textMinY = Infinity, textMaxY = -Infinity
    for (const shape of textShapes) {
      for (const p of shape.getPoints()) {
        if (p.y < textMinY) textMinY = p.y
        if (p.y > textMaxY) textMaxY = p.y
      }
    }
    const textCY = textMinY === Infinity ? 0 : (textMinY + textMaxY) / 2
    const textOffsetY = (config.textOffsetY ?? -0.6) * fontSize
    const textTranslateY = -textCY + textOffsetY
    const positionedText = textShapes.map((shape) => {
      const outer = shape.getPoints(24).map((p) => new THREE.Vector2(p.x + textTranslateX, p.y + textTranslateY))
      const s = new THREE.Shape(outer)
      for (const hole of shape.holes) {
        const hp = hole.getPoints(24).map((p) => new THREE.Vector2(p.x + textTranslateX, p.y + textTranslateY))
        s.holes.push(new THREE.Path(hp))
      }
      return s
    })
    void textCx

    // Bbox for centring the whole sign in the camera.
    const allBB = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    const accBB = (shapes: THREE.Shape[]) => {
      for (const s of shapes) {
        for (const p of s.getPoints()) {
          if (p.x < allBB.minX) allBB.minX = p.x
          if (p.y < allBB.minY) allBB.minY = p.y
          if (p.x > allBB.maxX) allBB.maxX = p.x
          if (p.y > allBB.maxY) allBB.maxY = p.y
        }
      }
    }
    accBB(positionedText)
    for (const arr of Array.from(frameByColor.values())) accBB(arr)

    return {
      textShapes: positionedText,
      frameByColor,
      bounds: allBB,
    }
  }, [
    font,
    svgs,
    displayText,
    config.textLetterSpacing,
    config.bleachFrameScale,
    config.bleachTextPad,
    config.textFontSize,
    config.textOffsetY,
  ])

  // Build meshes from the composition.
  const meshes = useMemo(() => {
    if (!composition) return null
    const out: THREE.Mesh[] = []
    const { textShapes, frameByColor, bounds } = composition
    const cx = (bounds.minX + bounds.maxX) / 2
    const cy = (bounds.minY + bounds.maxY) / 2
    // Centre everything via a wrapping group transform — simpler than
    // re-translating each shape individually for camera fit.

    // Frame layers: extrude per-color. We re-use the `layers` config
    // array — match by `svgColor` like the dragonball/svg scenes.
    if (config.layers) {
      for (const layer of config.layers) {
        const key = (layer.svgColor ?? layer.color).toLowerCase()
        const shapes = frameByColor.get(key)
        if (!shapes || shapes.length === 0) continue
        const m = extrudedMesh(shapes, layer, DEPTH_SCALE)
        if (m) {
          m.geometry.translate(-cx, -cy, 0)
          out.push(m)
        }
      }
    }

    // Text layers — stroke stack: blue (widest stroke), white (narrower
    // stroke), red (fill, no stroke). Mirrors the legacy 2D draw order.
    if (config.textLayers) {
      for (const layer of config.textLayers) {
        const m = extrudedMesh(textShapes, layer, DEPTH_SCALE)
        if (m) {
          m.geometry.translate(-cx, -cy, 0)
          out.push(m)
        }
      }
    }

    return out
  }, [composition, config.layers, config.textLayers])

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
  // Shrink slightly with longer names so the canvas isn't overrun.
  const lengthScale = Math.max(0.6, 1 - Math.max(0, displayText.length - 6) * 0.04)
  const scale = baseScale * lengthScale

  useFrame(() => {
    const g = groupRef.current
    if (!g) return
    g.scale.set(scale, -scale, scale)
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
      <PresentationControls global cursor speed={1} zoom={1} polar={[-0.35, 0.35]} azimuth={[-0.85, 0.85]}>
        <group ref={groupRef} scale={[scale, -scale, scale]}>
          {meshes?.map((m, i) => (
            <primitive key={i} object={m} />
          ))}
        </group>
      </PresentationControls>
      <ContactShadows position={[0, -9.85, 0]} opacity={0.2} scale={60} blur={2.8} far={20} />
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
