'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { damp, damp3, dampE } from 'maath/easing'
import { glslNoise, textTextures, type TextTextures } from '@/components/scene/sampling'
import { glance } from '@/content/site'
import { DAMP } from '@/scene/keyframes'
import { flux, frameStep, targets, useScene } from '@/scene/store'

// `targets.particles.morph` 0 → 1 builds the first numeral, k → k + 1 swaps numeral k for k + 1, 4 → 5 clears.
// Each numeral is a glyph texture on one plane. A noisy front dissolves it in and out, its edge burning bright;
// a slow liquid sheen flows through the strokes and a soft halo glows around them.

const vertex = /* glsl */ `
  uniform float uTime, uFlux;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // Fast scrolls send a faint ripple through the plane.
    p.z += sin(p.x * 2.2 - uTime * 3.0) * 0.05 * abs(uFlux);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform sampler2D uT0, uT1, uT2, uT3;
  uniform float uMorph, uTime, uFlux, uOpacity, uLightMix;
  uniform vec3 uDark, uLight;
  varying vec2 vUv;
  ${glslNoise}

  void layer(sampler2D t, float k, float thr, inout float a, inout float hot, inout float halo) {
    float d = uMorph - k;
    float show = 0.0;
    float h = 0.0;
    if (d >= -1.0 && d <= 0.0) {
      float f = d + 1.0;
      show = smoothstep(thr - 0.03, thr, f);
      h = show * (1.0 - smoothstep(0.0, 0.08, f - thr));
    } else if (d > 0.0 && d <= 1.0) {
      show = 1.0 - smoothstep(thr - 0.03, thr, d);
      h = show * (1.0 - smoothstep(0.0, 0.08, thr - d));
    }
    if (show <= 0.0) return;
    vec3 s = texture2D(t, vUv).rgb;
    a = max(a, s.r * show);
    hot = max(hot, h * max(s.r, s.g * 0.6));
    halo = max(halo, s.g * show);
  }

  void main() {
    float thr = 0.1 + 0.75 * (vUv.x * 0.7 + noise(vUv * vec2(22.0, 9.0)) * 0.3);
    float a = 0.0;
    float hot = 0.0;
    float halo = 0.0;
    layer(uT0, 1.0, thr, a, hot, halo);
    layer(uT1, 2.0, thr, a, hot, halo);
    layer(uT2, 3.0, thr, a, hot, halo);
    layer(uT3, 4.0, thr, a, hot, halo);
    float alpha = a + halo * 0.22 * (1.0 - uLightMix * 0.6) + hot * 0.6;
    if (alpha < 0.003) discard;
    float flow = noise(vUv * vec2(3.0, 1.5) + vec2(uTime * 0.07, -uTime * 0.04));
    float band = 0.5 + 0.5 * sin((vUv.x * 2.4 + vUv.y * 1.2 + flow * 2.2) * 3.14159 - uTime * 0.8);
    vec3 base = mix(uDark, uLight, uLightMix);
    vec3 hotC = mix(vec3(0.88, 1.0, 1.0), vec3(0.0, 0.42, 0.47), uLightMix);
    vec3 col = mix(base * 0.55, base, smoothstep(0.15, 0.85, band));
    float sweep = smoothstep(0.1, 0.0, abs(vUv.x - fract(uTime * 0.12) * 1.6 + 0.3));
    col = mix(col, hotC, clamp(hot + sweep * 0.5 * a + abs(uFlux) * 0.3 * a, 0.0, 1.0));
    gl_FragColor = vec4(col, min(1.0, alpha) * uOpacity);
  }
`

const material = (t: TextTextures) =>
  new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      ...Object.fromEntries([0, 1, 2, 3].map((i) => [`uT${i}`, { value: t.maps[i] ?? t.maps[0] }])),
      uMorph: { value: 0 },
      uTime: { value: 0 },
      uFlux: { value: 0 },
      uOpacity: { value: 0 },
      uLightMix: { value: 0 },
      uDark: { value: new THREE.Color('#7fd6db').multiplyScalar(1.25) },
      uLight: { value: new THREE.Color('#1d6f76') },
    },
  })

export function Numerals() {
  const mobile = useScene((s) => s.mobile)
  const quality = useScene((s) => s.quality)
  const px = mobile || quality === 0 ? 220 : 320
  const [tex, setTex] = useState<TextTextures | null>(null)
  const mesh = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>>(null)
  const live = useRef({ opacity: 0, light: 0, morph: 0 })

  useEffect(() => {
    let off = false
    let made: TextTextures | null = null
    void textTextures(
      glance.stats.map((s) => s.value),
      2.6,
      px,
    ).then((t) => {
      if (off) return t.maps.forEach((m) => m.dispose())
      made = t
      setTex(t)
    })
    return () => {
      off = true
      made?.maps.forEach((m) => m.dispose())
    }
  }, [px])

  const geometry = useMemo(() => (tex ? new THREE.PlaneGeometry(tex.w, tex.h, 48, 12) : null), [tex])
  const mat = useMemo(() => (tex ? material(tex) : null), [tex])

  useEffect(() => () => geometry?.dispose(), [geometry])
  useEffect(() => () => mat?.dispose(), [mat])

  useFrame((state, dt) => {
    const m = mesh.current
    if (!m) return
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
    const u = m.material.uniforms
    u.uMorph!.value = l.morph
    if (fs === dt) u.uTime!.value = state.clock.elapsedTime
    u.uFlux!.value = flux.v
    u.uOpacity!.value = l.opacity
    u.uLightMix!.value = l.light
  })

  if (!geometry || !mat) return null
  return <mesh ref={mesh} geometry={geometry} material={mat} frustumCulled={false} visible={false} />
}
