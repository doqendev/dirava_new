'use client'

import { useState, useCallback, useEffect } from 'react'
import { Shield, Loader2, AlertCircle, Check, X, Star, Image as ImageIcon, ExternalLink, Pencil, Save } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { StarRating } from '@/components/product/StarRating'
import type { AdminReview } from '@/types/reviews'

type TabStatus = 'pending' | 'approved' | 'rejected'

const TABS: { status: TabStatus; label: string; color: string }[] = [
  { status: 'pending', label: 'Pending', color: 'text-yellow-400 border-yellow-400' },
  { status: 'approved', label: 'Approved', color: 'text-neon-green border-neon-green' },
  { status: 'rejected', label: 'Rejected', color: 'text-red-400 border-red-400' },
]

const statusBadgeClasses: Record<TabStatus, string> = {
  pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
  approved: 'bg-neon-green/10 text-neon-green border-neon-green/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
}

export default function AdminReviewsContent() {
  const [adminSecret, setAdminSecret] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('mizoke-admin-secret') || ''
    }
    return ''
  })
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [activeTab, setActiveTab] = useState<TabStatus>('pending')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({})
  const [hasFetched, setHasFetched] = useState(false)
  const [expandedImages, setExpandedImages] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ authorName: string; rating: number; title: string; content: string }>({
    authorName: '',
    rating: 5,
    title: '',
    content: '',
  })

  // Persist admin secret to sessionStorage (not localStorage — avoid persisting across sessions)
  useEffect(() => {
    if (adminSecret) {
      sessionStorage.setItem('mizoke-admin-secret', adminSecret)
    }
  }, [adminSecret])

  const authHeaders = useCallback((): HeadersInit => ({
    'Authorization': `Bearer ${adminSecret}`,
    'Content-Type': 'application/json',
  }), [adminSecret])

  const fetchReviews = useCallback(async () => {
    if (!adminSecret) {
      setError('Please enter the admin secret')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/reviews', {
        headers: authHeaders(),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to fetch reviews')
        return
      }

      setReviews(data.reviews)
      setHasFetched(true)
    } catch {
      setError('Request failed')
    } finally {
      setIsLoading(false)
    }
  }, [adminSecret, authHeaders])

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
        headers: authHeaders(),
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
        headers: authHeaders(),
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

  const filteredReviews = reviews.filter(r => r.status === activeTab)

  const counts: Record<TabStatus, number> = {
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
  }

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
              disabled={isLoading || !adminSecret}
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

            {/* Review Cards */}
            {filteredReviews.length === 0 ? (
              <div className="text-center py-16 text-white/40">
                <Star className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>No {activeTab} reviews</p>
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
