'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { expandShapes } from '@/lib/preview/expandShapes'
import type { LayerConfig } from '@/lib/preview/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OpentypeFont = any

interface ExtrudedTextLayerProps {
  text: string
  font: OpentypeFont
  layer: LayerConfig
  depthScale: number
  fontSize: number
}

export function ExtrudedTextLayer({ text, font, layer, depthScale, fontSize }: ExtrudedTextLayerProps) {
  const geometry = useMemo(() => {
    // Use opentype.js to get the full text path (handles kerning, spacing, etc.)
    const path = font.getPath(text, 0, 0, fontSize)
    const pathData = path.toPathData() as string

    if (!pathData) return null

    // Wrap in minimal SVG for SVGLoader
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${pathData}"/></svg>`

    // Parse with Three.js SVGLoader (handles holes/winding correctly)
    const loader = new SVGLoader()
    const svgData = loader.parse(svgString)

    if (svgData.paths.length === 0) return null

    // Collect all shapes from all parsed paths
    const allShapes: THREE.Shape[] = []
    for (const svgPath of svgData.paths) {
      const shapes = SVGLoader.createShapes(svgPath)
      allShapes.push(...shapes)
    }

    if (allShapes.length === 0) return null

    // If strokeWidth is set, expand shapes using Clipper polygon offset
    const finalShapes = layer.strokeWidth
      ? expandShapes(allShapes, layer.strokeWidth)
      : allShapes

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
  }, [text, font, layer.depth, layer.strokeWidth, depthScale, fontSize])

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: layer.color,
      metalness: layer.metalness ?? 0.1,
      roughness: layer.roughness ?? 0.7,
    })
  }, [layer.color, layer.metalness, layer.roughness])

  if (!geometry) return null

  const scaledOffset = (layer.offsetZ ?? 0) * depthScale

  // scale Y by -1 to flip from SVG coords (Y-down) to Three.js coords (Y-up)
  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[0, 0, scaledOffset]}
      scale={[1, -1, 1]}
    />
  )
}
