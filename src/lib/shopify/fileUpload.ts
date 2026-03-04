/**
 * Shopify Files API helpers for uploading images.
 *
 * Flow: stagedUploadsCreate → HTTP PUT → fileCreate → poll for READY
 */

import { adminFetch } from '@/lib/shopify/adminClient'

// ---------------------------------------------------------------------------
// GraphQL operations
// ---------------------------------------------------------------------------

const STAGED_UPLOADS_CREATE = `
  mutation StagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

const FILE_CREATE = `
  mutation FileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        id
        fileStatus
        alt
        ... on MediaImage {
          image {
            url
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

const FILE_QUERY = `
  query FileById($id: ID!) {
    node(id: $id) {
      ... on MediaImage {
        id
        fileStatus
        image {
          url
        }
      }
    }
  }
`

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

interface StagedUploadTarget {
  url: string
  resourceUrl: string
  parameters: Array<{ name: string; value: string }>
}

interface StagedUploadsCreateResponse {
  stagedUploadsCreate: {
    stagedTargets: StagedUploadTarget[]
    userErrors: Array<{ field: string; message: string }>
  }
}

interface FileCreateResponse {
  fileCreate: {
    files: Array<{
      id: string
      fileStatus: string
      alt: string | null
      image?: { url: string }
    }>
    userErrors: Array<{ field: string; message: string }>
  }
}

interface FileQueryResponse {
  node: {
    id: string
    fileStatus: string
    image?: { url: string }
  } | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Request a staged upload URL from Shopify.
 */
async function createStagedUpload(
  filename: string,
  mimeType: string,
  fileSize: number
): Promise<StagedUploadTarget> {
  const response = await adminFetch<StagedUploadsCreateResponse>(
    STAGED_UPLOADS_CREATE,
    {
      input: [
        {
          filename,
          mimeType,
          httpMethod: 'POST',
          resource: 'IMAGE',
          fileSize: fileSize.toString(),
        },
      ],
    }
  )

  if (response.stagedUploadsCreate.userErrors.length > 0) {
    throw new Error(
      `Staged upload failed: ${response.stagedUploadsCreate.userErrors.map(e => e.message).join(', ')}`
    )
  }

  const target = response.stagedUploadsCreate.stagedTargets[0]
  if (!target) {
    throw new Error('No staged upload target returned')
  }

  return target
}

/**
 * Upload the file binary to the staged URL using multipart/form-data.
 */
async function uploadToStagedUrl(
  target: StagedUploadTarget,
  fileBuffer: Buffer,
  mimeType: string,
  filename: string
): Promise<void> {
  const formData = new FormData()

  // Append all parameters from the staged upload target first
  for (const param of target.parameters) {
    formData.append(param.name, param.value)
  }

  // Append the file last
  const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType })
  formData.append('file', blob, filename)

  const response = await fetch(target.url, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Upload to staged URL failed (${response.status}): ${text}`)
  }
}

/**
 * Register the uploaded file with Shopify via fileCreate.
 */
async function registerFile(
  resourceUrl: string,
  alt: string
): Promise<{ id: string; fileStatus: string; imageUrl?: string }> {
  const response = await adminFetch<FileCreateResponse>(FILE_CREATE, {
    files: [
      {
        alt,
        contentType: 'IMAGE',
        originalSource: resourceUrl,
      },
    ],
  })

  if (response.fileCreate.userErrors.length > 0) {
    throw new Error(
      `File create failed: ${response.fileCreate.userErrors.map(e => e.message).join(', ')}`
    )
  }

  const file = response.fileCreate.files[0]
  if (!file) {
    throw new Error('No file returned from fileCreate')
  }

  return {
    id: file.id,
    fileStatus: file.fileStatus,
    imageUrl: file.image?.url,
  }
}

/**
 * Poll Shopify until the file status is READY and return the CDN URL.
 */
async function pollForReady(
  fileId: string,
  maxAttempts = 10,
  intervalMs = 1500
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await adminFetch<FileQueryResponse>(FILE_QUERY, {
      id: fileId,
    })

    const node = response.node
    if (node?.fileStatus === 'READY' && node.image?.url) {
      return node.image.url
    }

    if (node?.fileStatus === 'FAILED') {
      throw new Error('Shopify file processing failed')
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs))
  }

  throw new Error('Timed out waiting for Shopify file to be ready')
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Upload an image to Shopify's CDN via the Files API.
 *
 * Orchestrates: stagedUploadsCreate → HTTP upload → fileCreate → poll.
 * Returns the final CDN URL (cdn.shopify.com).
 */
export async function uploadImageToShopify(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  // 1. Get a staged upload URL
  const target = await createStagedUpload(filename, mimeType, fileBuffer.length)

  // 2. Upload the file to the staged URL
  await uploadToStagedUrl(target, fileBuffer, mimeType, filename)

  // 3. Register the file in Shopify
  const file = await registerFile(target.resourceUrl, `Review image: ${filename}`)

  // 4. If already ready (unlikely but possible), return immediately
  if (file.fileStatus === 'READY' && file.imageUrl) {
    return file.imageUrl
  }

  // 5. Poll until the file is processed
  return pollForReady(file.id)
}
