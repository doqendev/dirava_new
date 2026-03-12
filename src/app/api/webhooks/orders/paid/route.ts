/**
 * Shopify Webhook: Order Paid
 *
 * When an order is paid, generate redemption codes for any mystery box products
 * and add them to the order notes/tags
 */

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { adminFetch } from '@/lib/shopify/adminClient'
import { generateCode } from '@/lib/gacha/codeGenerator'
import { createRedemptionCode } from '@/lib/gacha/metaobjects'
import { isMysteryBox } from '@/lib/gacha/constants'
import { ADMIN_ADD_ORDER_TAGS, ADMIN_GET_ORDER, type OrderQueryResponse } from '@/lib/gacha/queries'

// Shopify webhook secret for verification
const SHOPIFY_WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET

/**
 * Verify Shopify webhook signature
 */
function verifyWebhook(body: string, signature: string | null): boolean {
  if (!SHOPIFY_WEBHOOK_SECRET || !signature) {
    console.warn('Missing webhook secret or signature')
    return false
  }

  const hmac = crypto
    .createHmac('sha256', SHOPIFY_WEBHOOK_SECRET)
    .update(body, 'utf8')
    .digest('base64')

  const hmacBuf = Buffer.from(hmac)
  const sigBuf = Buffer.from(signature)
  if (hmacBuf.length !== sigBuf.length) return false
  return crypto.timingSafeEqual(hmacBuf, sigBuf)
}

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-shopify-hmac-sha256')

    // Verify webhook signature — reject all requests if secret is not configured
    if (!SHOPIFY_WEBHOOK_SECRET) {
      console.error('SHOPIFY_WEBHOOK_SECRET is not configured — rejecting webhook')
      return NextResponse.json({ error: 'Webhook verification not configured' }, { status: 500 })
    }

    if (!verifyWebhook(body, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)

    // Extract order info from webhook payload
    const orderId = payload.admin_graphql_api_id as string
    const orderName = payload.name as string
    const customerEmail = payload.email as string

    if (!orderId || !customerEmail) {
      console.error('Missing order ID or customer email')
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Fetch full order details from Admin API
    const orderResponse = await adminFetch<OrderQueryResponse>(ADMIN_GET_ORDER, {
      id: orderId,
    })

    if (!orderResponse.order) {
      console.error('Order not found:', orderId)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orderResponse.order

    // Find mystery box line items
    const mysteryBoxItems: Array<{
      handle: string
      quantity: number
    }> = []

    for (const edge of order.lineItems.edges) {
      const lineItem = edge.node
      const product = lineItem.variant?.product

      if (product && isMysteryBox(product.tags, product.productType)) {
        mysteryBoxItems.push({
          handle: product.handle,
          quantity: lineItem.quantity,
        })
      }
    }

    if (mysteryBoxItems.length === 0) {
      // No mystery boxes in this order
      return NextResponse.json({ success: true, codes: [] })
    }

    // Generate codes for each mystery box (quantity aware)
    const generatedCodes: string[] = []

    for (const item of mysteryBoxItems) {
      for (let i = 0; i < item.quantity; i++) {
        const code = generateCode()

        // Create redemption code in Shopify metaobjects
        const redemptionCode = await createRedemptionCode({
          code,
          boxHandle: item.handle,
          purchaseOrderId: orderId,
          purchaseOrderName: orderName,
          purchaserEmail: customerEmail,
          status: 'unused',
        })

        if (redemptionCode) {
          generatedCodes.push(code)
        } else {
          console.error(`Failed to create redemption code for ${item.handle}`)
        }
      }
    }

    // Add tags to order for tracking
    if (generatedCodes.length > 0) {
      try {
        await adminFetch(ADMIN_ADD_ORDER_TAGS, {
          id: orderId,
          tags: ['mystery-box-order', `codes:${generatedCodes.length}`],
        })
      } catch (tagError) {
        console.error('Failed to add order tags:', tagError)
        // Don't fail the webhook for this
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderName,
      codesGenerated: generatedCodes.length,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Shopify sends GET to verify endpoint
export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint active' })
}
