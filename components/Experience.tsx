'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import gsap from 'gsap'
import { SceneDirector } from '@/components/SceneDirector'
import { targets, useScene } from '@/scene/store'

const SceneCanvas = dynamic(() => import('@/components/scene/SceneCanvas'), { ssr: false })

const hasWebGL = () => {
  try {
    const ctx = document.createElement('canvas').getContext('webgl2')
    ctx?.getExtension('WEBGL_lose_context')?.loseContext()
    return !!ctx
  } catch {
    return false
  }
}

// Applies store video values to the fixed stage video; pauses it while invisible.
function useStageVideo(gl: boolean, motion: boolean) {
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('[data-stage]')
    const vid = el?.querySelector('video')
    if (!el || !vid) return

    // Reduced motion: decorative videos hold their poster frame.
    if (!motion) {
      for (const v of document.querySelectorAll<HTMLVideoElement>('video[data-video]')) {
        v.autoplay = false
        v.pause()
      }
    }

    if (!gl) {
      const hero = document.getElementById('hero')
      if (!hero) return
      if (!motion) return
      const io = new IntersectionObserver(([e]) => (e?.isIntersecting ? vid.play().catch(() => {}) : vid.pause()))
      io.observe(hero)
      return () => io.disconnect()
    }

    const alt = document.querySelector<HTMLElement>('[data-stage-alt]')
    const altVid = alt?.querySelector('video')
    const show = (v: HTMLVideoElement, on: boolean) => (on && motion ? v.paused && v.play().catch(() => {}) : v.pause())
    const stone = document.querySelector<HTMLElement>('[data-stone]')
    let last = ''
    let lastAlt = -1
    let lastStone = -1
    const tick = () => {
      const { video: v, video2, stone: st } = targets()
      if (stone && Math.abs(st.opacity - lastStone) > 1e-3) {
        lastStone = st.opacity
        stone.style.opacity = String(st.opacity)
      }
      const key = `${v.opacity.toFixed(3)}|${v.blur.toFixed(1)}|${v.scale.toFixed(3)}`
      if (key !== last) {
        last = key
        el.style.opacity = String(v.opacity)
        el.style.filter = v.blur > 0.05 ? `blur(${v.blur}px)` : ''
        el.style.transform = v.scale !== 1 ? `scale(${v.scale})` : ''
        show(vid, v.opacity >= 0.005)
      }
      if (alt && altVid && Math.abs(video2.opacity - lastAlt) > 1e-3) {
        lastAlt = video2.opacity
        alt.style.opacity = String(video2.opacity)
        alt.style.display = video2.opacity < 0.005 ? '' : 'block'
        show(altVid, video2.opacity >= 0.005)
      }
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      el.style.cssText = ''
      if (alt) alt.style.cssText = ''
      if (stone) stone.style.cssText = ''
    }
  }, [gl, motion])
}

export function Experience() {
  const gl = useScene((s) => s.gl)
  const motion = useScene((s) => s.motion)

  useEffect(() => {
    // `?nogl` and `?reduced` force the fallbacks for testing.
    const q = new URLSearchParams(location.search)
    const ok = !q.has('nogl') && (document.documentElement.classList.contains('has-gl') || hasWebGL())
    const motion = !q.has('reduced') && !matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = matchMedia('(max-width: 1023px), (pointer: coarse)').matches
    // `entered` flips when the loader leaves (smooth scroll and the hero intro wait for it).
    useScene.setState({ caps: true, gl: ok, motion, mobile, quality: mobile ? 1 : 3, entered: false })
    // `?debug` exposes the scene store for inspection in the console.
    if (q.has('debug')) Object.assign(window, { __scene: useScene })
  }, [])

  const caps = useScene((s) => s.caps)
  useEffect(() => {
    if (!caps) return
    document.documentElement.classList.toggle('has-gl', gl)
    return () => document.documentElement.classList.remove('has-gl')
  }, [caps, gl])

  useStageVideo(gl, motion)

  useEffect(() => {
    if (!gl || useScene.getState().scenery) return
    void import('@/scene/scenery').then((m) => useScene.setState({ scenery: m }))
  }, [gl])

  return (
    <>
      {gl && <SceneCanvas />}
      <SceneDirector />
    </>
  )
}
