'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { damp, damp3, dampE } from 'maath/easing'
import { buildArch } from '@/components/scene/geometry'
import { sampleBlocks, sampleLand, sampleSurface, sampleText } from '@/components/scene/sampling'
import { glance } from '@/content/site'
import { DAMP, keyframes as K } from '@/scene/keyframes'
import { frameStep, targets, useScene } from '@/scene/store'

// Target order matches `targets.particles.morph`: 0 arch · 1–4 numerals · 5 blocks · 6 globe · 7 arch.
const TARGETS = 8

const vertex = /* glsl */ `
  attribute vec3 aP0; attribute vec3 aP1; attribute vec3 aP2; attribute vec3 aP3;
  attribute vec3 aP4; attribute vec3 aP5; attribute vec3 aP6; attribute vec3 aP7;
  attribute float aRnd;
  uniform float uMorph, uTime, uNoise, uSize, uPixel;
  varying float vRnd;

  vec3 pick(float i) {
    if (i < 0.5) return aP0; if (i < 1.5) return aP1; if (i < 2.5) return aP2; if (i < 3.5) return aP3;
    if (i < 4.5) return aP4; if (i < 5.5) return aP5; if (i < 6.5) return aP6; return aP7;
  }

  void main() {
    float i = clamp(floor(uMorph), 0.0, 6.0);
    float f = clamp(uMorph - i, 0.0, 1.0);
    // Per-particle stagger so the cloud flows instead of snapping.
    float e = clamp((f - aRnd * 0.35) / 0.65, 0.0, 1.0);
    e = e * e * (3.0 - 2.0 * e);
    vec3 p = mix(pick(i), pick(i + 1.0), e);
    // Curl-like drift that peaks mid-transition.
    float n = sin(e * 3.14159) * uNoise;
    p += n * 0.55 * vec3(
      sin(p.y * 2.1 + uTime * 0.9 + aRnd * 6.0),
      sin(p.z * 2.3 + uTime * 1.1 + aRnd * 4.0),
      sin(p.x * 1.9 + uTime * 0.8 + aRnd * 5.0)
    );
    p += 0.012 * vec3(sin(uTime * 0.8 + aRnd * 20.0), cos(uTime * 0.7 + aRnd * 13.0), 0.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixel * (0.55 + aRnd * 0.9) / -mv.z;
    vRnd = aRnd;
  }
`

const fragment = /* glsl */ `
  uniform vec3 uDark, uLight;
  uniform float uLightMix, uOpacity;
  varying float vRnd;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.15, d) * uOpacity * (0.6 + vRnd * 0.4);
    gl_FragColor = vec4(mix(uDark, uLight, uLightMix), a);
  }
`

// Placeholders are the arch; numeral and globe targets are filled in once fonts and the land mask load.
const buildParticles = (count: number) => {
  const geometry = new THREE.BufferGeometry()
  const { geometry: arch, edges, counter } = buildArch()
  const archPts = sampleSurface(arch, count)
  ;[arch, edges, counter].forEach((g) => g.dispose())
  const rnd = new Float32Array(count).map(() => Math.random())
  for (let i = 0; i < TARGETS; i++) geometry.setAttribute(`aP${i}`, new THREE.BufferAttribute(archPts.slice(), 3))
  geometry.setAttribute('position', new THREE.BufferAttribute(archPts, 3))
  geometry.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1))
  geometry.setAttribute('aP5', new THREE.BufferAttribute(sampleBlocks(count, K.capabilities.row.gap), 3))
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50)
  const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uMorph: { value: 0 },
      uTime: { value: 0 },
      uNoise: { value: K.particles.noise },
      uSize: { value: K.particles.size },
      uPixel: { value: 1 },
      uOpacity: { value: 0 },
      uLightMix: { value: 0 },
      uDark: { value: new THREE.Color('#7fd6db').multiplyScalar(1.25) },
      uLight: { value: new THREE.Color('#1d6f76') },
    },
  })
  return { geometry, material }
}

export function ParticleMorph() {
  const mobile = useScene((s) => s.mobile)
  const quality = useScene((s) => s.quality)
  const count = mobile || quality === 0 ? K.particles.mobile : K.particles.count
  const dpr = useThree((s) => s.viewport.dpr)
  const points = useRef<THREE.Points>(null)
  const live = useRef({ opacity: 0, light: 0 })

  const { geometry, material } = useMemo(() => buildParticles(count), [count])

  // Font- and image-based targets resolve asynchronously, then replace the placeholders.
  useEffect(() => {
    let off = false
    const set = (i: number, data: Float32Array) => {
      if (off) return
      geometry.setAttribute(`aP${i}`, new THREE.BufferAttribute(data, 3))
    }
    glance.stats.forEach((s, i) => void sampleText(s.value, count).then((d) => set(i + 1, d)))
    void sampleLand(count, K.reach.globe.radius).then((d) => set(6, d))
    return () => {
      off = true
    }
  }, [geometry, count])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material],
  )

  useFrame((state, dt) => {
    const p = points.current
    if (!p) return
    const t = targets().particles
    const l = live.current
    const fs = frameStep(dt)
    damp(l, 'opacity', t.opacity, DAMP, fs)
    damp(l, 'light', t.light, DAMP, fs)
    p.visible = l.opacity > 0.002
    const step = p.visible ? fs : 10
    damp3(p.position, [t.x, t.y, t.z], DAMP, step)
    dampE(p.rotation, [t.rx, t.ry, t.rz], DAMP, step)
    damp3(p.scale, [t.scale, t.scale, t.scale], DAMP, step)
    const u = (p.material as THREE.ShaderMaterial).uniforms
    damp(u.uMorph!, 'value', t.morph, DAMP, step)
    if (fs === dt) u.uTime!.value = state.clock.elapsedTime
    u.uNoise!.value = t.noise
    u.uPixel!.value = dpr * (state.size.height / 900)
    u.uOpacity!.value = l.opacity
    u.uLightMix!.value = l.light
  })

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} visible={false} />
}
