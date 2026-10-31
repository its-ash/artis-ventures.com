<script setup lang="ts">
import { PhPlus } from '@phosphor-icons/vue'
import type { capabilities } from '~/data/site'

const props = defineProps<{ item: (typeof capabilities)[number]; index: number }>()

const el = ref<HTMLElement>()
const panel = ref<HTMLElement>()
const open = ref(false)
const { toggleHeight } = useScrollAnimation()
const track = useTrack()
const num = String(props.index + 1).padStart(2, '0')

const toggle = () => {
  open.value = !open.value
  toggleHeight(panel.value, open.value, prefersReducedMotion())
  track('accordion_toggle', { section: 'capabilities', item: props.item.id, open: open.value })
}

useGsap(el, ({ reduce, desktop }, { gsap }) => {
  const st = { trigger: el.value, start: 'top 88%', once: true }
  if (reduce) return void gsap.from(el.value!, { autoAlpha: 0, duration: 0.5, ease: 'none', scrollTrigger: st })
  const delay = desktop ? props.index * 0.12 : 0
  gsap
    .timeline({ delay, scrollTrigger: st })
    .from(el.value!, { y: 60, autoAlpha: 0, duration: 1.2 })
    .from('[data-num]', { yPercent: 110, duration: 1 }, 0.2)
    .from('.motif-stroke', { strokeDashoffset: 1, duration: 1.4, ease: 'expo.inOut', stagger: 0.1 }, 0.3)
    .from('[data-copy]', { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.08 }, 0.4)
  gsap.fromTo('[data-mark]', { rotate: -20 }, { rotate: 25, ease: 'none', scrollTrigger: { trigger: el.value, start: 'top bottom', end: 'bottom top', scrub: true } })
})
</script>

<template>
  <article ref="el" class="panel relative flex h-full flex-col overflow-hidden p-6 sm:p-8" :class="{ 'is-active': open }" :aria-labelledby="`cap-${item.id}`">
    <DrawBorder :delay="index * 0.12" :active="open" />
    <div data-mark aria-hidden="true" class="pointer-events-none absolute -right-16 -bottom-16 size-64 text-gold-400 opacity-[0.07]">
      <CapMotif :kind="item.motif" />
    </div>

    <div class="flex items-start justify-between gap-6">
      <span class="block overflow-hidden pb-[0.05em]">
        <span data-num class="text-outline block font-display text-[4.5rem] leading-none font-medium tabular sm:text-[5.5rem]">{{ num }}</span>
      </span>
      <span aria-hidden="true" class="mt-2 block size-16 text-gold-400 sm:size-20"><CapMotif :kind="item.motif" /></span>
    </div>

    <h3 :id="`cap-${item.id}`" data-copy class="mt-8 font-display text-[1.875rem] leading-[1.1] sm:text-4xl">{{ item.title }}</h3>
    <p data-copy class="mt-3 text-lg text-accent">{{ item.lead }}</p>

    <button
      type="button"
      data-copy
      class="mt-5 flex min-h-12 items-center gap-3 self-start font-mono text-xs tracking-[0.16em] text-fg uppercase lg:hidden"
      :aria-expanded="open"
      :aria-controls="`cap-${item.id}-panel`"
      @click="toggle"
    >
      <span class="grid size-8 place-items-center border border-line-strong">
        <PhPlus :size="14" aria-hidden="true" class="transition-transform duration-300" :class="open && 'rotate-45'" />
      </span>
      {{ open ? 'Close' : 'What it covers' }}<span class="sr-only">: {{ item.title }}</span>
    </button>

    <div :id="`cap-${item.id}-panel`" ref="panel" class="invisible h-0 overflow-hidden lg:visible! lg:h-auto! lg:opacity-100!">
      <div class="pt-5 lg:pt-6">
        <p class="leading-relaxed text-fg-muted">{{ item.body }}</p>
        <ul class="mt-5 grid gap-2.5 border-t border-line pt-5">
          <li v-for="p in item.points" :key="p" class="flex items-center gap-3 text-fg">
            <span aria-hidden="true" class="h-px w-4 shrink-0 bg-gold-400" />{{ p }}
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>
