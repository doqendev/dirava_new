'use client'

import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'

type ProductType = 'desk-sign' | 'keychain' | 'led-sign' | 'hoodie' | 'tshirt' | 'magnet'

interface ProductDescriptionProps {
  handle: string
  isPersonalized: boolean
  /** Optional Shopify HTML used as the fallback when we can't infer a
   *  type from the handle -keeps existing products that don't fit a
   *  category from going blank. */
  fallbackHtml?: string
}

/** Match a handle to a product type purely by handle keywords. The
 *  catalogue uses descriptive handles (e.g. `one-piece-custom-sign`,
 *  `dragon-ball-led-lightbox-sign`), so this is reliable without any
 *  Shopify product-type / tag plumbing. */
function detectProductType(handle: string): ProductType | null {
  const h = handle.toLowerCase()
  if (h.includes('led') || h.includes('lightbox')) return 'led-sign'
  if (h.includes('keychain')) return 'keychain'
  if (h.includes('magnet')) return 'magnet'
  if (h.includes('hoodie') || h.includes('sweatshirt')) return 'hoodie'
  if (h.includes('t-shirt') || h.includes('tshirt') || h.includes('tee') || h.includes('shirt')) return 'tshirt'
  if (h.includes('sign')) return 'desk-sign'
  return null
}

const HOODIE_SIZES: Array<[string, string]> = [
  ['XS', '49 / 64'],
  ['S', '52 / 66'],
  ['M', '55 / 68'],
  ['L', '58 / 70'],
  ['XL', '61 / 72'],
  ['XXL', '64 / 74'],
  ['3XL', '67 / 76'],
  ['4XL', '70 / 78'],
  ['5XL', '73 / 80'],
]

const TSHIRT_SIZES: Array<[string, string]> = [
  ['XS', '47 / 67'],
  ['S', '50 / 69'],
  ['M', '53 / 72'],
  ['L', '56 / 74'],
  ['XL', '59 / 76'],
  ['XXL', '62 / 79'],
  ['3XL', '65 / 82'],
  ['4XL', '68 / 85'],
  ['5XL', '71 / 88'],
]

function SizeTable({ rows, note }: { rows: Array<[string, string]>; note?: string }) {
  const t = useTranslations('product')
  return (
    <div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/10">
            <th className="py-2 pr-4 font-semibold text-white/85">{t('descriptionSizeCol')}</th>
            <th className="py-2 font-semibold text-white/85">{t('descriptionMeasurementsCol')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([size, dims]) => (
            <tr key={size} className="border-b border-white/5 last:border-0">
              <td className="py-1.5 pr-4 font-mono text-white/70">{size}</td>
              <td className="py-1.5 font-mono tabular-nums text-white/70">{dims}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {note && <p className="mt-2 text-[12px] text-white/45">{note}</p>}
    </div>
  )
}

/** Plain stacked lines, no bullet markers -reads as scannable
 *  topics without the visual heaviness of a bulleted list. Lines that
 *  contain a "label -value" pattern get the label rendered slightly
 *  brighter than the value, so the eye lands on the topic first. */
function FeatureLines({ items }: { items: string[] }) {
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => {
        const idx = item.indexOf(' -')
        if (idx === -1) {
          return (
            <p key={i} className="!my-0 text-white/70">
              {item}
            </p>
          )
        }
        const label = item.slice(0, idx)
        const value = item.slice(idx + 3)
        return (
          <p key={i} className="!my-0 text-white/70">
            <span className="font-semibold text-white/90">{label}</span>
            <span className="mx-2 text-white/30">-</span>
            <span>{value}</span>
          </p>
        )
      })}
    </div>
  )
}

/** Standalone sub-block separated from the main feature lines. Used
 *  for the "Sizing adjusts to your name" rule that's unique to
 *  personalized products and worth setting apart visually. */
function SizingRule({
  intro,
  longer,
  shorter,
}: {
  intro: string
  longer: string
  shorter: string
}) {
  return (
    <div className="mt-5">
      <p className="!my-0 font-semibold text-white/85">{intro}</p>
      <div className="mt-1.5 space-y-1">
        <p className="!my-0">{longer}</p>
        <p className="!my-0">{shorter}</p>
      </div>
    </div>
  )
}

function DeskSignDescription({ personalized }: { personalized: boolean }) {
  const items: string[] = [
    'Made from PLA - sturdy and lightweight',
    'Smooth top surface finish',
    'Average size: approx. 22 cm wide',
  ]
  if (personalized) items.push('Made to order - every piece is unique')
  return (
    <>
      <FeatureLines items={items} />
      {personalized && (
        <SizingRule
          intro="Size adjusts to your name:"
          longer="Longer names are wider with smaller letters."
          shorter="Shorter names are more compact and taller."
        />
      )}
    </>
  )
}

function KeychainDescription({ personalized }: { personalized: boolean }) {
  const items: string[] = [
    'PLA base - sturdy and lightweight',
    'UV-painted',
    'Average size: approx. 8 cm long',
  ]
  if (personalized) items.push('Made to order')
  return (
    <>
      <FeatureLines items={items} />
      {personalized && (
        <SizingRule
          intro="Size adjusts to your name:"
          longer="Longer names are longer with smaller letters."
          shorter="Shorter names are more compact with larger letters."
        />
      )}
    </>
  )
}

function LedSignDescription({ personalized }: { personalized: boolean }) {
  const items: string[] = [
    'Made from PLA - sturdy and lightweight',
    'UV-painted',
    'Internal white LEDs backlight every colour at once',
    'USB-powered with an on/off switch on the cable',
    'Height varies by design - see specifications',
  ]
  if (personalized) items.push('Made to order')
  return <FeatureLines items={items} />
}

function HoodieDescription() {
  const t = useTranslations('product')
  return (
    <>
      <FeatureLines
        items={[
          '50% cotton / 50% polyester, 320 g/m²',
          'Unisex hooded sweatshirt',
          '1×1 ribbed cuffs and hem',
          'Kangaroo pocket',
          'Hood with eyelets and tone-on-tone drawstring',
          'Carded interior, enzyme-treated for softness',
        ]}
      />
      <div className="mt-5">
        <p className="!my-0 font-semibold text-white/85">{t('descriptionSizes')}</p>
        <div className="mt-1.5">
          <SizeTable rows={HOODIE_SIZES} />
        </div>
      </div>
      <div className="mt-5">
        <p className="!my-0 font-semibold text-white/85">{t('descriptionCare')}</p>
        <div className="mt-1.5">
          <FeatureLines
            items={[
              'Machine wash, max 40°C',
              'Do not tumble dry, dry clean, or bleach',
              'Iron, max 110°C',
            ]}
          />
        </div>
      </div>
    </>
  )
}

function TshirtDescription() {
  const t = useTranslations('product')
  return (
    <>
      <FeatureLines
        items={[
          '100% combed-cotton jersey, 150 g/m²',
          'Unisex',
          '1×1 ribbed collar',
          'Double-stitched sleeves and hem',
          'Tubular construction, regular cut',
          'Enzyme-treated for softness',
        ]}
      />
      <div className="mt-5">
        <p className="!my-0 font-semibold text-white/85">{t('descriptionSizes')}</p>
        <div className="mt-1.5">
          <SizeTable rows={TSHIRT_SIZES} />
        </div>
      </div>
      <div className="mt-5">
        <p className="!my-0 font-semibold text-white/85">{t('descriptionCare')}</p>
        <div className="mt-1.5">
          <FeatureLines
            items={[
              'Machine wash, max 30°C',
              'Do not tumble dry, dry clean, or bleach',
              'Iron, max 110°C',
            ]}
          />
        </div>
      </div>
    </>
  )
}

function MagnetDescription({ personalized }: { personalized: boolean }) {
  const items: string[] = [
    'Made from PLA - sturdy and lightweight',
    'UV-painted',
    'Sticks to fridges, lockers, and any ferrous surface',
  ]
  return (
    <>
      <FeatureLines items={items} />
      {personalized && (
        <SizingRule
          intro="Size adjusts to your name:"
          longer="Longer names result in a slightly larger magnet."
          shorter="Shorter names result in a more compact magnet."
        />
      )}
    </>
  )
}

/**
 * In-code product description rendered inside the PDP description
 * accordion. Replaces the Shopify `descriptionHtml` field for the
 * known product types -easier to translate, easier to keep
 * consistent across products of the same type, and there's no need
 * to re-author the same boilerplate in Shopify per product.
 *
 * If the handle doesn't match a known type and a `fallbackHtml` is
 * provided, the Shopify HTML is rendered as-is so unmatched products
 * don't go blank.
 */
export function ProductDescription({ handle, isPersonalized, fallbackHtml }: ProductDescriptionProps) {
  const type = detectProductType(handle)
  let body: ReactNode = null

  switch (type) {
    case 'desk-sign':
      body = <DeskSignDescription personalized={isPersonalized} />
      break
    case 'keychain':
      body = <KeychainDescription personalized={isPersonalized} />
      break
    case 'led-sign':
      body = <LedSignDescription personalized={isPersonalized} />
      break
    case 'hoodie':
      body = <HoodieDescription />
      break
    case 'tshirt':
      body = <TshirtDescription />
      break
    case 'magnet':
      body = <MagnetDescription personalized={isPersonalized} />
      break
    default:
      // No type match -fall back to Shopify-managed HTML so the
      // accordion never appears empty.
      if (fallbackHtml) {
        return (
          <div
            className="prose prose-invert prose-sm max-w-[680px] text-[14px] text-white/75 leading-relaxed [&_*]:!bg-transparent [&_*]:!text-inherit"
            dangerouslySetInnerHTML={{ __html: fallbackHtml }}
          />
        )
      }
      return null
  }

  return (
    <div className="prose prose-invert prose-sm max-w-[680px] text-[14px] text-white/75 leading-relaxed [&_*]:!bg-transparent [&_*]:!text-inherit space-y-3">
      {body}
    </div>
  )
}
