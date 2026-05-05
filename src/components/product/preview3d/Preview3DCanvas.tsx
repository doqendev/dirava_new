'use client'

import { Suspense, useState, useEffect, useRef, Component, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Box, Hand, Search, Lightbulb, LightbulbOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { TextExtrusionScene } from './TextExtrusionScene'
import { SvgExtrusionScene } from './SvgExtrusionScene'
import { CompositeSignScene } from './CompositeSignScene'
import { DragonballSignScene } from './DragonballSignScene'
import { BleachSignScene } from './BleachSignScene'
import { Preview3DLoadingIndicator } from './LoadingSpinner'
import { useIsMobile } from '@/lib/hooks/useMediaQuery'
import type { PreviewConfig } from '@/lib/preview/types'

interface Preview3DCanvasProps {
  config: PreviewConfig
  text: string
  selectedVariantName?: string
  /** Runtime-only prop for the Dragon Ball sign scene: which slot the ball sits in. */
  ballPosition?: number
  /** Runtime-only prop for Dragon Ball signs: render every O as a Dragon Ball sprite. */
  replaceOsWithBalls?: boolean
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
      <p className="text-sm text-white/60">{notAvailable}</p>
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
  lightOn: boolean
  yOffset: number
}

function SceneRouter({
  config,
  text,
  selectedVariantName,
  sceneRef,
  lightOn,
  yOffset,
  ballPosition,
  replaceOsWithBalls,
}: SceneRouterProps) {
  switch (config.type) {
    case 'text-extrusion':
      return <TextExtrusionScene text={text} config={config} />
    case 'svg-extrusion': {
      // Resolve SVG path: variant-specific or single SVG
      const svgPath = (selectedVariantName && config.variantSvgs?.[selectedVariantName]) || config.svg
      if (!svgPath) return null
      return (
        <SvgExtrusionScene
          config={config}
          svgPath={svgPath}
          text={text}
          selectedVariantName={selectedVariantName}
          lightOn={lightOn}
          yOffset={yOffset}
        />
      )
    }
    case 'composite-sign': {
      const jollySvgPath = (selectedVariantName && config.variantSvgs?.[selectedVariantName]) || config.svg
      return <CompositeSignScene config={config} svgPath={jollySvgPath} text={text} selectedVariantName={selectedVariantName} sceneRef={sceneRef} />
    }
    case 'dragonball-sign':
      return (
        <DragonballSignScene
          text={text}
          config={config}
          ballPosition={ballPosition}
          replaceOsWithBalls={replaceOsWithBalls}
        />
      )
    case 'bleach-sign':
      return <BleachSignScene text={text} config={config} />
    default:
      return null
  }
}

export function Preview3DCanvas({
  config,
  text,
  selectedVariantName,
  ballPosition,
  replaceOsWithBalls,
}: Preview3DCanvasProps) {
  const t = useTranslations('product')
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null)
  const [debouncedText, setDebouncedText] = useState(text)
  const [showHint, setShowHint] = useState(true)
  const [lightOn, setLightOn] = useState(true)
  const sceneRef = useRef<THREE.Group>(null)
  const isMobile = useIsMobile()
  const isProductFirstLightbox = config.scene?.variant === 'lightbox'
  const cameraPosition: [number, number, number] =
    isMobile && isProductFirstLightbox
      ? [config.camera.position[0], config.camera.position[1], config.camera.position[2] * 1.32]
      : config.camera.position
  // Only products that opt into bloom actually have a "light" to toggle;
  // non-LED products hide the switch entirely so it doesn't confuse shoppers.
  const hasLightToggle = Boolean(config.postprocessingBloom)
  const shouldShowInteractionHint = showHint && !(isMobile && isProductFirstLightbox)
  // Nudge the model up on mobile so it sits above the (typically tall) body
  // content and stays visible in the square canvas without being cropped
  // behind the interaction hint or info chip.
  const sceneYOffset = isMobile ? (isProductFirstLightbox ? -0.35 : 1.2) : 0

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
            position: cameraPosition,
            fov: config.camera.fov ?? 50,
            near: config.camera.near ?? 0.1,
            far: config.camera.far ?? 1000,
          }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <SceneRouter
              config={config}
              text={debouncedText}
              selectedVariantName={selectedVariantName}
              sceneRef={sceneRef}
              lightOn={lightOn}
              yOffset={sceneYOffset}
              ballPosition={ballPosition}
              replaceOsWithBalls={replaceOsWithBalls}
            />
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

      {/* LED on/off toggle — only for products that actually light up.
          Mimics a real sign's wall switch; defaults to ON because the lit
          look is the selling point. */}
      {hasLightToggle && (
        <button
          type="button"
          onClick={() => setLightOn((v) => !v)}
          aria-pressed={lightOn}
          aria-label={lightOn ? t('preview3dLightOff') : t('preview3dLightOn')}
          className="absolute top-3 left-3 z-20 pointer-events-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent,#00f5ff)]"
          style={{
            background: lightOn ? 'rgba(0, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.45)',
            border: lightOn ? '1px solid rgba(0, 255, 255, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)',
            color: lightOn ? 'rgb(180, 245, 255)' : 'rgba(255, 255, 255, 0.65)',
            boxShadow: lightOn ? '0 0 14px rgba(0, 255, 255, 0.25)' : 'none',
          }}
        >
          {lightOn ? <Lightbulb className="w-3.5 h-3.5" /> : <LightbulbOff className="w-3.5 h-3.5" />}
          <span>{lightOn ? t('preview3dLightOnLabel') : t('preview3dLightOffLabel')}</span>
        </button>
      )}

      {/* Interaction hints — animated, fades out after 4s */}
      <div
        className="absolute top-8 inset-x-0 z-10 pointer-events-none flex justify-center"
        style={{
          opacity: shouldShowInteractionHint ? 1 : 0,
          transform: shouldShowInteractionHint ? 'translateY(0)' : 'translateY(-8px)',
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
          {!isProductFirstLightbox && (
            <>
              <span className="text-neon-cyan/30">|</span>
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                {t('preview3dPinchToZoom')}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
