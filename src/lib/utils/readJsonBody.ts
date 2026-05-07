export async function readJsonBody<T extends Record<string, unknown>>(
  request: Request
): Promise<T | null> {
  try {
    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return null
    }
    return body as T
  } catch {
    return null
  }
}
