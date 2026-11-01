import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// A segment maps a scroll range (from a ScrollTrigger) to tweens on the scene targets.
// `add` receives the start position and length in scroll pixels.
export type Segment = {
  range: ScrollTrigger
  add: (tl: gsap.core.Timeline, at: number, len: number) => void
}

// One paused timeline in scroll-pixel time owns every scene value, so overlapping
// ScrollTriggers never fight over the same property, whatever the jump size or direction.
export function sceneTrack(segments: Segment[]) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none', immediateRender: false } })
  const build = () => {
    tl.clear()
    for (const s of segments) s.add(tl, s.range.start, Math.max(1, s.range.end - s.range.start))
    tl.time(window.scrollY, true)
  }

  const driver = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (st) => tl.time(st.scroll()) })
  ScrollTrigger.addEventListener('refresh', build)
  build()

  return () => {
    ScrollTrigger.removeEventListener('refresh', build)
    driver.kill()
    tl.kill()
  }
}

// Position inside a segment: fraction f of its length.
export const at = (start: number, len: number, f: number) => start + len * f
