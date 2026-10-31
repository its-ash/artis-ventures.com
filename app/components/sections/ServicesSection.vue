<script setup lang="ts">
import { sections, services } from '~/data/site'

const s = sections.services
const root = ref<HTMLElement>()
const lead = ref<HTMLElement>()
const text = useTextReveal()
const { reveal } = useScrollAnimation()

useGsap(root, ({ reduce, mobile, desktop }, { gsap }) => {
  text(lead.value, { type: 'lines', reduce })
  const items = gsap.utils.toArray<HTMLElement>('[data-card]')
  if (reduce) return void reveal(items, { trigger: '[data-cards]', reduce })

  gsap.fromTo(
    '[data-panel]',
    { clipPath: mobile ? 'inset(3% 4% 0% 4%)' : 'inset(6% 5% 0% 5%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: root.value, start: 'top bottom', end: 'top 25%', scrub: true } },
  )

  if (desktop) return void reveal(items, { trigger: '[data-cards]', y: 60, stagger: 0.12 })

  items.forEach((li, i) => {
    gsap.from(li.firstElementChild!, { y: 80, autoAlpha: 0, duration: 1.1, scrollTrigger: { trigger: li, start: 'top 92%', once: true } })
    const next = items[i + 1]
    if (!next) return
    gsap.to(li.firstElementChild!, {
      scale: 0.92,
      transformOrigin: '50% 0%',
      ease: 'none',
      scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 30%', scrub: true },
    })
  })
})
</script>

<template>
  <section id="services" ref="root" class="relative" aria-labelledby="services-title">
    <div data-panel class="theme-light bg-paper py-24 sm:py-32">
      <div class="container-x">
        <SectionLabel :n="s.n" :label="s.label" />
        <div class="mt-6 lg:grid lg:grid-cols-12 lg:items-end lg:gap-16">
          <KineticHeading id="services-title" :text="s.title" :accent="s.accent" class="h-section max-w-[15ch] lg:col-span-7" />
          <p ref="lead" class="lead mt-6 lg:col-span-5 lg:mt-0 lg:pb-3">{{ s.lead }}</p>
        </div>

        <ol data-cards class="mt-14 grid gap-4 sm:mt-20 lg:grid-cols-2 lg:gap-6">
          <li v-for="(it, i) in services" :key="it.id" data-card class="sticky lg:static" :style="{ top: `calc(var(--header-h) + ${1 + i * 0.75}rem)` }">
            <ServiceCard :item="it" :index="i" />
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
