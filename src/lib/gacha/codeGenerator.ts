/**
 * Redemption Code Generator
 *
 * Generates unique 8-character codes in XXXX-XXXX format
 */

import { CODE_CONFIG } from './constants'

/**
 * Generate a random redemption code
 * Format: XXXX-XXXX (e.g., "DFRT-X7K2")
 */
export function generateCode(): string {
  const { length, charset, separator, segmentLength } = CODE_CONFIG
  let code = ''

  // Use crypto for better randomness if available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
      code += charset[array[i]! % charset.length]
    }
  } else {
    // Fallback to Math.random
    for (let i = 0; i < length; i++) {
      code += charset[Math.floor(Math.random() * charset.length)]
    }
  }

  // Insert separators (XXXX-XXXX)
  const segments: string[] = []
  for (let i = 0; i < code.length; i += segmentLength) {
    segments.push(code.slice(i, i + segmentLength))
  }

  return segments.join(separator)
}

/**
 * Generate multiple unique codes
 */
export function generateCodes(count: number): string[] {
  const codes = new Set<string>()

  while (codes.size < count) {
    codes.add(generateCode())
  }

  return Array.from(codes)
}

/**
 * Validate code format
 */
export function isValidCodeFormat(code: string): boolean {
  const { length, charset, separator, segmentLength } = CODE_CONFIG

  // Expected format: XXXX-XXXX
  const expectedLength = length + Math.floor(length / segmentLength) - 1
  if (code.length !== expectedLength) return false

  // Check separator positions
  const parts = code.split(separator)
  if (parts.length !== Math.ceil(length / segmentLength)) return false

  // Check each part has correct length and valid characters
  const charsetSet = new Set(charset.split(''))
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!
    if (part.length !== segmentLength) return false
    for (const char of part) {
      if (!charsetSet.has(char)) return false
    }
  }

  return true
}

/**
 * Normalize code input (uppercase, trim)
 */
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase()
}
