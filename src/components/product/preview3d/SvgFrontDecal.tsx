'use client'

import { useEffect, useState } from 'react'
import * as THREE from 'three'
import type { FrontDecalConfig } from '@/lib/preview/types'

interface SvgFrontDecalProps {
  config: FrontDecalConfig
  /** SVG viewBox (in raw SVG units). The decal is sized and positioned
   *  against this — NOT the path bbox — so a PNG exported from the same
   *  artboard as the SVG aligns 1:1 with the silhouette regardless of how
   *  much padding the paths leave inside the viewBox.
   *
   *  Null while the SVG is loading or when the SVG has no viewBox; the
   *  decal renders nothing in that case. */
  viewBox: { x: number; y: number; width: number; height: number } | null
  /** Same scene-units-per-svg-unit factor used by SvgExtrudedLayer. */
  depthScale: number
  /** When false the emissive contribution drops to ~18 % so the unlit look
   *  matches the rest of the scene's LED-off treatment. */
  lightOn?: boolean
}

function createInternalGlowTexture(
  image: HTMLImageElement,
  config: NonNullable<FrontDecalConfig['internalGlow']>,
): THREE.CanvasTexture | null {
  const width = image.naturalWidth || image.width
  const height = image.naturalHeight || image.height
  if (width <= 0 || height <= 0) return null

  const sourceCanvas = document.createElement('canvas')
  sourceCanvas.width = width
  sourceCanvas.height = height
  const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true })
  if (!sourceContext) return null

  sourceContext.drawImage(image, 0, 0, width, height)
  const source = sourceContext.getImageData(0, 0, width, height)
  const maskCanvas = document.createElement('canvas')
  maskCanvas.width = width
  maskCanvas.height = height
  const maskContext = maskCanvas.getContext('2d')
  if (!maskContext) return null

  const threshold = config.threshold ?? 34
  const warmth = config.warmth ?? 0.18
  const data = source.data
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0
    const g = data[i + 1] ?? 0
    const b = data[i + 2] ?? 0
    const a = data[i + 3] ?? 0
    const max = Math.max(r, g, b)
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    const strength = Math.max(0, Math.min(1, (max - threshold) / (255 - threshold)))

    if (a === 0 || max <= threshold || luminance < threshold) {
      data[i] = 0
      data[i + 1] = 0
      data[i + 2] = 0
      data[i + 3] = 0
      continue
    }

    // Warm the isolated light slightly, matching the real sign's creamy
    // internal diffuser while preserving saturated yellow/red accents.
    data[i] = Math.min(255, r + 255 * warmth * strength)
    data[i + 1] = Math.min(255, g + 170 * warmth * strength)
    data[i + 2] = Math.max(0, b - 80 * warmth * strength)
    data[i + 3] = Math.round(a * Math.pow(strength, 0.7))
  }

  maskContext.putImageData(source, 0, 0)

  const glowCanvas = document.createElement('canvas')
  glowCanvas.width = width
  glowCanvas.height = height
  const glowContext = glowCanvas.getContext('2d')
  if (!glowContext) return null

  glowContext.globalCompositeOperation = 'lighter'
  glowContext.filter = `blur(${config.blur ?? 9}px)`
  glowContext.globalAlpha = 0.9
  glowContext.drawImage(maskCanvas, 0, 0)
  glowContext.globalAlpha = 0.45
  glowContext.drawImage(maskCanvas, 0, 0)
  glowContext.filter = 'none'
  glowContext.globalAlpha = 0.55
  glowContext.drawImage(maskCanvas, 0, 0)

  const texture = new THREE.CanvasTexture(glowCanvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

export function SvgFrontDecal({
  config,
  viewBox,
  depthScale,
  lightOn = true,
}: SvgFrontDecalProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [glowTexture, setGlowTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    let cancelled = false

    loader.load(
      config.texture,
      (loaded) => {
        if (cancelled) {
          loaded.dispose()
          return
        }
        loaded.colorSpace = THREE.SRGBColorSpace
        loaded.anisotropy = 8
        setTexture(loaded)

        if (config.internalGlow && loaded.image instanceof HTMLImageElement) {
          const generatedGlow = createInternalGlowTexture(loaded.image, config.internalGlow)
          if (generatedGlow) {
            setGlowTexture(generatedGlow)
          }
        } else {
          setGlowTexture(null)
        }
      },
      undefined,
      (err) => {
        console.error('Failed to load front decal texture:', err)
      },
    )

    return () => {
      cancelled = true
    }
  }, [config.internalGlow, config.texture])

  useEffect(() => {
    return () => {
      texture?.dispose()
      glowTexture?.dispose()
    }
  }, [texture, glowTexture])

  if (!texture || !viewBox) return null

  const zOffset = config.zOffset ?? 12.05
  const scaledZ = zOffset * depthScale
  const userScale = config.scale ?? 1
  const offsetX = config.offsetX ?? 0
  const offsetY = config.offsetY ?? 0

  // Plane sits at the viewBox centre. Parent group already translates by
  // -svgCenter (path bbox centre), so the plane ends up offset from that
  // by (viewBoxCentre - pathBboxCentre) — exactly the artboard padding.
  const centerX = viewBox.x + viewBox.width / 2 + offsetX
  const centerY = viewBox.y + viewBox.height / 2 + offsetY

  // The decal keeps the authored PNG colour, then adds texture-driven
  // emissive light so bright printed pixels bloom like backlit paint.
  // With light off we dim both the tint and emissive contribution toward
  // the matte silhouette underneath.
  const onTint = config.lightIntensity ?? 1
  const offTint = 0.18
  const tint = lightOn ? onTint : offTint
  const emissiveIntensity = lightOn
    ? (config.emissiveIntensity ?? 0)
    : (config.emissiveIntensity ?? 0) * 0.12
  const glowConfig = config.internalGlow
  const glowOpacity = lightOn ? (glowConfig?.opacity ?? 0.55) : 0.04
  const glowIntensity = glowConfig?.intensity ?? 1.45
  const glowScale = glowConfig?.scale ?? 1.015
  const glowZ = ((glowConfig?.zOffset ?? zOffset + 0.12) * depthScale)

  return (
    <>
      <mesh
        position={[centerX, centerY, scaledZ]}
        // The plane lives inside the outer model group whose Y axis is
        // flipped (scale[s, -s, 1]). Pre-flipping the plane's Y here so the
        // texture renders upright after the parent flip. The X scale carries
        // the user-tunable size multiplier.
        scale={[userScale, -userScale, 1]}
      >
        <planeGeometry args={[viewBox.width, viewBox.height]} />
        <meshPhysicalMaterial
          map={texture}
          emissiveMap={emissiveIntensity > 0 ? texture : null}
          emissive={config.emissive ?? '#ffffff'}
          emissiveIntensity={emissiveIntensity}
          color={new THREE.Color(tint, tint, tint)}
          roughness={config.roughness ?? 0.35}
          metalness={config.metalness ?? 0}
          clearcoat={config.clearcoat ?? 0.4}
          clearcoatRoughness={config.clearcoatRoughness ?? 0.3}
          transparent
          alphaTest={config.alphaTest ?? 0.01}
          toneMapped={false}
        />
      </mesh>

      {glowTexture && glowConfig && (
        <mesh
          position={[centerX, centerY, glowZ]}
          scale={[userScale * glowScale, -userScale * glowScale, 1]}
          renderOrder={2}
        >
          <planeGeometry args={[viewBox.width, viewBox.height]} />
          <meshBasicMaterial
            map={glowTexture}
            color={new THREE.Color(glowIntensity, glowIntensity * 0.96, glowIntensity * 0.82)}
            transparent
            opacity={glowOpacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      )}
    </>
  )
}
