<script setup lang="ts">
import type { SplitKind } from '~/composables/useTextReveal'

const props = withDefaults(
  defineProps<{ text: string; accent?: readonly string[]; tag?: 'h1' | 'h2' | 'h3'; split?: SplitKind; delay?: number }>(),
  { accent: () => [], tag: 'h2', split: 'words', delay: 0 },
)

const el = ref<HTMLElement>()
const reveal = useTextReveal()
const words = computed(() => props.text.split(/\s+/).map((w) => ({ w, hl: props.accent.includes(w) })))

useGsap(el, ({ reduce }) => void reveal(el.value, { type: props.split, delay: props.delay, reduce }))
</script>

<template>
  <component :is="tag" ref="el">
    <template v-for="(t, i) in words" :key="i">
      <span v-if="t.hl" class="hl accent">{{ t.w }}</span><template v-else>{{ t.w }}</template>{{ i < words.length - 1 ? ' ' : '' }}
    </template>
  </component>
</template>
