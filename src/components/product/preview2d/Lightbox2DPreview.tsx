'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Lightbox2DPreviewConfig } from '@/lib/preview/types'

interface Lightbox2DPreviewProps {
  config: Lightbox2DPreviewConfig
  text: string
  alt: string
  className?: string
}

interface PreviewSize {
  width: number
  height: number
}

function getImageRect(size: PreviewSize, config: Lightbox2DPreviewConfig) {
  if (size.width <= 0 || size.height <= 0) {
    return { x: 0, y: 0, width: 0, height: 0, scale: 0 }
  }

  const scale = Math.min(size.width / config.imageWidth, size.height / config.imageHeight)
  const width = config.imageWidth * scale
  const height = config.imageHeight * scale

  return {
    x: (size.width - width) / 2,
    y: (size.height - height) / 2,
    width,
    height,
    scale,
  }
}

function getFittedFontSize(text: string, boxWidth: number, boxHeight: number, config: Lightbox2DPreviewConfig) {
  const length = Math.max(text.length, 1)
  const lengthRatio = config.fontRatioByLength?.[length]

  if (lengthRatio) {
    return boxHeight * lengthRatio
  }

  const sizingLength = length <= 5 ? Math.min(length, 4) : length <= 12 ? 5 : length
  const letterSpacing = config.letterSpacingByLength?.[length] ?? config.letterSpacing ?? (sizingLength <= 4 ? 0.16 : sizingLength <= 8 ? 0.1 : 0.04)
  const maxByHeight = boxHeight * (config.maxFontRatio ?? 0.76)
  const averageGlyphWidth = sizingLength <= 4 ? 0.56 : sizingLength <= 8 ? 0.68 : 0.82
  const maxByWidth = boxWidth / (sizingLength * averageGlyphWidth + Math.max(0, sizingLength - 1) * letterSpacing)
  const minFontSize = config.minFontSize ?? 9

  return Math.max(minFontSize, Math.min(maxByHeight, maxByWidth))
}

export function Lightbox2DPreview({ config, text, alt, className }: Lightbox2DPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<PreviewSize>({ width: 0, height: 0 })
  const [loadedImage, setLoadedImage] = useState<string | null>(null)
  const [loadedFontFamily, setLoadedFontFamily] = useState<string | null>(null)
  const displayText = text.trim() || 'NAME'
  const fontFamily = config.fontFamily ?? '"OnePiecePreview", fantasy'
  const imageReady = loadedImage === config.image
  const fontReady = loadedFontFamily === fontFamily
  const previewReady = imageReady && fontReady

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const updateSize = () => {
      const rect = node.getBoundingClientRect()
      setSize({ width: rect.width, height: rect.height })
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false

    if (!document.fonts) {
      setLoadedFontFamily(fontFamily)
      return undefined
    }

    const loadFont = async () => {
      try {
        await document.fonts.load(`1em ${fontFamily}`)
        await document.fonts.ready
      } finally {
        if (!cancelled) {
          setLoadedFontFamily(fontFamily)
        }
      }
    }

    loadFont()

    return () => {
      cancelled = true
    }
  }, [fontFamily])

  const textStyle = useMemo<CSSProperties>(() => {
    const imageRect = getImageRect(size, config)
    const box = config.textBox
    const left = imageRect.x + box.x * imageRect.scale
    const top = imageRect.y + box.y * imageRect.scale
    const width = box.width * imageRect.scale
    const height = box.height * imageRect.scale
    const fontSize = getFittedFontSize(displayText, width, height, config)
    const sizingLength = displayText.length <= 5 ? Math.min(displayText.length, 4) : displayText.length <= 12 ? 5 : displayText.length
    const letterSpacing = config.letterSpacingByLength?.[displayText.length] ?? config.letterSpacing ?? (sizingLength <= 4 ? 0.16 : sizingLength <= 8 ? 0.1 : 0.04)
    const glowColor = config.glowColor ?? 'rgba(255, 255, 255, 0.95)'

    return {
      left,
      top,
      width,
      height,
      fontFamily,
      fontSize,
      letterSpacing: `${letterSpacing}em`,
      transform: `translateY(${height * (config.textOffsetY ?? 0)}px)`,
      color: config.textColor ?? '#ffffff',
      textShadow: [
        '0 0 2px rgba(255, 255, 255, 0.95)',
        `0 0 ${Math.max(8, fontSize * 0.18)}px ${glowColor}`,
      ].join(', '),
    }
  }, [config, displayText, fontFamily, size])

  return (
    <div ref={containerRef} className={className}>
      <Image
        key={config.image}
        src={config.image}
        alt={alt}
        fill
        priority
        quality={85}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
        className="object-contain"
        onLoad={() => setLoadedImage(config.image)}
      />
      {!previewReady && (
        <div
          aria-label="Loading preview"
          aria-live="polite"
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 backdrop-blur-[1px]"
        >
          <div
            aria-hidden
            className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-white/90 shadow-[0_0_18px_rgba(255,255,255,0.35)]"
          />
        </div>
      )}
      {size.width > 0 && previewReady && (
        <div
          aria-label={displayText}
          className="pointer-events-none absolute flex items-center justify-center overflow-visible whitespace-nowrap text-center leading-none"
          style={textStyle}
        >
          {displayText}
        </div>
      )}
    </div>
  )
}
