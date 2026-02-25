import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimit'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rl = checkRateLimit(`contact:${ip}`, { maxRequests: 5, windowSeconds: 600 })
    if (rl.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      )
    }

    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }
    if (!subject || !subject.trim()) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
    }
    if (!message || message.trim().length < 10 || message.trim().length > 1000) {
      return NextResponse.json(
        { error: 'Message must be between 10 and 1000 characters' },
        { status: 400 }
      )
    }

    // TODO: Wire up email service (SendGrid, Resend, etc.)
    console.info('[Contact Form]', {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      messageLength: message.trim().length,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      { success: true, message: 'Message sent successfully' },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    )
  } catch {
    return NextResponse.json({ error: 'Failed to process your message' }, { status: 500 })
  }
}
