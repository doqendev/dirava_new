'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg'
import { expandShapes } from '@/lib/preview/expandShapes'
import type { LayerConfig } from '@/lib/preview/types'

interface SvgExtrudedLayerProps {
  svgData: { paths: THREE.ShapePath[] }
  matchColor: string
  layer: LayerConfig
  depthScale: number
  cutShapes?: THREE.Shape[]
  /** 3D geometry to subtract via CSG boolean operation */
  subtractGeometry?: THREE.BufferGeometry
  /** When false, any configured emissiveIntensity is forced to 0 so the
   *  layer stops self-lighting. Used by the LED on/off toggle. */
  lightOn?: boolean
}

function colorMatch(svgColor: THREE.Color, targetHex: string): boolean {
  return '#' + svgColor.getHexString() === targetHex.toLowerCase()
}

/** Compute 2D bounding box from a set of points */
function getBBox(points: THREE.Vector2[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  return { minX, minY, maxX, maxY }
}

/** Check if two 2D bounding boxes overlap */
function bboxOverlap(
  a: { minX: number; minY: number; maxX: number; maxY: number },
  b: { minX: number; minY: number; maxX: number; maxY: number },
): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY
}

export function SvgExtrudedLayer({ svgData, matchColor, layer, depthScale, cutShapes, subtractGeometry, lightOn = true }: SvgExtrudedLayerProps) {
  const geometry = useMemo(() => {
    // Filter SVG paths by fill color
    const allShapes: THREE.Shape[] = []
    for (const svgPath of svgData.paths) {
      if (colorMatch(svgPath.color, matchColor)) {
        const shapes = SVGLoader.createShapes(svgPath)
        allShapes.push(...shapes)
      }
    }

    if (allShapes.length === 0) return null

    // Apply Clipper offset if strokeWidth is set
    const finalShapes = layer.strokeWidth
      ? expandShapes(allShapes, layer.strokeWidth)
      : allShapes

    if (finalShapes.length === 0) return null

    // Add cut shapes as holes — only where bounding boxes overlap
    if (cutShapes && cutShapes.length > 0) {
      for (const shape of finalShapes) {
        const shapeBBox = getBBox(shape.getPoints())
        for (const cutShape of cutShapes) {
          const cutPoints = cutShape.getPoints()
          const cutBBox = getBBox(cutPoints)
          if (bboxOverlap(shapeBBox, cutBBox)) {
            shape.holes.push(new THREE.Path(cutPoints))
          }
        }
      }
    }

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: layer.depth * depthScale,
      bevelEnabled: false,
      steps: 1,
    }

    let geo: THREE.BufferGeometry = new THREE.ExtrudeGeometry(finalShapes, extrudeSettings)

    // CSG subtraction: cut the subtractGeometry from this layer
    if (subtractGeometry) {
      try {
        const baseBrush = new Brush(geo)
        baseBrush.position.set(0, 0, (layer.offsetZ ?? 0) * depthScale)
        baseBrush.updateMatrixWorld()

        const cutBrush = new Brush(subtractGeometry.clone())
        cutBrush.updateMatrixWorld()

        const evaluator = new Evaluator()
        const result = evaluator.evaluate(baseBrush, cutBrush, SUBTRACTION)
        // The result includes the offsetZ transform, so we need to undo it
        // since the mesh position will apply it again
        result.geometry.translate(0, 0, -(layer.offsetZ ?? 0) * depthScale)
        geo = result.geometry
      } catch (e) {
        console.warn('CSG subtraction failed, using original geometry:', e)
      }
    }

    geo.computeVertexNormals()
    return geo
  }, [svgData, matchColor, layer.depth, layer.offsetZ, layer.strokeWidth, depthScale, cutShapes, subtractGeometry])

  const material = useMemo(() => {
    const baseIntensity = layer.emissiveIntensity ?? 0
    // When the LED is "off" we still give emissive layers ~18% of their lit
    // intensity so the colours remain legible against the dark scene
    // background. Bloom stays disabled in off mode, so the look is a clean
    // unlit acrylic rather than a glowing sign.
    const emissiveIntensity = lightOn ? baseIntensity : baseIntensity * 0.18
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

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[0, 0, scaledOffset]}
      castShadow
      receiveShadow
    />
  )
}
