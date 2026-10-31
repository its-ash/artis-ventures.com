<script setup lang="ts">
const props = withDefaults(defineProps<{ delay?: number; active?: boolean }>(), { delay: 0, active: false })

const el = ref<HTMLElement>()

useGsap(el, ({ reduce }, { gsap }) => {
  if (reduce) return
  gsap.fromTo(
    '[data-edge]',
    { strokeDashoffset: 1 },
    { strokeDashoffset: 0, duration: 1.6, delay: props.delay, ease: 'expo.inOut', scrollTrigger: { trigger: el.value?.parentElement, start: 'top 85%', once: true } },
  )
})
</script>

<template>
  <span ref="el" aria-hidden="true" class="pointer-events-none absolute -inset-px">
    <svg class="size-full overflow-visible" preserveAspectRatio="none">
      <rect
        data-edge
        x="0.5"
        y="0.5"
        width="100%"
        height="100%"
        pathLength="1"
        fill="none"
        vector-effect="non-scaling-stroke"
        class="edge"
        :class="{ 'is-active': active }"
      />
    </svg>
  </span>
</template>

<style scoped>
.edge {
  stroke: var(--c-accent);
  stroke-width: 1;
  stroke-dasharray: 1;
  stroke-opacity: 0.45;
  width: calc(100% - 1px);
  height: calc(100% - 1px);
  transition: stroke-opacity 300ms ease;
}

.edge.is-active {
  stroke-opacity: 1;
}
</style>
