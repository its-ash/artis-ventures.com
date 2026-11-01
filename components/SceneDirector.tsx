'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import type Lenis from 'lenis'
import { keyframes as K } from '@/scene/keyframes'
import { useScene } from '@/scene/store'
import { layout } from '@/scene/view'

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)
// Mobile URL-bar show/hide must not re-measure every trigger.
ScrollTrigger.config({ ignoreMobileResize: true })

const q = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)
const qa = <T extends Element = HTMLElement>(s: string) => gsap.utils.toArray<T>(s)
const span = ([a, b]: readonly [number, number]) => b - a
const pad = (n: number) => String(n).padStart(2, '0')
// Masked text travel (% of the line/char box). Lines are set at line-height 0.9, so glyph
// descenders and ascenders overhang the box; 110% left the "y" tail visible in its mask.
const MASK = 150
// Non-pinned triggers refresh after pins so their positions include pin spacing.
const LATE = { refreshPriority: -1 } as const

let lenis: Lenis | null = null

// Lenis on fine pointers only (loaded on demand), synced to the GSAP ticker; paused until the preloader hands over.
function useLenis() {
  useEffect(() => {
    if (!matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return
    let off = false
    let stop = () => {}
    void import('lenis').then(({ default: L }) => {
      if (!off) stop = startLenis(new L({ autoRaf: false, lerp: 0.1 }))
    })
    return () => {
      off = true
      stop()
    }
  }, [])
}

function startLenis(l: Lenis) {
  lenis = l
  // In-page links: smooth scroll, then move focus to the target (Lenis' own anchors only scroll).
  const onClick = (e: MouseEvent) => {
    const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]')
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const id = decodeURIComponent(a.hash.slice(1))
    const el = id ? document.getElementById(id) : null
    if (!el) return
    e.preventDefault()
    history.pushState(null, '', `#${id}`)
    l.scrollTo(el, {
      onComplete: () => {
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
        el.focus({ preventScroll: true })
      },
    })
  }
  document.addEventListener('click', onClick)
  const raf = (t: number) => l.raf(t * 1000)
  l.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)
  let on: boolean | null = null
  const sync = (e: boolean) => {
    if (e === on) return
    on = e
    if (e) l.start()
    else l.stop()
  }
  sync(useScene.getState().entered)
  const unsub = useScene.subscribe((s) => sync(s.entered))
  return () => {
    unsub()
    document.removeEventListener('click', onClick)
    gsap.ticker.remove(raf)
    l.destroy()
    lenis = null
  }
}

const whenEntered = (fn: () => void) => {
  if (useScene.getState().entered) return fn()
  const unsub = useScene.subscribe((s) => {
    if (!s.entered) return
    unsub()
    fn()
  })
}

// Headlines: masked lines rise. Body: fade + 24px at 80% viewport.
function textReveals(motion: boolean) {
  for (const el of qa('[data-split]')) {
    if (el.id === 'hero-title') continue
    const st = { trigger: el, start: 'top 85%', once: true, ...LATE }
    if (!motion) {
      gsap.from(el, { autoAlpha: 0, duration: 0.8, scrollTrigger: st })
      continue
    }
    SplitText.create(el.firstElementChild!, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'ln',
      aria: 'none',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, { yPercent: MASK, duration: 0.9, ease: 'power4.out', stagger: 0.08, scrollTrigger: st }),
    })
  }
  for (const el of qa('[data-reveal]'))
    gsap.from(el, {
      autoAlpha: 0,
      y: motion ? 24 : 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%', once: true, ...LATE },
    })
}

const syncStageVideo = () => {
  const src = useScene.getState().portalEl
  const dom = q<HTMLVideoElement>('[data-stage] video')
  if (src && dom && Math.abs(dom.currentTime - src.currentTime) > 0.05) dom.currentTime = src.currentTime
}

// Hero (pinned): chars rise on load; on scroll the title lines exit up and the sub lines rise.
function heroDom() {
  const H = K.hero
  const h1 = q('#hero-title > span')
  const label = q('[data-hero-label]')
  const subs = qa('[data-hero-sub] p')
  if (!h1) return null

  const title = SplitText.create(h1, { type: 'chars,lines', mask: 'lines', linesClass: 'ln', aria: 'none' })
  const sub = SplitText.create(subs, { type: 'lines', mask: 'lines', linesClass: 'ln', aria: 'none' })

  gsap.set(title.chars, { yPercent: MASK })
  whenEntered(() => gsap.to(title.chars, { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.025 }))

  const tl = gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '#hero', start: 'top top', end: `+=${layout().heroPin * 100}%`, pin: true, scrub: true, anticipatePin: 1 },
    })
    .fromTo(title.lines, { yPercent: 0 }, { yPercent: -MASK, stagger: 0.02, duration: span(H.headlineOut) * 0.7, ease: 'power2.in', immediateRender: false }, H.headlineOut[0])
    .fromTo(label, { autoAlpha: 1 }, { autoAlpha: 0, duration: span(H.headlineOut) * 0.5, immediateRender: false }, H.headlineOut[0])
    .fromTo(sub.lines, { yPercent: MASK }, { yPercent: 0, stagger: 0.02, duration: span(H.subIn) * 0.7, ease: 'power3.out' }, H.subIn[0])
    .call(syncStageVideo, [], H.handoff[0] - 0.01)
    .set({}, {}, 1)
  return tl.scrollTrigger ?? null
}

// Who We Are: statement words fill 15% → 100% with scroll; each pillar lights as its stroke docks.
function storyDom() {
  const h2 = q('#story-title')
  if (h2) {
    const words = SplitText.create(h2, { type: 'words' }).words
    gsap.fromTo(
      words,
      { opacity: 0.15 },
      { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: h2, start: 'top 80%', end: 'bottom 35%', scrub: true, ...LATE } },
    )
  }
  for (const el of qa('[data-pillar]'))
    gsap.fromTo(
      el,
      { opacity: 0.3 },
      { opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: K.story.pillarRange[0], end: 'top 60%', scrub: true, ...LATE } },
    )
}

// Stack items into one grid cell; only the first shows. Opacity only (not visibility),
// so screen readers still read every item.
const stack = (list: HTMLElement, items: HTMLElement[]) => {
  gsap.set(list, { display: 'grid' })
  gsap.set(items, { gridArea: '1 / 1' })
  gsap.set(items.slice(1), { opacity: 0 })
}

// At a glance (pinned): the label beside each particle numeral swaps; counter syncs.
function glanceDom() {
  const stage = q('[data-glance-stage]')
  const list = q('[data-stats]')
  const items = qa('[data-stat]')
  const count = q('[data-glance-count]')
  if (!stage || !list || !items.length) return null
  const G = K.glance
  const n = items.length
  stack(list, items)
  gsap.set('[data-stat-num]', { autoAlpha: 0 })
  const shown = (p: number) => G.morphs.slice(1).filter((m) => p >= m + G.morphLen / 2).length
  const tl = gsap.timeline({
    defaults: { ease: 'none', immediateRender: false },
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: `+=${layout().pin(G.pin) * 100}%`,
      pin: true,
      scrub: true,
      onUpdate: (st) => count && (count.textContent = `[${pad(shown(st.progress) + 1)}/${pad(n)}]`),
    },
  })
  for (let k = 1; k < n; k++) {
    const p = G.morphs[k]! + G.morphLen / 2
    tl.fromTo(items[k - 1]!, { opacity: 1, y: 0 }, { opacity: 0, y: -24, duration: 0.05 }, p - 0.05).fromTo(
      items[k]!,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.05 },
      p,
    )
  }
  tl.set({}, {}, 1)
  return tl.scrollTrigger ?? null
}

// Capabilities (desktop): cards translate horizontally while pinned; progress bar + counter.
function trackDom() {
  const track = q('[data-track]')
  const rail = q('[data-track-rail]')
  const cards = qa('[data-track-card]')
  const bar = q('[data-track-progress]')
  const count = q('[data-track-count]')
  if (!track || !rail || !cards.length) return null
  const n = cards.length
  gsap.set(rail, { display: 'flex', gap: '1.25rem', width: 'max-content' })
  gsap.set(cards, { width: 'min(34rem, 38vw)', flexShrink: 0 })
  const dist = () => Math.max(0, rail.scrollWidth - track.clientWidth)
  const tl = gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: track,
        start: K.capabilities.trackStart,
        end: () => `+=${Math.max(dist() * 2, innerHeight * 1.5)}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (st) => count && (count.textContent = `[${pad(Math.round(st.progress * (n - 1)) + 1)}/${pad(n)}]`),
      },
    })
    .fromTo(rail, { x: 0 }, { x: () => -dist() }, 0)
  if (bar) tl.fromTo(bar, { scaleX: 1 / n }, { scaleX: 1 }, 0)
  return tl.scrollTrigger ?? null
}

// Full menu: teal underline sweep per row; marquee speed and direction follow scroll velocity.
function menuDom() {
  for (const s of qa('[data-menu-sweep]'))
    gsap.fromTo(
      s,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: s.parentElement, start: 'top 88%', once: true, ...LATE } },
    )

  const track = q('[data-marquee-track]')
  if (!track) return () => {}
  let x = 0
  let dir = 1
  let boost = 0
  const st = ScrollTrigger.create({
    trigger: track,
    start: 'top bottom',
    end: 'bottom top',
    ...LATE,
    onUpdate: (s) => {
      const v = s.getVelocity()
      if (Math.abs(v) > 5) dir = v > 0 ? 1 : -1
      boost = Math.max(boost, Math.min(Math.abs(v) / 250, 10))
    },
  })
  const setX = gsap.quickSetter(track, 'x', 'px')
  // Moves only while the user scrolls (no autonomous motion), then eases to a stop.
  const tick = (_t: number, dt: number) => {
    if (!st.isActive || boost < 0.01) return
    boost *= 0.94
    x = gsap.utils.wrap(-track.scrollWidth / 2, 0, x - dir * boost * dt * 0.06)
    setX(x)
  }
  gsap.ticker.add(tick)
  return () => gsap.ticker.remove(tick)
}

// Approach (pinned): desktop shows all steps, active 100% and others 20%, and snaps to steps.
// Mobile stacks the steps so only the active one shows, keeping the pinned block within the viewport.
function approachDom(desktop: boolean) {
  const stepper = q('[data-stepper]')
  const steps = qa('[data-step]')
  if (!stepper || !steps.length) return { pin: null, off: () => {} }
  const n = steps.length
  const [off, on] = desktop ? [{ opacity: 0.2 }, { opacity: 1 }] : [{ opacity: 0 }, { opacity: 1 }]
  if (desktop) gsap.set(steps.slice(1), off)
  else stack(stepper, steps)
  const tl = gsap.timeline({
    defaults: { ease: 'none', immediateRender: false },
    scrollTrigger: { trigger: stepper, start: 'center center', end: `+=${layout().pin(K.approach.pin) * 100}%`, pin: true, scrub: true },
  })
  for (let k = 1; k < n; k++) {
    const p = (k - 0.5) / (n - 1)
    tl.fromTo(steps[k - 1]!, on, { ...off, duration: 0.08 }, p - 0.04).fromTo(steps[k]!, off, { ...on, duration: 0.08 }, p - 0.04)
  }
  tl.set({}, {}, 1)
  const st = tl.scrollTrigger ?? null
  if (!desktop || !st) return { pin: st, off: () => {} }
  const snap = () => {
    if (!st.isActive) return
    const goal = Math.round(st.progress * (n - 1)) / (n - 1)
    if (Math.abs(goal - st.progress) < 0.01) return
    const y = st.start + (st.end - st.start) * goal
    if (lenis) lenis.scrollTo(y, { duration: 0.7 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }
  ScrollTrigger.addEventListener('scrollEnd', snap)
  return { pin: st, off: () => ScrollTrigger.removeEventListener('scrollEnd', snap) }
}

// Reach (pinned): CMA / FCA / FSC wordmarks, then the two offices, swap with the globe stops.
function reachDom() {
  const stage = q('[data-reach-stage]')
  const list = q('[data-stops]')
  const items = qa('[data-stop]')
  if (!stage || !list || !items.length) return null
  const n = items.length
  stack(list, items)
  const tl = gsap.timeline({
    defaults: { ease: 'none', immediateRender: false },
    scrollTrigger: { trigger: stage, start: 'top top', end: `+=${layout().pin(K.reach.pin) * 100}%`, pin: true, scrub: true },
  })
  for (let k = 1; k < n; k++)
    tl.fromTo(items[k - 1]!, { opacity: 1, yPercent: 0 }, { opacity: 0, yPercent: -12, duration: 0.05 }, k / n - 0.04).fromTo(
      items[k]!,
      { opacity: 0, yPercent: 12 },
      { opacity: 1, yPercent: 0, duration: 0.05 },
      k / n,
    )
  tl.set({}, {}, 1)
  return tl.scrollTrigger ?? null
}

// Leadership: photo clip-path bottom-up with inner scale 1.12 → 1; names rise by line.
function leadershipDom() {
  for (const box of qa('[data-leader-photo]')) {
    const inner = box.firstElementChild
    const tl = gsap.timeline({ scrollTrigger: { trigger: box, start: 'top 80%', once: true, ...LATE } })
    tl.fromTo(box, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power4.inOut' })
    if (inner) tl.fromTo(inner, { scale: 1.12 }, { scale: 1, duration: 1.6, ease: 'power3.out' }, 0)
  }
  for (const h of qa('[data-leader-name]'))
    SplitText.create(h, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'ln',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: MASK,
          duration: 0.9,
          ease: 'power4.out',
          stagger: 0.08,
          scrollTrigger: { trigger: h, start: 'top 85%', once: true, ...LATE },
        }),
    })
}

// Footer: the huge wordmark slides up from behind the fold.
function footerDom() {
  gsap.fromTo(
    '[data-footer-word]',
    { yPercent: 60 },
    { yPercent: 0, ease: 'none', scrollTrigger: { trigger: 'footer', start: 'top bottom', end: 'bottom bottom', scrub: true, ...LATE } },
  )
}

export function SceneDirector() {
  const caps = useScene((s) => s.caps)
  const gl = useScene((s) => s.gl)
  const scenery = useScene((s) => s.scenery)
  useLenis()

  useGSAP(
    () => {
      // With WebGL, wait for the scene choreography chunk so everything is built once, in page order.
      if (!caps || (gl && !scenery)) return
      const mm = gsap.matchMedia()
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1024px)' },
        (ctx) => {
          const { desktop } = ctx.conditions as { motion: boolean; desktop: boolean }
          const motion = !!ctx.conditions?.motion && useScene.getState().motion
          textReveals(motion)
          if (!motion) {
            if (gl) scenery?.stillScene()
            return
          }
          // Pins in page order, then everything else.
          const hero = gl ? heroDom() : null
          storyDom()
          const glance = gl ? glanceDom() : null
          const track = desktop ? trackDom() : null
          const menuOff = menuDom()
          const approach = approachDom(desktop)
          const reach = gl ? reachDom() : null
          leadershipDom()
          footerDom()
          const trackOff =
            scenery && hero ? scenery.sceneTrack(scenery.buildScene({ hero, glance, track, approach: approach.pin, reach })) : () => {}
          return () => {
            menuOff()
            approach.off()
            trackOff()
          }
        },
      )
      document.fonts?.ready.then(() => ScrollTrigger.refresh())
      return () => mm.revert()
    },
    { dependencies: [caps, gl, scenery], revertOnUpdate: true },
  )

  return null
}
