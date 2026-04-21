'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cartStore';
import { cn } from '@/lib/utils/cn';
import { Tag, X, Loader2, Check } from 'lucide-react';

export function DiscountCodeInput() {
  const t = useTranslations('discount');
  const { discountCodes, isApplyingDiscount, applyDiscount, removeDiscount } = useCartStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Filter to only applicable discount codes
  const appliedCodes = discountCodes.filter((dc) => dc.applicable);

  const handleApply = async () => {
    if (!code.trim()) return;

    setError('');
    const result = await applyDiscount(code.trim());

    if (result.success) {
      setCode('');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsExpanded(false);
      }, 1500);
    } else {
      setError(t('invalid'));
    }
  };

  const handleRemove = () => {
    removeDiscount();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  return (
    <div className="space-y-3">
      {/* Applied discount codes */}
      {appliedCodes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {appliedCodes.map((dc) => (
            <div
              key={dc.code}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium',
                'bg-neon-green/20 text-neon-green border border-neon-green/30',
                'transition-all duration-200'
              )}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{dc.code}</span>
              <button
                onClick={handleRemove}
                className="hover:opacity-70 transition-opacity"
                aria-label={t('remove')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Discount code input */}
      {!isExpanded && appliedCodes.length === 0 && (
        <button
          onClick={() => setIsExpanded(true)}
          className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2"
        >
          <Tag className="w-4 h-4" />
          {t('haveCode')}
        </button>
      )}

      {isExpanded && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder')}
              disabled={isApplyingDiscount}
              aria-label={t('placeholder')}
              className={cn(
                'flex-1 px-3 py-2 text-sm rounded-lg',
                'bg-black/40 border border-white/20 text-white placeholder:text-white/30',
                'focus:outline-none focus:border-neon-cyan transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
            <button
              onClick={handleApply}
              disabled={isApplyingDiscount || !code.trim() || showSuccess}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                'bg-neon-cyan text-bg-primary hover:bg-[color:var(--accent,#00f5ff)]/90',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center gap-2 min-w-[80px] justify-center'
              )}
            >
              {isApplyingDiscount ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="sr-only">Loading...</span>
                </>
              ) : showSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  {t('applied')}
                </>
              ) : (
                t('apply')
              )}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
