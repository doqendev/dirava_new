import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: '#0a0a12',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <span
          style={{
            color: '#00f0ff',
            fontWeight: 'bold',
            letterSpacing: '0.1em',
          }}
        >
          MIZOKE
        </span>
        <span
          style={{
            color: 'rgba(0, 240, 255, 0.6)',
            fontSize: 14,
            letterSpacing: '0.2em',
          }}
        >
          YOUR ANIME SPIRIT
        </span>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  )
}
