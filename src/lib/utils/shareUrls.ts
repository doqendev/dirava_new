export interface ShareData {
  url: string
  title: string
  text?: string
  image?: string
}

export function getTwitterShareUrl(data: ShareData): string {
  const params = new URLSearchParams({
    url: data.url,
    text: data.text || data.title,
  })
  return `https://twitter.com/intent/tweet?${params.toString()}`
}

export function getFacebookShareUrl(data: ShareData): string {
  const params = new URLSearchParams({
    u: data.url,
  })
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`
}

export function getPinterestShareUrl(data: ShareData): string {
  const params = new URLSearchParams({
    url: data.url,
    description: data.text || data.title,
  })
  if (data.image) {
    params.set('media', data.image)
  }
  return `https://pinterest.com/pin/create/button/?${params.toString()}`
}

export function getWhatsAppShareUrl(data: ShareData): string {
  const text = `${data.text || data.title} ${data.url}`
  const params = new URLSearchParams({
    text,
  })
  return `https://wa.me/?${params.toString()}`
}

export function getEmailShareUrl(data: ShareData): string {
  const params = new URLSearchParams({
    subject: data.title,
    body: `${data.text || 'Check out this product!'}\n\n${data.url}`,
  })
  return `mailto:?${params.toString()}`
}

export function canUseWebShare(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share
}

export async function webShare(data: ShareData): Promise<boolean> {
  if (!canUseWebShare()) return false

  try {
    await navigator.share({
      title: data.title,
      text: data.text,
      url: data.url,
    })
    return true
  } catch (error) {
    // User cancelled or error occurred
    if ((error as Error).name !== 'AbortError') {
      console.error('Web Share failed:', error)
    }
    return false
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }

    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    return true
  } catch (error) {
    console.error('Copy to clipboard failed:', error)
    return false
  }
}
