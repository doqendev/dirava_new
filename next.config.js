/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/s/files/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Note: typedRoutes disabled due to dynamic route complexity
  // experimental: {
  //   typedRoutes: true,
  // },
}

module.exports = nextConfig
