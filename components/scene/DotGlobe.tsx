'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { damp, damp3, dampE } from 'maath/easing'
import { disposeAll, GLOW } from '@/components/scene/geometry'
import { latLonToVec } from '@/scene/geo'
import { DAMP, keyframes as K } from '@/scene/keyframes'
import { frameStep, targets } from '@/scene/store'

const R = K.reach.globe.radius
const ARC_POINTS = 64
const UP = new THREE.Vector3(0, 1, 0)
const v3 = (lat: number, lon: number, r = R) => new THREE.Vector3(...latLonToVec(lat, lon, r))

// Great-circle arc lifted off the surface, higher for longer hops.
const arc = (a: THREE.Vector3, b: THREE.Vector3) => {
  const angle = a.angleTo(b)
  const lift = 0.06 + 0.32 * (angle / Math.PI)
  const qa = new THREE.Quaternion()
  const qb = new THREE.Quaternion().setFromUnitVectors(a.clone().normalize(), b.clone().normalize())
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= ARC_POINTS; i++) {
    const t = i / ARC_POINTS
    const q = qa.clone().slerp(qb, t)
    pts.push(a.clone().normalize().applyQuaternion(q).multiplyScalar(R + lift * Math.sin(Math.PI * t)))
  }
  return new THREE.BufferGeometry().setFromPoints(pts)
}

// Pins + Dubai arcs. The land dots are the particle cloud (morph target 6); this group shares its pose.
export function DotGlobe() {
  const hub = useMemo(() => v3(K.reach.hub.lat, K.reach.hub.lon), [])
  const stops = useMemo(() => K.reach.stops.map((s) => v3(s.lat, s.lon)), [])
  // Arcs from the Dubai hub to every stop that is not Dubai itself.
  const arcs = useMemo(
    () =>
      stops
        .filter((s) => s.distanceTo(hub) > 0.05)
        .map((s) => new THREE.Line(arc(hub, s), new THREE.LineBasicMaterial({ color: GLOW, transparent: true, opacity: 0, toneMapped: false }))),
    [stops, hub],
  )
  const pin = useMemo(() => new THREE.CylinderGeometry(0.006, 0.006, 0.28, 6).translate(0, 0.14, 0), [])
  const head = useMemo(() => new THREE.SphereGeometry(0.03, 12, 12).translate(0, 0.28, 0), [])
  const core = useMemo(() => new THREE.SphereGeometry(R * 0.985, 48, 48), [])
  const group = useRef<THREE.Group>(null)
  const pins = useRef<(THREE.Group | null)[]>([])
  const lines = useRef<(THREE.Line | null)[]>([])
  const coreMesh = useRef<THREE.Mesh>(null)
  const live = useRef({ opacity: 0, pins: 0, arcs: 0 })

  useEffect(
    () => () => disposeAll(pin, head, core, ...arcs.flatMap((a) => [a.geometry, a.material as THREE.Material])),
    [pin, head, core, arcs],
  )

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const { particles: p, globe } = targets()
    const l = live.current
    const fs = frameStep(dt)
    damp(l, 'opacity', globe.opacity, DAMP, fs)
    damp(l, 'pins', globe.pins, DAMP, fs)
    damp(l, 'arcs', globe.arcs, DAMP, fs)
    g.visible = l.opacity > 0.002
    const step = g.visible ? fs : 10
    damp3(g.position, [p.x, p.y, p.z], DAMP, step)
    dampE(g.rotation, [p.rx, p.ry, p.rz], DAMP, step)
    damp3(g.scale, [p.scale, p.scale, p.scale], DAMP, step)
    if (!g.visible) return

    if (coreMesh.current) (coreMesh.current.material as THREE.Material).opacity = l.opacity
    pins.current.forEach((m, i) => {
      if (!m) return
      const rise = THREE.MathUtils.clamp(l.pins - i, 0, 1)
      m.scale.set(1, Math.max(0.001, rise), 1)
      for (const c of m.children) ((c as THREE.Mesh).material as THREE.Material).opacity = l.opacity * Math.min(1, rise * 3)
    })
    lines.current.forEach((ln, i) => {
      if (!ln) return
      const t = THREE.MathUtils.clamp(l.arcs - i, 0, 1)
      ln.geometry.setDrawRange(0, Math.floor(t * (ARC_POINTS + 1)))
      ;(ln.material as THREE.Material).opacity = l.opacity
    })
  })

  return (
    <group ref={group} visible={false}>
      <mesh ref={coreMesh} geometry={core} renderOrder={-1}>
        <meshBasicMaterial color="#0c0e11" transparent opacity={0} />
      </mesh>
      {stops.map((s, i) => (
        <group
          key={i}
          position={s}
          quaternion={new THREE.Quaternion().setFromUnitVectors(UP, s.clone().normalize())}
          ref={(m) => {
            pins.current[i] = m
          }}
        >
          <mesh geometry={pin}>
            <meshBasicMaterial color={GLOW} transparent opacity={0} toneMapped={false} />
          </mesh>
          <mesh geometry={head}>
            <meshBasicMaterial color={GLOW} transparent opacity={0} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {arcs.map((obj, i) => (
        <primitive
          key={i}
          object={obj}
          ref={(m: THREE.Line | null) => {
            lines.current[i] = m
          }}
        />
      ))}
    </group>
  )
}
