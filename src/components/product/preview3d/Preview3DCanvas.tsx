'use client'

import { Suspense, useState, useEffect, useRef, Component, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Box, Hand, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { TextExtrusionScene } from './TextExtrusionScene'
import { SvgExtrusionScene } from './SvgExtrusionScene'
import { CompositeSignScene } from './CompositeSignScene'
import { Preview3DLoadingIndicator } from './LoadingSpinner'
import type { PreviewConfig } from '@/lib/preview/types'

interface Preview3DCanvasProps {
  config: PreviewConfig
  text: string
  selectedVariantName?: string
}

function LoadingFallback({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a12]">
      <Preview3DLoadingIndicator label={label} />
    </div>
  )
}

function ErrorFallback({ notAvailable, webglHint }: { notAvailable: string; webglHint: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a12]">
      <Box className="w-8 h-8 text-white/30 mb-3" />
      <p className="text-sm text-white/40">{notAvailable}</p>
      <p className="text-xs text-white/20 mt-1">{webglHint}</p>
    </div>
  )
}

// Error boundary to catch WebGL and Three.js runtime errors
class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.warn('3D Preview error:', error.message)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return false
    // Explicitly lose the context to free the slot
    const ext = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')
    if (ext) ext.loseContext()
    canvas.width = 0
    canvas.height = 0
    return true
  } catch {
    return false
  }
}

interface SceneRouterProps extends Preview3DCanvasProps {
  sceneRef?: React.Ref<THREE.Group>
}

function SceneRouter({ config, text, selectedVariantName, sceneRef }: SceneRouterProps) {
  switch (config.type) {
    case 'text-extrusion':
      return <TextExtrusionScene text={text} config={config} />
    case 'svg-extrusion': {
      // Resolve SVG path: variant-specific or single SVG
      const svgPath = (selectedVariantName && config.variantSvgs?.[selectedVariantName]) || config.svg
      if (!svgPath) return null
      return <SvgExtrusionScene config={config} svgPath={svgPath} text={text} />
    }
    case 'composite-sign': {
      const jollySvgPath = (selectedVariantName && config.variantSvgs?.[selectedVariantName]) || config.svg
      return <CompositeSignScene config={config} svgPath={jollySvgPath} text={text} selectedVariantName={selectedVariantName} sceneRef={sceneRef} />
    }
    default:
      return null
  }
}

export function Preview3DCanvas({ config, text, selectedVariantName }: Preview3DCanvasProps) {
  const t = useTranslations('product')
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null)
  const [debouncedText, setDebouncedText] = useState(text)
  const [showHint, setShowHint] = useState(true)
  const sceneRef = useRef<THREE.Group>(null)

  // Check WebGL support on mount
  useEffect(() => {
    setWebGLSupported(checkWebGLSupport())
  }, [])

  // Auto-hide interaction hint after 4 seconds
  useEffect(() => {
    if (!showHint) return
    const timer = setTimeout(() => setShowHint(false), 4000)
    return () => clearTimeout(timer)
  }, [showHint])

  // Debounce text input for performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(text)
    }, 500)
    return () => clearTimeout(timer)
  }, [text])

  // Still checking
  if (webGLSupported === null) {
    return (
      <div className="relative w-full h-full bg-[#0a0a12]">
        <LoadingFallback label={t('preview3dLoading')} />
      </div>
    )
  }

  // WebGL not supported
  if (!webGLSupported) {
    return (
      <div className="relative w-full h-full bg-[#0a0a12]">
        <ErrorFallback notAvailable={t('preview3dNotAvailable')} webglHint={t('preview3dWebglHint')} />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-[#0a0a12]">
      <WebGLErrorBoundary
        fallback={
          <div className="relative w-full h-full bg-[#0a0a12]">
            <ErrorFallback notAvailable={t('preview3dNotAvailable')} webglHint={t('preview3dWebglHint')} />
          </div>
        }
      >
        <Canvas
          shadows
          camera={{
            position: config.camera.position,
            fov: config.camera.fov ?? 50,
            near: config.camera.near ?? 0.1,
            far: config.camera.far ?? 1000,
          }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <SceneRouter config={config} text={debouncedText} selectedVariantName={selectedVariantName} sceneRef={sceneRef} />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>

      {/* Updating spinner — shows while text is debouncing */}
      {text !== debouncedText && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          <div className="absolute inset-0 bg-[#0a0a12]/40" />
          <Preview3DLoadingIndicator label={t('preview3dUpdating')} className="relative z-10" />
        </div>
      )}

      {/* Interaction hints — animated, fades out after 4s */}
      <div
        className="absolute top-8 inset-x-0 z-10 pointer-events-none flex justify-center"
        style={{
          opacity: showHint ? 1 : 0,
          transform: showHint ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 1s ease, transform 1s ease',
        }}
      >
        <div
          className="flex items-center gap-5 px-5 py-2 rounded-full text-xs text-neon-cyan/80 animate-pulse"
          style={{
            background: 'rgba(0, 255, 255, 0.06)',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.15), 0 0 40px rgba(0, 255, 255, 0.05)',
            border: '1px solid rgba(0, 255, 255, 0.15)',
          }}
        >
          <span className="flex items-center gap-2">
            <Hand className="w-4 h-4" />
            {t('preview3dDragToRotate')}
          </span>
          <span className="text-neon-cyan/30">|</span>
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            {t('preview3dPinchToZoom')}
          </span>
        </div>
      </div>
    </div>
  )
}
