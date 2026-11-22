'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { damp } from 'maath/easing'
import { disposeAll } from '@/components/scene/geometry'
import { keyframes as K } from '@/scene/keyframes'
import { flux, frameStep, targets, useScene } from '@/scene/store'

// Exported for compatibility.
export const pathCurve = new THREE.CatmullRomCurve3(
  K.approach.nodes.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  false,
  'centripetal',
)

const SYNC_DAMP = 0.08
const SPHERE_RADIUS = 1.92

const sphereVertex = /* glsl */ `
  attribute float aRand;
  attribute float aLayer;
  uniform float uTime;
  uniform float uDraw;
  uniform float uFlux;
  uniform float uPixelRatio;
  varying float vWorldY;
  varying float vRim;
  varying float vElev;
  varying float vRidge;
  varying float vRand;
  varying float vLayer;
  varying float vDepth;

  // Ashima 3D Simplex Noise
  vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  vec2 terrain(vec3 dir, float scrollShift, float t) {
    vec3 q = dir * 2.05 + vec3(scrollShift * 0.78, -scrollShift * 0.45, t * 0.14);
    float n1 = snoise(q);
    float n2 = snoise(dir * 4.10 - vec3(t * 0.12, scrollShift * 1.15, scrollShift * 0.55));
    float r = 1.0 - abs(snoise(dir * 2.65 + vec3(-scrollShift * 0.85, t * 0.10, scrollShift * 0.48)));
    float ridge = pow(r, 2.2);
    float disp = n1 * 0.48 + n2 * 0.24 + (ridge - 0.32) * 0.44;
    return vec2(disp, ridge);
  }

  void main() {
    vec3 dir = normalize(position);
    float scrollShift = uDraw * 3.6;
    float t = uTime;

    vec2 tf = terrain(dir, scrollShift, t);
    float baseField = tf.x;
    float ridgeVal = tf.y;

    // Scroll-synchronized harmonic pulse sweeping across the 5 engagement stages
    float stageWave = sin(dir.y * 5.2 - uDraw * 12.56637 + baseField * 2.4) * 0.06;
    float fluxBoost = min(abs(uFlux) * 0.15, 0.25);
    float stageAmp = 0.25 + 0.08 * sin(uDraw * 3.14159265) + fluxBoost * 0.35;

    // Primary lattice shell + outer billowing particle spray fringe
    float fringeOffset = aLayer * (0.06 + 0.24 * pow(aRand, 1.35) + fluxBoost * 0.22);
    float radialDisp = baseField * (stageAmp + aLayer * 0.15) + stageWave + fringeOffset;

    // Slight tangential curl on outer fringe dots for feathery edge ripples
    vec3 tangent = normalize(cross(dir, abs(dir.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
    vec3 bitangent = cross(dir, tangent);
    float curlA = snoise(dir * 3.1 + vec3(scrollShift * 0.8, t * 0.16, aRand * 4.0));
    float curlB = snoise(dir * 3.1 + vec3(-scrollShift * 0.8, aRand * 5.0, -t * 0.15));
    vec3 tangential = (tangent * curlA + bitangent * curlB) * (0.032 + aLayer * 0.15);

    float radius = ${SPHERE_RADIUS.toFixed(2)} * (0.96 + 0.07 * sin(uDraw * 3.14159265));
    vec3 displaced = dir * (radius + radialDisp) + tangential;

    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vec3 worldNormal = normalize(mat3(modelMatrix) * dir);
    vec3 viewDir = normalize(cameraPosition - worldPos.xyz);

    float ndv = abs(dot(worldNormal, viewDir));
    float rim = pow(1.0 - ndv, 1.35);

    // World-space Y keeps top ice-cyan and bottom crimson/flame/gold steady throughout scroll rotation
    vWorldY = clamp(worldPos.y / (radius * 1.06), -1.0, 1.0);
    vRim = rim;
    vElev = clamp(baseField * 0.85 + 0.5, 0.0, 1.0);
    vRidge = ridgeVal;
    vRand = aRand;
    vLayer = aLayer;

    vec4 mvPos = viewMatrix * worldPos;
    vDepth = clamp((-mvPos.z - 4.0) / 5.5, 0.0, 1.0);

    float isStar = step(0.9974, aRand) * (1.0 - aLayer);
    float dotScale = mix(1.22, 1.72, rim) * mix(1.0, 0.92, aLayer);
    dotScale += smoothstep(0.55, 0.95, ridgeVal) * 0.25 * (1.0 - aLayer);
    dotScale = mix(dotScale, 2.35, isStar);
    float px = dotScale * (13.0 / max(1.5, -mvPos.z)) * uPixelRatio;
    gl_PointSize = clamp(px, 1.6, 6.8);
    gl_Position = projectionMatrix * mvPos;
  }
`

const sphereFragment = /* glsl */ `
  uniform float uOpacity;
  uniform float uDraw;
  varying float vWorldY;
  varying float vRim;
  varying float vElev;
  varying float vRidge;
  varying float vRand;
  varying float vLayer;
  varying float vDepth;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float disc = smoothstep(0.5, 0.20, r);

    // Top: electric ice-cyan -> sky-blue | Core: deep sapphire -> royal violet | Flanks: vivid hot-pink/magenta | Bottom: flame-red -> molten gold
    float y = clamp(vWorldY * 0.5 + 0.5, 0.0, 1.0);
    float yPerturb = clamp(y + (vElev - 0.5) * 0.13 + (vRand - 0.5) * 0.05, 0.0, 1.0);

    vec3 cGold    = vec3(1.00, 0.76, 0.24);
    vec3 cFlame   = vec3(1.00, 0.28, 0.16);
    vec3 cMagenta = vec3(0.96, 0.18, 0.52);
    vec3 cViolet  = vec3(0.46, 0.22, 0.78);
    vec3 cSapph   = vec3(0.16, 0.42, 0.90);
    vec3 cIce     = vec3(0.50, 0.88, 1.00);

    vec3 col = mix(cGold, cFlame, smoothstep(0.02, 0.15, yPerturb));
    col = mix(col, cMagenta, smoothstep(0.15, 0.37, yPerturb));
    col = mix(col, cViolet, smoothstep(0.35, 0.62, yPerturb));
    col = mix(col, cSapph, smoothstep(0.58, 0.82, yPerturb));
    col = mix(col, cIce, smoothstep(0.80, 0.96, yPerturb));

    // Structured sapphire/violet core lattice clearly visible while keeping overlaid white copy crisp
    vec3 coreTint = mix(vec3(0.14, 0.34, 0.76), col, 0.48);
    col = mix(coreTint, col, smoothstep(0.06, 0.62, vRim + vRidge * 0.35));

    // Topographic ridge folds & blazing rim crown
    float ridgeGlow = smoothstep(0.48, 0.92, vRidge) * 0.48;
    float crownBoost = (smoothstep(0.82, 1.0, y) + smoothstep(0.18, 0.0, y)) * vRim * 0.62;
    float luminance = 0.56 + vRim * 0.88 + ridgeGlow + crownBoost;

    // Pinpoint crisp white constellation stars sparsely scattered across the orb
    float isStar = step(0.9974, vRand) * (1.0 - vLayer);
    col = mix(col * luminance, vec3(0.96, 0.98, 1.0) * 1.3, isStar);

    // Front lattice crisp & legible; back hemisphere attenuates softly for 3D depth
    float depthFade = mix(1.0, 0.36, vDepth);
    float coreAlpha = mix(0.46, 0.96, pow(vRim, 0.72) + ridgeGlow * 0.75);
    float layerAlpha = vLayer > 0.5 ? (0.34 + 0.64 * vRim) * (0.55 + 0.45 * vRand) : coreAlpha;
    float alpha = disc * mix(layerAlpha, 0.98, isStar) * depthFade * uOpacity;

    if (alpha < 0.004) discard;
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.96));
  }
`

function buildParticleSphere(faceRes: number, fringeCount: number) {
  const shellCount = 6 * faceRes * faceRes
  const total = shellCount + fringeCount
  const pos = new Float32Array(total * 3)
  const rand = new Float32Array(total)
  const layer = new Float32Array(total)

  const hash = (n: number) => {
    const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453123
    return s - Math.floor(s)
  }

  let ptr = 0
  // Normalized 6-face cube-sphere gives uniform dot density with zero polar clumping
  // and the iconic orthogonal dot-matrix lattice visible across the center of the orb.
  for (let face = 0; face < 6; face++) {
    for (let iy = 0; iy < faceRes; iy++) {
      const v = ((iy + 0.5) / faceRes) * 2 - 1
      for (let ix = 0; ix < faceRes; ix++) {
        const u = ((ix + 0.5) / faceRes) * 2 - 1
        let x = 0
        let y = 0
        let z = 0
        if (face === 0) {
          x = u
          y = v
          z = 1
        } else if (face === 1) {
          x = -u
          y = v
          z = -1
        } else if (face === 2) {
          x = 1
          y = v
          z = -u
        } else if (face === 3) {
          x = -1
          y = v
          z = u
        } else if (face === 4) {
          x = u
          y = 1
          z = -v
        } else {
          x = u
          y = -1
          z = v
        }
        const inv = 1 / Math.hypot(x, y, z)
        pos[ptr * 3] = x * inv
        pos[ptr * 3 + 1] = y * inv
        pos[ptr * 3 + 2] = z * inv
        rand[ptr] = hash(ptr + 1)
        layer[ptr] = 0
        ptr++
      }
    }
  }

  // Outer wispy fringe spray particles distributed cleanly on a Fibonacci sphere
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < fringeCount; i++) {
    const y = 1 - ((i + 0.5) / fringeCount) * 2
    const rad = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    pos[ptr * 3] = Math.cos(theta) * rad
    pos[ptr * 3 + 1] = y
    pos[ptr * 3 + 2] = Math.sin(theta) * rad
    rand[ptr] = hash(ptr + 73)
    layer[ptr] = 1
    ptr++
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1))
  geo.setAttribute('aLayer', new THREE.BufferAttribute(layer, 1))
  return geo
}

export function ApproachPath() {
  const mobile = useScene((s) => s.mobile)

  const { geo, mat } = useMemo(() => {
    const g = buildParticleSphere(mobile ? 46 : 66, mobile ? 3200 : 6800)
    const m = new THREE.ShaderMaterial({
      vertexShader: sphereVertex,
      fragmentShader: sphereFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uDraw: { value: 0 },
        uFlux: { value: 0 },
        uOpacity: { value: 0 },
        uPixelRatio: { value: 1 },
      },
    })
    return { geo: g, mat: m }
  }, [mobile])

  const group = useRef<THREE.Group>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const live = useRef({ opacity: 0, draw: 0 })

  useEffect(
    () => () => {
      disposeAll(geo, mat)
    },
    [geo, mat],
  )

  useFrame((state, dt) => {
    const g = group.current
    const pts = pointsRef.current
    if (!g || !pts) return

    const p = targets().path
    const l = live.current
    const step = frameStep(dt)
    const moving = step === dt

    damp(l, 'opacity', p.opacity, SYNC_DAMP, step)
    damp(l, 'draw', p.draw, SYNC_DAMP, step)
    g.visible = l.opacity > 0.002
    if (!g.visible) return

    const time = state.clock.elapsedTime
    const draw = THREE.MathUtils.clamp(l.draw, 0, 1)

    // Scroll-locked 3D orbital rotation + subtle breathing precession
    pts.rotation.y = THREE.MathUtils.lerp(-0.85, 2.35, draw) + (moving ? time * 0.07 : 0)
    pts.rotation.x = THREE.MathUtils.lerp(0.22, -0.24, draw) + (moving ? Math.sin(time * 0.25) * 0.035 : 0)
    pts.rotation.z = THREE.MathUtils.lerp(-0.10, 0.10, draw)

    // Subtle scale swell across the 5-step arc
    const scale = 0.88 + 0.12 * l.opacity + 0.06 * Math.sin(draw * Math.PI)
    g.scale.setScalar(scale)

    const u = (pts.material as THREE.ShaderMaterial).uniforms
    u.uDraw!.value = draw
    u.uOpacity!.value = l.opacity
    u.uFlux!.value = flux.v
    u.uPixelRatio!.value = state.gl.getPixelRatio()
    if (moving) u.uTime!.value = time
  })

  return (
    <group ref={group} visible={false}>
      <points ref={pointsRef} geometry={geo} material={mat} frustumCulled={false} renderOrder={4} />
    </group>
  )
}
