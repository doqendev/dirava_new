interface TurnstileVerifyResponse {
  success: boolean
  'error-codes'?: string[]
}

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY)
}

export async function verifyTurnstileToken(
  token: string | null | undefined,
  ip?: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false

  try {
    const body = new URLSearchParams({
      secret,
      response: token,
    })

    if (ip && ip !== 'unknown') {
      body.set('remoteip', ip)
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    })

    if (!response.ok) return false

    const data = await response.json() as TurnstileVerifyResponse
    if (!data.success) {
      console.warn('Turnstile verification failed:', data['error-codes'] || [])
    }

    return data.success
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return false
  }
}
