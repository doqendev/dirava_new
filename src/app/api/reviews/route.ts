import { NextResponse } from 'next/server'
import { createReview } from '@/lib/reviews/metaobjects'
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimit'
import { validateReview } from '@/lib/utils/validation'
import { uploadImageToShopify } from '@/lib/shopify/fileUpload'

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_IMAGE_SIZE = 4 * 1024 * 1024 // 4MB per image (stay under Vercel's 4.5MB body limit)
const MAX_IMAGES = 3

export async function POST(request: Request) {
  try {
    // Rate limit: 2 requests per minute per IP (tighter for image uploads)
    const ip = getClientIp(request)
    const rl = await checkRateLimit(`review:${ip}`, { maxRequests: 2, windowSeconds: 60 })
    if (rl.limited) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const contentType = request.headers.get('content-type') || ''

    let bodyData: Record<string, unknown>
    let imageFiles: File[] = []

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart/form-data (with possible images)
      const formData = await request.formData()

      bodyData = {
        productHandle: formData.get('productHandle') as string | null,
        authorName: formData.get('authorName') as string | null,
        authorEmail: formData.get('authorEmail') as string | null,
        rating: Number(formData.get('rating')),
        title: formData.get('title') as string | null,
        content: formData.get('content') as string | null,
        anonymous: formData.get('anonymous') === 'true',
      }

      // Extract image files
      const images = formData.getAll('images')
      for (const img of images) {
        if (img instanceof File && img.size > 0) {
          imageFiles.push(img)
        }
      }
    } else {
      // Handle JSON (no images)
      bodyData = await request.json()
    }

    // Validate and sanitize text fields
    const result = validateReview(bodyData)
    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    const { productHandle, authorName, authorEmail, rating, title, content } = result.sanitized!

    // Validate image files
    if (imageFiles.length > MAX_IMAGES) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_IMAGES} images allowed` },
        { status: 400 }
      )
    }

    for (const file of imageFiles) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        return NextResponse.json(
          { success: false, error: 'Only JPG, PNG, and WebP images are allowed' },
          { status: 400 }
        )
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { success: false, error: 'Each image must be under 5MB' },
          { status: 400 }
        )
      }
    }

    // Upload images to Shopify CDN (non-blocking: review still created if upload fails)
    let imageUrls: string[] | undefined
    if (imageFiles.length > 0) {
      try {
        const uploadResults = await Promise.allSettled(
          imageFiles.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)
            return uploadImageToShopify(buffer, file.name, file.type)
          })
        )

        const successfulUrls = uploadResults
          .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
          .map(r => r.value)

        if (successfulUrls.length > 0) {
          imageUrls = successfulUrls
        }

        // Log failed uploads for debugging
        const failed = uploadResults.filter(r => r.status === 'rejected')
        if (failed.length > 0) {
          console.error('Some image uploads failed:', failed.map(r => (r as PromiseRejectedResult).reason))
        }
      } catch (uploadError) {
        console.error('Image upload error (review will be created without images):', uploadError)
      }
    }

    // Detect country from Vercel geo headers
    const countryCode = request.headers.get('x-vercel-ip-country') || undefined

    const review = await createReview({
      productHandle,
      authorName,
      authorEmail,
      rating,
      title,
      content: content || undefined,
      images: imageUrls,
      countryCode,
    })

    if (!review) {
      console.error('createReview returned null for:', { productHandle, authorName, rating })
      return NextResponse.json(
        { success: false, error: 'Failed to create review. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, review },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Failed to submit review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}
