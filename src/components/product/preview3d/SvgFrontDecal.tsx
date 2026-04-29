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

export function SvgFrontDecal({
  config,
  viewBox,
  depthScale,
  lightOn = true,
}: SvgFrontDecalProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

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
      },
      undefined,
      (err) => {
        console.error('Failed to load front decal texture:', err)
      },
    )

    return () => {
      cancelled = true
    }
  }, [config.texture])

  useEffect(() => {
    return () => {
      texture?.dispose()
    }
  }, [texture])

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

  // Unlit decal: the painted PNG renders at its full authored color with
  // no PBR lighting applied. The black silhouette extrusion stays a black
  // silhouette (no studio-light brightening at the rim), and the painted
  // pixels pop because the scene's bloom pass glows whatever exceeds the
  // luminanceThreshold. With light off we dim the decal toward the base
  // silhouette so the LED reads as switched off.
  const onTint = config.lightIntensity ?? 1
  const offTint = 0.18
  const tint = lightOn ? onTint : offTint

  return (
    <mesh
      position={[centerX, centerY, scaledZ]}
      // The plane lives inside the outer model group whose Y axis is
      // flipped (scale[s, -s, 1]). Pre-flipping the plane's Y here so the
      // texture renders upright after the parent flip. The X scale carries
      // the user-tunable size multiplier.
      scale={[userScale, -userScale, 1]}
    >
      <planeGeometry args={[viewBox.width, viewBox.height]} />
      <meshBasicMaterial
        map={texture}
        color={new THREE.Color(tint, tint, tint)}
        transparent
        alphaTest={config.alphaTest ?? 0.01}
        toneMapped={false}
      />
    </mesh>
  )
}
