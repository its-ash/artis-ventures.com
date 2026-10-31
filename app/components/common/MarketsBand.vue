<script setup lang="ts">
import { markets } from '~/data/site'

const REPEAT = 3
const rows = markets.map((row) => Array.from({ length: REPEAT }, () => row).flat())
const root = ref<HTMLElement>()

useGsap(root, ({ reduce }, { gsap }) => {
  if (reduce) return
  const st = { trigger: root.value, start: 'top bottom', end: 'bottom top', scrub: 0.4 }
  gsap.fromTo('[data-row="0"]', { xPercent: 0 }, { xPercent: -28, ease: 'none', scrollTrigger: st })
  gsap.fromTo('[data-row="1"]', { xPercent: -28 }, { xPercent: 0, ease: 'none', scrollTrigger: st })
})
</script>

<template>
  <section ref="root" class="relative overflow-hidden bg-ink-900 py-12 sm:py-16" aria-label="Markets we advise on">
    <ul class="sr-only">
      <li v-for="m in markets.flat()" :key="m">{{ m }}</li>
    </ul>
    <div aria-hidden="true" class="grid gap-3 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)] sm:gap-5">
      <div v-for="(row, r) in rows" :key="r" :data-row="r" class="flex w-max items-center gap-6 sm:gap-10">
        <template v-for="(m, i) in row" :key="`${r}-${i}`">
          <span class="font-display text-[2.25rem] leading-none whitespace-nowrap sm:text-6xl" :class="r ? 'text-outline' : 'text-fg'">{{ m }}</span>
          <span class="h-px w-8 shrink-0 bg-gold-400 sm:w-14" />
        </template>
      </div>
    </div>
  </section>
</template>
