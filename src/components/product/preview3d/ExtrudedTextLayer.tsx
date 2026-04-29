'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { expandShapes } from '@/lib/preview/expandShapes'
import type { LayerConfig } from '@/lib/preview/types'

interface ExtrudedTextLayerProps {
  /** Pre-computed text shapes with proper hole classification */
  shapes: THREE.Shape[]
  layer: LayerConfig
  depthScale: number
  /** When false, emissiveIntensity is forced to 0 (LED toggle off). */
  lightOn?: boolean
  /**
   * Optional bbox (in shape-space coords) used for X/Y centering instead
   * of the extruded geometry's own bbox. Lets the scene supply a bbox
   * computed from a subset of characters (e.g. "everything except Q")
   * so an outlier glyph doesn't pull the rest of the text off-centre.
   */
  centerBounds?: { minX: number; minY: number; maxX: number; maxY: number } | null
}

/** Shrink a contour toward its centroid by a given amount */
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

export function ExtrudedTextLayer({ shapes, layer, depthScale, lightOn = true, centerBounds = null }: ExtrudedTextLayerProps) {
  const geometry = useMemo(() => {
    if (shapes.length === 0) return null

    // If strokeWidth is set, expand shapes then manually re-add shrunk holes
    let finalShapes: THREE.Shape[]
    if (layer.strokeWidth) {
      const solidShapes = shapes
        .map(s => { const pts = s.getPoints(); return pts.length > 0 ? new THREE.Shape(pts) : null })
        .filter((s): s is THREE.Shape => s !== null)
      if (solidShapes.length === 0) return null
      const expanded = expandShapes(solidShapes, layer.strokeWidth)
      // Re-add shrunk holes from original shapes after expansion
      if (!layer.stripHoles) {
        for (let i = 0; i < expanded.length && i < shapes.length; i++) {
          const src = shapes[i]
          const dst = expanded[i]
          if (!src || !dst) continue
          for (const hole of src.holes) {
            const shrunk = shrinkContour(hole.getPoints(), layer.strokeWidth)
            dst.holes.push(new THREE.Path(shrunk))
          }
        }
      }
      finalShapes = expanded
    } else {
      finalShapes = shapes
    }

    if (finalShapes.length === 0) return null

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: layer.depth * depthScale,
      bevelEnabled: false,
      steps: 1,
    }

    const geo = new THREE.ExtrudeGeometry(finalShapes, extrudeSettings)

    // Center only X/Y — leave Z untouched so layers stack correctly.
    // When `centerBounds` is supplied, use it (e.g. "non-Q bbox") so an
    // outlier glyph doesn't shift the rest of the text; otherwise fall
    // back to the geometry's own bbox.
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
    return geo
  }, [shapes, layer.depth, layer.strokeWidth, layer.stripHoles, depthScale, centerBounds])

  const material = useMemo(() => {
    const baseIntensity = layer.emissiveIntensity ?? 0
    // Mirror the paint layers: keep ~18% emissive in the off state so the
    // text stays legible without the full "lit" glow.
    const emissiveIntensity = lightOn ? baseIntensity : baseIntensity * 0.18
    const opacity = lightOn ? (layer.opacity ?? 1) : Math.min(layer.opacity ?? 1, 0.22)
    if (layer.additive) {
      const additiveIntensity = lightOn ? (layer.emissiveIntensity ?? 1) : (layer.emissiveIntensity ?? 1) * 0.18
      return new THREE.MeshBasicMaterial({
        color: new THREE.Color(layer.emissive ?? layer.color).multiplyScalar(additiveIntensity),
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      })
    }
    if (layer.unlit) {
      const unlitIntensity = lightOn ? (layer.emissiveIntensity ?? 1) : (layer.emissiveIntensity ?? 1) * 0.18
      return new THREE.MeshBasicMaterial({
        color: new THREE.Color(layer.emissive ?? layer.color).multiplyScalar(unlitIntensity),
        transparent: true,
        opacity,
        toneMapped: false,
      })
    }
    return new THREE.MeshStandardMaterial({
      color: layer.color,
      metalness: layer.metalness ?? 0.1,
      roughness: layer.roughness ?? 0.7,
      emissive: emissiveIntensity > 0 ? new THREE.Color(layer.emissive ?? layer.color) : new THREE.Color(0, 0, 0),
      emissiveIntensity,
      transparent: true,
      opacity,
      toneMapped: false,
    })
  }, [layer.additive, layer.color, layer.metalness, layer.opacity, layer.roughness, layer.emissive, layer.emissiveIntensity, layer.unlit, lightOn])

  if (!geometry) return null

  const scaledOffset = (layer.offsetZ ?? 0) * depthScale

  // scale Y by -1 to flip from SVG coords (Y-down) to Three.js coords (Y-up)
  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[0, 0, scaledOffset]}
      scale={[1, -1, 1]}
      castShadow
      receiveShadow={!layer.additive}
      renderOrder={layer.additive ? 1 : 3}
    />
  )
}
