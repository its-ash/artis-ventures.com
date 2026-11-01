'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { damp, damp3, dampE } from 'maath/easing'
import { buildShards, disposeAll, makeGlass } from '@/components/scene/geometry'
import { DAMP } from '@/scene/keyframes'
import { frameStep, targets, useScene } from '@/scene/store'

// The A's three strokes. The group follows the arch pose; each stroke moves in that local space.
export function Shards() {
  const quality = useScene((s) => s.quality)
  const geos = useMemo(() => buildShards(), [])
  const mats = useMemo(() => makeGlass(quality), [quality])
  const group = useRef<THREE.Group>(null)
  const parts = useRef<(THREE.Mesh<THREE.BufferGeometry, THREE.Material[]> | null)[]>([])
  const live = useRef({ opacity: 0 })

  useEffect(() => () => disposeAll(mats.glass, mats.metal), [mats])
  useEffect(() => () => disposeAll(...geos), [geos])

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const { object: o, shards } = targets()
    damp(live.current, 'opacity', shards.opacity, DAMP, frameStep(dt))
    const op = live.current.opacity
    g.visible = op > 0.002
    // While hidden, snap to targets so nothing drifts in from a stale pose.
    const step = g.visible ? frameStep(dt) : 10

    damp3(g.position, [o.x, o.y, o.z], DAMP, step)
    dampE(g.rotation, [o.rx, o.ry, o.rz], DAMP, step)
    damp3(g.scale, [o.scale, o.scale, o.scale], DAMP, step)
    shards.s.forEach((s, i) => {
      const m = parts.current[i]
      if (!m) return
      damp3(m.position, [s.x, s.y, s.z], DAMP, step)
      dampE(m.rotation, [s.rx, s.ry, s.rz], DAMP, step)
      damp3(m.scale, [s.scale, s.scale, s.scale], DAMP, step)
      if (i === 0) for (const mat of m.material) mat.opacity = op
    })
  })

  return (
    <group ref={group} visible={false}>
      {geos.map((geo, i) => (
        <mesh
          key={i}
          ref={(m) => {
            parts.current[i] = m as THREE.Mesh<THREE.BufferGeometry, THREE.Material[]> | null
          }}
          geometry={geo}
          material={[mats.glass, mats.metal]}
        />
      ))}
    </group>
  )
}
