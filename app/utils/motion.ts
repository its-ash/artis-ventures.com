import type Lenis from 'lenis'

export const MQ = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  fine: '(hover: hover) and (pointer: fine)',
  reduce: '(prefers-reduced-motion: reduce)',
} as const

export type MotionConditions = { -readonly [K in keyof typeof MQ]: boolean }

const HEADER_OFFSET = -64

export const scroller: { lenis: Lenis | null } = { lenis: null }

export const scrollToHash = (hash: string) => {
  const el = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
  if (!el) return false
  scroller.lenis ? scroller.lenis.scrollTo(el, { offset: HEADER_OFFSET, force: true }) : el.scrollIntoView({ block: 'start' })
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
  history.replaceState(null, '', hash)
  return true
}
