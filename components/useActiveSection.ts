'use client'

import { useEffect, useState } from 'react'
import { sections, type SectionId } from '@/content/site'

type Active = { id: SectionId; index: number; tone: 'dark' | 'light' }

const first: Active = { id: sections[0].id, index: 0, tone: sections[0].tone }

// Tracks the section under a horizontal probe line (fraction of viewport height).
// IntersectionObserver only: no layout reads during scroll.
export function useActiveSection(probe = 0.04) {
  const [active, setActive] = useState<Active>(first)

  useEffect(() => {
    const els = sections
      .map((s, index) => ({ ...s, index, el: document.getElementById(s.id) }))
      .filter((s): s is typeof s & { el: HTMLElement } => !!s.el)
    if (!els.length) return

    // A section is active while it covers the probe line.
    const line = Math.round(probe * 100)
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting)
        if (!hit) return
        const s = els.find((x) => x.el === hit.target)
        if (!s) return
        const tone = (s.el.dataset.tone as Active['tone']) ?? s.tone
        setActive((a) => (a.id === s.id && a.tone === tone ? a : { id: s.id, index: s.index, tone }))
      },
      { rootMargin: `-${line}% 0px -${100 - line - 1}% 0px`, threshold: 0 },
    )
    els.forEach((s) => io.observe(s.el))
    return () => io.disconnect()
  }, [probe])

  return active
}
