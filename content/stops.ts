import { offices, reach, type Office } from './site'

// Reach stops, composed from `site.ts` only (no copy of its own): the three regulators, each with the
// office in its country, then the Dubai and Hong Kong offices. One DOM card and one cube-wall card each.
export type Stop = {
  id: string
  kicker: string
  title: string
  sub?: string
  meta: string[]
  address: readonly string[]
}

const office = (id: string): Office => offices.items.find((o) => o.id === id)!
const meta = (o: Office) => [o.entity, o.licence].filter((l): l is string => !!l)

export const stops: Stop[] = [
  ...reach.regulators.map((r) => {
    const o = 'office' in r ? office(r.office) : null
    return { id: r.code, kicker: r.country, title: r.code, sub: o?.label, meta: o ? meta(o) : [], address: o?.lines ?? [] }
  }),
  ...['dubai', 'hong-kong'].map((id) => {
    const o = office(id)
    return { id, kicker: offices.label, title: o.label, meta: meta(o), address: o.lines }
  }),
]
