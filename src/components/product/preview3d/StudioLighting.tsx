'use client'

import type { PreviewSceneConfig } from '@/lib/preview/types'

interface StudioLightingProps {
  scene?: PreviewSceneConfig
  floorY?: number
  lightOn?: boolean
}

export function StudioLighting({
  scene,
  floorY = -10,
  lightOn = true,
}: StudioLightingProps) {
  const isLightbox = scene?.variant === 'lightbox'
  const ambientIntensity = scene?.ambientIntensity ?? (isLightbox ? 0.22 : 0.35)
  const ambientColor = scene?.ambientColor ?? (isLightbox ? '#d8ecff' : '#dbe8ff')
  const keyIntensity = scene?.keyIntensity ?? (isLightbox ? 1.05 : 1.15)
  const keyColor = scene?.keyColor ?? '#ffffff'
  const fillIntensity = scene?.fillIntensity ?? (isLightbox ? 0.36 : 0.6)
  const fillColor = scene?.fillColor ?? (isLightbox ? '#45cfff' : '#85b8ff')
  const rimIntensity = scene?.rimIntensity ?? (isLightbox ? 0.9 : 0.35)
  const rimColor = scene?.rimColor ?? (isLightbox ? '#ff526d' : '#ffffff')
  const floorColor = scene?.floorColor ?? '#0a1022'
  const floorEmissive = scene?.floorEmissive ?? '#021028'
  const floorEmissiveIntensity = scene?.floorEmissiveIntensity ?? 0.2
  const floorSize = scene?.floorSize ?? [80, 80]
  const wallSize = scene?.wallSize ?? [42, 24]
  const wallZ = scene?.wallZ ?? -5.2
  const wallColor = scene?.wallColor ?? '#0b1020'
  const wallEmissive = scene?.wallEmissive ?? '#050b18'
  const wallEmissiveIntensity = scene?.wallEmissiveIntensity ?? 0.45
  const accentColor = scene?.accentColor ?? '#ffd84a'
  const ledGlowColor = scene?.ledGlowColor ?? '#fff2c2'
  const ledGlowIntensity = lightOn ? (scene?.ledGlowIntensity ?? 2.4) : 0.08
  const ledGlowDistance = scene?.ledGlowDistance ?? 15

  return (
    <>
      {/* Ambient fill */}
      <ambientLight intensity={ambientIntensity} color={ambientColor} />

      {/* Key light with shadows for grounded depth. Lightbox variant
       *  pulls the position closer to head-on so the painted decal lights
       *  symmetrically top-to-bottom — the previous high-and-right
       *  position made bloom contributions visibly stronger above any
       *  bright element (e.g. the upper bones glowed harder than the lower
       *  ones). */}
      <directionalLight
        position={isLightbox ? [1.5, 3.5, 12] : [2, 6.5, 14]}
        intensity={keyIntensity}
        color={keyColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.00008}
        shadow-normalBias={0.015}
        shadow-camera-near={1}
        shadow-camera-far={42}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />

      {/* Cool fill */}
      <directionalLight
        position={isLightbox ? [-8, 1.5, 6] : [-9, 5, 8]}
        intensity={fillIntensity}
        color={fillColor}
      />

      {/* Back edge highlight — head-on behind the sign for the lightbox
       *  variant so the rim contribution doesn't sit asymmetrically on the
       *  top edges of the painted decal and silhouette outline. */}
      <directionalLight
        position={isLightbox ? [0, 0, -10] : [0, 3, -10]}
        intensity={rimIntensity}
        color={rimColor}
      />

      {isLightbox && (
        <>
          <pointLight
            position={[0, 0.4, 2.4]}
            intensity={ledGlowIntensity}
            color={ledGlowColor}
            distance={ledGlowDistance}
            decay={2}
          />
          <pointLight
            position={[0, 0, -1.6]}
            intensity={lightOn ? ledGlowIntensity * 0.65 : 0.05}
            color={ledGlowColor}
            distance={8}
            decay={2}
          />
          <pointLight
            position={[-4.2, 0.8, 2.2]}
            intensity={lightOn ? 0.45 : 0.04}
            color={fillColor}
            distance={10}
            decay={2}
          />
          <spotLight
            position={[4.6, 4.2, 6.2]}
            angle={0.38}
            penumbra={0.7}
            intensity={lightOn ? 0.62 : 0.12}
            color={accentColor}
            distance={15}
            decay={2}
          />
          {/* Matte wall behind the product, close enough to catch LED spill. */}
          <mesh
            position={[0, 0, wallZ]}
            receiveShadow
          >
            <planeGeometry args={wallSize} />
            <meshStandardMaterial
              color={wallColor}
              metalness={0}
              roughness={0.96}
              emissive={wallEmissive}
              emissiveIntensity={wallEmissiveIntensity}
            />
          </mesh>
        </>
      )}

      {!isLightbox && (
        <group>
          {/* Floor surface */}
          <mesh position={[0, floorY, -0.8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={floorSize} />
            <meshStandardMaterial
              color={floorColor}
              metalness={0.05}
              roughness={0.88}
              emissive={floorEmissive}
              emissiveIntensity={floorEmissiveIntensity}
            />
          </mesh>
        </group>
      )}
    </>
  )
}
