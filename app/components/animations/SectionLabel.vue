<script setup lang="ts">
defineProps<{ n: string; label: string }>()

const el = ref<HTMLElement>()

useGsap(el, ({ reduce }, { gsap }) => {
  const st = { trigger: el.value, start: 'top 90%', once: true }
  if (reduce) return void gsap.from(el.value!, { autoAlpha: 0, duration: 0.5, ease: 'none', scrollTrigger: st })
  gsap
    .timeline({ scrollTrigger: st })
    .from('[data-n]', { yPercent: 110, duration: 0.9 })
    .from('[data-rule]', { scaleX: 0, duration: 1, ease: 'expo.inOut' }, '<0.1')
    .from('[data-text]', { autoAlpha: 0, x: -12, duration: 0.8 }, '<0.4')
})
</script>

<template>
  <p ref="el" class="flex items-center gap-4">
    <span class="label tabular inline-block overflow-hidden"><span data-n class="inline-block">{{ n }}</span></span>
    <span data-rule aria-hidden="true" class="rule w-10 sm:w-16" />
    <span data-text class="label">{{ label }}</span>
  </p>
</template>
