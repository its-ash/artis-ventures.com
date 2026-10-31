import tailwindcss from '@tailwindcss/vite'

const SITE_URL = 'https://artis-ventures.com'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-31',
  devtools: { enabled: false },
  modules: ['@nuxt/fonts'],
  components: [{ path: '~/components', pathPrefix: false }],
  css: ['lenis/dist/lenis.css', '~/assets/css/main.css'],
  runtimeConfig: { public: { siteUrl: SITE_URL } },
  vite: { plugins: [tailwindcss()] },
  features: { inlineStyles: true },
  experimental: { payloadExtraction: false },
  nitro: { prerender: { routes: ['/'], crawlLinks: false } },
  fonts: {
    defaults: { subsets: ['latin'], styles: ['normal'] },
    families: [
      {
        name: 'Bodoni Moda',
        provider: 'google',
        weights: ['400 700'],
        variableAxis: { opsz: [6, 96] },
        preload: true,
      },
      { name: 'Geist', provider: 'google', weights: ['400 600'], preload: true },
      { name: 'Geist Mono', provider: 'google', weights: [400, 500] },
    ],
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en', dir: 'ltr' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      meta: [
        { name: 'theme-color', content: '#040a14' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', type: 'image/png', href: '/icon-192.png', sizes: '192x192' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'preload', as: 'image', href: '/logo-word.webp', type: 'image/webp' },
      ],
      script: [{ innerHTML: "document.documentElement.classList.add('js')", tagPosition: 'head' }],
    },
  },
})
