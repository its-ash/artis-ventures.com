import type { Ref } from 'vue'
import type { MotionConditions } from '~/utils/motion'

type Nuxt = ReturnType<typeof useNuxtApp>

export type GsapApi = { gsap: Nuxt['$gsap']; ScrollTrigger: Nuxt['$ScrollTrigger']; SplitText: Nuxt['$SplitText'] }

export type GsapSetup = (c: MotionConditions, api: GsapApi) => void | (() => void)

/** Runs `setup` on mount inside a scoped gsap.matchMedia; re-runs on breakpoint, pointer or motion-preference change and reverts everything on unmount. */
export const useGsap = (scope: Ref<HTMLElement | undefined>, setup: GsapSetup) => {
  const nuxt = useNuxtApp()
  let mm: gsap.MatchMedia | undefined

  onMounted(() => {
    const el = scope.value
    if (!el || !nuxt.$gsap) return
    const api: GsapApi = { gsap: nuxt.$gsap, ScrollTrigger: nuxt.$ScrollTrigger, SplitText: nuxt.$SplitText }
    mm = api.gsap.matchMedia(el)
    mm.add(MQ, (ctx) => setup(ctx.conditions as MotionConditions, api))
  })

  onBeforeUnmount(() => {
    mm?.revert()
    mm = undefined
  })
}
