import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { getProductLifestyleImages } from '@/data/productLifestyle'

interface ProductLifestyleGalleryProps {
  productHandle: string
}

export async function ProductLifestyleGallery({ productHandle }: ProductLifestyleGalleryProps) {
  const images = getProductLifestyleImages(productHandle)

  if (!images || images.length === 0) {
    return null
  }

  const t = await getTranslations('product')

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-display text-white mb-6">
        {t('lifestyleGalleryTitle')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10"
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
