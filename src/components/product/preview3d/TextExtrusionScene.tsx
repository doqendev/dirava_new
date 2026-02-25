'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, PresentationControls } from '@react-three/drei'
import { StudioLighting } from './StudioLighting'
import { ExtrudedTextLayer } from './ExtrudedTextLayer'
import { useReducedMotion } from '@/lib/hooks/useMediaQuery'
import type { PreviewConfig } from '@/lib/preview/types'
import { getPreviewDisplayText } from '@/lib/preview/textTransform'

interface TextExtrusionSceneProps {
  text: string
  config: PreviewConfig
}

// Scale factor: converts mm to scene units
const DEPTH_SCALE = 0.08
const FONT_SIZE = 5
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

export function TextExtrusionScene({ text, config }: TextExtrusionSceneProps) {
  const [font, setFont] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const groupRef = useRef<THREE.Group>(null)
  const introProgressRef = useRef(0)
  const introFinishedRef = useRef(false)
  const hasPlayedIntroRef = useRef(false)
  const shouldReduceMotion = useReducedMotion()

  // Load the font file with opentype.js
  useEffect(() => {
    let cancelled = false

    async function loadFont() {
      try {
        // Dynamic import opentype.js (only loaded when 3D preview is used)
        const opentype = await import('opentype.js')

        // Font path — use .ttf version (real TTF, not WOFF2)
        const fontPath = config.font!.replace('.json', '.ttf')
        const response = await fetch(fontPath)
        const arrayBuffer = await response.arrayBuffer()
        const loadedFont = opentype.parse(arrayBuffer)

        if (!cancelled) {
          setFont(loadedFont)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load font:', error)
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadFont()
    return () => { cancelled = true }
  }, [config.font])

  const displayText = useMemo(() => {
    return getPreviewDisplayText(text, config, 'Name')
  }, [text, config])

  const spacingMode = config.textSpacingMode ?? 'shape-overlap'
  const letterSpacing = config.textLetterSpacing ?? 0

  // Per-character contour classification for proper hole detection
  const textShapes = useMemo(() => {
    if (!font) return null

    type Cmd = { type: string; x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number }
    const allShapes: THREE.Shape[] = []
    let cursorX = 0

    for (let ci = 0; ci < displayText.length; ci++) {
      const char = displayText[ci]!
      const charPath = font.getPath(char, 0, 0, FONT_SIZE)
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

      if (spacingMode === 'advance') {
        // Use glyph advance widths so spacing is stable regardless of neighboring letters.
        const advanceWidth = Number(font.getAdvanceWidth?.(char, FONT_SIZE)) || (maxX - minX)
        cursorX += advanceWidth + FONT_SIZE * letterSpacing
      } else {
        // Overlap characters so actual 3D shapes touch (not just bounding boxes).
        const charOverlap = config.textCharOverlap ?? 0.1
        cursorX = maxX + offsetX - FONT_SIZE * charOverlap
      }
    }

    return allShapes.length > 0 ? allShapes : null
  }, [font, displayText, config.textCharOverlap, spacingMode, letterSpacing])

  const scale = config.scale ?? 1
  const shouldAnimateIntro = !shouldReduceMotion && !hasPlayedIntroRef.current
  const initialScale = scale * (shouldAnimateIntro ? INTRO_START_SCALE_MULTIPLIER : INTRO_END_SCALE_MULTIPLIER)
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
      group.scale.setScalar(scale * INTRO_END_SCALE_MULTIPLIER)
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

    const animatedScale = THREE.MathUtils.lerp(INTRO_START_SCALE_MULTIPLIER, INTRO_END_SCALE_MULTIPLIER, scaleT)
    group.scale.setScalar(scale * animatedScale)

    if (t >= 1) {
      introFinishedRef.current = true
      hasPlayedIntroRef.current = true
    }
  })

  if (loading || !font || !textShapes) {
    return (
      <>
        <color attach="background" args={[config.background || '#0a0a12']} />
        <StudioLighting />
      </>
    )
  }

  return (
    <>
      <color attach="background" args={[config.background || '#0a0a12']} />

      <StudioLighting />

      {/* Each layer self-centers via geo.center() so they align perfectly */}
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
          scale={initialScale}
          rotation={initialRotation}
          position={initialPosition}
        >
          {config.layers.map((layer, index) => (
            <ExtrudedTextLayer
              key={`${index}-${layer.color}`}
              shapes={textShapes}
              layer={layer}
              depthScale={DEPTH_SCALE}
            />
          ))}
        </group>
      </PresentationControls>

      {/* Ground shadow */}
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
        autoRotateSpeed={0}
        maxPolarAngle={Math.PI * 0.7}
        minPolarAngle={Math.PI * 0.3}
        target={[0, 0, 0]}
      />
    </>
  )
}
