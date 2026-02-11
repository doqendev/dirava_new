import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tamashii.store'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/account/', '/reveal/', '/gacha/claim/']
      },
      {
        userAgent: 'Googlebot',
        allow: '/'
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  }
}
