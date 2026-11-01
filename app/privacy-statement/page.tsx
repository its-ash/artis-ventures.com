import type { Metadata } from 'next'
import { SimplePage } from '@/components/SimplePage'
import { pages } from '@/content/site'

export const metadata: Metadata = { title: pages.privacy.title, alternates: { canonical: '/privacy-statement' } }

export default function Privacy() {
  return <SimplePage {...pages.privacy} />
}
