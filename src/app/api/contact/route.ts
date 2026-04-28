import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimit'
import { requireSameOrigin } from '@/lib/utils/csrf'

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN

export async function POST(request: Request) {
  try {
    // State-changing POST: reject cross-origin requests up front. Pairs
    // with the per-IP rate limit + honeypot below to make the contact
    // form a hostile target for bots without adding any user friction.
    const csrfReject = requireSameOrigin(request)
    if (csrfReject) return csrfReject

    const ip = getClientIp(request)
    const rl = await checkRateLimit(`contact:${ip}`, { maxRequests: 5, windowSeconds: 600 })
    if (rl.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      )
    }

    const body = await request.json()
    const { name, email, subject, message, website } = body

    // Honeypot. The form renders a hidden `website` input that real
    // users never see (display:none + tabIndex=-1 + aria-hidden), but
    // form-spam bots fill every field they find. If anything is in
    // there, silently return 200 so the bot's success heuristic is
    // satisfied while we do nothing - we do NOT forward to Shopify.
    if (typeof website === 'string' && website.trim().length > 0) {
      console.warn(`[Contact Form] Honeypot triggered (ip=${ip})`)
      return NextResponse.json(
        { success: true, message: 'Message sent successfully' },
        { status: 200, headers: { 'Cache-Control': 'no-store' } }
      )
    }

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

    if (!SHOPIFY_STORE_DOMAIN) {
      console.error('[Contact Form] NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is not configured')
      return NextResponse.json(
        { error: 'Contact form is temporarily unavailable' },
        { status: 503 }
      )
    }

    const shopifyUrl = `https://${SHOPIFY_STORE_DOMAIN}/contact#contact_form`
    const formData = new URLSearchParams({
      form_type: 'contact',
      utf8: 'yes',
      'contact[email]': email.trim(),
      'contact[name]': name.trim(),
      'contact[subject]': subject.trim(),
      'contact[body]': message.trim(),
    })

    const shopifyResponse = await fetch(shopifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
      redirect: 'manual',
    })

    if (shopifyResponse.status !== 302 && !shopifyResponse.ok) {
      console.error('[Contact Form] Shopify submission failed:', shopifyResponse.status)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, message: 'Message sent successfully' },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('[Contact Form] Failed to process request:', error)
    return NextResponse.json({ error: 'Failed to process your message' }, { status: 500 })
  }
}
