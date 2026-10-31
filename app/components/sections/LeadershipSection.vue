<script setup lang="ts">
import { leaders, sections } from '~/data/site'

const s = sections.leadership
const root = ref<HTMLElement>()
const lead = ref<HTMLElement>()
const text = useTextReveal()
const { drawLine } = useScrollAnimation()

useGsap(root, ({ reduce }) => {
  text(lead.value, { type: 'lines', reduce })
  drawLine('[data-divider]', { trigger: '[data-people]', start: 'top 80%', end: 'top 30%', reduce })
})
</script>

<template>
  <section id="leadership" ref="root" class="relative bg-ink-900 py-24 sm:py-32" aria-labelledby="leadership-title">
    <div class="container-x">
      <SectionLabel :n="s.n" :label="s.label" />
      <div class="mt-6 lg:grid lg:grid-cols-12 lg:items-end lg:gap-16">
        <KineticHeading id="leadership-title" :text="s.title" :accent="s.accent" class="h-section max-w-[16ch] lg:col-span-7" />
        <p ref="lead" class="lead mt-6 lg:col-span-5 lg:mt-0 lg:pb-3">{{ s.lead }}</p>
      </div>

      <span data-divider aria-hidden="true" class="rule mt-14 w-full sm:mt-20" />

      <ul data-people class="mt-14 grid gap-20 sm:mt-20 sm:gap-28 lg:gap-36">
        <li v-for="(l, i) in leaders" :key="l.id">
          <LeaderProfile :leader="l" :index="i" />
        </li>
      </ul>
    </div>
  </section>
</template>
