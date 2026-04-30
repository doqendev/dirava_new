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
  const displayText = text.trim() || 'NAME'

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
      fontFamily: config.fontFamily ?? '"OnePiecePreview", fantasy',
      fontSize,
      letterSpacing: `${letterSpacing}em`,
      transform: `translateY(${height * (config.textOffsetY ?? 0)}px)`,
      color: config.textColor ?? '#ffffff',
      textShadow: [
        '0 0 2px rgba(255, 255, 255, 0.95)',
        `0 0 ${Math.max(8, fontSize * 0.18)}px ${glowColor}`,
      ].join(', '),
    }
  }, [config, displayText, size])

  return (
    <div ref={containerRef} className={className}>
      <Image
        src={config.image}
        alt={alt}
        fill
        priority
        quality={85}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
        className="object-contain"
      />
      {size.width > 0 && (
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
