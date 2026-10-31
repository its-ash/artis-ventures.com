<script setup lang="ts">
import { manifesto, sections, stats } from '~/data/site'

const s = sections.about
const root = ref<HTMLElement>()
const body = ref<HTMLElement>()
const text = useTextReveal()
const { reveal, clipReveal, parallax } = useScrollAnimation()

useGsap(root, ({ reduce, mobile }, { gsap }) => {
  if (!reduce) {
    gsap.fromTo(
      '[data-panel]',
      { clipPath: mobile ? 'inset(3% 4% 0% 4%)' : 'inset(8% 6% 0% 6%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: root.value, start: 'top bottom', end: 'top 25%', scrub: true } },
    )
  }
  reveal('[data-tagline]', { trigger: '[data-tagline]', reduce })
  text(body.value, { type: 'lines', reduce })
  reveal('[data-note]', { trigger: '[data-note]', reduce })
  clipReveal('[data-image]', { trigger: '[data-image]', reduce })
  parallax('[data-image-inner]', { trigger: '[data-image]', from: -10, to: 10, scale: 1.1, reduce })
  reveal('[data-stat]', { trigger: '[data-stats]', stagger: 0.15, reduce })
  if (!reduce) gsap.from('[data-stat-rule]', { scaleX: 0, duration: 1.2, ease: 'expo.inOut', stagger: 0.15, delay: 0.3, scrollTrigger: { trigger: '[data-stats]', start: 'top 85%', once: true } })
})
</script>

<template>
  <section id="about" ref="root" class="relative" aria-labelledby="about-title">
    <div data-panel class="theme-light bg-paper py-24 sm:py-32">
      <div class="container-x">
        <SectionLabel :n="s.n" :label="s.label" />

        <div class="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div class="lg:col-span-7">
            <KineticHeading id="about-title" :text="s.title" :accent="s.accent" class="h-section max-w-[17ch]" />
            <p data-tagline class="mt-8 font-display text-2xl leading-snug sm:text-3xl">
              {{ manifesto.lineA }} <span class="accent">{{ manifesto.lineB }}</span>
            </p>
            <p ref="body" class="lead mt-6 max-w-[52ch]">{{ manifesto.body }}</p>
            <p data-note class="mt-5 max-w-[52ch] text-fg-subtle">{{ manifesto.note }}</p>
          </div>

          <div class="lg:col-span-5 lg:pt-4">
            <div data-image class="relative aspect-[4/5] overflow-hidden bg-ink-900">
              <div data-image-inner class="absolute -inset-y-[12%] inset-x-0">
                <ArchBackdrop variant="facade" />
              </div>
              <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
              <p class="absolute inset-x-5 bottom-5 font-mono text-xs tracking-[0.2em] text-gold-300 uppercase">Dubai · Hong Kong · London</p>
            </div>
          </div>
        </div>

        <ul data-stats class="mt-16 grid grid-cols-2 gap-px border-y border-line bg-line sm:mt-24 lg:grid-cols-4">
          <li v-for="(st, i) in stats" :key="st.label" data-stat class="bg-paper px-4 py-7 sm:px-6 sm:py-10">
            <p class="font-display text-[3.25rem] leading-none font-medium tracking-[-0.03em] sm:text-7xl">
              <StatCounter :value="st.value" :suffix="st.suffix" :delay="i * 0.2" />
            </p>
            <span data-stat-rule aria-hidden="true" class="rule mt-5 w-10" />
            <p class="mt-4 max-w-[18ch] text-sm leading-snug text-fg-muted sm:text-base">{{ st.label }}</p>
            <p v-if="'detail' in st" class="label mt-2">{{ st.detail }}</p>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
