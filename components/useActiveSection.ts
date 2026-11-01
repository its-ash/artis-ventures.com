'use client'

import { useEffect, useState } from 'react'
import { sections, type SectionId } from '@/content/site'

type Active = { id: SectionId; index: number; tone: 'dark' | 'light' }

const first: Active = { id: sections[0].id, index: 0, tone: sections[0].tone }

// Tracks the section under a horizontal probe line (fraction of viewport height).
export function useActiveSection(probe = 0.04) {
  const [active, setActive] = useState<Active>(first)

  useEffect(() => {
    const els = sections
      .map((s, index) => ({ ...s, index, el: document.getElementById(s.id) }))
      .filter((s): s is typeof s & { el: HTMLElement } => !!s.el)
    if (!els.length) return

    let raf = 0
    const read = () => {
      raf = 0
      const y = window.innerHeight * probe
      const hit = els.findLast((s) => s.el.getBoundingClientRect().top <= y) ?? els[0]!
      const tone = (hit.el.dataset.tone as Active['tone']) ?? hit.tone
      setActive((a) => (a.id === hit.id && a.tone === tone ? a : { id: hit.id, index: hit.index, tone }))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [probe])

  return active
}
