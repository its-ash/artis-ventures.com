'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { damp, damp3, dampE } from 'maath/easing'
import { disposeAll } from '@/components/scene/geometry'
import { EDGE_DARK, EDGE_LIGHT, matrixMaterial, RAIN_DARK, RAIN_LIGHT } from '@/components/scene/matrix'
import { cubeEdges, cubeGeometry } from '@/components/scene/sampling'
import { capabilities } from '@/content/site'
import { DAMP, keyframes as K } from '@/scene/keyframes'
import { frameStep, targets } from '@/scene/store'

const lerp = THREE.MathUtils.lerp
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
// Inactive cubes sit at an isometric angle; the active one turns square to the camera.
const REST = { rx: -0.42, ry: 0.72 }

// Number on the front face: mono index and a large mono numeral.
const numberTexture = (n: string) => {
  const S = 512
  const c = document.createElement('canvas')
  c.width = c.height = S
  const ctx = c.getContext('2d')!
  const mono = getComputedStyle(document.documentElement).getPropertyValue('--font-jetbrains').trim() || 'monospace'
  ctx.fillStyle = '#fff'
  ctx.font = `400 34px ${mono}`
  ctx.fillText(`[${n}]`, 40, 72)
  ctx.font = `400 250px ${mono}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(n, S / 2, S / 2 + 30)
  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 4
  return tex
}

const NODES = K.approach.nodes

export function Blocks() {
  const geo = useMemo(() => cubeGeometry(), [])
  const edges = useMemo(() => cubeEdges(), [])
  const front = useMemo(() => new THREE.PlaneGeometry(0.86, 0.86).translate(0, 0, 0.502), [])
  const rains = useMemo(() => capabilities.cards.map((_, i) => matrixMaterial(i * 7.31 + 1)), [])
  const numbers = useMemo(
    () =>
      capabilities.cards.map(
        (c) =>
          new THREE.MeshBasicMaterial({
            map: numberTexture(c.n),
            color: RAIN_DARK,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            toneMapped: false,
          }),
      ),
    [],
  )
  const lines = useMemo(
    () => rains.map(() => new THREE.LineBasicMaterial({ color: EDGE_DARK, transparent: true, opacity: 0, toneMapped: false })),
    [rains],
  )
  const group = useRef<THREE.Group>(null)
  const items = useRef<(THREE.Group | null)[]>([])
  const live = useRef({ opacity: 0, light: 0 })
  const tint = useRef({ rain: new THREE.Color(), edge: new THREE.Color() })

  useEffect(
    () => () => {
      numbers.forEach((m) => m.map?.dispose())
      disposeAll(geo, edges, front, ...rains, ...numbers, ...lines)
    },
    [geo, edges, front, rains, numbers, lines],
  )

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const { blocks: b, path, stone } = targets()
    const fs = frameStep(dt)
    const l = live.current
    damp(l, 'opacity', b.opacity, DAMP, fs)
    // Colours follow the background: bright teal on graphite, deep teal on stone.
    damp(l, 'light', stone.opacity, DAMP, fs)
    g.visible = l.opacity > 0.002
    const step = g.visible ? fs : 10
    const moving = fs === dt
    const time = state.clock.elapsedTime
    const { rain, edge } = tint.current
    rain.copy(RAIN_DARK).lerp(RAIN_LIGHT, l.light)
    edge.copy(EDGE_DARK).lerp(EDGE_LIGHT, l.light)

    items.current.forEach((it, i) => {
      if (!it) return
      const [box, border, num] = it.children as [THREE.Mesh, THREE.LineSegments, THREE.Mesh]
      const node = NODES[i]!
      const onRow = 1 - b.toPath
      const w = clamp01(1 - Math.abs(i - b.active)) * onRow
      const lit = clamp01((path.draw * (NODES.length - 1) - i) * 6 + 1) * b.toPath
      const glow = Math.max(w, lit)
      const bob = moving ? Math.sin(time * 0.8 + i * 1.3) * 0.04 * onRow : 0
      const row: [number, number, number] = [b.x + (i - b.active) * b.gap * b.scale, b.y + bob, 0]
      const pos = [0, 1, 2].map((k) => lerp(lerp(row[k]!, node[k]!, b.toPath), k === 0 ? b.gx : k === 1 ? b.gy : 0, b.collapse))
      const s = lerp(lerp(b.scale * (0.9 + 0.1 * w), K.approach.nodeScale, b.toPath), 0.001, b.collapse)
      const spin = moving ? time * 0.3 + i : i
      damp3(it.position, pos as [number, number, number], DAMP, step)
      damp3(it.scale, [s, s, s], DAMP, step)
      dampE(
        it.rotation,
        [lerp(REST.rx * (1 - w), REST.rx * 0.6, b.toPath), lerp(REST.ry * (1 - w), spin, b.toPath), 0],
        DAMP,
        step,
      )

      const u = (box.material as THREE.ShaderMaterial).uniforms
      if (moving) u.uTime!.value = time
      u.uOpacity!.value = l.opacity * (0.55 + 0.45 * glow)
      u.uGlow!.value = glow
      ;(u.uColor!.value as THREE.Color).copy(rain)
      const lm = border.material as THREE.LineBasicMaterial
      lm.color.copy(edge)
      lm.opacity = l.opacity * (0.45 + 0.55 * glow)
      const nm = num.material as THREE.MeshBasicMaterial
      nm.color.copy(rain)
      nm.opacity = l.opacity * lerp(0.25 + 0.75 * w, 0.3 + 0.7 * lit, b.toPath)
    })
  })

  return (
    <group ref={group} visible={false}>
      {rains.map((rain, i) => (
        <group
          key={i}
          ref={(m) => {
            items.current[i] = m
          }}
        >
          <mesh geometry={geo} material={rain} renderOrder={1} />
          <lineSegments geometry={edges} material={lines[i]} renderOrder={2} />
          <mesh geometry={front} material={numbers[i]} renderOrder={3} />
        </group>
      ))}
    </group>
  )
}
