<script setup lang="ts">
import { PhArrowUpRight } from '@phosphor-icons/vue'
import { contact, presence, sections } from '~/data/site'

const LON = [-20, 130] as const
const LAT = [0, 62] as const
const K = 6.6
const W = (LON[1] - LON[0]) * K
const H = (LAT[1] - LAT[0]) * K

const s = sections.presence
const root = ref<HTMLElement>()
const lead = ref<HTMLElement>()
const text = useTextReveal()
const { reveal } = useScrollAnimation()
const track = useTrack()

const project = (lon: number, lat: number) => ({ x: Math.round((lon - LON[0]) * K), y: Math.round((LAT[1] - lat) * K) })
const cities = presence.map((p) => ({ ...p, ...project(p.lon, p.lat) }))
const arcs = cities.slice(1).map((b, i) => {
  const a = cities[i]!
  const mx = (a.x + b.x) / 2
  const my = Math.min(a.y, b.y) - Math.abs(b.x - a.x) * 0.28
  return `M${a.x} ${a.y} Q${Math.round(mx)} ${Math.round(my)} ${b.x} ${b.y}`
})
const meridians = Array.from({ length: (LON[1] - LON[0]) / 10 + 1 }, (_, i) => Math.round(i * 10 * K))
const parallels = Array.from({ length: Math.floor((LAT[1] - LAT[0]) / 10) + 1 }, (_, i) => Math.round(H - i * 10 * K))

useGsap(root, ({ reduce }, { gsap }) => {
  text(lead.value, { type: 'lines', reduce })
  reveal('[data-office]', { trigger: '[data-offices]', stagger: 0.12, reduce })
  reveal('[data-place]', { trigger: '[data-places]', stagger: 0.12, reduce })
  if (reduce) return void reveal('[data-map]', { trigger: '[data-map]', reduce })

  const tl = gsap.timeline({ scrollTrigger: { trigger: '[data-map]', start: 'top 75%', once: true } })
  tl.from('[data-grid] line', { autoAlpha: 0, duration: 1.2, stagger: { each: 0.03, from: 'center' }, ease: 'power2.out' })
    .from('[data-marker]', { scale: 0, transformOrigin: '50% 50%', duration: 0.7, ease: 'back.out(2)', stagger: 0.3 }, 0.3)
    .fromTo('[data-arc]', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: 'expo.inOut', stagger: 0.35 }, 0.6)
    .from('[data-city]', { autoAlpha: 0, y: 8, duration: 0.8, stagger: 0.3 }, 0.5)
    .fromTo('[data-pulse]', { scale: 1, autoAlpha: 0.8 }, { scale: 3.2, autoAlpha: 0, duration: 1.8, ease: 'expo.out', stagger: 0.3, repeat: 2, transformOrigin: '50% 50%' }, 1)
})
</script>

<template>
  <section id="presence" ref="root" class="relative overflow-hidden bg-ink-950 py-24 sm:py-32" aria-labelledby="presence-title">
    <div class="container-x">
      <SectionLabel :n="s.n" :label="s.label" />
      <div class="mt-6 lg:grid lg:grid-cols-12 lg:items-end lg:gap-16">
        <KineticHeading id="presence-title" :text="s.title" :accent="s.accent" split="chars" class="h-section max-w-[14ch] lg:col-span-7" />
        <p ref="lead" class="lead mt-6 lg:col-span-5 lg:mt-0 lg:pb-3">{{ s.lead }}</p>
      </div>

      <figure data-map class="relative mt-14 sm:mt-20">
        <svg :viewBox="`0 0 ${W} ${H}`" class="block h-auto w-full overflow-visible" role="img" aria-labelledby="map-title">
          <title id="map-title">Map showing London, Dubai and Hong Kong connected by arcs</title>
          <g data-grid stroke="currentColor" class="text-line" stroke-width="1" vector-effect="non-scaling-stroke">
            <line v-for="x in meridians" :key="`m${x}`" :x1="x" y1="0" :x2="x" :y2="H" stroke-dasharray="2 6" />
            <line v-for="y in parallels" :key="`p${y}`" x1="0" :y1="y" :x2="W" :y2="y" stroke-dasharray="2 6" />
          </g>
          <path v-for="(d, i) in arcs" :key="i" data-arc :d="d" pathLength="1" fill="none" class="arc" stroke-dasharray="1" vector-effect="non-scaling-stroke" />
          <g v-for="c in cities" :key="c.id">
            <circle data-pulse :cx="c.x" :cy="c.y" r="10" fill="none" stroke="#d7b065" stroke-width="1" vector-effect="non-scaling-stroke" />
            <circle data-marker :cx="c.x" :cy="c.y" r="10" fill="#d7b065" />
            <circle :cx="c.x" :cy="c.y" r="3.5" fill="#040a14" />
            <text data-city :x="c.x" :y="c.y - 26" text-anchor="middle" class="city fill-fg font-display">{{ c.city }}</text>
          </g>
        </svg>
      </figure>

      <ul data-places class="mt-12 grid gap-px border-y border-line bg-line sm:grid-cols-3">
        <li v-for="c in cities" :key="c.id" data-place class="flex items-start gap-4 bg-ink-950 py-6 sm:px-6 sm:first:pl-0">
          <span aria-hidden="true" class="relative mt-2 grid size-3 shrink-0 place-items-center">
            <span class="size-2 rounded-full bg-gold-400" />
          </span>
          <div>
            <p class="font-display text-2xl">{{ c.city }}</p>
            <p class="label mt-1">{{ c.country }}</p>
            <p class="mt-2 text-sm text-fg-muted">{{ c.role }}</p>
          </div>
        </li>
      </ul>

      <div data-offices class="mt-16 sm:mt-20">
        <h3 class="label">Offices</h3>
        <ul class="mt-6 grid gap-4 md:grid-cols-3">
          <li v-for="o in contact.offices" :key="o.id" data-office class="panel flex flex-col p-6">
            <p class="font-display text-xl">{{ o.title }}</p>
            <address class="mt-4 grid gap-0.5 leading-relaxed text-fg-muted not-italic">
              <span v-for="l in o.lines" :key="l">{{ l }}</span>
            </address>
            <a :href="o.map" target="_blank" rel="noopener noreferrer" class="link-gold mt-auto pt-4" @click="track('map_open', { office: o.id })">
              Open in Maps
              <PhArrowUpRight :size="16" aria-hidden="true" />
              <span class="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.arc {
  stroke: var(--color-gold-400);
  stroke-width: 1.25;
  stroke-dashoffset: 0;
}

.city {
  font-size: 42px;
}

@media (min-width: 768px) {
  .city {
    font-size: 22px;
  }
}
</style>
