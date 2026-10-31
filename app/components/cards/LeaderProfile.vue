<script setup lang="ts">
import { PhPlus } from '@phosphor-icons/vue'
import type { leaders } from '~/data/site'

const props = defineProps<{ leader: (typeof leaders)[number]; index: number }>()

const el = ref<HTMLElement>()
const name = ref<HTMLElement>()
const bio = ref<HTMLElement>()
const img = ref<HTMLImageElement>()
const failed = ref(false)
const open = ref(false)
const text = useTextReveal()
const { reveal, clipReveal, parallax, toggleHeight } = useScrollAnimation()
const track = useTrack()

const initials = props.leader.name
  .split(/\s+/)
  .map((p) => p[0])
  .join('')

const toggle = () => {
  open.value = !open.value
  toggleHeight(bio.value, open.value, prefersReducedMotion())
  track('profile_toggle', { leader: props.leader.id, open: open.value })
}

onMounted(() => {
  if (img.value?.complete && img.value.naturalWidth === 0) failed.value = true
})

useGsap(el, ({ reduce }) => {
  clipReveal('[data-portrait]', { trigger: el.value!, reduce })
  parallax('[data-portrait-inner]', { trigger: '[data-portrait]', from: -8, to: 8, scale: 1.12, reduce })
  text(name.value, { type: 'chars', trigger: el.value, start: 'top 70%', reduce })
  reveal('[data-copy]', { trigger: el.value!, start: 'top 65%', stagger: 0.1, delay: 0.3, reduce })
})
</script>

<template>
  <article ref="el" class="grid gap-8 md:grid-cols-12 md:items-center md:gap-12 lg:gap-20" :aria-labelledby="`${leader.id}-name`">
    <div data-portrait class="relative aspect-[4/5] overflow-hidden bg-ink-800 md:col-span-5" :class="{ 'md:order-2 md:col-start-8': index % 2 }">
      <div data-portrait-inner class="absolute -inset-y-[10%] inset-x-0">
        <img
          v-if="!failed"
          ref="img"
          :src="leader.photo"
          :alt="`Portrait of ${leader.name}`"
          width="800"
          height="1000"
          loading="lazy"
          decoding="async"
          class="size-full object-cover grayscale-[0.4]"
          @error="failed = true"
        />
        <div v-else aria-hidden="true" class="grid size-full place-items-center bg-[radial-gradient(80%_60%_at_50%_30%,var(--color-ink-600),var(--color-ink-900))]">
          <span class="font-display text-[clamp(5rem,22vw,9rem)] leading-none text-gold-300/80">{{ initials }}</span>
        </div>
      </div>
      <div aria-hidden="true" class="pointer-events-none absolute inset-3 border border-gold-400/25" />
      <span class="label absolute top-6 left-6 tabular">{{ String(index + 1).padStart(2, '0') }}</span>
    </div>

    <div class="md:col-span-7" :class="{ 'md:order-1 md:col-span-6 md:col-start-1': index % 2 }">
      <p data-copy class="label">{{ leader.role }}</p>
      <h3 :id="`${leader.id}-name`" ref="name" class="mt-4 font-display text-[clamp(2.75rem,10vw,5rem)] leading-[1] font-medium tracking-[-0.02em]">{{ leader.name }}</h3>
      <p data-copy class="mt-6 max-w-[34ch] font-display text-xl leading-snug sm:text-2xl">{{ leader.summary }}</p>

      <div :id="`${leader.id}-bio`" ref="bio" class="invisible h-0 overflow-hidden">
        <div class="mt-5 grid max-w-[56ch] gap-4 border-t border-line pt-5 leading-relaxed text-fg-muted">
          <p v-for="p in leader.bio" :key="p">{{ p }}</p>
        </div>
      </div>

      <button
        type="button"
        data-copy
        class="mt-5 flex min-h-12 items-center gap-3 font-mono text-xs tracking-[0.16em] uppercase"
        :aria-expanded="open"
        :aria-controls="`${leader.id}-bio`"
        @click="toggle"
      >
        <span class="grid size-8 place-items-center border border-line-strong">
          <PhPlus :size="14" aria-hidden="true" class="transition-transform duration-300" :class="open && 'rotate-45'" />
        </span>
        {{ open ? 'Show less' : 'Read full profile' }}<span class="sr-only">: {{ leader.name }}</span>
      </button>
    </div>
  </article>
</template>
