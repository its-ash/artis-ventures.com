'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { useGSAP } from '@gsap/react'
import type Lenis from 'lenis'
import { keyframes as K } from '@/scene/keyframes'
import { flux, targets, useScene } from '@/scene/store'
import { layout } from '@/scene/view'

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, useGSAP)
// Mobile URL-bar show/hide must not re-measure every trigger.
ScrollTrigger.config({ ignoreMobileResize: true })

const q = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)
const qa = <T extends Element = HTMLElement>(s: string) => gsap.utils.toArray<T>(s)
const span = ([a, b]: readonly [number, number]) => b - a
const pad = (n: number) => String(n).padStart(2, '0')
// Masked text travel (% of the line/char box). Lines are set at line-height 0.9, so glyph
// descenders and ascenders overhang the box; 110% left the "y" tail visible in its mask.
const MASK = 150
// House motion: long, settling exits of the mask. One vocabulary for every reveal.
const RISE = { duration: 1.2, ease: 'expo.out' } as const
const FADE = { duration: 0.45, ease: 'power1.out' } as const
// Non-pinned triggers refresh after pins so their positions include pin spacing.
const LATE = { refreshPriority: -1 } as const
// Reveals and non-pinned scrubs start this many px before their nominal viewport line.
const EARLY = 300
const early = (pos: string) => `${pos}+=${EARLY}`

// Plays a paused timeline once its trigger enters. A callback trigger has its positions at once; a `once`
// trigger owned by a timeline waits a tick, so another trigger's refresh can fire and kill it mid-loop.
const playOnce = (trigger: Element, start: string, tl: gsap.core.Timeline) =>
  ScrollTrigger.create({ trigger, start, once: true, ...LATE, onEnter: () => void tl.play() })

let lenis: Lenis | null = null

// Lenis on fine pointers only (loaded on demand), synced to the GSAP ticker; paused until the preloader hands over.
function useLenis() {
  useEffect(() => {
    if (!matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return
    let off = false
    let stop = () => {}
    void import('lenis').then(({ default: L }) => {
      if (!off) stop = startLenis(new L({ autoRaf: false, lerp: 0.1, wheelMultiplier: 1 }))
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
    if (!motion) {
      gsap.from(el, { autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: el, start: early('top 88%'), once: true, ...LATE } })
      continue
    }
    // Depth: the headline settles from 94% to full size as it travels up the viewport.
    gsap.fromTo(
      el,
      { scale: 0.94, transformOrigin: '0% 100%' },
      { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: early('top bottom'), end: early('top 45%'), scrub: true, ...LATE } },
    )
    let st: ScrollTrigger | undefined
    SplitText.create(el.firstElementChild!, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'ln',
      aria: 'none',
      autoSplit: true,
      // Lines rise out of the mask with a short fade, so the top edge never reads as a hard cut.
      // A re-split (resize, fonts) replaces both the timeline and its trigger.
      onSplit: (self) => {
        st?.kill()
        const tl = gsap
          .timeline({ paused: true })
          .from(self.lines, { yPercent: MASK, ...RISE, stagger: 0.09 }, 0)
          .from(self.lines, { opacity: 0, ...FADE, stagger: 0.09 }, 0)
        st = playOnce(el, early('top 88%'), tl)
        return tl
      },
    })
  }
  for (const el of qa('[data-reveal]'))
    gsap.from(el, {
      autoAlpha: 0,
      y: motion ? 28 : 0,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: early('top 84%'), once: true, ...LATE },
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

  gsap.set(title.chars, { yPercent: MASK, opacity: 0 })
  whenEntered(() =>
    gsap
      .timeline({ delay: 0.15 })
      .to(title.chars, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.022 }, 0)
      .to(title.chars, { opacity: 1, duration: 0.5, ease: 'power1.out', stagger: 0.022 }, 0),
  )

  const tl = gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '#hero', start: 'top top', end: `+=${layout().heroPin * 100}%`, pin: true, scrub: true, anticipatePin: 1 },
    })
    .fromTo(title.lines, { yPercent: 0 }, { yPercent: -MASK, stagger: 0.025, duration: span(H.headlineOut) * 0.75, ease: 'power2.inOut', immediateRender: false }, H.headlineOut[0])
    .fromTo(label, { autoAlpha: 1 }, { autoAlpha: 0, duration: span(H.headlineOut) * 0.5, immediateRender: false }, H.headlineOut[0])
    .fromTo(sub.lines, { yPercent: MASK }, { yPercent: 0, stagger: 0.03, duration: span(H.subIn) * 0.8, ease: 'power2.out' }, H.subIn[0])
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
      { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: h2, start: early('top 80%'), end: early('bottom 35%'), scrub: true, ...LATE } },
    )
  }
  for (const el of qa('[data-pillar]'))
    gsap.fromTo(
      el,
      { opacity: 0.3 },
      { opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: early(K.story.pillarRange[0]), end: early('top 60%'), scrub: true, ...LATE } },
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
    // Outgoing label drifts up while the next drifts in: an overlapping cross-fade, not a cut.
    tl.fromTo(items[k - 1]!, { opacity: 1, y: 0 }, { opacity: 0, y: -40, duration: 0.08, ease: 'power1.in' }, p - 0.06).fromTo(
      items[k]!,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.08, ease: 'power1.out' },
      p - 0.02,
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
      // The cubes read this eased progress, so they never run ahead of the cards.
      onUpdate: () => void (targets().blocks.active = tl.progress() * (n - 1)),
      scrollTrigger: {
        trigger: track,
        start: K.capabilities.trackStart,
        end: () => `+=${Math.max(dist() * 1.4, innerHeight)}`,
        pin: true,
        scrub: 0.8,
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
      { scaleX: 1, duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: s.parentElement, start: early('top 88%'), once: true, ...LATE } },
    )

  const track = q('[data-marquee-track]')
  if (!track) return () => {}
  let x = 0
  let dir = 1
  let boost = 0
  // Width is read on refresh only: no layout reads inside the ticker.
  let half = track.scrollWidth / 2
  const st = ScrollTrigger.create({
    trigger: track,
    start: 'top bottom',
    end: 'bottom top',
    ...LATE,
    onRefresh: () => void (half = track.scrollWidth / 2),
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
    x = gsap.utils.wrap(-half, 0, x - dir * boost * dt * 0.06)
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
    tl.fromTo(steps[k - 1]!, on, { ...off, duration: 0.1, ease: 'power1.inOut' }, p - 0.05).fromTo(
      steps[k]!,
      off,
      { ...on, duration: 0.1, ease: 'power1.inOut' },
      p - 0.05,
    )
  }
  tl.set({}, {}, 1)
  const st = tl.scrollTrigger ?? null
  if (!desktop || !st) return { pin: st, off: () => {} }
  // Gentle settle: only when the user stops near a step, never a yank from mid-way.
  const snap = () => {
    if (!st.isActive) return
    const goal = Math.round(st.progress * (n - 1)) / (n - 1)
    const gap = Math.abs(goal - st.progress)
    if (gap < 0.005 || gap > 0.35 / (n - 1)) return
    const y = st.start + (st.end - st.start) * goal
    if (lenis) lenis.scrollTo(y, { duration: 1.1, easing: (t: number) => 1 - Math.pow(1 - t, 3) })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }
  ScrollTrigger.addEventListener('scrollEnd', snap)
  return { pin: st, off: () => ScrollTrigger.removeEventListener('scrollEnd', snap) }
}

// Reach (pinned): CMA / FCA / FSC, then the two offices, swap one at a time while the globe turns to each stop.
function reachDom() {
  const stage = q('[data-reach-stage]')
  const box = q('[data-stops]')
  const groups = qa('[data-stop-group]')
  const items = qa('[data-stop]')
  if (!stage || !box || !groups.length || !items.length) return null
  const n = items.length
  // Groups (regulators, offices) share one cell; inside each group its stops share one cell.
  stack(box, groups)
  for (const g of groups) {
    const list = g.querySelector<HTMLElement>('[data-stop-list]')
    if (list) stack(list, gsap.utils.toArray<HTMLElement>('[data-stop]', g))
  }
  const groupOf = (el: HTMLElement) => el.closest<HTMLElement>('[data-stop-group]')
  const tl = gsap.timeline({
    defaults: { ease: 'none', immediateRender: false },
    scrollTrigger: { trigger: stage, start: 'top top', end: `+=${layout().pin(K.reach.pin) * 100}%`, pin: true, scrub: true },
  })
  for (let k = 1; k < n; k++) {
    const [a, b] = [items[k - 1]!, items[k]!]
    const [ga, gb] = [groupOf(a), groupOf(b)]
    tl.fromTo(a, { opacity: 1, yPercent: 0 }, { opacity: 0, yPercent: -12, duration: 0.05 }, k / n - 0.04).fromTo(
      b,
      { opacity: 0, yPercent: 12 },
      { opacity: 1, yPercent: 0, duration: 0.05 },
      k / n,
    )
    // Crossing from regulators to offices: the group (label, caption) swaps with the stop.
    if (ga && gb && ga !== gb)
      tl.fromTo(ga, { opacity: 1 }, { opacity: 0, duration: 0.05 }, k / n - 0.04).fromTo(gb, { opacity: 0 }, { opacity: 1, duration: 0.05 }, k / n)
  }
  tl.set({}, {}, 1)
  return tl.scrollTrigger ?? null
}

// Leadership: photo clip-path bottom-up with inner scale 1.12 → 1; names rise by line.
function leadershipDom() {
  for (const box of qa('[data-leader-photo]')) {
    const inner = box.firstElementChild
    const tl = gsap.timeline({ paused: true })
    tl.fromTo(box, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power4.inOut' })
    if (inner) tl.fromTo(inner, { scale: 1.12 }, { scale: 1, duration: 1.6, ease: 'power3.out' }, 0)
    playOnce(box, early('top 80%'), tl)
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
          scrollTrigger: { trigger: h, start: early('top 85%'), once: true, ...LATE },
        }),
    })
}

// Scroll velocity → `flux`: the scene warps with the scroll speed and settles when it stops.
function fluxDom() {
  let raw = 0
  const st = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (s) => void (raw = gsap.utils.clamp(-1, 1, s.getVelocity() / 3200)),
  })
  const tick = (_t: number, dt: number) => {
    raw *= Math.pow(0.9, dt / 16.7)
    const k = 1 - Math.pow(0.88, dt / 16.7)
    flux.v += (raw - flux.v) * k
    flux.a = Math.abs(flux.v)
  }
  gsap.ticker.add(tick)
  return () => {
    gsap.ticker.remove(tick)
    st.kill()
    flux.v = flux.a = 0
  }
}

// Section labels decode from glyph noise as they enter.
const GLYPHS = '01<>/[]+=#'
function labelDom() {
  for (const el of qa('[data-scramble]')) {
    const text = el.textContent ?? ''
    if (!text.trim()) continue
    gsap.to(el, {
      duration: Math.min(1.4, 0.5 + text.length * 0.03),
      ease: 'none',
      scrambleText: { text, chars: GLYPHS, speed: 0.5, revealDelay: 0.15 },
      scrollTrigger: { trigger: el, start: early('top 90%'), once: true, ...LATE },
    })
  }
}

// Footer wordmark: letters rise one after another and their fill sweeps up with the scroll;
// while the footer is in view they float in a slow wave and a light band crosses the word.
// On fine pointers a hovered letter stretches up and its fill fades to show the teal outline.
function footerDom() {
  const chars = qa('[data-footer-char]')
  const st = { trigger: 'footer', start: early('top bottom'), end: 'bottom bottom', scrub: true, ...LATE }
  const inView = { trigger: 'footer', start: early('top 60%'), toggleActions: 'play pause resume pause', ...LATE }
  gsap
    .timeline({ defaults: { ease: 'none' }, scrollTrigger: st })
    .fromTo(chars, { yPercent: 70 }, { yPercent: 0, stagger: 0.08, duration: 0.6 }, 0)
    .fromTo('[data-footer-fill]', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', stagger: 0.08, duration: 0.6 }, 0.25)
  // `y` composes with the scrubbed `yPercent`, so the wave rides on top of the rise.
  gsap.to(chars, { y: -14, duration: 2.2, ease: 'sine.inOut', stagger: { each: 0.18, repeat: -1, yoyo: true }, scrollTrigger: inView })
  const off: (() => void)[] = []
  if (matchMedia('(hover: hover) and (pointer: fine)').matches)
    for (const ch of chars) {
      const fill = ch.querySelector('[data-footer-fill]')
      const over = () => {
        gsap.to(ch, { scaleY: 1.08, transformOrigin: '50% 100%', duration: 0.45, ease: 'power3.out', overwrite: 'auto' })
        gsap.to(fill, { opacity: 0.15, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
      }
      const out = () => {
        gsap.to(ch, { scaleY: 1, duration: 0.35, ease: 'power3.out', overwrite: 'auto' })
        gsap.to(fill, { opacity: 1, duration: 0.25, ease: 'power2.out', overwrite: 'auto' })
      }
      ch.addEventListener('pointerenter', over)
      ch.addEventListener('pointerleave', out)
      off.push(() => {
        ch.removeEventListener('pointerenter', over)
        ch.removeEventListener('pointerleave', out)
      })
    }
  gsap.fromTo(
    '[data-footer-glint]',
    { clipPath: 'inset(0% 100% 0% -12%)' },
    {
      clipPath: 'inset(0% -12% 0% 100%)',
      duration: 2.6,
      ease: 'power1.inOut',
      repeat: -1,
      repeatDelay: 2.4,
      scrollTrigger: inView,
    },
  )
  return () => off.forEach((fn) => fn())
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
          // With WebGL the footer word is a 3D scene of its own (FooterWordmark).
          const footerOff = gl ? () => {} : footerDom()
          labelDom()
          const fluxOff = gl ? fluxDom() : () => {}
          const trackOff =
            scenery && hero ? scenery.sceneTrack(scenery.buildScene({ hero, glance, track, approach: approach.pin, reach })) : () => {}
          return () => {
            menuOff()
            footerOff()
            fluxOff()
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
