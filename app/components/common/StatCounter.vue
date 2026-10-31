<script setup lang="ts">
const props = withDefaults(defineProps<{ value: number; suffix?: string; delay?: number }>(), { suffix: '', delay: 0 })

const el = ref<HTMLElement>()
const num = ref<HTMLElement>()

useGsap(el, ({ reduce }, { gsap }) => {
  if (reduce || !num.value) return
  const n = num.value
  const o = { v: 0 }
  n.textContent = '0'
  gsap.to(o, {
    v: props.value,
    duration: 1.8,
    delay: props.delay,
    ease: 'power3.out',
    onUpdate: () => void (n.textContent = String(Math.round(o.v))),
    scrollTrigger: { trigger: el.value, start: 'top 88%', once: true },
  })
  return () => void (n.textContent = String(props.value))
})
</script>

<template>
  <span ref="el" class="tabular inline-flex items-baseline">
    <span class="sr-only">{{ value }}{{ suffix }}</span>
    <span aria-hidden="true"><span ref="num">{{ value }}</span><span v-if="suffix" class="accent">{{ suffix }}</span></span>
  </span>
</template>
