'use client'

import { useState, useCallback, useMemo } from 'react'
import { Shield, Loader2, AlertCircle, Check, X, Star, Image as ImageIcon, ExternalLink, Pencil, Save, Upload } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { StarRating } from '@/components/product/StarRating'
import type { AdminReview } from '@/types/reviews'

type TabStatus = 'pending' | 'approved' | 'rejected'
type ImportStatus = 'pending' | 'approved' | 'rejected'

interface ImportResult {
  prepared: number
  created: number
  failed: number
  skipped?: number
  processed?: number
  dryRun?: boolean
  errors?: string[]
}

interface ImportResponse {
  success?: boolean
  error?: string
  prepared?: number
  total?: number
  created?: number
  failed?: number
  skipped?: number
  processed?: number
  offset?: number
  batchSize?: number
  nextOffset?: number
  hasMore?: boolean
  errors?: string[]
}

const TABS: { status: TabStatus; label: string; color: string }[] = [
  { status: 'pending', label: 'Pending', color: 'text-yellow-400 border-yellow-400' },
  { status: 'approved', label: 'Approved', color: 'text-neon-green border-neon-green' },
  { status: 'rejected', label: 'Rejected', color: 'text-red-400 border-red-400' },
]

const REVIEW_IMPORT_BATCH_SIZE = 20

const statusBadgeClasses: Record<TabStatus, string> = {
  pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
  approved: 'bg-neon-green/10 text-neon-green border-neon-green/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
}

function formatProductHandle(handle: string) {
  return handle
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function AdminReviewsContent() {
  const [adminSecret, setAdminSecret] = useState('')
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [activeTab, setActiveTab] = useState<TabStatus>('pending')
  const [selectedProductHandle, setSelectedProductHandle] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({})
  const [hasFetched, setHasFetched] = useState(false)
  const [expandedImages, setExpandedImages] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importStatus, setImportStatus] = useState<ImportStatus>('pending')
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [editForm, setEditForm] = useState<{ authorName: string; rating: number; title: string; content: string }>({
    authorName: '',
    rating: 5,
    title: '',
    content: '',
  })

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (adminSecret) {
        const sessionResponse = await fetch('/api/admin/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: adminSecret }),
        })
        const sessionData = await sessionResponse.json()

        if (!sessionResponse.ok || !sessionData.success) {
          setError(sessionData.error || 'Invalid admin secret')
          return
        }

        setAdminSecret('')
      }

      const response = await fetch('/api/admin/reviews', { cache: 'no-store' })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(response.status === 401 ? 'Please enter the admin secret' : data.error || 'Failed to fetch reviews')
        return
      }

      setReviews(data.reviews)
      setHasFetched(true)
    } catch {
      setError('Request failed')
    } finally {
      setIsLoading(false)
    }
  }, [adminSecret])

  const logout = async () => {
    await fetch('/api/admin/session', { method: 'DELETE' }).catch(() => null)
    setReviews([])
    setHasFetched(false)
    setAdminSecret('')
  }

  const startEditing = (review: AdminReview) => {
    setEditingId(review.id)
    setEditForm({
      authorName: review.author,
      rating: review.rating,
      title: review.title || '',
      content: review.content,
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
  }

  const saveEdit = async (reviewId: string) => {
    setLoadingActions(prev => ({ ...prev, [reviewId]: true }))

    try {
      const encodedId = encodeURIComponent(reviewId)
      const response = await fetch(`/api/admin/reviews/${encodedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: editForm.authorName,
          rating: editForm.rating,
          title: editForm.title,
          content: editForm.content,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to save review')
        return
      }

      // Optimistic update
      setReviews(prev =>
        prev.map(r =>
          r.id === reviewId
            ? { ...r, author: editForm.authorName, rating: editForm.rating, title: editForm.title || undefined, content: editForm.content }
            : r
        )
      )
      setEditingId(null)
    } catch {
      setError('Failed to save review')
    } finally {
      setLoadingActions(prev => ({ ...prev, [reviewId]: false }))
    }
  }

  const handleStatusUpdate = async (reviewId: string, newStatus: 'approved' | 'rejected') => {
    setLoadingActions(prev => ({ ...prev, [reviewId]: true }))

    try {
      const encodedId = encodeURIComponent(reviewId)
      const response = await fetch(`/api/admin/reviews/${encodedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to update review')
        return
      }

      // Optimistic update
      setReviews(prev =>
        prev.map(r => r.id === reviewId ? { ...r, status: newStatus } : r)
      )
    } catch {
      setError('Failed to update review status')
    } finally {
      setLoadingActions(prev => ({ ...prev, [reviewId]: false }))
    }
  }

  const importReviews = async () => {
    if (!importFile) {
      setError('Choose a CSV file to import')
      return
    }

    setIsImporting(true)
    setError(null)
    setImportResult(null)

    try {
      let offset = 0
      let total = 0
      let created = 0
      let failed = 0
      let skipped = 0
      let processed = 0
      let hasMore = true
      const errors: string[] = []

      while (hasMore) {
        const formData = new FormData()
        formData.append('file', importFile)
        formData.append('status', importStatus)
        formData.append('offset', String(offset))
        formData.append('batchSize', String(REVIEW_IMPORT_BATCH_SIZE))
        formData.append('ensureFields', offset === 0 ? 'true' : 'false')

        const response = await fetch('/api/admin/reviews/import', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json() as ImportResponse

        if (!response.ok || data.error) {
          setImportResult({
            prepared: data.total || data.prepared || total,
            created,
            failed,
            processed,
            errors: [...errors, ...(data.errors || [])],
          })
          setError(data.error || 'Failed to import reviews')
          return
        }

        const batchCreated = data.created || 0
        const batchFailed = data.failed || 0
        const batchSkipped = data.skipped || 0
        const batchProcessed = data.processed || batchCreated + batchFailed + batchSkipped
        const nextOffset = data.nextOffset ?? offset + batchProcessed

        total = data.total || data.prepared || total
        created += batchCreated
        failed += batchFailed
        skipped += batchSkipped
        processed += batchProcessed
        errors.push(...(data.errors || []))

        setImportResult({
          prepared: total,
          created,
          failed,
          skipped,
          processed,
          errors,
        })

        hasMore = Boolean(data.hasMore)
        if (hasMore && nextOffset <= offset) {
          setError('Import stopped because progress stalled. Try a smaller CSV.')
          return
        }
        offset = nextOffset
      }

      if (failed > 0) {
        setError(`Imported with ${failed} failed row${failed === 1 ? '' : 's'}.`)
      }
      setImportFile(null)
      await fetchReviews()
      setActiveTab(importStatus)
    } catch {
      setError('Failed to import reviews')
    } finally {
      setIsImporting(false)
    }
  }

  const counts: Record<TabStatus, number> = {
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
  }

  const productOptions = useMemo(() => {
    const countsByHandle = new Map<string, { active: number; total: number }>()

    reviews.forEach((review) => {
      const current = countsByHandle.get(review.productHandle) || { active: 0, total: 0 }
      countsByHandle.set(review.productHandle, {
        active: current.active + (review.status === activeTab ? 1 : 0),
        total: current.total + 1,
      })
    })

    return Array.from(countsByHandle.entries())
      .map(([handle, count]) => ({ handle, ...count }))
      .filter((product) => product.active > 0 || product.handle === selectedProductHandle)
      .sort((a, b) => a.handle.localeCompare(b.handle))
  }, [activeTab, reviews, selectedProductHandle])

  const filteredReviews = reviews.filter((review) => {
    if (review.status !== activeTab) return false
    if (selectedProductHandle === 'all') return true
    return review.productHandle === selectedProductHandle
  })

  return (
    <div className="min-h-screen bg-bg-primary p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-neon-purple/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-neon-purple" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-white">Review Moderation</h1>
            <p className="text-white/60 text-sm">Approve or reject customer reviews</p>
          </div>
        </div>

        {/* Auth + Fetch */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-6 mb-6">
          <label className="block text-sm text-white/60 mb-1">Admin Secret</label>
          <div className="flex gap-3">
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              placeholder="Enter ADMIN_SECRET"
              onKeyDown={(e) => e.key === 'Enter' && fetchReviews()}
              className="flex-1 px-4 py-3 rounded-lg bg-bg-secondary border border-border-subtle text-white placeholder:text-white/30 focus:outline-none focus:border-neon-purple"
            />
            <button
              onClick={fetchReviews}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-lg font-medium',
                'bg-neon-purple text-black',
                'hover:bg-neon-purple/90 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load Reviews'
              )}
            </button>
            {hasFetched && (
              <button
                onClick={logout}
                className={cn(
                  'px-4 py-3 rounded-lg font-medium',
                  'border border-border-subtle text-white/70',
                  'hover:text-white hover:border-white/30 transition-colors'
                )}
              >
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-white/10 rounded">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Tabs + Content */}
        {hasFetched && (
          <>
            {/* Import */}
            <div className="bg-bg-card border border-border-subtle rounded-xl p-5 mb-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Upload className="w-4 h-4 text-neon-purple" />
                    <h2 className="text-white font-medium">Import reviews</h2>
                  </div>
                  <p className="text-xs text-white/45 mb-3">
                    Upload CSV with productHandle, authorName, rating, title, content, createdAt, countryCode, verifiedPurchase, reviewImages.
                  </p>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(event) => setImportFile(event.target.files?.[0] || null)}
                    className="block w-full text-sm text-white/70 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/15"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Import as</label>
                  <select
                    value={importStatus}
                    onChange={(event) => setImportStatus(event.target.value as ImportStatus)}
                    className="w-full md:w-36 px-3 py-2.5 rounded-lg bg-bg-secondary border border-border-subtle text-white text-sm focus:outline-none focus:border-neon-purple"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <button
                  onClick={importReviews}
                  disabled={isImporting || !importFile}
                  className={cn(
                    'flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium',
                    'bg-neon-purple text-black',
                    'hover:bg-neon-purple/90 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {importResult?.prepared
                        ? `Importing ${importResult.processed || 0}/${importResult.prepared}`
                        : 'Importing...'}
                    </>
                  ) : (
                    'Import CSV'
                  )}
                </button>
              </div>

              {importResult && (
                <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-white/65">
                  Processed {importResult.processed || 0}/{importResult.prepared}, created {importResult.created}, skipped {importResult.skipped || 0}, failed {importResult.failed}.
                  {importResult.errors && importResult.errors.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-red-300">
                      {importResult.errors.slice(0, 5).map((importError) => (
                        <li key={importError}>{importError}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-border-subtle mb-6">
              {TABS.map(tab => (
                <button
                  key={tab.status}
                  onClick={() => setActiveTab(tab.status)}
                  className={cn(
                    'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                    activeTab === tab.status
                      ? tab.color
                      : 'text-white/40 border-transparent hover:text-white/60'
                  )}
                >
                  {tab.label}
                  <span className={cn(
                    'ml-2 px-2 py-0.5 rounded-full text-xs',
                    activeTab === tab.status ? 'bg-white/10' : 'bg-white/5'
                  )}>
                    {counts[tab.status]}
                  </span>
                </button>
              ))}
            </div>

            {/* Product Filter */}
            <div className="bg-bg-card border border-border-subtle rounded-xl p-4 mb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <label htmlFor="review-product-filter" className="text-sm font-medium text-white">
                    Filter by product
                  </label>
                  <p className="text-xs text-white/45">
                    Showing {filteredReviews.length} {activeTab} review{filteredReviews.length === 1 ? '' : 's'}
                  </p>
                </div>
                <select
                  id="review-product-filter"
                  value={selectedProductHandle}
                  onChange={(event) => setSelectedProductHandle(event.target.value)}
                  className="w-full sm:w-80 px-3 py-2.5 rounded-lg bg-bg-secondary border border-border-subtle text-white text-sm focus:outline-none focus:border-neon-purple"
                >
                  <option value="all">All products ({counts[activeTab]})</option>
                  {productOptions.map((product) => (
                    <option key={product.handle} value={product.handle}>
                      {formatProductHandle(product.handle)} ({product.active})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Review Cards */}
            {filteredReviews.length === 0 ? (
              <div className="text-center py-16 text-white/40">
                <Star className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>
                  No {activeTab} reviews
                  {selectedProductHandle !== 'all' ? ` for ${formatProductHandle(selectedProductHandle)}` : ''}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map(review => (
                  <div
                    key={review.id}
                    className="bg-bg-card border border-border-subtle rounded-xl p-5"
                  >
                    {/* Top row: rating + status + product */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <StarRating rating={review.rating} size="sm" />
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs border',
                          statusBadgeClasses[review.status]
                        )}>
                          {review.status}
                        </span>
                      </div>
                      <a
                        href={`/worlds/_/${review.productHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 text-xs transition-colors"
                      >
                        {review.productHandle}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Author info */}
                    <div className="flex items-center gap-2 mb-2 text-sm text-white/50">
                      <span className="text-white/80 font-medium">{review.author}</span>
                      <span>&middot;</span>
                      <span>{review.authorEmail}</span>
                      {review.verified && (
                        <>
                          <span>&middot;</span>
                          <span className="text-neon-green text-xs">Verified Purchase</span>
                        </>
                      )}
                    </div>

                    {/* Title + Content (or edit form) */}
                    {editingId === review.id ? (
                      <div className="space-y-3 mb-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-white/50 mb-1">Author Name</label>
                            <input
                              type="text"
                              value={editForm.authorName}
                              onChange={(e) => setEditForm(f => ({ ...f, authorName: e.target.value }))}
                              className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-subtle text-white text-sm focus:outline-none focus:border-neon-purple"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-white/50 mb-1">Rating (1-5)</label>
                            <input
                              type="number"
                              min={1}
                              max={5}
                              value={editForm.rating}
                              onChange={(e) => setEditForm(f => ({ ...f, rating: Math.max(1, Math.min(5, parseInt(e.target.value) || 1)) }))}
                              className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-subtle text-white text-sm focus:outline-none focus:border-neon-purple"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Title (optional)</label>
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-subtle text-white text-sm focus:outline-none focus:border-neon-purple"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Content</label>
                          <textarea
                            value={editForm.content}
                            onChange={(e) => setEditForm(f => ({ ...f, content: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg bg-bg-secondary border border-border-subtle text-white text-sm focus:outline-none focus:border-neon-purple resize-y"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        {review.title && (
                          <h3 className="text-white font-medium mb-1">{review.title}</h3>
                        )}
                        <p className="text-white/70 text-sm leading-relaxed mb-3">
                          {review.content}
                        </p>
                      </>
                    )}

                    {/* Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="mb-3">
                        <button
                          onClick={() => setExpandedImages(expandedImages === review.id ? null : review.id)}
                          className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition-colors"
                        >
                          <ImageIcon className="w-3 h-3" />
                          {review.images.length} image{review.images.length > 1 ? 's' : ''}
                        </button>
                        {expandedImages === review.id && (
                          <div className="flex gap-2 mt-2">
                            {review.images.map((url, i) => (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-16 h-16 rounded-lg overflow-hidden border border-border-subtle hover:border-neon-purple/50 transition-colors"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt={`Review image ${i + 1}`} className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Date + Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                      <span className="text-xs text-white/30">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <div className="flex items-center gap-2">
                        {editingId === review.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(review.id)}
                              disabled={!!loadingActions[review.id]}
                              className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30',
                                'hover:bg-[color:var(--accent,#00f5ff)]/20',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                              )}
                            >
                              {loadingActions[review.id] ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Save className="w-3.5 h-3.5" />
                              )}
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={!!loadingActions[review.id]}
                              className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                'bg-white/5 text-white/60 border border-white/10',
                                'hover:bg-white/10',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                              )}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(review)}
                              disabled={!!loadingActions[review.id]}
                              className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                'bg-neon-purple/10 text-neon-purple border border-neon-purple/30',
                                'hover:bg-neon-purple/20',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                              )}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            {review.status !== 'approved' && (
                              <button
                                onClick={() => handleStatusUpdate(review.id, 'approved')}
                                disabled={!!loadingActions[review.id]}
                                className={cn(
                                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                  'bg-neon-green/10 text-neon-green border border-neon-green/30',
                                  'hover:bg-neon-green/20',
                                  'disabled:opacity-50 disabled:cursor-not-allowed'
                                )}
                              >
                                {loadingActions[review.id] ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                                Approve
                              </button>
                            )}
                            {review.status !== 'rejected' && (
                              <button
                                onClick={() => handleStatusUpdate(review.id, 'rejected')}
                                disabled={!!loadingActions[review.id]}
                                className={cn(
                                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                  'bg-red-500/10 text-red-400 border border-red-500/30',
                                  'hover:bg-red-500/20',
                                  'disabled:opacity-50 disabled:cursor-not-allowed'
                                )}
                              >
                                {loadingActions[review.id] ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <X className="w-3.5 h-3.5" />
                                )}
                                Reject
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
