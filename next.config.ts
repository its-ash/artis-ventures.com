import type { NextConfig } from 'next'

const moved = [
  ['/about-us', '/#story'],
  ['/services', '/#capabilities'],
  ['/business-plan-writing', '/#capabilities'],
  ['/team', '/#leadership'],
  ['/contact-us', '/#contact'],
] as const

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return moved.map(([source, destination]) => ({ source, destination, statusCode: 301 }))
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/(video|posters|textures)/:file*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }],
      },
    ]
  },
}

export default config
