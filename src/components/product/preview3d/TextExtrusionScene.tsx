'use client'

import { useMemo, useState, useEffect } from 'react'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import { StudioLighting } from './StudioLighting'
import { ExtrudedTextLayer } from './ExtrudedTextLayer'
import type { PreviewConfig } from '@/lib/preview/types'

interface TextExtrusionSceneProps {
  text: string
  config: PreviewConfig
}

// Scale factor: converts mm to scene units
const DEPTH_SCALE = 0.08
const FONT_SIZE = 5

export function TextExtrusionScene({ text, config }: TextExtrusionSceneProps) {
  const [font, setFont] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
    const trimmed = text.trim()
    if (!trimmed) return 'Name'
    if (config.maxChars) return trimmed.slice(0, config.maxChars)
    return trimmed
  }, [text, config.maxChars])

  const scale = config.scale ?? 1

  if (loading || !font) {
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
      <group scale={scale} rotation={[0.1, 0, 0]}>
        {config.layers.map((layer, index) => (
          <ExtrudedTextLayer
            key={`${index}-${layer.color}`}
            text={displayText}
            font={font}
            layer={layer}
            depthScale={DEPTH_SCALE}
            fontSize={FONT_SIZE}
          />
        ))}
      </group>

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -4, 0]}
        opacity={0.3}
        scale={60}
        blur={2}
        far={15}
      />

      <OrbitControls
        enablePan={false}
        minDistance={15}
        maxDistance={80}
        autoRotate={config.camera.autoRotate ?? true}
        autoRotateSpeed={config.camera.autoRotateSpeed ?? 1}
        maxPolarAngle={Math.PI * 0.7}
        minPolarAngle={Math.PI * 0.3}
        target={[0, 0, 0]}
      />
    </>
  )
}
