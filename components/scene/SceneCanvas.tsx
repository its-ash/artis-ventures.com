'use client'

import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, PerformanceMonitor, useProgress } from '@react-three/drei'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import gsap from 'gsap'
import { ApproachPath } from '@/components/scene/ApproachPath'
import { Arch } from '@/components/scene/Arch'
import { Blocks } from '@/components/scene/Blocks'
import { CameraRig } from '@/components/scene/CameraRig'
import { DotGlobe } from '@/components/scene/DotGlobe'
import { ParticleMorph } from '@/components/scene/ParticleMorph'
import { Shards } from '@/components/scene/Shards'
import { keyframes as K } from '@/scene/keyframes'
import { targets, useScene, type Quality } from '@/scene/store'

const HIDDEN = 0.001

// Loader progress is only real once the suspended assets have resolved; until then cap it below 1.
function LoadBridge() {
  const progress = useProgress((s) => s.progress)
  useEffect(() => {
    useScene.setState((s) => ({
      load: { ...s.load, chunk: true, assets: s.load.assets >= 1 ? 1 : Math.min(0.95, progress / 100) },
    }))
  }, [progress])
  return null
}

function AssetsReady() {
  useEffect(() => useScene.setState((s) => ({ load: { ...s.load, assets: 1 } })), [])
  return null
}

// Pause rendering while the canvas is invisible.
function FrameGate() {
  const setFrameloop = useThree((s) => s.setFrameloop)
  useEffect(() => {
    let on = true
    const tick = () => {
      const vis = targets().canvas.opacity > HIDDEN
      if (vis === on) return
      on = vis
      setFrameloop(vis ? 'always' : 'demand')
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [setFrameloop])
  return null
}

function Effects() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.55} />
      <Noise premultiply opacity={0.03} />
      <Vignette offset={0.3} darkness={0.55} />
    </EffectComposer>
  )
}

export default function SceneCanvas() {
  const quality = useScene((s) => s.quality)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let last = -1
    const tick = () => {
      const o = targets().canvas.opacity
      if (!wrap.current || Math.abs(o - last) < 1e-3) return
      last = o
      wrap.current.style.opacity = String(o)
      wrap.current.style.visibility = o > HIDDEN ? 'visible' : 'hidden'
    }
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [])

  const step = (dir: -1 | 1) =>
    useScene.setState((s) => ({ quality: Math.min(3, Math.max(0, s.quality + dir)) as Quality }))

  return (
    <div ref={wrap} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        dpr={quality >= 2 ? [1, 1.75] : quality === 1 ? [1, 1.5] : 1}
        gl={{ alpha: true, antialias: quality >= 2, powerPreference: 'high-performance', stencil: false }}
        camera={{ position: [K.hero.idle.camera.x, K.hero.idle.camera.y, K.hero.idle.camera.z], fov: K.hero.idle.camera.fov, near: 0.05, far: 60 }}
      >
        <PerformanceMonitor flipflops={3} onDecline={() => step(-1)} onFallback={() => useScene.setState({ quality: 1 })} />
        <LoadBridge />
        <FrameGate />
        <CameraRig />
        <Suspense fallback={null}>
          <Environment files="/hdri/city_512.hdr" environmentIntensity={0.9} />
          <AssetsReady />
        </Suspense>
        <Arch />
        <Shards />
        <ParticleMorph />
        <Blocks />
        <ApproachPath />
        <DotGlobe />
        {quality >= 3 && <Effects />}
      </Canvas>
    </div>
  )
}
