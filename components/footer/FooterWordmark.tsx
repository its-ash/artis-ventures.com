'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { keyframes } from '@/scene/keyframes'
import type { WordDrive } from './WordScene'

gsap.registerPlugin(ScrollTrigger)

const WordScene = dynamic(() => import('./WordScene'), { ssr: false })
const F = keyframes.footer

// The server-rendered word (children) is the fallback. With WebGL, a 3D field of columns
// replaces it once it is built; the 3D chunk loads only when the footer comes near.
export function FooterWordmark({ word, children }: { word: string; children: React.ReactNode }) {
  const stage = useRef<HTMLDivElement>(null)
  const layer = useRef<HTMLDivElement>(null)
  const drive: WordDrive = useRef(0)
  const [motion, setMotion] = useState(true)
  const [mount, setMount] = useState(false)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = stage.current
    if (!el) return
    const q = new URLSearchParams(location.search)
    if (q.has('nogl') || !document.documentElement.classList.contains('has-gl')) return
    const still = q.has('reduced') || matchMedia('(prefers-reduced-motion: reduce)').matches
    const io = new IntersectionObserver(
      ([e]) => {
        const on = !!e?.isIntersecting
        if (on) {
          setMotion(!still)
          setMount(true)
        }
        setActive(on)
      },
      { rootMargin: '400px 0px' },
    )
    io.observe(el)
    const sync = (s: ScrollTrigger) => void (drive.current = s.progress)
    const st = ScrollTrigger.create({ trigger: el, start: F.range[0], end: F.range[1], refreshPriority: -1, onUpdate: sync, onRefresh: sync })
    // `?debug` exposes the scroll drive for inspection in the console.
    if (q.has('debug')) Object.assign(window, { __footer: { drive, st } })
    return () => {
      io.disconnect()
      st.kill()
    }
  }, [drive])

  useLayoutEffect(() => {
    if (mount && layer.current) gsap.set(layer.current, { autoAlpha: 0 })
  }, [mount])

  const ready = useCallback(() => {
    const dom = stage.current?.querySelector('[data-footer-word]')
    const d = motion ? 0.6 : 0
    gsap.to(layer.current, { autoAlpha: 1, duration: d, ease: 'power2.out' })
    if (dom) gsap.to(dom, { autoAlpha: 0, duration: d * 0.6, ease: 'power1.out' })
  }, [motion])

  return (
    <div ref={stage} data-footer-stage className="relative">
      {children}
      {mount && (
        <div ref={layer} aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-[8vw] bottom-0">
          <WordScene word={word} drive={drive} motion={motion} active={active} onReady={ready} />
        </div>
      )}
    </div>
  )
}
