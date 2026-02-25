'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, PresentationControls, Html } from '@react-three/drei'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { StudioLighting } from './StudioLighting'
import { SvgExtrudedLayer } from './SvgExtrudedLayer'
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

export function SvgExtrusionScene({ config, svgPath, text }: SvgExtrusionSceneProps) {
  const [svgData, setSvgData] = useState<ReturnType<SVGLoader['parse']> | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [font, setFont] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const groupRef = useRef<THREE.Group>(null)
  const introProgressRef = useRef(0)
  const introFinishedRef = useRef(false)
  const hasPlayedIntroRef = useRef(false)
  const shouldReduceMotion = useReducedMotion()

  // Load and parse the SVG file
  useEffect(() => {
    let cancelled = false

    async function loadSvg() {
      try {
        const response = await fetch(svgPath)
        const svgText = await response.text()
        const loader = new SVGLoader()
        const data = loader.parse(svgText)

        if (!cancelled) {
          setSvgData(data)
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

  // Auto-scale font size so text width fills a target ratio of the SVG width
  const effectiveFontSize = useMemo(() => {
    const baseFontSize = config.textFontSize ?? 150
    if (!font || !config.textLayers) return baseFontSize

    const targetRatio = config.textMaxWidthRatio ?? 0.95
    const targetWidth = svgBounds.width * targetRatio

    // Measure text advance width at the base font size
    const textWidth = font.getAdvanceWidth(displayText, baseFontSize) as number
    if (!textWidth || textWidth <= 0) return baseFontSize

    // Scale font size proportionally
    const scaled = baseFontSize * (targetWidth / textWidth)

    // Clamp to reasonable range (25% to 200% of base)
    return Math.max(baseFontSize * 0.25, Math.min(baseFontSize * 2, scaled))
  }, [font, displayText, config.textFontSize, config.textLayers, config.textMaxWidthRatio, svgBounds.width])

  // Collect shapes from 'cut' layers to subtract as holes from extrude layers
  const cutShapes = useMemo(() => {
    if (!svgData) return [] as THREE.Shape[]

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
    return shapes
  }, [svgData, config.layers])

  // Compute text shapes ONCE using per-character contour classification.
  // Shared between textSubtractGeometry and ExtrudedTextLayer to avoid
  // redundant expensive computation on every text change.
  const textShapes = useMemo(() => {
    if (!font) return null

    const fontSize = effectiveFontSize
    type Cmd = { type: string; x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number }
    const allShapes: THREE.Shape[] = []
    let cursorX = 0

    for (let ci = 0; ci < displayText.length; ci++) {
      const char = displayText[ci]!
      const charPath = font.getPath(char, 0, 0, fontSize)
      const charCmds = charPath.commands as Cmd[]

      let minX = Infinity, maxX = -Infinity
      for (const cmd of charCmds) {
        if (cmd.x !== undefined) { minX = Math.min(minX, cmd.x); maxX = Math.max(maxX, cmd.x) }
        if (cmd.x1 !== undefined) { minX = Math.min(minX, cmd.x1); maxX = Math.max(maxX, cmd.x1) }
        if (cmd.x2 !== undefined) { minX = Math.min(minX, cmd.x2); maxX = Math.max(maxX, cmd.x2) }
      }
      if (minX === Infinity) continue

      const offsetX = cursorX - minX
      const transformed: Cmd[] = charCmds.map(cmd => {
        const shifted: Cmd = { ...cmd }
        if (shifted.x !== undefined) shifted.x += offsetX
        if (shifted.x1 !== undefined) shifted.x1 += offsetX
        if (shifted.x2 !== undefined) shifted.x2 += offsetX
        return shifted
      })

      const charContours: Cmd[][] = []
      let cur: Cmd[] = []
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

      // Overlap characters so actual 3D shapes touch (not just bounding boxes).
      // 5% of fontSize ensures contour shapes connect even for irregular glyphs.
      cursorX = maxX + offsetX - fontSize * 0.1
    }

    return allShapes.length > 0 ? allShapes : null
  }, [font, displayText, effectiveFontSize])

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

    // Compute text bbox center
    let bMinX = Infinity, bMinY = Infinity, bMaxX = -Infinity, bMaxY = -Infinity
    for (const shape of expanded) {
      for (const pt of shape.getPoints()) {
        if (pt.x < bMinX) bMinX = pt.x
        if (pt.y < bMinY) bMinY = pt.y
        if (pt.x > bMaxX) bMaxX = pt.x
        if (pt.y > bMaxY) bMaxY = pt.y
      }
    }
    const textCenterX = (bMinX + bMaxX) / 2
    const textCenterY = (bMinY + bMaxY) / 2

    // Strip any remaining holes — solid fill for subtraction
    const finalShapes = expanded.map(shape => new THREE.Shape(shape.getPoints()))

    const maxSvgZ = Math.max(...config.layers.map(l => (l.offsetZ ?? 0) + l.depth))
    const cutDepth = (maxSvgZ + 4) * DEPTH_SCALE

    const geo = new THREE.ExtrudeGeometry(finalShapes, {
      depth: cutDepth,
      bevelEnabled: false,
      steps: 1,
    })

    geo.translate(-textCenterX + svgCenter.x, -textCenterY + svgCenter.y, -DEPTH_SCALE)
    return geo
  }, [textShapes, config.textLayers, config.layers, svgCenter])

  const scale = config.scale ?? 0.02
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

  if (loading || !svgData || (config.font && !font)) {
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

      {/* Scale SVG coords to scene units, flip Y, and center */}
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
                  cutShapes={(layer.offsetZ ?? 0) > 0 ? cutShapes : undefined}
                  subtractGeometry={textSubtractGeometry ?? undefined}
                />
              ))}
          </group>

          {/* Text layers — centered on the SVG, tiny Z nudge to render in front */}
          {textShapes && config.textLayers && config.textLayers.length > 0 && (
            <group
              position={[0, 0, 0.02]}
              scale={[1, -1, 1]}
            >
              {config.textLayers.map((layer, index) => (
                <ExtrudedTextLayer
                  key={`text-${index}-${layer.color}`}
                  shapes={textShapes}
                  layer={layer}
                  depthScale={DEPTH_SCALE}
                />
              ))}
            </group>
          )}
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
