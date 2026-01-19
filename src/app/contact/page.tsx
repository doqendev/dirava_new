import { ContentPageLayout } from '@/components/content/ContentPageLayout'
import { ContactForm } from './ContactForm'
import { Mail, MessageCircle, Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with our customer support team. We\'re here to help with orders, products, and any questions.',
}

export default function ContactPage() {
  const breadcrumbs = [{ label: 'Contact', href: '/contact' }]

  return (
    <ContentPageLayout
      title="Contact Us"
      description="Have a question or need help? We're here for you."
      breadcrumbs={breadcrumbs}
      glowColor="cyan"
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6">
            <h2 className="font-display text-xl font-semibold text-white mb-6">
              Send us a message
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
              <h3 className="font-display text-white font-semibold">Email</h3>
            </div>
            <p className="text-white/70 text-sm">
              For general inquiries:
            </p>
            <a
              href="mailto:support@neo-stage.com"
              className="text-neon-cyan hover:underline"
            >
              support@neo-stage.com
            </a>
          </div>

          {/* Social */}
          <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-neon-cyan" />
              </div>
              <h3 className="font-display text-white font-semibold">Social</h3>
            </div>
            <p className="text-white/70 text-sm mb-2">
              Connect with us on social media for updates and support.
            </p>
            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-neon-cyan transition-colors"
              >
                Twitter
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-neon-cyan transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-neon-cyan transition-colors"
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
              <h3 className="font-display text-white font-semibold">Response Time</h3>
            </div>
            <p className="text-white/70 text-sm">
              We typically respond within 24-48 hours during business days (Monday-Friday).
            </p>
          </div>
        </div>
      </div>
    </ContentPageLayout>
  )
}
