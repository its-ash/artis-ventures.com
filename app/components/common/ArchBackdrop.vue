<script setup lang="ts">
type Variant = 'tower' | 'facade' | 'skyline'
type Tower = { x0: number; x1: number; cols: number; floors: number; tone: number; seed: number }
type Line = { x1: number; y1: number; x2: number; y2: number }

const props = withDefaults(defineProps<{ variant?: Variant }>(), { variant: 'tower' })

const r = (n: number) => Math.round(n * 10) / 10
const hash = (a: number, b: number, s: number) => (((a * 73856093) ^ (b * 19349663) ^ (s * 83492791)) >>> 0) % 97
const range = (n: number) => Array.from({ length: n }, (_, i) => i)

const VIEW: Record<Variant, { w: number; h: number; vpy: number; ratio: string }> = {
  tower: { w: 400, h: 800, vpy: -1100, ratio: 'xMidYMid slice' },
  facade: { w: 400, h: 500, vpy: -5000, ratio: 'xMidYMid slice' },
  skyline: { w: 1200, h: 600, vpy: 0, ratio: 'xMidYMax slice' },
}

const TOWERS: Record<'tower' | 'facade', Tower[]> = {
  tower: [
    { x0: -150, x1: 70, cols: 6, floors: 30, tone: 0.45, seed: 3 },
    { x0: 300, x1: 560, cols: 7, floors: 34, tone: 0.45, seed: 5 },
    { x0: 40, x1: 330, cols: 10, floors: 26, tone: 1, seed: 7 },
  ],
  facade: [{ x0: -20, x1: 420, cols: 9, floors: 14, tone: 1, seed: 11 }],
}

const build = (t: Tower, h: number, vpy: number, cx: number, exp: number) => {
  const xAt = (xb: number, y: number) => r(cx + ((xb - cx) * (y - vpy)) / (h - vpy))
  const ms = range(t.cols + 1).map((i) => t.x0 + ((t.x1 - t.x0) * i) / t.cols)
  const ys = range(t.floors + 1).map((k) => r(h * (k / t.floors) ** exp))
  const mullions: Line[] = ms.map((xb) => ({ x1: xAt(xb, 0), y1: 0, x2: r(xb), y2: h }))
  const floors: Line[] = ys.map((y) => ({ x1: xAt(t.x0, y), y1: y, x2: xAt(t.x1, y), y2: y }))
  const lit = range(t.cols).flatMap((i) =>
    range(t.floors)
      .filter((k) => hash(i, k, t.seed) < 10)
      .map((k) => {
        const [a, b, y0, y1] = [ms[i]!, ms[i + 1]!, ys[k]!, ys[k + 1]!]
        return {
          pts: `${xAt(a, y0)},${y0} ${xAt(b, y0)},${y0} ${xAt(b, y1)},${y1} ${xAt(a, y1)},${y1}`,
          o: r((0.12 + (hash(k, i, t.seed) % 5) * 0.07) * t.tone),
        }
      }),
  )
  const body = `${xAt(t.x0, 0)},0 ${xAt(t.x1, 0)},0 ${r(t.x1)},${h} ${r(t.x0)},${h}`
  return { ...t, mullions, floors, lit, body }
}

const skyline = (w: number, h: number) =>
  range(3).map((layer) => {
    const blocks: { x: number; y: number; w: number; h: number; win: { x: number; y: number }[] }[] = []
    let x = -60
    let i = 0
    while (x < w + 60) {
      const bw = 50 + (hash(i, layer, 13) % 70)
      const bh = h * (0.22 + layer * 0.12) + (hash(layer, i, 17) % 40) * (5 - layer * 1.2)
      const y = r(h - bh)
      const win = layer === 2 ? [] : range(Math.floor(bh / 22)).flatMap((row) => range(Math.floor(bw / 16)).filter((c) => hash(c + i * 7, row, layer + 19) < 7).map((c) => ({ x: r(x + 6 + c * 16), y: r(y + 10 + row * 22) })))
      blocks.push({ x: r(x), y, w: bw, h: r(bh), win })
      x += bw + 4 + (hash(i, 3, layer) % 14)
      i++
    }
    return { layer, blocks }
  })

const view = computed(() => VIEW[props.variant])
const towers = computed(() => (props.variant === 'skyline' ? [] : TOWERS[props.variant].map((t) => build(t, view.value.h, view.value.vpy, view.value.w / 2, props.variant === 'tower' ? 1.45 : 1))))
const layers = computed(() => (props.variant === 'skyline' ? skyline(view.value.w, view.value.h) : []))
const LAYER_FILL = ['#14263f', '#0e1e35', '#071120']
</script>

<template>
  <svg :viewBox="`0 0 ${view.w} ${view.h}`" :preserveAspectRatio="view.ratio" aria-hidden="true" class="block size-full" focusable="false">
    <defs>
      <linearGradient :id="`sky-${variant}`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#14263f" />
        <stop offset="0.6" stop-color="#071120" />
        <stop offset="1" stop-color="#040a14" />
      </linearGradient>
      <radialGradient :id="`glow-${variant}`" cx="0.5" cy="0" r="0.8">
        <stop offset="0" stop-color="#d7b065" stop-opacity="0.32" />
        <stop offset="1" stop-color="#d7b065" stop-opacity="0" />
      </radialGradient>
      <linearGradient :id="`body-${variant}`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1d3556" />
        <stop offset="1" stop-color="#0a172a" />
      </linearGradient>
    </defs>
    <rect :width="view.w" :height="view.h" :fill="`url(#sky-${variant})`" />
    <rect :width="view.w" :height="view.h" :fill="`url(#glow-${variant})`" />

    <g v-for="t in towers" :key="t.seed" :opacity="t.tone">
      <polygon :points="t.body" :fill="`url(#body-${variant})`" />
      <polygon v-for="(c, i) in t.lit" :key="i" :points="c.pts" fill="#d7b065" :fill-opacity="c.o" />
      <g stroke="#d7b065" stroke-opacity="0.22" stroke-width="0.6" vector-effect="non-scaling-stroke">
        <line v-for="(l, i) in t.mullions" :key="`m${i}`" v-bind="l" />
      </g>
      <g stroke="#eef1f6" stroke-opacity="0.07" stroke-width="0.5">
        <line v-for="(l, i) in t.floors" :key="`f${i}`" v-bind="l" />
      </g>
    </g>

    <g v-for="l in layers" :key="l.layer" :data-layer="l.layer">
      <template v-for="(b, i) in l.blocks" :key="i">
        <rect :x="b.x" :y="b.y" :width="b.w" :height="b.h + 40" :fill="LAYER_FILL[l.layer]" stroke="#d7b065" :stroke-opacity="0.08 + l.layer * 0.06" stroke-width="0.6" />
        <rect v-for="(w, j) in b.win" :key="j" :x="w.x" :y="w.y" width="6" height="9" fill="#d7b065" :fill-opacity="0.25 + l.layer * 0.2" />
      </template>
    </g>
  </svg>
</template>
