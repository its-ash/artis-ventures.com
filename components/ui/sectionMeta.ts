import { sections, type SectionId } from '@/content/site'

export const TOTAL = sections.length - 1
export const pad = (n: number) => String(n).padStart(2, '0')

export const meta = (id: SectionId) => {
  const i = sections.findIndex((s) => s.id === id)
  const s = sections[i]!
  return { n: pad(i), label: s.label, tone: s.tone }
}
