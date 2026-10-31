export type SplitKind = 'chars' | 'words' | 'lines'

type Opts = {
  type?: SplitKind
  trigger?: Element
  start?: string
  stagger?: number
  delay?: number
  duration?: number
  reduce?: boolean
  /** Add to this timeline instead of creating a ScrollTrigger. */
  timeline?: gsap.core.Timeline
  position?: gsap.Position
}

const SPLIT: Record<SplitKind, string> = { chars: 'words,chars', words: 'words', lines: 'lines' }
const STAGGER: Record<SplitKind, number> = { chars: 0.018, words: 0.06, lines: 0.1 }

export const useTextReveal = () => {
  const nuxt = useNuxtApp()

  return (el: HTMLElement | undefined, o: Opts = {}) => {
    if (!el) return
    const { $gsap: gsap, $SplitText: SplitText } = nuxt
    const type = o.type ?? 'words'
    const hl = el.querySelectorAll('.hl')
    const scrollTrigger = o.timeline ? undefined : { trigger: o.trigger ?? el, start: o.start ?? 'top 85%', once: true }

    if (o.reduce) {
      gsap.set(hl, { '--lit': '100%' })
      const tween = gsap.from(el, { autoAlpha: 0, duration: 0.5, ease: 'none', delay: o.delay ?? 0, scrollTrigger })
      o.timeline?.add(tween, o.position)
      return
    }

    return SplitText.create(el, {
      type: SPLIT[type],
      mask: type === 'chars' ? 'words' : type,
      aria: 'auto',
      autoSplit: type === 'lines' && !o.timeline,
      onSplit(self) {
        const parts = type === 'chars' ? self.chars : type === 'lines' ? self.lines : self.words
        const tl = gsap.timeline({ delay: o.delay ?? 0, scrollTrigger })
        tl.from(parts, {
          yPercent: 115,
          rotate: type === 'lines' ? 0 : type === 'chars' ? 8 : 3,
          transformOrigin: '0% 100%',
          duration: o.duration ?? 1.1,
          ease: 'expo.out',
          stagger: o.stagger ?? STAGGER[type],
        })
        if (hl.length) tl.to(hl, { '--lit': '100%', duration: 0.9, ease: 'expo.inOut', stagger: 0.12 }, '-=0.6')
        o.timeline?.add(tl, o.position)
        return tl
      },
    })
  }
}
