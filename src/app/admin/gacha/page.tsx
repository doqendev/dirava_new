'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Settings, Ticket, Loader2, Check, Copy, AlertCircle, Database } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export default function AdminGachaPage() {
  // Generate codes form
  const [email, setEmail] = useState('')
  const [boxHandle, setBoxHandle] = useState('devil-fruit-mystery-box')
  const [quantity, setQuantity] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Setup metaobject
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [setupResult, setSetupResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setGeneratedCodes([])
    setIsGenerating(true)

    try {
      const response = await fetch('/api/admin/gacha/generate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, boxHandle, quantity }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to generate codes')
      } else {
        setGeneratedCodes(data.codes || [])
      }
    } catch {
      setError('Request failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSetupMetaobject = async () => {
    setIsSettingUp(true)
    setSetupResult(null)

    try {
      const response = await fetch('/api/gacha/setup', { method: 'POST' })
      const data = await response.json()

      setSetupResult({
        success: data.success,
        message: data.success
          ? 'Metaobject definition created successfully!'
          : data.error || 'Failed to create metaobject definition',
      })
    } catch {
      setSetupResult({ success: false, message: 'Request failed' })
    } finally {
      setIsSettingUp(false)
    }
  }

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(generatedCodes.join('\n'))
    setCopiedCode('all')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="min-h-screen bg-bg-primary p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-neon-cyan" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-white">Gacha Admin</h1>
            <p className="text-white/60 text-sm">Development tools for testing</p>
          </div>
        </div>

        {/* Setup Section */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-neon-purple" />
            <h2 className="font-display text-lg text-white">1. Setup Metaobject Definition</h2>
          </div>
          <p className="text-white/60 text-sm mb-4">
            Run this once to create the RedemptionCode metaobject schema in Shopify.
            Required before generating codes.
          </p>

          <button
            onClick={handleSetupMetaobject}
            disabled={isSettingUp}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm',
              'bg-neon-purple/20 text-neon-purple border border-neon-purple/30',
              'hover:bg-neon-purple/30 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isSettingUp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                Create Metaobject Definition
              </>
            )}
          </button>

          {setupResult && (
            <div
              className={cn(
                'mt-4 p-3 rounded-lg text-sm',
                setupResult.success
                  ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              )}
            >
              {setupResult.message}
            </div>
          )}
        </div>

        {/* Generate Codes Section */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Ticket className="w-5 h-5 text-neon-cyan" />
            <h2 className="font-display text-lg text-white">2. Generate Redemption Codes</h2>
          </div>
          <p className="text-white/60 text-sm mb-4">
            Manually create codes for testing. These work exactly like codes generated by the webhook.
          </p>

          <form onSubmit={handleGenerateCodes} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">Customer Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                required
                className="w-full px-4 py-3 rounded-lg bg-bg-secondary border border-border-subtle text-white placeholder:text-white/30 focus:outline-none focus:border-neon-cyan"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1">Box Handle *</label>
              <input
                type="text"
                value={boxHandle}
                onChange={(e) => setBoxHandle(e.target.value)}
                placeholder="devil-fruit-mystery-box"
                required
                className="w-full px-4 py-3 rounded-lg bg-bg-secondary border border-border-subtle text-white placeholder:text-white/30 focus:outline-none focus:border-neon-cyan"
              />
              <p className="text-white/40 text-xs mt-1">
                The product handle from Shopify (URL slug)
              </p>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                min={1}
                max={10}
                className="w-24 px-4 py-3 rounded-lg bg-bg-secondary border border-border-subtle text-white focus:outline-none focus:border-neon-cyan"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isGenerating || !email || !boxHandle}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-lg font-medium',
                'bg-neon-cyan text-black',
                'hover:bg-neon-cyan/90 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Ticket className="w-5 h-5" />
                  Generate {quantity} {quantity === 1 ? 'Code' : 'Codes'}
                </>
              )}
            </button>
          </form>

          {/* Generated Codes Display */}
          {generatedCodes.length > 0 && (
            <div className="mt-6 p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-neon-green font-medium">
                  Generated {generatedCodes.length} {generatedCodes.length === 1 ? 'code' : 'codes'}:
                </span>
                {generatedCodes.length > 1 && (
                  <button
                    onClick={handleCopyAll}
                    className="text-xs text-neon-green/80 hover:text-neon-green"
                  >
                    {copiedCode === 'all' ? 'Copied!' : 'Copy all'}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {generatedCodes.map((code) => (
                  <div
                    key={code}
                    className="flex items-center justify-between p-3 bg-black/20 rounded-lg"
                  >
                    <span className="font-mono text-lg text-white">{code}</span>
                    <button
                      onClick={() => handleCopyCode(code)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {copiedCode === code ? (
                        <Check className="w-4 h-4 text-neon-green" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/40" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-white/40 text-xs mt-3">
                Use these codes at{' '}
                <Link href="/gacha/reveal" className="text-neon-cyan hover:underline">
                  /gacha/reveal
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-6">
          <h2 className="font-display text-lg text-white mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/gacha"
              className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center"
            >
              <span className="text-white/80 text-sm">Mystery Boxes</span>
            </Link>
            <Link
              href="/gacha/test"
              className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center"
            >
              <span className="text-white/80 text-sm">Test Animation</span>
            </Link>
            <Link
              href="/gacha/reveal"
              className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center"
            >
              <span className="text-white/80 text-sm">Redeem Code</span>
            </Link>
            <Link
              href="/account/codes"
              className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-center"
            >
              <span className="text-white/80 text-sm">My Codes</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
