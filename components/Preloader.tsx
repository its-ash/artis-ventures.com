'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { A_MARK } from '@/components/brand/Logo'
import { brand } from '@/content/site'
import { keyframes as K } from '@/scene/keyframes'
import { loadProgress, targets, useScene } from '@/scene/store'

gsap.registerPlugin(useGSAP)

// Full-screen loader, server-rendered so it covers the page from the first paint.
// The A fills bottom-up and the counter runs 000→100 with real progress (3D assets with WebGL,
// fonts + hero poster without), then the panel wipes up into the hero.
// No JS: hidden by <noscript>. JS error: a CSS failsafe fades it out after 14 s.
export function Preloader() {
  const caps = useScene((s) => s.caps)
  const root = useRef<HTMLDivElement>(null)
  const num = useRef<HTMLSpanElement>(null)
  const fill = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = root.current
      if (!caps || !el) return
      const { gl, motion } = useScene.getState()
      const scene = gl && motion
      const t = targets()
      const html = document.documentElement
      const shown = { v: 0 }
      const born = performance.now()
      let page = 20
      let done = false
      let unsub = () => {}

      history.scrollRestoration = 'manual'
      window.scrollTo(0, 0)
      html.style.overflow = 'hidden'
      if (scene) {
        t.object.fill = 0
        t.object.wire = 0
        gsap.to(t.video, { opacity: K.preload.backdrop, duration: 0.8 })
      }

      const render = () => {
        const v = shown.v
        if (num.current) num.current.textContent = String(Math.round(v)).padStart(3, '0')
        if (fill.current) fill.current.style.clipPath = `inset(${100 - v}% 0% 0% 0%)`
        if (bar.current) bar.current.style.transform = `scaleX(${v / 100})`
        if (scene) t.object.wire = v / 100
      }

      const progress = () => (scene ? loadProgress(useScene.getState().load) : Math.min(100, page))

      const exit = () => {
        if (done) return
        done = true
        unsub()
        const has3d = scene && useScene.getState().load.chunk
        // 3D failed to load: fall back to the static hero.
        if (scene && !has3d) {
          t.video.opacity = 1
          useScene.setState({ gl: false })
        }
        const tl = gsap.timeline({
          onComplete: () => {
            html.style.overflow = ''
            gsap.set(el, { display: 'none' })
          },
        })
        tl.to(shown, { v: 100, duration: 0.35, ease: 'power2.out', onUpdate: render })
        if (!motion) {
          tl.add(() => useScene.setState({ entered: true })).to(el, { opacity: 0, duration: 0.3 })
          return
        }
        tl.to('[data-loader-glass]', { opacity: 1, duration: 0.35 })
          .add(() => useScene.setState({ entered: true }), '+=0.1')
          .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'power4.inOut' }, '<')
        if (has3d)
          tl.to(t.object, { fill: 1, duration: K.preload.fill, ease: 'power2.inOut' }, '<0.2').to(t.video, { opacity: 0, duration: 1 }, '<')
      }

      const update = () => {
        const p = progress()
        gsap.to(shown, {
          v: p,
          duration: motion ? 0.6 : 0.01,
          ease: 'power2.out',
          overwrite: true,
          onUpdate: render,
          onComplete: () => {
            if (p >= 100 && performance.now() - born >= K.preload.minTime * 1000) exit()
          },
        })
      }

      if (scene) unsub = useScene.subscribe((s, prev) => s.load !== prev.load && update())
      else {
        // Without the 3D scene the page is ready once fonts and the hero poster are in.
        const step = () => {
          page += 40
          update()
        }
        void document.fonts.ready.then(step)
        const img = document.querySelector<HTMLImageElement>('[data-stage] img')
        if (!img || img.complete) step()
        else {
          img.addEventListener('load', step, { once: true })
          img.addEventListener('error', step, { once: true })
        }
      }
      update()
      gsap.delayedCall(K.preload.minTime, () => progress() >= 100 && exit())
      gsap.delayedCall(scene ? K.preload.maxTime : 4, exit)

      return () => {
        unsub()
        html.style.overflow = ''
      }
    },
    { dependencies: [caps] },
  )

  const mark = (
    <g transform={A_MARK.transform}>
      <path d={A_MARK.d} />
    </g>
  )

  return (
    <div
      ref={root}
      data-loader
      data-tone="dark"
      aria-hidden="true"
      className="loader-failsafe fixed inset-0 z-70 flex flex-col bg-graphite-950 text-stone-50"
    >
      <noscript>
        <style>{'[data-loader]{display:none}'}</style>
      </noscript>
      <div className="flex flex-1 flex-col items-center justify-center gap-10">
        <div className="relative w-[min(38vw,11rem)]">
          <svg viewBox={A_MARK.viewBox} className="block w-full" fill="none" stroke="#9aa3ab" strokeOpacity="0.28" strokeWidth="1">
            <g transform={A_MARK.transform}>
              <path d={A_MARK.d} vectorEffect="non-scaling-stroke" />
            </g>
          </svg>
          <div ref={fill} className="absolute inset-0" style={{ clipPath: 'inset(100% 0% 0% 0%)' }}>
            <svg viewBox={A_MARK.viewBox} className="block w-full" fill="none" stroke="#7fd6db" strokeWidth="1.25">
              <g transform={A_MARK.transform}>
                <path d={A_MARK.d} vectorEffect="non-scaling-stroke" />
              </g>
            </svg>
            <svg viewBox={A_MARK.viewBox} className="absolute inset-0 block w-full opacity-0" fill="#33b7c2" fillOpacity="0.22" data-loader-glass>
              {mark}
            </svg>
          </div>
        </div>
        <p className="label text-mist-400">{brand.legalName}</p>
      </div>
      <div className="shell pb-10">
        <div className="flex items-end justify-between gap-6">
          <p className="label text-mist-400">{brand.tagline}</p>
          <p className="label text-[clamp(1.25rem,2vw,1.75rem)] tracking-[0.08em] text-teal-500">
            <span ref={num}>000</span>
          </p>
        </div>
        <div className="relative mt-4 h-px bg-graphite-800">
          <div ref={bar} className="absolute inset-0 origin-left bg-teal-500" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </div>
  )
}
