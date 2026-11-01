import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { legacy, type LegacySlug } from '@/lib/legacy'
import { ui } from '@/content/site'

// Static hosting has no 301s: each old URL becomes a page that forwards at once.
// On the server build, the 301 in next.config.ts answers before this page.
export const dynamicParams = false

export const generateStaticParams = () => Object.keys(legacy).map((slug) => ({ legacy: slug }))

type Props = { params: Promise<{ legacy: string }> }

const target = (slug: string) => (slug in legacy ? legacy[slug as LegacySlug] : null)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const to = target((await params).legacy)
  return { robots: { index: false, follow: true }, alternates: to ? { canonical: to } : undefined }
}

export default async function Legacy({ params }: Props) {
  const to = target((await params).legacy)
  if (!to) notFound()
  return (
    <section data-tone="dark" className="tone shell pb-28 pt-[calc(var(--header-h)+6rem)]">
      <meta httpEquiv="refresh" content={`0;url=${to}`} />
      <Link href={to} className="label link-u">
        {ui.moved}
      </Link>
    </section>
  )
}
