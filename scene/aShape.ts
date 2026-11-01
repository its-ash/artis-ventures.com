import { A_MARK } from '@/components/brand/Logo'

// Logo "A" in potrace units (y up), normalised to world units. Pure data: no three.js here.
export const ARCH_HEIGHT = 3.2
export const ARCH_DEPTH = 0.42
export const BEVEL = 0.035
export const FRONT_Z = ARCH_DEPTH / 2 + BEVEL

export type P = readonly [number, number]
export type Op = { k: 'M' | 'L'; p: P } | { k: 'C'; p: readonly [P, P, P] }

const parse = (d: string): Op[] => {
  const t = d.match(/[a-zA-Z]|-?\d*\.?\d+/g) ?? []
  const ops: Op[] = []
  let cur: P = [0, 0]
  let cmd = ''
  let i = 0
  const n = () => Number(t[i++])
  while (i < t.length) {
    if (/[a-z]/i.test(t[i]!)) {
      cmd = t[i++]!
      if (cmd === 'z' || cmd === 'Z') continue
    }
    if (cmd === 'M') {
      cur = [n(), n()]
      ops.push({ k: 'M', p: cur })
    } else if (cmd === 'l') {
      cur = [cur[0] + n(), cur[1] + n()]
      ops.push({ k: 'L', p: cur })
    } else if (cmd === 'c') {
      const [x, y] = cur
      const a: P = [x + n(), y + n()]
      const b: P = [x + n(), y + n()]
      const e: P = [x + n(), y + n()]
      cur = e
      ops.push({ k: 'C', p: [a, b, e] })
    } else i++
  }
  return ops
}

const raw = parse(A_MARK.d)
const ends = raw.map((o) => (o.k === 'C' ? o.p[2] : o.p))
const xs = ends.map((p) => p[0])
const ys = ends.map((p) => p[1])
const minX = Math.min(...xs)
const maxX = Math.max(...xs)
const minY = Math.min(...ys)
const maxY = Math.max(...ys)
const S = ARCH_HEIGHT / (maxY - minY)
const CX = (minX + maxX) / 2
const CY = (minY + maxY) / 2

export const toWorld = ([x, y]: P): P => [(x - CX) * S, (y - CY) * S]

export const ARCH_OPS: Op[] = raw.map((o) =>
  o.k === 'C' ? { k: 'C', p: [toWorld(o.p[0]), toWorld(o.p[1]), toWorld(o.p[2])] } : { k: o.k, p: toWorld(o.p) },
)

export const ARCH_WIDTH = (maxX - minX) * S

// The A's counter (negative space between crossbar and right leg): the portal opening.
export const COUNTER: P[] = (
  [
    [1761, 645],
    [2311, 1753],
    [3159, 7],
    [2950, 0],
    [2619, 640],
  ] as const
).map(toWorld)

const centroid = (pts: P[]) => {
  let a = 0
  let x = 0
  let y = 0
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length]!
    const c = p[0] * q[1] - q[0] * p[1]
    a += c
    x += (p[0] + q[0]) * c
    y += (p[1] + q[1]) * c
  })
  return { x: x / (3 * a), y: y / (3 * a) }
}

// Fly-through aims at the upper triangle of the counter, where the opening is widest.
export const OPENING = centroid(COUNTER.slice(0, 3).concat([COUNTER[4]!]))

// The A pre-split into its three strokes (straight-edged approximations of the logo outline).
const SHARD_RAW: Record<'left' | 'bar' | 'right', [number, number][]> = {
  left: [
    [841, 645],
    [1761, 645],
    [2311, 1753],
    [2330, 3020],
    [2022, 3020],
  ],
  bar: [
    [521, 0],
    [2950, 0],
    [2756, 372],
    [2619, 640],
    [1761, 645],
    [841, 645],
  ],
  right: [
    [2311, 1753],
    [3159, 7],
    [4090, 5],
    [3377, 1440],
    [2609, 2931],
    [2330, 3020],
  ],
}

export const SHARDS = Object.values(SHARD_RAW).map((poly) => {
  const pts = poly.map(toWorld)
  const c = centroid(pts)
  // Points relative to the shard centre, so each shard rotates about itself; `rest` is its place in the A.
  return { points: pts.map(([x, y]) => [x - c.x, y - c.y] as P), rest: c }
})
