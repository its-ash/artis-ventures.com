import type { MotionConditions } from '~/utils/motion'

/** Reactive media-query flags. SSR renders the mobile-first defaults (all false). */
export const useResponsive = () => {
  const state = reactive<MotionConditions>({ mobile: false, tablet: false, desktop: false, fine: false, reduce: false })
  const lists: [MediaQueryList, () => void][] = []

  onMounted(() => {
    for (const [k, q] of Object.entries(MQ) as [keyof MotionConditions, string][]) {
      const mq = matchMedia(q)
      const sync = () => (state[k] = mq.matches)
      sync()
      mq.addEventListener('change', sync)
      lists.push([mq, sync])
    }
  })

  onBeforeUnmount(() => lists.forEach(([mq, fn]) => mq.removeEventListener('change', fn)))

  return readonly(state)
}
