import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Mizoke Universe'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ universe: string }> }) {
  const { universe } = await params
  const universeName = universe
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

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
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 229, 255, 0.18) 0%, transparent 70%)',
          }}
        />

        {/* Universe label */}
        <span
          style={{
            fontSize: 20,
            color: 'rgba(0, 229, 255, 0.6)',
            letterSpacing: '0.4em',
            marginBottom: 16,
            textTransform: 'uppercase',
          }}
        >
          MIZOKE UNIVERSE
        </span>

        {/* Universe name */}
        <span
          style={{
            fontSize: 88,
            fontWeight: 'bold',
            color: '#00e5ff',
            letterSpacing: '0.1em',
            textShadow: '0 0 60px rgba(0, 229, 255, 0.6)',
            textAlign: 'center',
            padding: '0 48px',
          }}
        >
          {universeName.toUpperCase()}
        </span>

        {/* Tagline */}
        <span
          style={{
            fontSize: 24,
            color: 'rgba(255, 255, 255, 0.6)',
            letterSpacing: '0.25em',
            marginTop: 20,
          }}
        >
          EXPLORE THE UNIVERSE
        </span>

        {/* Brand */}
        <span
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 18,
            color: 'rgba(255, 255, 255, 0.3)',
            letterSpacing: '0.3em',
          }}
        >
          MIZOKE.COM
        </span>
      </div>
    ),
    { ...size }
  )
}
