<script setup lang="ts">
defineProps<{ kind: 'circle' | 'grid' | 'path' | 'frame' }>()

const GRID = [40, 100, 160]
</script>

<template>
  <svg viewBox="0 0 200 200" fill="none" aria-hidden="true" class="cap-motif size-full overflow-visible">
    <g stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
      <template v-if="kind === 'circle'">
        <path class="motif-stroke" d="M100 24 A76 76 0 1 1 100 176 A76 76 0 1 1 100 24" pathLength="1" />
        <path class="motif-stroke" d="M100 148 A48 48 0 1 1 100 52 A48 48 0 1 1 100 148" pathLength="1" opacity="0.5" />
        <path class="motif-stroke" d="M100 24 V52" pathLength="1" />
      </template>
      <template v-else-if="kind === 'grid'">
        <path v-for="x in GRID" :key="`v${x}`" class="motif-stroke" :d="`M${x} 24 V176`" pathLength="1" />
        <path v-for="y in GRID" :key="`h${y}`" class="motif-stroke" :d="`M24 ${y} H176`" pathLength="1" />
        <path class="motif-stroke" d="M100 40 H160 V100 H100 Z" pathLength="1" opacity="0.6" />
      </template>
      <template v-else-if="kind === 'path'">
        <path class="motif-stroke" d="M20 164 L64 124 L104 140 L176 52" pathLength="1" />
        <path class="motif-stroke" d="M140 52 H176 V88" pathLength="1" />
        <path class="motif-stroke" d="M20 180 H180" pathLength="1" opacity="0.4" />
      </template>
      <template v-else>
        <path class="motif-stroke" d="M100 18 L182 100 L100 182 L18 100 Z" pathLength="1" />
        <path class="motif-stroke" d="M100 58 L142 100 L100 142 L58 100 Z" pathLength="1" opacity="0.6" />
        <path class="motif-stroke" d="M82 100 L95 113 L120 88" pathLength="1" />
      </template>
    </g>
  </svg>
</template>

<style scoped>
.motif-stroke {
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
}
</style>
