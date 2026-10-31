import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

const LENIS_LERP = 0.12

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText)
  gsap.defaults({ ease: 'expo.out', duration: 1 })
  ScrollTrigger.config({ ignoreMobileResize: true })

  if (!matchMedia(MQ.reduce).matches && matchMedia(MQ.fine).matches) {
    void import('lenis').then(({ default: Lenis }) => {
      const lenis = new Lenis({ lerp: LENIS_LERP, autoRaf: false, anchors: false, syncTouch: false })
      lenis.on('scroll', ScrollTrigger.update)
      gsap.ticker.add((t) => lenis.raf(t * 1000))
      gsap.ticker.lagSmoothing(0)
      scroller.lenis = lenis
    })
  }

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const hash = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]')?.getAttribute('href')
    if (!hash || hash === '#' || !document.getElementById(decodeURIComponent(hash.slice(1)))) return
    e.preventDefault()
    scrollToHash(hash)
  })

  onNuxtReady(() => document.fonts?.ready.then(() => ScrollTrigger.refresh()))

  return { provide: { gsap, ScrollTrigger, SplitText } }
})
