const PULL = 0.18
const MAX_PX = 8

export default defineNuxtPlugin(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || prefersReducedMotion()) return

  let active: HTMLElement | null = null

  const release = () => {
    if (active) active.style.translate = ''
    active = null
  }

  document.addEventListener(
    'pointermove',
    (e) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('.magnetic')
      if (el !== active) release()
      if (!el) return
      active = el
      const r = el.getBoundingClientRect()
      const clamp = (v: number) => Math.max(-MAX_PX, Math.min(MAX_PX, v * PULL))
      el.style.translate = `${clamp(e.clientX - (r.left + r.width / 2))}px ${clamp(e.clientY - (r.top + r.height / 2))}px`
    },
    { passive: true },
  )

  document.addEventListener('pointerleave', release, { passive: true })
})
