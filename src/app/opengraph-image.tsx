import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Mizoke - Your Anime Spirit'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a12 0%, #0d0d1a 50%, #0a0a12 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, transparent 70%)',
          }}
        />

        {/* Brand name */}
        <span
          style={{
            fontSize: 96,
            fontWeight: 'bold',
            color: '#ffffff',
            letterSpacing: '0.15em',
            textShadow: '0 0 40px rgba(0, 240, 255, 0.5)',
          }}
        >
          MIZOKE
        </span>

        {/* Tagline */}
        <span
          style={{
            fontSize: 24,
            color: 'rgba(0, 240, 255, 0.7)',
            letterSpacing: '0.3em',
            marginTop: 8,
          }}
        >
          YOUR ANIME SPIRIT
        </span>

        {/* Description */}
        <span
          style={{
            fontSize: 20,
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: 24,
          }}
        >
          Premium Anime Merchandise &amp; Mystery Boxes
        </span>
      </div>
    ),
    { ...size }
  )
}
