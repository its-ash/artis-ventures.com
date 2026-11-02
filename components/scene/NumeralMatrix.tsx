'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { damp, damp3, dampE } from 'maath/easing'
import { textCells } from '@/components/scene/sampling'
import { glance } from '@/content/site'
import { DAMP, keyframes as K } from '@/scene/keyframes'
import { flux, frameStep, targets, useScene } from '@/scene/store'

// `targets.particles.morph` 0 → 1 builds the first numeral, k → k + 1 swaps numeral k for k + 1, 4 → 5 clears.
// Each numeral is a matrix of square cells: outline cells are solid (the border), inner cells are hollow frames.
// Cells switch column by column with a bright head, and a rain glint falls down each column.

const vertex = /* glsl */ `
  attribute vec4 aCell;
  attribute float aNum, aRnd;
  uniform float uMorph, uTime, uSize, uFlux;
  varying vec2 vUv;
  varying float vShow, vHot, vEdge;

  void main() {
    float d = uMorph - aNum;
    float thr = 0.1 + 0.75 * (aCell.w * 0.78 + aRnd * 0.22);
    float show = 0.0;
    float hot = 0.0;
    if (d >= -1.0 && d <= 0.0) {
      float f = d + 1.0;
      show = smoothstep(thr - 0.03, thr, f);
      hot = show * (1.0 - smoothstep(0.0, 0.09, f - thr));
    } else if (d > 0.0 && d <= 1.0) {
      show = 1.0 - smoothstep(thr - 0.03, thr, d);
      hot = show * (1.0 - smoothstep(0.0, 0.09, thr - d));
    }
    // Rain: a glint falls down each column at its own phase.
    float rain = smoothstep(0.92, 1.0, fract(aCell.y * 0.4 + uTime * 0.55 + fract(aCell.w * 37.0) * 5.0));
    // Flicker: a few inner cells blink off for a beat.
    float blink = step(0.992, fract(sin(floor(uTime * 7.0) * 12.9898 + aRnd * 78.233) * 43758.5453)) * (1.0 - aCell.z);
    vShow = show * (1.0 - blink * 0.8);
    vHot = hot + rain * show * 0.7 + abs(uFlux) * 0.4 * show;
    vEdge = aCell.z;
    vUv = uv;
    float s = uSize * 0.84 * mix(0.35, 1.0, show);
    vec3 p = vec3(aCell.xy + position.xy * s, aCell.z * 0.02);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform vec3 uDark, uLight;
  uniform float uLightMix, uOpacity;
  varying vec2 vUv;
  varying float vShow, vHot, vEdge;

  void main() {
    if (vShow < 0.01) discard;
    vec2 q = abs(vUv - 0.5);
    float m = max(q.x, q.y);
    if (vEdge < 0.5 && m < 0.33) discard;
    vec3 base = mix(uDark, uLight, uLightMix);
    vec3 hot = mix(vec3(0.88, 1.0, 1.0), vec3(0.0, 0.42, 0.47), uLightMix);
    float a = vShow * uOpacity * (vEdge > 0.5 ? 1.0 : 0.5);
    gl_FragColor = vec4(mix(base, hot, clamp(vHot, 0.0, 1.0)), min(1.0, a * (1.0 + vHot)));
  }
`

type Cells = { cells: Float32Array; size: number }

const build = (sets: Cells[]) => {
  const plane = new THREE.PlaneGeometry(1, 1)
  const g = new THREE.InstancedBufferGeometry()
  g.index = plane.index
  g.setAttribute('position', plane.getAttribute('position'))
  g.setAttribute('uv', plane.getAttribute('uv'))
  const n = sets.reduce((s, c) => s + c.cells.length / 4, 0)
  const cell = new Float32Array(n * 4)
  const num = new Float32Array(n)
  const rnd = new Float32Array(n)
  let o = 0
  sets.forEach((c, k) => {
    cell.set(c.cells, o * 4)
    const m = c.cells.length / 4
    num.fill(k + 1, o, o + m)
    o += m
  })
  for (let i = 0; i < n; i++) rnd[i] = Math.random()
  g.setAttribute('aCell', new THREE.InstancedBufferAttribute(cell, 4))
  g.setAttribute('aNum', new THREE.InstancedBufferAttribute(num, 1))
  g.setAttribute('aRnd', new THREE.InstancedBufferAttribute(rnd, 1))
  g.instanceCount = n
  return g
}

const material = () =>
  new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uMorph: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 0.07 },
      uFlux: { value: 0 },
      uOpacity: { value: 0 },
      uLightMix: { value: 0 },
      uDark: { value: new THREE.Color('#7fd6db').multiplyScalar(1.25) },
      uLight: { value: new THREE.Color('#1d6f76') },
    },
  })

export function NumeralMatrix() {
  const mobile = useScene((s) => s.mobile)
  const quality = useScene((s) => s.quality)
  const cell = mobile || quality === 0 ? K.matrix.mobileCell : K.matrix.cell
  const [sets, setSets] = useState<Cells[] | null>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const live = useRef({ opacity: 0, light: 0, morph: 0 })

  useEffect(() => {
    let off = false
    void Promise.all(glance.stats.map((s) => textCells(s.value, cell))).then((data) => !off && setSets(data))
    return () => {
      off = true
    }
  }, [cell])

  const geometry = useMemo(() => (sets ? build(sets) : null), [sets])
  const mat = useMemo(() => material(), [])

  useEffect(() => () => geometry?.dispose(), [geometry])
  useEffect(() => () => mat.dispose(), [mat])

  useFrame((state, dt) => {
    const m = mesh.current
    if (!m || !sets) return
    const t = targets().particles
    const l = live.current
    const fs = frameStep(dt)
    damp(l, 'opacity', t.opacity, DAMP, fs)
    damp(l, 'light', t.light, DAMP, fs)
    damp(l, 'morph', t.morph, DAMP, fs)
    m.visible = l.opacity > 0.002 && l.morph > 0.001 && l.morph < 4.999
    const step = m.visible ? fs : 10
    damp3(m.position, [t.x, t.y, t.z], DAMP, step)
    dampE(m.rotation, [t.rx, t.ry, t.rz], DAMP, step)
    damp3(m.scale, [t.scale, t.scale, t.scale], DAMP, step)
    const u = (m.material as THREE.ShaderMaterial).uniforms
    u.uMorph!.value = l.morph
    if (fs === dt) u.uTime!.value = state.clock.elapsedTime
    u.uSize!.value = sets[0]?.size ?? 0.07
    u.uFlux!.value = flux.v
    u.uOpacity!.value = l.opacity
    u.uLightMix!.value = l.light
  })

  if (!geometry) return null
  return <mesh ref={mesh} geometry={geometry} material={mat} frustumCulled={false} visible={false} />
}
