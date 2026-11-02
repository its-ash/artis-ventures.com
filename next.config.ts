import type { NextConfig } from 'next'
import { legacy } from './lib/legacy'

// STATIC_EXPORT=1 builds a static site for GitHub Pages (`make build` → docs/).
// Static hosting cannot send redirects or headers, so they apply only to the server build.
const exporting = process.env.STATIC_EXPORT === '1'

const server: NextConfig = {
  async redirects() {
    return Object.entries(legacy).map(([slug, destination]) => ({ source: `/${slug}`, destination, statusCode: 301 }))
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

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(exporting ? { output: 'export', trailingSlash: true, images: { unoptimized: true } } : server),
}

export default config
