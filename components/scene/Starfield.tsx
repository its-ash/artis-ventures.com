'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { damp } from 'maath/easing'
import { DAMP } from '@/scene/keyframes'
import { flux, frameStep, targets, useScene } from '@/scene/store'

// Data stars in a box around the stage that flow toward the camera. At rest they drift as points;
// scroll speed stretches them into hyperspace streaks (direction follows the scroll).
// Shown on graphite sections only: they fade out under the stone layer.
const FIELD = { count: 1800, mobileCount: 700, x: 14, y: 9, near: 7, far: -26 }
const DEPTH = FIELD.near - FIELD.far
// Travel speed (world units/s) at rest and per unit of scroll speed; streak length per unit of scroll speed.
const DRIFT = 0.25
const WARP = 9
const STREAK = 2.2

const geometry = (count: number) => {
  const pos = new Float32Array(count * 6)
  const end = new Float32Array(count * 2)
  const rnd = new Float32Array(count * 2)
  for (let i = 0; i < count; i++) {
    const x = (Math.random() * 2 - 1) * FIELD.x
    const y = (Math.random() * 2 - 1) * FIELD.y
    const z = FIELD.far + Math.random() * DEPTH
    const r = Math.random()
    pos.set([x, y, z, x, y, z], i * 6)
    end.set([0, 1], i * 2)
    rnd.set([r, r], i * 2)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aEnd', new THREE.BufferAttribute(end, 1))
  g.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1))
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, (FIELD.near + FIELD.far) / 2), 40)
  return g
}

const material = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTravel: { value: 0 },
      uStreak: { value: 0 },
      uOpacity: { value: 0 },
      uTeal: { value: new THREE.Color('#7fd6db') },
    },
    vertexShader: /* glsl */ `
      attribute float aEnd, aRnd;
      uniform float uTravel, uStreak;
      varying float vA, vRnd;
      void main() {
        vec3 p = position;
        float speed = 0.5 + aRnd;
        // Wrap along z so the field streams past without end.
        p.z = mod(p.z - ${FIELD.far.toFixed(1)} + uTravel * speed, ${DEPTH.toFixed(1)}) + ${FIELD.far.toFixed(1)};
        // The tail trails behind the head, against the travel direction.
        p.z -= aEnd * (0.015 + uStreak * speed);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float depth = smoothstep(${FIELD.far.toFixed(1)}, ${(FIELD.far + 6).toFixed(1)}, p.z) * (1.0 - smoothstep(${(FIELD.near - 3).toFixed(1)}, ${FIELD.near.toFixed(1)}, p.z));
        vA = depth * (0.25 + 0.75 * aRnd) * (1.0 - aEnd * 0.85);
        vRnd = aRnd;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uTeal; uniform float uOpacity;
      varying float vA, vRnd;
      void main() {
        gl_FragColor = vec4(mix(uTeal, vec3(1.0), step(0.85, vRnd)), vA * uOpacity);
      }
    `,
  })

export function Starfield() {
  const mobile = useScene((s) => s.mobile)
  const geo = useMemo(() => geometry(mobile ? FIELD.mobileCount : FIELD.count), [mobile])
  const mat = useMemo(() => material(), [])
  const lines = useRef<THREE.LineSegments>(null)
  const live = useRef({ dark: 0, travel: 0 })

  useEffect(() => () => geo.dispose(), [geo])
  useEffect(() => () => mat.dispose(), [mat])

  useFrame((_, dt) => {
    const m = lines.current
    if (!m) return
    const l = live.current
    const fs = frameStep(dt)
    damp(l, 'dark', 1 - targets().stone.opacity, DAMP, fs)
    m.visible = l.dark > 0.01
    if (!m.visible) return
    const moving = fs === dt
    // Scrolling down flies forward, scrolling up backs out.
    if (moving) l.travel += Math.min(dt, 0.1) * (DRIFT + flux.v * WARP)
    const u = (m.material as THREE.ShaderMaterial).uniforms
    u.uTravel!.value = l.travel
    u.uStreak!.value = moving ? flux.v * STREAK : 0
    u.uOpacity!.value = l.dark * 0.8
  })

  return <lineSegments ref={lines} geometry={geo} material={mat} frustumCulled={false} renderOrder={-2} />
}
