import type { Metadata, Viewport } from 'next'
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import { Header } from '@/components/Header'
import { Footer } from '@/components/sections/Footer'
import { brand, offices, seo, ui } from '@/content/site'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['400'], variable: '--font-inter', display: 'swap' })
const interTight = Inter_Tight({ subsets: ['latin'], weight: ['500'], variable: '--font-inter-tight', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-jetbrains', display: 'swap' })

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? brand.url

const HAS_GL = `try{var c=document.createElement('canvas').getContext('webgl2');if(c){document.documentElement.classList.add('has-gl');var x=c.getExtension('WEBGL_lose_context');x&&x.loseContext()}}catch(e){}`

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: seo.title, template: `%s — ${brand.name}` },
  description: seo.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: brand.name,
    title: seo.title,
    description: seo.description,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: seo.title }],
  },
  twitter: { card: 'summary_large_image', title: seo.title, description: seo.description, images: ['/og.jpg'] },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#0c0e11',
  colorScheme: 'dark light',
}

const place = (o: (typeof offices.items)[number]) => ({
  '@type': 'Place',
  name: [o.label, 'entity' in o ? o.entity : undefined].filter(Boolean).join(' — '),
  ...('licence' in o && o.licence ? { identifier: o.licence } : {}),
  address: { '@type': 'PostalAddress', streetAddress: o.lines.join(' ') },
  geo: { '@type': 'GeoCoordinates', latitude: o.lat, longitude: o.lon },
})

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'ProfessionalService'],
  name: brand.name,
  legalName: brand.legalName,
  slogan: brand.tagline,
  url: SITE,
  logo: `${SITE}/icon.svg`,
  image: `${SITE}/og.jpg`,
  description: seo.description,
  telephone: brand.phone,
  email: brand.email,
  foundingDate: '2023',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'The Meydan Hotel, Grandstand, 6th Floor, Meydan Road, Nad Al Sheba',
    addressLocality: 'Dubai',
    addressCountry: 'AE',
  },
  location: offices.items.filter((o) => o.id === 'dubai' || o.id === 'hong-kong').map(place),
  areaServed: ['AE', 'GB', 'MU', 'HK'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${interTight.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Mark WebGL support before first paint so fallback media and opaque sections never flash. */}
        <script dangerouslySetInnerHTML={{ __html: HAS_GL }} />
      </head>
      <body>
        <a href="#main" className="skip label">
          {ui.skip}
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      </body>
    </html>
  )
}
