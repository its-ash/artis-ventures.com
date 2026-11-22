'use client'

import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshPortalMaterial } from '@react-three/drei'
import { damp, damp3, dampE } from 'maath/easing'
import { buildArch, GLOW, makeGlass } from '@/components/scene/geometry'
import { asset } from '@/lib/base'
import { FRONT_Z, OPENING } from '@/scene/aShape'
import { DAMP, keyframes as K } from '@/scene/keyframes'
import { flux, frameStep, targets, useScene, type VideoName } from '@/scene/store'

// Idle float (world units, rad/s) and the lean that scroll speed gives the arch.
const BOB = { amp: 0.06, speed: 0.6 }
const LEAN = 0.18

// World pose of the arch, shared with the portal plane (portal uses world units).
export const archWorld = new THREE.Vector3()
export const archScale = { v: 1 }

const makeMaterials = (quality: number) => ({
  ...makeGlass(quality),
  wire: new THREE.LineBasicMaterial({ color: GLOW, transparent: true, opacity: 1, toneMapped: false }),
})

function PortalVideo({ src }: { src: VideoName }) {
  const plane = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    // Share the existing hero DOM <video> so portal and stage video are frame-identical with zero handoff cut.
    const shared = src === 'hero_city' ? document.querySelector<HTMLVideoElement>('[data-stage] video') : null
    let owned: HTMLVideoElement | null = null
    const v =
      shared ??
      (() => {
        const el = document.createElement('video')
        el.src = asset(`/video/${src}.mp4`)
        el.crossOrigin = 'anonymous'
        el.loop = true
        el.muted = true
        el.defaultMuted = true
        el.playsInline = true
        el.preload = 'auto'
        owned = el
        return el
      })()

    v.muted = true
    v.defaultMuted = true
    v.playsInline = true
    v.loop = true

    const vt = new THREE.VideoTexture(v)
    vt.colorSpace = THREE.SRGBColorSpace
    vt.minFilter = THREE.LinearFilter
    vt.magFilter = THREE.LinearFilter
    vt.generateMipmaps = false
    vt.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy())

    const m = mat.current
    if (m) {
      m.map = vt
      m.needsUpdate = true
    }

    const markReady = () => useScene.setState((s) => ({ portalEl: v, load: { ...s.load, video: true } }))
    const motion = useScene.getState().motion

    if (motion) {
      void v.play().catch(() => {})
    } else {
      v.pause()
    }

    if (v.readyState >= 2) markReady()
    else v.addEventListener('loadeddata', markReady, { once: true })

    return () => {
      v.removeEventListener('loadeddata', markReady)
      if (m) {
        m.map = null
        m.needsUpdate = true
      }
      vt.dispose()
      if (owned) {
        owned.pause()
        owned.removeAttribute('src')
        owned.load()
      }
    }
  }, [src, gl])

  useFrame(() => {
    const m = plane.current
    if (!m) return
    // Cover-fit the plane to the viewport as seen from the end of the fly-through, so the DOM handoff matches.
    const d = FRONT_Z + 0.3 - K.portal.planeZ
    const h = 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
    const w = h * (size.width / size.height)
    const cover = w / h > K.portal.aspect ? [w, w / K.portal.aspect] : [h * K.portal.aspect, h]
    m.scale.set(cover[0]!, cover[1]!, 1)
    const k = archScale.v
    m.position.set(archWorld.x + OPENING.x * k, archWorld.y + OPENING.y * k, archWorld.z + K.portal.planeZ)
  })

  return (
    <mesh ref={plane}>
      <planeGeometry />
      <meshBasicMaterial ref={mat} toneMapped={false} />
    </mesh>
  )
}

export function Arch() {
  const quality = useScene((s) => s.quality)
  const mobile = useScene((s) => s.mobile)
  const portal = useScene((s) => s.portal)
  const { geometry, edges, counter } = useMemo(() => buildArch(), [])
  const mats = useMemo(() => makeMaterials(quality), [quality])
  const group = useRef<THREE.Group>(null)
  const body = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.Material[]>>(null)
  const line = useRef<THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>>(null)
  const portalMesh = useRef<THREE.Mesh>(null)
  const live = useRef({ wire: 0, fill: 0, opacity: 1 })
  const total = edges.getAttribute('position').count

  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])
  useEffect(
    () => () => {
      geometry.dispose()
      edges.dispose()
      counter.dispose()
    },
    [geometry, edges, counter],
  )

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const o = targets().object
    const l = live.current
    const time = state.clock.elapsedTime
    const swing = o.idle * Math.sin(time * K.hero.idle.speed) * K.hero.idle.swing
    const step = frameStep(dt)
    const moving = step === dt
    const bob = moving ? o.idle * Math.sin(time * BOB.speed) * BOB.amp * o.scale : 0
    // Fast scrolls tip the arch into the travel direction; it rights itself as the scroll settles.
    const lean = moving ? flux.v * LEAN : 0

    damp3(g.position, [o.x, o.y + bob, o.z], DAMP, step)
    dampE(g.rotation, [o.rx + lean, o.ry + swing, o.rz], DAMP, step)
    damp3(g.scale, [o.scale, o.scale, o.scale], DAMP, step)
    damp(l, 'opacity', o.opacity, DAMP, step)
    damp(l, 'fill', o.fill, 0.35, step)
    damp(l, 'wire', o.wire, 0.2, step)
    g.getWorldPosition(archWorld)
    archScale.v = g.scale.x

    const fill = l.fill * l.opacity
    if (body.current) {
      for (const m of body.current.material) m.opacity = fill
      body.current.visible = fill > 0.002
    }
    if (portalMesh.current) portalMesh.current.visible = fill > 0.002
    // No video decoding while neither the portal nor the stage video is visible.
    const vid = useScene.getState().portalEl
    if (vid && useScene.getState().motion) {
      const stageVisible = useScene.getState().portal === 'hero_city' && targets().video.opacity >= 0.005
      const active = fill > 0.002 || stageVisible
      if (active && vid.paused) void vid.play().catch(() => {})
      else if (!active && !vid.paused) vid.pause()
    }

    // Wire draws with load progress (0–1), then fades to a faint rest as the glass fills in.
    const ln = line.current
    if (ln) {
      ln.geometry.setDrawRange(0, Math.floor((Math.min(1, l.wire) * total) / 2) * 2)
      ln.material.opacity = THREE.MathUtils.lerp(1, K.preload.wireRest, l.fill) * l.opacity
      ln.visible = l.wire > 0.002 && ln.material.opacity > 0.002
    }
    g.visible = l.opacity > 0.002
  })

  return (
    <group ref={group}>
      <mesh ref={body} geometry={geometry} material={[mats.glass, mats.metal]} />
      <lineSegments ref={line} geometry={edges} material={mats.wire} />
      <mesh ref={portalMesh} geometry={counter} position-z={FRONT_Z + 0.002}>
        <MeshPortalMaterial worldUnits blur={0} resolution={mobile ? 512 : 1024} toneMapped={false}>
          <color attach="background" args={['#0c0e11']} />
          <Suspense fallback={null}>
            <PortalVideo src={portal} />
          </Suspense>
        </MeshPortalMaterial>
      </mesh>
    </group>
  )
}
