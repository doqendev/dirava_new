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

export function ExtrudedTextLayer({ shapes, layer, depthScale, lightOn = true }: ExtrudedTextLayerProps) {
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
      for (let i = 0; i < expanded.length && i < shapes.length; i++) {
        const src = shapes[i]
        const dst = expanded[i]
        if (!src || !dst) continue
        for (const hole of src.holes) {
          const shrunk = shrinkContour(hole.getPoints(), layer.strokeWidth)
          dst.holes.push(new THREE.Path(shrunk))
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

    // Center only X/Y — leave Z untouched so layers stack correctly
    geo.computeBoundingBox()
    const bb = geo.boundingBox!
    geo.translate(
      -(bb.min.x + bb.max.x) / 2,
      -(bb.min.y + bb.max.y) / 2,
      0,
    )

    geo.computeVertexNormals()
    return geo
  }, [shapes, layer.depth, layer.strokeWidth, depthScale])

  const material = useMemo(() => {
    const baseIntensity = layer.emissiveIntensity ?? 0
    const emissiveIntensity = lightOn ? baseIntensity : 0
    return new THREE.MeshStandardMaterial({
      color: layer.color,
      metalness: layer.metalness ?? 0.1,
      roughness: layer.roughness ?? 0.7,
      emissive: emissiveIntensity > 0 ? new THREE.Color(layer.emissive ?? layer.color) : new THREE.Color(0, 0, 0),
      emissiveIntensity,
    })
  }, [layer.color, layer.metalness, layer.roughness, layer.emissive, layer.emissiveIntensity, lightOn])

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
      receiveShadow
    />
  )
}
