'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { damp } from 'maath/easing'
import { glslNoise, textTextures, type TextTextures } from '@/components/scene/sampling'
import { keyframes } from '@/scene/keyframes'

const F = keyframes.footer
const FOV = 26

// Scroll progress (0–1), written by the wrapper and read every frame.
export type WordDrive = React.RefObject<number>

// The reveal front: `f` runs past every threshold once uRise reaches 1.
const front = /* glsl */ `
  float revealFront() { return uRise * 1.05 - 0.02; }
`

const vertex = /* glsl */ `
  uniform float uRise, uTime, uWave;
  varying vec2 vUv;
  varying float vShade, vLift;
  ${front}

  float wave(vec2 p) { return sin(p.x * 1.3 - uTime * 0.9) * 0.5 + sin(p.x * 0.7 + p.y * 1.1 + uTime * 0.6) * 0.5; }

  void main() {
    vUv = uv;
    // Each column lifts just behind the dissolve front, then rides the wave.
    float e = clamp((revealFront() - uv.x * 0.6) * 4.0, 0.0, 1.0);
    e = 1.0 - pow(1.0 - e, 3.0);
    vec2 q = position.xy;
    float amp = uWave * e;
    vec3 p = position;
    p.z += wave(q) * amp - (1.0 - e) * 0.8;
    float dx = (wave(q + vec2(0.02, 0.0)) - wave(q - vec2(0.02, 0.0))) / 0.04 * amp;
    float dy = (wave(q + vec2(0.0, 0.02)) - wave(q - vec2(0.0, 0.02))) / 0.04 * amp;
    vec3 n = normalize(normalMatrix * normalize(vec3(-dx, -dy, 1.0)));
    vShade = dot(n, normalize(vec3(-0.4, 0.5, 0.8)));
    vLift = e;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uRise, uTime, uSweep, uOpacity;
  uniform vec3 uDeep, uTeal, uGlint;
  varying vec2 vUv;
  varying float vShade, vLift;
  ${glslNoise}
  ${front}

  void main() {
    vec3 t = texture2D(uMap, vUv).rgb;
    float f = revealFront();
    float thr = vUv.x * 0.6 + noise(vUv * vec2(26.0, 8.0)) * 0.25;
    float show = smoothstep(thr - 0.02, thr + 0.02, f);
    float edge = show * (1.0 - smoothstep(0.0, 0.06, f - thr));
    float alpha = t.r * show + t.g * 0.28 * show + edge * max(t.r, t.g) * 0.9;
    if (alpha < 0.003) discard;
    // Liquid sheen: bands that drift through the strokes, lit by the rolling surface.
    float flow = noise(vUv * vec2(4.0, 2.0) + vec2(uTime * 0.08, -uTime * 0.05));
    float band = 0.5 + 0.5 * sin((vUv.x * 3.0 + vUv.y * 1.5 + flow * 2.0) * 3.14159 - uTime * 0.6);
    float lit = max(vShade, 0.0);
    vec3 col = mix(uDeep, uTeal, smoothstep(0.2, 0.9, band)) * (0.65 + 0.5 * lit);
    col += uGlint * pow(lit, 8.0) * 0.5 * vLift;
    col += uGlint * smoothstep(0.12, 0.0, abs(vUv.x - uSweep)) * 0.6 * t.r;
    col = mix(col, uGlint * 1.15, clamp(edge, 0.0, 1.0));
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0) * uOpacity);
  }
`

const material = (map: THREE.Texture) =>
  new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uMap: { value: map },
      uRise: { value: 0 },
      uTime: { value: 0 },
      uWave: { value: F.wave },
      uSweep: { value: -1 },
      uOpacity: { value: 1 },
      uDeep: { value: new THREE.Color('#1d6f76') },
      uTeal: { value: new THREE.Color('#33b7c2') },
      uGlint: { value: new THREE.Color('#7fd6db') },
    },
  })

type WordProps = { tex: TextTextures; drive: WordDrive; motion: boolean; onReady: () => void }

function Word({ tex, drive, motion, onReady }: WordProps) {
  const geo = useMemo(() => new THREE.PlaneGeometry(tex.w, tex.h, 160, 40), [tex])
  const mat = useMemo(() => material(tex.maps[0]!), [tex])
  const pivot = useRef<THREE.Group>(null)
  const mesh = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>>(null)
  const live = useRef({ rise: 0, tilt: F.tilt[0] as number, time: 0, fit: '' })
  // The glyph baseline sits half a cap height below the frame centre.
  const base = -tex.cap / 2

  useEffect(() => () => geo.dispose(), [geo])
  useEffect(() => () => mat.dispose(), [mat])
  useEffect(() => onReady(), [onReady])

  useFrame(({ camera, size }, dt) => {
    const g = pivot.current
    const m = mesh.current
    if (!g || !m) return
    const l = live.current
    // Fit the word to the stage width (or height on tall stages); look at its middle. Only on resize.
    const key = `${size.width}x${size.height}`
    if (key !== l.fit) {
      l.fit = key
      const t = Math.tan(THREE.MathUtils.degToRad(FOV) / 2)
      const d = Math.max(tex.tw / 2 / F.fit / (t * (size.width / Math.max(1, size.height))), tex.cap / 2 / 0.7 / t)
      camera.position.set(0, -tex.cap * 0.12, d)
      camera.lookAt(0, 0, 0)
    }
    const p = THREE.MathUtils.clamp(drive.current ?? 0, 0, 1)
    const step = motion ? Math.min(dt, 0.1) : 10
    damp(l, 'rise', motion ? p : 1, 0.35, step)
    damp(l, 'tilt', THREE.MathUtils.lerp(F.tilt[0], F.tilt[1], motion ? THREE.MathUtils.smoothstep(p, 0, 0.85) : 1), 0.45, step)
    if (motion) l.time += step
    g.rotation.x = l.tilt
    g.rotation.y = motion ? Math.sin(l.time * F.swaySpeed) * F.sway * l.rise : 0
    const u = m.material.uniforms
    u.uRise!.value = l.rise
    u.uTime!.value = l.time
    u.uWave!.value = motion ? F.wave : 0
    // One pass of the light band per period, then a pause off the word.
    u.uSweep!.value = motion ? ((l.time % F.sweep) / F.sweep) * 2.2 - 0.3 : -1
  })

  // Rotation pivots on the baseline, so the word stands up from the floor of the footer.
  return (
    <group ref={pivot} position-y={base}>
      <mesh ref={mesh} geometry={geo} material={mat} position-y={-base} frustumCulled={false} />
    </group>
  )
}

type SceneProps = Omit<WordProps, 'tex'> & { word: string; active: boolean }

export default function WordScene({ word, drive, motion, active, onReady }: SceneProps) {
  const [tex, setTex] = useState<TextTextures | null>(null)

  useEffect(() => {
    let off = false
    let made: TextTextures | null = null
    const px = matchMedia('(max-width: 1023px), (pointer: coarse)').matches ? 240 : F.px
    void textTextures([word], 2.6, px).then((t) => {
      if (off) return t.maps.forEach((m) => m.dispose())
      made = t
      setTex(t)
    })
    return () => {
      off = true
      made?.maps.forEach((m) => m.dispose())
    }
  }, [word])

  return (
    <Canvas
      frameloop={!motion ? 'demand' : active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: FOV, near: 0.1, far: 80, position: [0, 0, 12] }}
      onCreated={(s) => void (new URLSearchParams(location.search).has('debug') && Object.assign(window, { __footerGL: s.get }))}
    >
      {tex && <Word tex={tex} drive={drive} motion={motion} onReady={onReady} />}
    </Canvas>
  )
}
