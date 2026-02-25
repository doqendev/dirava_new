'use client'

export function StudioLighting() {
  return (
    <>
      {/* Ambient fill */}
      <ambientLight intensity={0.35} color="#dbe8ff" />

      {/* Key light with shadows for grounded depth */}
      <directionalLight
        position={[2, 6.5, 14]}
        intensity={1.15}
        color="#ffffff"
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
        position={[-9, 5, 8]}
        intensity={0.6}
        color="#85b8ff"
      />

      {/* Back edge highlight */}
      <directionalLight
        position={[0, 3, -10]}
        intensity={0.35}
        color="#ffffff"
      />

      <group>
        {/* Floor surface */}
        <mesh position={[0, -10, -0.8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial
            color="#0a1022"
            metalness={0.05}
            roughness={0.88}
            emissive="#021028"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
    </>
  )
}
