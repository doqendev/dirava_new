import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function AboutIntro() {
  const t = await getTranslations('aboutIntro')

  return (
    <section
      aria-labelledby="about-intro-heading"
      className="relative px-4 py-16 md:py-20 max-w-5xl mx-auto"
    >
      <div className="relative z-10">
        <h2
          id="about-intro-heading"
          className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 uppercase tracking-wider"
          style={{ textShadow: '0 0 20px rgba(0, 245, 255, 0.35)' }}
        >
          {t('heading')}
        </h2>

        <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-3xl mb-6">
          {t('paragraph1')}
        </p>

        <p className="text-white/60 text-base leading-relaxed max-w-3xl mb-8">
          {t('paragraph2')}
        </p>

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div>
            <dt className="font-display text-neon-cyan text-sm uppercase tracking-wider mb-1">
              {t('fact1Label')}
            </dt>
            <dd className="text-white/70 text-sm">{t('fact1Value')}</dd>
          </div>
          <div>
            <dt className="font-display text-neon-cyan text-sm uppercase tracking-wider mb-1">
              {t('fact2Label')}
            </dt>
            <dd className="text-white/70 text-sm">{t('fact2Value')}</dd>
          </div>
          <div>
            <dt className="font-display text-neon-cyan text-sm uppercase tracking-wider mb-1">
              {t('fact3Label')}
            </dt>
            <dd className="text-white/70 text-sm">{t('fact3Value')}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href="/about"
            className="text-neon-cyan hover:underline font-medium"
          >
            {t('learnMore')} →
          </Link>
          <Link
            href="/faq"
            className="text-white/60 hover:text-white font-medium"
          >
            {t('readFaq')}
          </Link>
        </div>
      </div>
    </section>
  )
}
