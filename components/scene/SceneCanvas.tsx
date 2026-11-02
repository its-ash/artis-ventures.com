'use client'

import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, PerformanceMonitor, useProgress } from '@react-three/drei'
import { Bloom, ChromaticAberration, EffectComposer, Noise, Scanline, Vignette } from '@react-three/postprocessing'
import type { ScanlineEffect } from 'postprocessing'
import gsap from 'gsap'
import { ApproachPath } from '@/components/scene/ApproachPath'
import { Arch } from '@/components/scene/Arch'
import { Blocks } from '@/components/scene/Blocks'
import { CameraRig } from '@/components/scene/CameraRig'
import { DotGlobe } from '@/components/scene/DotGlobe'
import { NumeralMatrix } from '@/components/scene/NumeralMatrix'
import { Shards } from '@/components/scene/Shards'
import { Starfield } from '@/components/scene/Starfield'
import { keyframes as K } from '@/scene/keyframes'
import { flux, targets, useScene, type Quality } from '@/scene/store'

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

// Lens split and holographic scanlines grow with scroll speed (the uniform holds this vector by reference).
const SPLIT = 0.0022
const SCAN = { density: 1.4, rest: 0.035, boost: 0.16 }

function Effects() {
  const offset = useMemo(() => new THREE.Vector2(), [])
  const scan = useRef<ScanlineEffect>(null)
  useFrame(() => {
    offset.set(flux.v * SPLIT, flux.a * SPLIT * 0.4)
    if (scan.current) scan.current.blendMode.opacity.value = SCAN.rest + flux.a * SCAN.boost
  })
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.55} />
      <ChromaticAberration offset={offset} radialModulation modulationOffset={0.25} />
      <Scanline ref={scan} density={SCAN.density} opacity={SCAN.rest} />
      <Noise premultiply opacity={0.03} />
      <Vignette offset={0.3} darkness={0.55} />
    </EffectComposer>
  )
}

export default function SceneCanvas() {
  const quality = useScene((s) => s.quality)
  const mobile = useScene((s) => s.mobile)
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
        dpr={mobile ? [1, quality >= 1 ? 1.25 : 1] : quality >= 2 ? [1, 1.5] : quality === 1 ? [1, 1.25] : 1}
        gl={{ alpha: true, antialias: quality >= 2 && !mobile, powerPreference: 'high-performance', stencil: false, depth: true }}
        // Glass transmission re-renders the scene each frame; low resolution is invisible behind blur.
        onCreated={({ gl }) => void (gl.transmissionResolutionScale = mobile ? 0.35 : 0.5)}
        camera={{ position: [K.hero.idle.camera.x, K.hero.idle.camera.y, K.hero.idle.camera.z], fov: K.hero.idle.camera.fov, near: 0.05, far: 60 }}
      >
        <PerformanceMonitor flipflops={3} onDecline={() => step(-1)} onFallback={() => useScene.setState({ quality: 1 })} />
        <LoadBridge />
        <FrameGate />
        <CameraRig />
        <Starfield />
        <Suspense fallback={null}>
          <Environment files="/hdri/city_512.hdr" environmentIntensity={0.9} />
          <AssetsReady />
        </Suspense>
        <Arch />
        <Shards />
        <NumeralMatrix />
        <Blocks />
        <ApproachPath />
        <DotGlobe />
        {quality >= 3 && !mobile && <Effects />}
      </Canvas>
    </div>
  )
}
