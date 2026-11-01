'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { damp } from 'maath/easing'
import { disposeAll, GLOW } from '@/components/scene/geometry'
import { matrixMaterial } from '@/components/scene/matrix'
import { cubeEdges, cubeGeometry } from '@/components/scene/sampling'
import { DAMP, keyframes as K } from '@/scene/keyframes'
import { frameStep, targets } from '@/scene/store'

const SEGMENTS = 320
const RADIAL = 8

// Shared with the camera rig, which travels along it.
export const pathCurve = new THREE.CatmullRomCurve3(
  K.approach.nodes.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  'centripetal',
)

export function ApproachPath() {
  const tube = useMemo(() => new THREE.TubeGeometry(pathCurve, SEGMENTS, 0.022, RADIAL, false), [])
  const ghost = useMemo(() => new THREE.BufferGeometry().setFromPoints(pathCurve.getSpacedPoints(200)), [])
  const ghostObj = useMemo(
    () => new THREE.Line(ghost, new THREE.LineBasicMaterial({ color: '#7fd6db', transparent: true, opacity: 0, depthWrite: false })),
    [ghost],
  )
  const end = useMemo(() => cubeGeometry(), [])
  const endEdges = useMemo(() => cubeEdges(), [])
  const endRain = useMemo(() => matrixMaterial(41.7), [])
  const group = useRef<THREE.Group>(null)
  const tubeMesh = useRef<THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial>>(null)
  const ghostLine = useRef<THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>>(null)
  const node = useRef<THREE.Group>(null)
  const live = useRef({ opacity: 0, draw: 0 })
  const last = K.approach.nodes.at(-1)!

  useEffect(
    () => () => disposeAll(tube, ghost, end, endEdges, endRain, ghostObj.material as THREE.Material),
    [tube, ghost, end, endEdges, endRain, ghostObj],
  )

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const p = targets().path
    const l = live.current
    const step = frameStep(dt)
    damp(l, 'opacity', p.opacity, DAMP, step)
    damp(l, 'draw', p.draw, DAMP, step)
    g.visible = l.opacity > 0.002
    if (!g.visible) return
    const count = Math.floor(Math.min(1, l.draw) * SEGMENTS) * RADIAL * 6
    if (tubeMesh.current) {
      tubeMesh.current.geometry.setDrawRange(0, count)
      tubeMesh.current.material.opacity = l.opacity
    }
    if (ghostLine.current) ghostLine.current.material.opacity = 0.14 * l.opacity
    const n = node.current
    if (n) {
      const lit = THREE.MathUtils.smoothstep(l.draw, 0.94, 1)
      n.scale.setScalar(K.approach.nodeScale * (0.6 + 0.4 * l.opacity))
      if (step === dt) {
        n.rotation.set(-0.25, state.clock.elapsedTime * 0.3, 0)
      }
      const [body, edge] = n.children as [THREE.Mesh, THREE.LineSegments]
      const u = (body.material as THREE.ShaderMaterial).uniforms
      if (step === dt) u.uTime!.value = state.clock.elapsedTime
      u.uOpacity!.value = (0.5 + 0.5 * lit) * l.opacity
      u.uGlow!.value = lit
      ;(edge.material as THREE.Material).opacity = Math.max(0.35, lit) * l.opacity
    }
  })

  return (
    <group ref={group} visible={false}>
      <mesh ref={tubeMesh} geometry={tube}>
        <meshBasicMaterial color={GLOW} transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
      <primitive ref={ghostLine} object={ghostObj} />
      <group ref={node} position={last}>
        <mesh geometry={end} material={endRain} renderOrder={1} />
        <lineSegments geometry={endEdges} renderOrder={2}>
          <lineBasicMaterial color={GLOW} transparent opacity={0} toneMapped={false} />
        </lineSegments>
      </group>
    </group>
  )
}
