'use client'

import { useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { StudioLighting } from './StudioLighting'
import { SvgExtrudedLayer } from './SvgExtrudedLayer'
import type { PreviewConfig } from '@/lib/preview/types'

interface SvgExtrusionSceneProps {
  config: PreviewConfig
  svgPath: string
}

const DEPTH_SCALE = 0.08

export function SvgExtrusionScene({ config, svgPath }: SvgExtrusionSceneProps) {
  const [svgData, setSvgData] = useState<ReturnType<SVGLoader['parse']> | null>(null)
  const [loading, setLoading] = useState(true)

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

  // Compute the bounding box center of all SVG paths for centering
  const svgCenter = useMemo(() => {
    if (!svgData) return new THREE.Vector2(250, 250)

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
    return center
  }, [svgData])

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

  const scale = config.scale ?? 0.02

  if (loading || !svgData) {
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

      {/* Scale SVG coords to scene units, flip Y, and center */}
      <group scale={[scale, -scale, 1]} rotation={[0.1, 0, 0]}>
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
              />
            ))}
        </group>
      </group>

      <ContactShadows
        position={[0, -4, 0]}
        opacity={0.3}
        scale={60}
        blur={2}
        far={15}
      />

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={40}
        autoRotate={config.camera.autoRotate ?? true}
        autoRotateSpeed={config.camera.autoRotateSpeed ?? 1}
        maxPolarAngle={Math.PI * 0.7}
        minPolarAngle={Math.PI * 0.3}
        target={[0, 0, 0]}
      />
    </>
  )
}
