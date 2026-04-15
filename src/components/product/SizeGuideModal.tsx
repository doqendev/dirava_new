'use client'

import { useTranslations } from 'next-intl'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils/cn'
import type { SizeGuide } from '@/types/sizeGuide'

interface SizeGuideModalProps {
  isOpen: boolean
  onClose: () => void
  sizeGuide: SizeGuide
}

export function SizeGuideModal({ isOpen, onClose, sizeGuide }: SizeGuideModalProps) {
  const t = useTranslations('sizeGuide')
  const columnKeys = sizeGuide.columns

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('title', { type: t(`productTypes.${sizeGuide.productType}`) })}
      size="lg"
    >
      <div className="space-y-4">
        {/* Unit indicator */}
        <p className="text-sm text-white/60">
          {t('allMeasurementsIn')} <span className="text-white font-medium">{sizeGuide.unit}</span>
        </p>

        {/* Size table */}
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-border-subtle">
                {sizeGuide.columns.map((colKey) => (
                  <th
                    key={colKey}
                    className={cn(
                      'px-3 py-2 text-left text-sm font-medium text-white/80',
                      colKey === 'size' && 'w-16'
                    )}
                  >
                    {t(`columns.${colKey}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizeGuide.rows.map((row, index) => (
                <tr
                  key={row.size}
                  className={cn(
                    'border-b border-border-subtle/50',
                    index % 2 === 0 ? 'bg-white/[0.02]' : ''
                  )}
                >
                  {columnKeys.map((key) => (
                    <td
                      key={key}
                      className={cn(
                        'px-3 py-2.5 text-sm',
                        key === 'size' ? 'font-medium text-neon-cyan' : 'text-white/70'
                      )}
                    >
                      {row[key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {sizeGuide.notes && sizeGuide.notes.length > 0 && (
          <div className="pt-4 border-t border-border-subtle">
            <p className="text-sm font-medium text-white/80 mb-2">{t('notes')}</p>
            <ul className="space-y-1">
              {sizeGuide.notes.map((noteKey, index) => (
                <li key={index} className="text-sm text-white/60 flex items-start gap-2">
                  <span className="text-neon-cyan mt-1">•</span>
                  {t(`noteKeys.${noteKey}`)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* How to measure */}
        <div className="pt-4 border-t border-border-subtle">
          <p className="text-sm font-medium text-white/80 mb-2">{t('howToMeasure')}</p>
          <ul className="space-y-1 text-sm text-white/60">
            <li className="flex items-start gap-2">
              <span className="text-neon-cyan mt-1">•</span>
              <span><strong className="text-white/80">{t('chest')}:</strong> {t('chestDescription')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-cyan mt-1">•</span>
              <span><strong className="text-white/80">{t('waist')}:</strong> {t('waistDescription')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-cyan mt-1">•</span>
              <span><strong className="text-white/80">{t('hips')}:</strong> {t('hipsDescription')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-cyan mt-1">•</span>
              <span><strong className="text-white/80">{t('length')}:</strong> {t('lengthDescription')}</span>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}
