'use client'

export function StudioLighting() {
  return (
    <>
      {/* Key light - main illumination from top-right */}
      <directionalLight
        position={[10, 10, 10]}
        intensity={1.5}
        color="#ffffff"
        castShadow
      />

      {/* Fill light - softer from left */}
      <directionalLight
        position={[-8, 5, 5]}
        intensity={0.8}
        color="#e8f0ff"
      />

      {/* Rim light - back edge highlight */}
      <directionalLight
        position={[0, -3, -10]}
        intensity={0.5}
        color="#ffffff"
      />

      {/* Ambient base */}
      <ambientLight intensity={0.45} color="#ffffff" />
    </>
  )
}
