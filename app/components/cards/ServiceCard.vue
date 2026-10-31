<script setup lang="ts">
import { PhArrowRight, PhPlus } from '@phosphor-icons/vue'
import type { services } from '~/data/site'

const props = defineProps<{ item: (typeof services)[number]; index: number }>()

const panel = ref<HTMLElement>()
const open = ref(false)
const { toggleHeight } = useScrollAnimation()
const track = useTrack()

const toggle = () => {
  open.value = !open.value
  toggleHeight(panel.value, open.value, prefersReducedMotion())
  track('accordion_toggle', { section: 'services', item: props.item.id, open: open.value })
}
</script>

<template>
  <article class="panel relative bg-[#f7f8fa] p-6 sm:p-8" :class="{ 'is-active': open }" :aria-labelledby="`${item.id}-title`">
    <DrawBorder :delay="index * 0.1" :active="open" />
    <div class="flex items-baseline justify-between gap-4">
      <span class="label tabular">{{ String(index + 1).padStart(2, '0') }} / {{ item.items.length }} services</span>
    </div>
    <h3 :id="`${item.id}-title`" class="mt-6 font-display text-[1.875rem] leading-[1.1] sm:text-4xl">{{ item.title }}</h3>
    <p class="mt-3 max-w-[40ch] leading-relaxed text-fg-muted">{{ item.lead }}</p>

    <button
      type="button"
      class="mt-5 flex min-h-12 items-center gap-3 font-mono text-xs tracking-[0.16em] text-fg uppercase"
      :aria-expanded="open"
      :aria-controls="`${item.id}-panel`"
      @click="toggle"
    >
      <span class="grid size-8 place-items-center border border-line-strong">
        <PhPlus :size="14" aria-hidden="true" class="transition-transform duration-300" :class="open && 'rotate-45'" />
      </span>
      {{ open ? 'Hide services' : 'View services' }}<span class="sr-only">: {{ item.title }}</span>
    </button>

    <div :id="`${item.id}-panel`" ref="panel" class="invisible h-0 overflow-hidden">
      <ul class="mt-4 grid gap-3 border-t border-line pt-5">
        <li v-for="it in item.items" :key="it" class="flex gap-3 leading-snug">
          <span aria-hidden="true" class="mt-[0.6em] h-px w-4 shrink-0 bg-gold-700" />{{ it }}
        </li>
      </ul>
      <a href="#contact" class="link-gold mt-3" @click="track('cta_click', { location: 'services', item: item.id, action: 'discuss' })">
        Discuss this service<span class="sr-only">: {{ item.title }}</span>
        <PhArrowRight :size="16" aria-hidden="true" class="arrow-nudge" />
      </a>
    </div>
  </article>
</template>
