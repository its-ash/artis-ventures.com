import type { Metadata } from 'next'
import { SimplePage } from '@/components/SimplePage'
import { pages } from '@/content/site'

export const metadata: Metadata = { title: pages.opportunities.title, alternates: { canonical: '/affiliate-program' } }

export default function Opportunities() {
  return <SimplePage {...pages.opportunities} />
}
