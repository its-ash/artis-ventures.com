type Trigger = Element | string

type RevealOpts = { trigger: Trigger; y?: number; x?: number; stagger?: number; delay?: number; start?: string; reduce?: boolean }
type ScrubOpts = { trigger: Trigger; start?: string; end?: string; reduce?: boolean }

const START = 'top 85%'

export const useScrollAnimation = () => {
  const nuxt = useNuxtApp()
  const g = () => nuxt.$gsap

  const reveal = (targets: gsap.TweenTarget, { trigger, y = 36, x = 0, stagger = 0.08, delay = 0, start = START, reduce }: RevealOpts) =>
    g().from(targets, {
      autoAlpha: 0,
      y: reduce ? 0 : y,
      x: reduce ? 0 : x,
      duration: reduce ? 0.5 : 1.1,
      ease: reduce ? 'none' : 'expo.out',
      stagger: reduce ? 0 : stagger,
      delay,
      scrollTrigger: { trigger, start, once: true },
    })

  const drawLine = (target: gsap.TweenTarget, { trigger, start = 'top 80%', end = 'bottom 60%', reduce, axis = 'x' }: ScrubOpts & { axis?: 'x' | 'y' }) => {
    if (reduce) return
    const prop = axis === 'x' ? 'scaleX' : 'scaleY'
    return g().fromTo(target, { [prop]: 0 }, { [prop]: 1, ease: 'none', scrollTrigger: { trigger, start, end, scrub: 0.6 } })
  }

  const parallax = (target: gsap.TweenTarget, { trigger, from = -8, to = 8, scale = 1, reduce }: ScrubOpts & { from?: number; to?: number; scale?: number }) => {
    if (reduce) return
    return g().fromTo(
      target,
      { yPercent: from, scale },
      { yPercent: to, scale, ease: 'none', scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true } },
    )
  }

  const clipReveal = (target: gsap.TweenTarget, { trigger, start = 'top 80%', reduce }: ScrubOpts) =>
    reduce
      ? g().from(target, { autoAlpha: 0, duration: 0.5, ease: 'none', scrollTrigger: { trigger, start, once: true } })
      : g().fromTo(
          target,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger, start, once: true } },
        )

  const toggleHeight = (el: HTMLElement | undefined, open: boolean, reduce = false) => {
    if (!el) return
    const gsap = g()
    gsap.killTweensOf(el)
    const done = () => nuxt.$ScrollTrigger.refresh()
    if (open) {
      gsap.fromTo(el, { height: 0, autoAlpha: 0 }, { height: 'auto', autoAlpha: 1, duration: reduce ? 0.2 : 0.7, ease: reduce ? 'none' : 'expo.out', onComplete: done })
      return
    }
    gsap.to(el, { height: 0, autoAlpha: 0, duration: reduce ? 0.15 : 0.45, ease: reduce ? 'none' : 'expo.inOut', onComplete: done })
  }

  return { reveal, drawLine, parallax, clipReveal, toggleHeight }
}
