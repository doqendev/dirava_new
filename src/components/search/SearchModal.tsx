'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2, Clock, ArrowRight, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/stores/uiStore'
import { shopifyFetch } from '@/lib/shopify/client'
import { PREDICTIVE_SEARCH } from '@/lib/shopify/queries'
import { formatPrice } from '@/lib/utils/formatPrice'

interface PredictiveProduct {
  id: string
  handle: string
  title: string
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  featuredImage: {
    url: string
    altText: string | null
  } | null
}

interface PredictiveSearchResponse {
  predictiveSearch: {
    products: PredictiveProduct[]
  }
}

const RECENT_SEARCHES_KEY = 'tamashii-recent-searches'
const MAX_RECENT_SEARCHES = 5

// Get recent searches from localStorage
function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Save recent search to localStorage
function saveRecentSearch(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return
  try {
    const searches = getRecentSearches()
    const filtered = searches.filter((s) => s.toLowerCase() !== query.toLowerCase())
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  } catch {
    // Ignore localStorage errors
  }
}

// Remove a recent search
function removeRecentSearch(query: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const searches = getRecentSearches()
    const updated = searches.filter((s) => s !== query)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return []
  }
}

// Clear all recent searches
function clearRecentSearches(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  } catch {
    // Ignore
  }
}

export function SearchModal() {
  const t = useTranslations('search')
  const tCommon = useTranslations('common')
  const { isSearchOpen, closeSearch } = useUIStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PredictiveProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Load recent searches on mount
  useEffect(() => {
    if (isSearchOpen) {
      setRecentSearches(getRecentSearches())
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isSearchOpen])

  // Lock body scroll when open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isSearchOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen, closeSearch])

  // Debounced search with cancellation to prevent memory leaks
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setIsLoading(false)
      return
    }

    let cancelled = false

    const debounceTimer = setTimeout(async () => {
      if (cancelled) return
      setIsLoading(true)
      try {
        const data = await shopifyFetch<PredictiveSearchResponse>(PREDICTIVE_SEARCH, {
          query: query.trim(),
        })
        if (!cancelled) {
          setResults(data.predictiveSearch.products || [])
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Predictive search failed:', error)
          setResults([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(debounceTimer)
    }
  }, [query])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!query.trim()) return

      saveRecentSearch(query.trim())
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      closeSearch()
      setQuery('')
      setResults([])
    },
    [query, router, closeSearch]
  )

  const handleRecentSearchClick = (search: string) => {
    saveRecentSearch(search)
    router.push(`/search?q=${encodeURIComponent(search)}`)
    closeSearch()
    setQuery('')
    setResults([])
  }

  const handleRemoveRecentSearch = (search: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = removeRecentSearch(search)
    setRecentSearches(updated)
  }

  const handleClearAllRecent = () => {
    clearRecentSearches()
    setRecentSearches([])
  }

  const handleProductClick = () => {
    if (query.trim()) {
      saveRecentSearch(query.trim())
    }
    closeSearch()
    setQuery('')
    setResults([])
  }

  const handleClose = () => {
    closeSearch()
    setQuery('')
    setResults([])
  }

  const handleViewAllResults = useCallback(() => {
    if (!query.trim()) return
    saveRecentSearch(query.trim())
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    closeSearch()
    setQuery('')
    setResults([])
  }, [query, router, closeSearch])

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 md:pt-20"
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
          >
            <div className="max-w-2xl mx-auto">
              <div className="bg-bg-primary border border-border-subtle rounded-2xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <form onSubmit={handleSubmit} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('placeholder')}
                    className={cn(
                      'w-full pl-12 pr-20 py-4',
                      'bg-transparent border-b border-border-subtle',
                      'text-white text-lg placeholder:text-white/30',
                      'focus:outline-none'
                    )}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isLoading && (
                      <Loader2 className="w-5 h-5 text-neon-cyan animate-spin" />
                    )}
                    <button
                      type="button"
                      onClick={handleClose}
                      className="p-1.5 text-white/50 hover:text-white transition-colors"
                      aria-label={tCommon('close')}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </form>

                {/* Content Area */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {/* Recent Searches (when no query) */}
                  {!query.trim() && recentSearches.length > 0 && (
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {t('recentSearches')}
                        </h3>
                        <button
                          onClick={handleClearAllRecent}
                          className="text-xs text-white/40 hover:text-neon-cyan transition-colors flex items-center gap-1"
                          aria-label={t('clearAll')}
                        >
                          <Trash2 className="w-3 h-3" />
                          {t('clearAll')}
                        </button>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.map((search) => (
                          <button
                            key={search}
                            onClick={() => handleRecentSearchClick(search)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors group"
                          >
                            <span className="text-sm">{search}</span>
                            <button
                              onClick={(e) => handleRemoveRecentSearch(search, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-white transition-all"
                              aria-label={`Remove "${search}" from recent searches`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No query, no recent searches */}
                  {!query.trim() && recentSearches.length === 0 && (
                    <div className="p-8 text-center">
                      <Search className="w-10 h-10 text-white/20 mx-auto mb-3" />
                      <p className="text-white/50 text-sm">
                        {t('placeholder')}
                      </p>
                    </div>
                  )}

                  {/* Search Results */}
                  {query.trim() && !isLoading && results.length > 0 && (
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider mb-3">
                        {t('products')}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {results.slice(0, 8).map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.handle}`}
                            onClick={handleProductClick}
                            className="group"
                          >
                            <div className="aspect-square bg-bg-secondary rounded-lg overflow-hidden mb-2 relative">
                              {product.featuredImage ? (
                                <Image
                                  src={product.featuredImage.url}
                                  alt={product.featuredImage.altText || product.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  sizes="(max-width: 640px) 50vw, 25vw"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                  <Search className="w-8 h-8" />
                                </div>
                              )}
                            </div>
                            <h4 className="text-sm text-white/80 group-hover:text-white line-clamp-1 transition-colors">
                              {product.title}
                            </h4>
                            <p className="text-sm text-neon-cyan font-mono">
                              {formatPrice(
                                product.priceRange.minVariantPrice.amount,
                                product.priceRange.minVariantPrice.currencyCode
                              )}
                            </p>
                          </Link>
                        ))}
                      </div>

                      {/* View All Results */}
                      <button
                        type="button"
                        onClick={handleViewAllResults}
                        className="w-full mt-4 py-3 flex items-center justify-center gap-2 text-neon-cyan hover:bg-neon-cyan/10 rounded-lg transition-colors"
                      >
                        <span className="text-sm font-medium">
                          {t('viewAllResults', { query })}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* No Results */}
                  {query.trim() && !isLoading && results.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-white/50 text-sm mb-2">
                        {t('noResults', { query })}
                      </p>
                      <button
                        type="button"
                        onClick={handleViewAllResults}
                        className="text-neon-cyan text-sm hover:underline"
                      >
                        {t('searchAnyway')} →
                      </button>
                    </div>
                  )}

                  {/* Loading State */}
                  {query.trim() && isLoading && (
                    <div className="p-8 text-center">
                      <Loader2 className="w-8 h-8 text-neon-cyan animate-spin mx-auto" />
                    </div>
                  )}
                </div>

                {/* Footer hint */}
                <div className="px-4 py-3 border-t border-border-subtle bg-bg-secondary/50">
                  <p className="text-xs text-white/30 text-center">
                    {t('pressEnter')}
                    {' · '}
                    {t('pressEsc')}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
