'use client'

import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshPortalMaterial, useVideoTexture } from '@react-three/drei'
import { damp, damp3, dampE } from 'maath/easing'
import { buildArch, GLOW, makeGlass } from '@/components/scene/geometry'
import { FRONT_Z, OPENING } from '@/scene/aShape'
import { DAMP, keyframes as K } from '@/scene/keyframes'
import { frameStep, targets, useScene, type VideoName } from '@/scene/store'

// World pose of the arch, shared with the portal plane (portal uses world units).
export const archWorld = new THREE.Vector3()
export const archScale = { v: 1 }

const makeMaterials = (quality: number) => ({
  ...makeGlass(quality),
  wire: new THREE.LineBasicMaterial({ color: GLOW, transparent: true, opacity: 1, toneMapped: false }),
})

function PortalVideo({ src }: { src: VideoName }) {
  const tex = useVideoTexture(`/video/${src}.mp4`, { start: true, muted: true, loop: true, playsInline: true })
  const plane = useRef<THREE.Mesh>(null)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)

  useEffect(() => {
    const v = tex.image as HTMLVideoElement
    useScene.setState((s) => ({ portalEl: v, load: { ...s.load, video: true } }))
    // Reduced motion: keep the first frame, no playback.
    if (useScene.getState().motion) return
    const hold = () => v.pause()
    if (!v.paused) hold()
    v.addEventListener('playing', hold)
    return () => v.removeEventListener('playing', hold)
  }, [tex])

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
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  )
}

export function Arch() {
  const quality = useScene((s) => s.quality)
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
    const swing = o.idle * Math.sin(state.clock.elapsedTime * K.hero.idle.speed) * K.hero.idle.swing
    const step = frameStep(dt)

    damp3(g.position, [o.x, o.y, o.z], DAMP, step)
    dampE(g.rotation, [o.rx, o.ry + swing, o.rz], DAMP, step)
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
        <MeshPortalMaterial worldUnits blur={0} resolution={512} toneMapped={false}>
          <color attach="background" args={['#0c0e11']} />
          <Suspense fallback={null}>
            <PortalVideo src={portal} />
          </Suspense>
        </MeshPortalMaterial>
      </mesh>
    </group>
  )
}
