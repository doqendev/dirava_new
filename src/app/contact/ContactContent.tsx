'use client'

import { useTranslations } from 'next-intl'
import { ContentPageLayout } from '@/components/content/ContentPageLayout'
import { ContactForm } from './ContactForm'
import { Mail, MessageCircle, Clock } from 'lucide-react'

export default function ContactContent() {
  const t = useTranslations('contact')
  const breadcrumbs = [{ label: t('title'), href: '/contact' }]

  return (
    <ContentPageLayout
      title={t('title')}
      description={t('description')}
      breadcrumbs={breadcrumbs}
      glowColor="cyan"
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6">
            <h2 className="font-display text-xl font-semibold text-white mb-6">
              {t('sendMessage')}
            </h2>
            <ContactForm />
          </div>
        </div>

        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          {/* Email */}
          <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-neon-cyan" />
              </div>
              <h3 className="font-display text-white font-semibold">{t('email')}</h3>
            </div>
            <p className="text-white/70 text-sm">
              {t('forGeneralInquiries')}
            </p>
            <a
              href="mailto:support@mizoke.com"
              className="text-neon-cyan hover:underline"
            >
              support@mizoke.com
            </a>
          </div>

          {/* Social */}
          <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-neon-cyan" />
              </div>
              <h3 className="font-display text-white font-semibold">{t('social')}</h3>
            </div>
            <p className="text-white/70 text-sm mb-2">
              {t('socialDescription')}
            </p>
            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-[color:var(--accent,#00f5ff)] transition-colors"
              >
                Twitter
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-[color:var(--accent,#00f5ff)] transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-[color:var(--accent,#00f5ff)] transition-colors"
              >
                Discord
              </a>
            </div>
          </div>

          {/* Response Time */}
          <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-neon-cyan" />
              </div>
              <h3 className="font-display text-white font-semibold">{t('responseTime')}</h3>
            </div>
            <p className="text-white/70 text-sm">
              {t('responseTimeDescription')}
            </p>
          </div>
        </div>
      </div>
    </ContentPageLayout>
  )
}
