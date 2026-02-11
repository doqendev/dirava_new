/**
 * POST /api/gacha/setup
 *
 * One-time setup endpoint to create the metaobject definition for redemption codes.
 * Run this once when setting up the gacha system.
 *
 * Protected by a secret key to prevent unauthorized access.
 */

import { NextResponse } from 'next/server'
import { setupMetaobjectDefinition } from '@/lib/gacha/metaobjects'

const SETUP_SECRET = process.env.GACHA_SETUP_SECRET || 'dev-setup-secret'

export async function POST(request: Request) {
  try {
    // In development, allow without secret
    const isDev = process.env.NODE_ENV === 'development'

    if (!isDev) {
      const body = await request.json().catch(() => ({}))
      const secret = body?.secret

      if (secret !== SETUP_SECRET) {
        return NextResponse.json(
          { success: false, error: 'Invalid setup secret' },
          { status: 401 }
        )
      }
    }

    // Create metaobject definition
    const success = await setupMetaobjectDefinition()

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Metaobject definition created successfully',
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to create metaobject definition. It may already exist.',
      })
    }
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { success: false, error: 'Setup failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with { "secret": "your-setup-secret" } to initialize the gacha system',
  })
}
