'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { damp, damp3, dampE } from 'maath/easing'
import { disposeAll } from '@/components/scene/geometry'
import { landDots } from '@/components/scene/sampling'
import { offices, reach } from '@/content/site'
import { latLonToVec } from '@/scene/geo'
import { DAMP, keyframes as K } from '@/scene/keyframes'
import { flux, frameStep, globeSpin, targets, useScene } from '@/scene/store'

const R = K.reach.globe.radius
const ARC_POINTS = 64
const UP = new THREE.Vector3(0, 1, 0)
const v3 = (lat: number, lon: number, r: number = R) => new THREE.Vector3(...latLonToVec(lat, lon, r))
// Pulse: laps per second along each arc. Ripple: rings per second from the stop in view, max radius.
const PULSE = 0.45
const RIPPLE = { speed: 0.55, size: 0.5 }
const TAU = Math.PI * 2
// Free spin (rad/s), extra spin per unit of scroll speed, sway once settled on a stop.
const SPIN = 0.32
const SPIN_FLUX = 1.4
const SWAY = 0.1
// Plexus: land dots sampled for the network, link reach (world units), links per dot.
const PLEXUS = { nodes: 1600, mobileNodes: 700, reach: 0.24, links: 2 }
// Floating particles around the planet: count and shell (× R).
const DUST = { count: 1400, mobileCount: 600, inner: 1.15, outer: 2.4 }
// Site palette (app/globals.css): graphite body, mist sea, teal land and lines, stone highlights.
const DEEP = new THREE.Color('#0c0e11')
const SEA = new THREE.Color('#4a5058')
const TEAL = new THREE.Color('#33b7c2')
const LAND = new THREE.Color('#7fd6db')
const MIST = new THREE.Color('#9aa3ab')
// Key light in view space (upper left, toward the viewer): shades the body and dims the night side's land.
const KEY = new THREE.Vector3(-0.45, 0.55, 0.7).normalize()
const glslKey = `vec3(${KEY.x.toFixed(3)}, ${KEY.y.toFixed(3)}, ${KEY.z.toFixed(3)})`
// HQ tower at each stop: base width, height, floor rings, beam length (world units); inactive stops stay low.
const CITY = { width: 0.11, height: 0.34, floors: 9, beam: 0.3, rest: 0.25 }
// Label per stop, in `K.reach.stops` order: the three regulators, then the Dubai and Hong Kong offices.
const stageOffices = ['dubai', 'hong-kong'].map((id) => offices.items.find((o) => o.id === id)!)
const LABELS = [
  ...reach.regulators.map((r) => ({ title: r.code, sub: r.country })),
  ...stageOffices.map((o) => ({ title: o.label, sub: ('entity' in o && o.entity) || '' })),
]
const LABEL = { height: 0.3, lift: CITY.height + CITY.beam + 0.04 }

const NEON = K.reach.neon.map((c) => new THREE.Color(c).multiplyScalar(1.15))
const neon = (i: number) => NEON[Math.min(NEON.length - 1, Math.max(0, i))]!

// `w` is the globe form weight (morph 6). The free spin rolls forward to the next full turn as it settles,
// so a stop always lands facing the camera.
const spin = (w: number, time: number, dt: number, motion: boolean) => {
  const free = targets().globe.spin
  const s = globeSpin
  if (w < 1e-3 || !motion) s.raw = 0
  else {
    s.raw += dt * (SPIN + flux.a * SPIN_FLUX) * w * free
    if (free < 1) s.raw = THREE.MathUtils.damp(s.raw, Math.ceil(s.raw / TAU - 1e-4) * TAU, 3 * (1 - free), dt)
  }
  const r = ((s.raw % TAU) + TAU) % TAU
  const sway = motion ? Math.sin(time * 0.4) * SWAY * (1 - free) : 0
  s.a = ((r > Math.PI ? r - TAU : r) + sway) * w
  return s.a
}

const viewVertex = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

// Body: graphite sphere lit by the key light, with a thin teal rim on the limb.
const coreMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    uniforms: { uDeep: { value: DEEP }, uTeal: { value: TEAL }, uOpacity: { value: 0 } },
    vertexShader: viewVertex,
    fragmentShader: /* glsl */ `
      uniform vec3 uDeep, uTeal; uniform float uOpacity;
      varying vec3 vN; varying vec3 vV;
      void main() {
        float lit = max(dot(vN, ${glslKey}), 0.0);
        float rim = pow(1.0 - max(dot(vN, vV), 0.0), 4.0);
        vec3 col = uDeep * (0.85 + 0.6 * lit) + uTeal * rim * (0.25 + 0.5 * lit);
        gl_FragColor = vec4(col, uOpacity);
      }
    `,
  })

// Graticule: hairline meridians and parallels every 20°; a sweep brightens the lines it passes.
const gridMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uMist: { value: MIST }, uTeal: { value: LAND }, uOpacity: { value: 0 }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying float vA, vSweep;
      void main() {
        float face = clamp(normalize(normalMatrix * normalize(position)).z * 0.5 + 0.5, 0.0, 1.0);
        vSweep = smoothstep(0.93, 1.0, fract(atan(position.z, position.x) / 6.28318 - uTime * 0.05));
        vA = face * face;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uMist, uTeal; uniform float uOpacity;
      varying float vA, vSweep;
      void main() { gl_FragColor = vec4(mix(uMist, uTeal, vSweep), vA * uOpacity * (0.09 + 0.35 * vSweep)); }
    `,
  })

// Planet dots: teal land (dimmer on the night side), faint mist sea, soft round glow. They stream in from the surrounding space as the
// globe forms and drift back out as it leaves; each twinkles on its own phase.
const dotMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uSea: { value: SEA },
      uLand: { value: LAND },
      uOpacity: { value: 0 },
      uReveal: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 14 },
      uPixel: { value: 1 },
    },
    vertexShader: /* glsl */ `
      attribute float aLand, aRnd;
      uniform float uReveal, uTime, uSize, uPixel;
      varying float vA, vLand;
      void main() {
        vec3 n = normalize(position);
        float delay = aRnd * 0.55;
        float pr = smoothstep(delay, delay + 0.45, uReveal);
        float e = 1.0 - pow(1.0 - pr, 3.0);
        vec3 drift = vec3(sin(aRnd * 41.0), cos(aRnd * 23.0), sin(aRnd * 13.0)) * 0.6;
        vec3 p = mix(n * ${R.toFixed(3)} * (1.8 + aRnd * 1.2) + drift, position, e);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        vec3 vn = normalize(normalMatrix * n);
        float face = clamp(vn.z * 0.5 + 0.5, 0.0, 1.0);
        float day = 0.35 + 0.65 * smoothstep(-0.3, 0.6, dot(vn, ${glslKey}));
        float twinkle = 0.75 + 0.25 * sin(uTime * 2.0 + aRnd * 60.0);
        vA = pr * mix(0.14, 0.85 * day, aLand) * (0.2 + 0.8 * face) * twinkle;
        vLand = aLand;
        gl_PointSize = uSize * uPixel * mix(0.7, 1.2, aLand) * (0.8 + aRnd * 0.4) / -mv.z;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uSea, uLand; uniform float uOpacity;
      varying float vA, vLand;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float core = smoothstep(0.5, 0.0, d);
        vec3 col = mix(uSea, uLand, vLand) + vec3(pow(core, 6.0) * 0.3 * vLand);
        gl_FragColor = vec4(col, core * vA * uOpacity);
      }
    `,
  })

// Plexus network over the continents: faint links with pulses running through them.
const plexusMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uCyan: { value: TEAL }, uOpacity: { value: 0 }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float aRnd;
      uniform float uTime;
      varying float vA;
      void main() {
        float pulse = smoothstep(0.85, 1.0, fract(uTime * 0.3 + aRnd));
        float face = clamp(normalize(normalMatrix * normalize(position)).z * 0.5 + 0.5, 0.0, 1.0);
        vA = (0.14 + 0.5 * pulse) * face;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uCyan; uniform float uOpacity;
      varying float vA;
      void main() { gl_FragColor = vec4(uCyan, vA * uOpacity); }
    `,
  })

// Floating particles in the space around the planet: tiny, twinkling, slowly orbiting.
const dustMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uCyan: { value: MIST }, uOpacity: { value: 0 }, uTime: { value: 0 }, uPixel: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aRnd;
      uniform float uTime, uPixel;
      varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        vA = (0.25 + 0.75 * step(0.93, aRnd)) * (0.6 + 0.4 * sin(uTime * 1.5 + aRnd * 80.0));
        gl_PointSize = uPixel * (6.0 + 10.0 * step(0.93, aRnd)) / -mv.z;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uCyan; uniform float uOpacity;
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(uCyan, smoothstep(0.5, 0.0, d) * vA * uOpacity);
      }
    `,
  })

// Round soft glints that ride the arcs (point sprites are square by default).
const cometMaterial = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: LAND }, opacity: { value: 0 } },
    vertexShader: /* glsl */ `
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = 90.0 / -mv.z;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float opacity;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, d) * opacity);
      }
    `,
  })

// Links between nearby land dots, at most `links` per dot, lifted just off the surface.
const plexusGeometry = (dots: THREE.BufferGeometry, nodes: number) => {
  const pos = dots.getAttribute('position') as THREE.BufferAttribute
  const land = dots.getAttribute('aLand') as THREE.BufferAttribute
  const pts: THREE.Vector3[] = []
  for (let i = 0; i < pos.count; i++) if (land.getX(i) > 0.5) pts.push(new THREE.Vector3().fromBufferAttribute(pos, i))
  const step = Math.max(1, Math.floor(pts.length / nodes))
  const sel = pts.filter((_, i) => i % step === 0).map((p) => p.multiplyScalar(1.012))
  const out: number[] = []
  const rnd: number[] = []
  const r2 = PLEXUS.reach * PLEXUS.reach
  sel.forEach((a, i) => {
    let n = 0
    for (let j = i + 1; j < sel.length && n < PLEXUS.links; j++) {
      const b = sel[j]!
      if (a.distanceToSquared(b) > r2) continue
      out.push(a.x, a.y, a.z, b.x, b.y, b.z)
      const r = Math.random()
      rnd.push(r, r)
      n++
    }
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(out, 3))
  g.setAttribute('aRnd', new THREE.Float32BufferAttribute(rnd, 1))
  return g
}

const graticule = () => {
  const r = R * 1.006
  const pts: number[] = []
  const seg = (a: number[], b: number[]) => pts.push(...a, ...b)
  for (let lat = -80; lat <= 80; lat += 20)
    for (let lon = -180; lon < 180; lon += 4) seg(latLonToVec(lat, lon, r), latLonToVec(lat, lon + 4, r))
  for (let lon = -180; lon < 180; lon += 20)
    for (let lat = -88; lat < 88; lat += 4) seg(latLonToVec(lat, lon, r), latLonToVec(lat + 4, lon, r))
  return new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
}

const dustGeometry = (count: number) => {
  const pos: number[] = []
  const rnd: number[] = []
  const v = new THREE.Vector3()
  for (let i = 0; i < count; i++) {
    v.randomDirection().multiplyScalar(R * (DUST.inner + Math.random() * (DUST.outer - DUST.inner)))
    pos.push(v.x, v.y, v.z)
    rnd.push(Math.random())
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('aRnd', new THREE.Float32BufferAttribute(rnd, 1))
  return g
}

// Great-circle arc lifted off the surface, higher for longer hops.
const arc = (a: THREE.Vector3, b: THREE.Vector3) => {
  const angle = a.angleTo(b)
  const lift = 0.1 + 0.32 * (angle / Math.PI)
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

// HQ on the local XZ plane (the tangent plane at a stop), base at y = 0: a tapered hexagonal glass shaft
// with a spire, a wire frame (corner edges, a ring per floor, a hexagonal landing pad) and a light beam.
const TOWER_TOP = CITY.height * 1.12
const tower = () => {
  const { width: w, height: h, floors } = CITY
  const rb = w * 0.5
  const rt = w * 0.3
  const shaft = new THREE.CylinderGeometry(rt, rb, h, 6).translate(0, h / 2, 0)
  const spire = new THREE.CylinderGeometry(0.002, w * 0.06, h * 0.12, 6).translate(0, h * 1.06, 0)
  const body = mergeGeometries([shaft, spire])
  ;[shaft, spire].forEach((g) => g.dispose())
  const hex = (r: number, y: number) => Array.from({ length: 6 }, (_, k) => new THREE.Vector3(Math.cos((k / 6) * TAU) * r, y, Math.sin((k / 6) * TAU) * r))
  const pts: THREE.Vector3[] = []
  const loop = (v: THREE.Vector3[]) => v.forEach((p, k) => pts.push(p, v[(k + 1) % v.length]!))
  const bottom = hex(rb, 0)
  const top = hex(rt, h)
  bottom.forEach((p, k) => pts.push(p, top[k]!))
  for (let f = 0; f <= floors; f++) loop(hex(rb + (rt - rb) * (f / floors), (h * f) / floors))
  loop(hex(w * 0.95, 0.004))
  loop(hex(w * 1.25, 0.004))
  const frame = new THREE.BufferGeometry().setFromPoints(pts)
  return { body, frame }
}

// Frame lines brighten as a scan band climbs the floors.
const frameMaterial = (color: THREE.Color) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: color }, uOpacity: { value: 0 }, uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying float vY;
      void main() {
        vY = position.y / ${CITY.height.toFixed(3)};
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uOpacity, uTime;
      varying float vY;
      void main() {
        float scan = exp(-pow((vY - fract(uTime * 0.45) * 1.2) * 10.0, 2.0));
        gl_FragColor = vec4(mix(uColor, vec3(1.0), scan * 0.6), uOpacity * (0.55 + 0.45 * scan));
      }
    `,
  })

// Light beam from the spire to the label, fading upward.
const beamMaterial = (color: THREE.Color) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: color }, uOpacity: { value: 0 } },
    vertexShader: /* glsl */ `
      varying float vV;
      void main() {
        vV = uv.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uOpacity;
      varying float vV;
      void main() { gl_FragColor = vec4(uColor, pow(1.0 - vV, 1.5) * uOpacity); }
    `,
  })

// Label sprite: stop name in outline type, context line in mono, inside HUD corner brackets.
const labelTexture = (title: string, sub: string) => {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 256
  const ctx = c.getContext('2d')!
  const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || 'sans-serif'
  ctx.strokeStyle = ctx.fillStyle = '#fff'
  ctx.lineWidth = 4
  const L = 30
  for (const [x, y, dx, dy] of [
    [4, 12, 1, 1],
    [1020, 12, -1, 1],
    [4, 244, 1, -1],
    [1020, 244, -1, -1],
  ] as const) {
    ctx.beginPath()
    ctx.moveTo(x, y + dy * L)
    ctx.lineTo(x, y)
    ctx.lineTo(x + dx * L, y)
    ctx.stroke()
  }
  ctx.font = `500 120px ${css('--font-inter-tight')}`
  ctx.lineWidth = 3
  ctx.lineJoin = 'round'
  ctx.strokeText(title, 40, 142, 940)
  ctx.font = `400 34px ${css('--font-jetbrains')}`
  ctx.letterSpacing = '6px'
  ctx.globalAlpha = 0.85
  ctx.fillRect(44, 186, 14, 14)
  ctx.fillText(sub.toUpperCase(), 72, 200, 920)
  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 4
  return tex
}

// Unit circle in the local XZ plane (the tangent plane at a pin).
const circle = (n = 64) =>
  new THREE.BufferGeometry().setFromPoints(Array.from({ length: n }, (_, i) => new THREE.Vector3(Math.cos((i / n) * TAU), 0, Math.sin((i / n) * TAU))))

// Digital planet in the site palette: teal land dots over a lit graphite body, a hairline graticule with a
// sweep, a plexus network over the land, floating
// particles, a neon tower and label at each stop (the stop in view rises tallest), ripples and Dubai arcs.
// Pose follows `targets.particles`; the dots stream in as `morph` reaches 6 and drift out as it leaves.
export function DotGlobe() {
  const mobile = useScene((s) => s.mobile)
  const quality = useScene((s) => s.quality)
  const lite = mobile || quality === 0
  const count = lite ? K.matrix.mobileDots : K.matrix.dots
  const dpr = useThree((s) => s.viewport.dpr)
  const [dots, setDots] = useState<{ points: THREE.BufferGeometry; plexus: THREE.BufferGeometry } | null>(null)
  useEffect(() => {
    let off = false
    let made: typeof dots = null
    void landDots(R, count).then((points) => {
      const plexus = plexusGeometry(points, lite ? PLEXUS.mobileNodes : PLEXUS.nodes)
      if (off) return disposeAll(points, plexus)
      made = { points, plexus }
      setDots(made)
    })
    return () => {
      off = true
      if (made) disposeAll(made.points, made.plexus)
    }
  }, [count, lite])

  const hub = useMemo(() => v3(K.reach.hub.lat, K.reach.hub.lon), [])
  const stops = useMemo(() => K.reach.stops.map((s) => v3(s.lat, s.lon)), [])
  // Arcs from the Dubai hub to every stop that is not Dubai itself, each in its destination's neon.
  const arcs = useMemo(
    () =>
      stops.flatMap((s, i) =>
        s.distanceTo(hub) > 0.05 ? [new THREE.Line(arc(hub, s), new THREE.LineBasicMaterial({ color: neon(i), transparent: true, opacity: 0, toneMapped: false }))] : [],
      ),
    [stops, hub],
  )
  const cities = useMemo(() => stops.map(() => tower()), [stops])
  const frames = useMemo(() => stops.map((_, i) => frameMaterial(neon(i))), [stops])
  const beams = useMemo(() => stops.map((_, i) => beamMaterial(neon(i))), [stops])
  const beam = useMemo(() => new THREE.CylinderGeometry(0.008, 0.008, CITY.beam, 8, 1, true).translate(0, CITY.beam / 2, 0), [])
  const beacon = useMemo(() => new THREE.OctahedronGeometry(0.022), [])
  const [labels, setLabels] = useState<THREE.SpriteMaterial[] | null>(null)
  useEffect(() => {
    let off = false
    let made: THREE.SpriteMaterial[] = []
    void document.fonts.ready.then(() => {
      if (off) return
      made = LABELS.map(
        (t, i) => new THREE.SpriteMaterial({ map: labelTexture(t.title, t.sub), color: neon(i), transparent: true, opacity: 0, depthWrite: false, toneMapped: false }),
      )
      setLabels(made)
    })
    return () => {
      off = true
      made.forEach((m) => {
        m.map?.dispose()
        m.dispose()
      })
    }
  }, [])
  const ring = useMemo(() => circle(), [])
  const core = useMemo(() => new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 64, 64), coreMaterial()), [])
  const dotMat = useMemo(() => dotMaterial(), [])
  const grid = useMemo(() => new THREE.LineSegments(graticule(), gridMaterial()), [])
  const plexusMat = useMemo(() => plexusMaterial(), [])
  const dust = useMemo(() => new THREE.Points(dustGeometry(lite ? DUST.mobileCount : DUST.count), dustMaterial()), [lite])
  const comets = useMemo(
    () => new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(arcs.length * 3), 3)), cometMaterial()),
    [arcs],
  )

  const group = useRef<THREE.Group>(null)
  const spinner = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const dotRef = useRef<THREE.Points>(null)
  const gridRef = useRef<THREE.LineSegments>(null)
  const plexusRef = useRef<THREE.LineSegments>(null)
  const dustRef = useRef<THREE.Points>(null)
  const cometRef = useRef<THREE.Points>(null)
  const pins = useRef<(THREE.Group | null)[]>([])
  const hqs = useRef<(THREE.Group | null)[]>([])
  const lights = useRef<(THREE.Mesh | null)[]>([])
  const tops = useRef<(THREE.Mesh | null)[]>([])
  const tags = useRef<(THREE.Sprite | null)[]>([])
  const ripples = useRef<(THREE.LineLoop | null)[]>([])
  const lines = useRef<(THREE.Line | null)[]>([])
  const live = useRef({ opacity: 0, pins: 0, arcs: 0, morph: 0, land: 0, stop: 0 })

  useEffect(
    () => () =>
      disposeAll(
        ...cities.flatMap((c) => [c.body, c.frame]),
        ...frames,
        ...beams,
        beam,
        beacon,
        ring,
        dotMat,
        plexusMat,
        ...arcs.flatMap((a) => [a.geometry, a.material as THREE.Material]),
        ...[core, grid, dust, comets].flatMap((o) => [o.geometry, o.material as THREE.Material]),
      ),
    [cities, frames, beams, beam, beacon, ring, dotMat, plexusMat, arcs, core, grid, dust, comets],
  )

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const { particles: p, globe } = targets()
    const l = live.current
    const fs = frameStep(dt)
    damp(l, 'opacity', globe.opacity, DAMP, fs)
    damp(l, 'pins', globe.pins, DAMP, fs)
    damp(l, 'arcs', globe.arcs, DAMP, fs)
    damp(l, 'morph', p.morph, DAMP, fs)
    damp(l, 'land', p.opacity, DAMP, fs)
    damp(l, 'stop', globe.stop, DAMP, fs)
    const reveal = 1 - Math.min(1, Math.abs(l.morph - 6))
    const landA = reveal > 0 ? l.land : 0
    const shown = Math.max(l.opacity, landA)
    g.visible = shown > 0.002
    const ps = g.visible ? fs : 10
    damp3(g.position, [p.x, p.y, p.z], DAMP, ps)
    dampE(g.rotation, [p.rx, p.ry, p.rz], DAMP, ps)
    damp3(g.scale, [p.scale, p.scale, p.scale], DAMP, ps)
    if (!g.visible) return

    const motion = fs === dt
    const time = state.clock.elapsedTime
    const pixel = dpr * (state.size.height / 900)
    if (spinner.current) spinner.current.rotation.y = spin(reveal, time, Math.min(dt, 0.1), motion)

    if (coreRef.current) (coreRef.current.material as THREE.ShaderMaterial).uniforms.uOpacity!.value = shown
    if (dotRef.current) {
      const u = (dotRef.current.material as THREE.ShaderMaterial).uniforms
      u.uOpacity!.value = landA
      u.uReveal!.value = reveal
      u.uPixel!.value = pixel
      u.uSize!.value = 14 * Math.sqrt(K.matrix.dots / count)
      if (motion) u.uTime!.value = time
    }
    if (gridRef.current) {
      const u = (gridRef.current.material as THREE.ShaderMaterial).uniforms
      u.uOpacity!.value = landA * THREE.MathUtils.smoothstep(reveal, 0.4, 1)
      if (motion) u.uTime!.value = time
    }
    if (plexusRef.current) {
      const u = (plexusRef.current.material as THREE.ShaderMaterial).uniforms
      u.uOpacity!.value = landA * THREE.MathUtils.smoothstep(reveal, 0.6, 1)
      if (motion) u.uTime!.value = time
    }
    if (dustRef.current) {
      const u = (dustRef.current.material as THREE.ShaderMaterial).uniforms
      u.uOpacity!.value = landA * reveal
      u.uPixel!.value = pixel
      if (motion) {
        u.uTime!.value = time
        dustRef.current.rotation.y = time * 0.04
      }
    }

    const si = Math.floor(l.stop)
    pins.current.forEach((m, i) => {
      if (!m) return
      const rise = THREE.MathUtils.clamp(l.pins - i, 0, 1)
      const focus = Math.max(0, 1 - Math.abs(l.stop - i))
      // HQ: grows from the pad as its stop is reached, tallest while in view; beacon rides the spire,
      // the beam shows only for the stop in view.
      const fade = l.opacity * Math.min(1, rise * 3)
      const sy = Math.max(0.001, rise * (CITY.rest + (1 - CITY.rest) * focus))
      const hq = hqs.current[i]
      if (hq) {
        hq.scale.y = sy
        const [body, frame] = hq.children as [THREE.Mesh, THREE.LineSegments]
        ;(body.material as THREE.Material).opacity = fade * (0.1 + 0.15 * focus)
        const u = (frame.material as THREE.ShaderMaterial).uniforms
        u.uOpacity!.value = fade * (0.4 + 0.6 * focus)
        if (motion) u.uTime!.value = time + i * 0.37
      }
      const top = tops.current[i]
      if (top) {
        top.position.y = TOWER_TOP * sy + 0.02
        top.scale.setScalar(motion ? 1 + 0.25 * Math.sin(time * 4 + i) * focus : 1)
        if (motion) top.rotation.y = time * 1.5
        ;(top.material as THREE.Material).opacity = fade * (0.5 + 0.5 * focus)
      }
      const light = lights.current[i]
      if (light) {
        light.position.y = TOWER_TOP * sy
        ;(light.material as THREE.ShaderMaterial).uniforms.uOpacity!.value = fade * THREE.MathUtils.smoothstep(focus, 0.4, 1)
      }
      const tag = tags.current[i]
      if (tag) (tag.material as THREE.SpriteMaterial).opacity = l.opacity * rise * THREE.MathUtils.smoothstep(focus, 0.4, 1)
      // Two staggered rings spread from the stop in view.
      const active = focus * l.opacity * rise
      for (let j = 0; j < 2; j++) {
        const r = ripples.current[i * 2 + j]
        if (!r) continue
        const ph = motion ? (time * RIPPLE.speed + j * 0.5) % 1 : 0.5
        const s = 0.04 + ph * RIPPLE.size
        r.scale.set(s, 1, s)
        ;(r.material as THREE.LineBasicMaterial).opacity = active * (1 - ph) * 0.9
      }
    })

    // A light pulse travels each fully drawn arc from the hub; undrawn arcs park theirs inside the core.
    const cm = cometRef.current
    const pos = cm?.geometry.getAttribute('position') as THREE.BufferAttribute | undefined
    lines.current.forEach((ln, i) => {
      if (!ln) return
      const t = THREE.MathUtils.clamp(l.arcs - i, 0, 1)
      ln.geometry.setDrawRange(0, Math.floor(t * (ARC_POINTS + 1)))
      ;(ln.material as THREE.Material).opacity = l.opacity
      if (!pos) return
      const src = ln.geometry.getAttribute('position') as THREE.BufferAttribute
      const k = Math.floor(((time * PULSE + i * 0.27) % 1) * ARC_POINTS)
      if (t >= 1) pos.setXYZ(i, src.getX(k), src.getY(k), src.getZ(k))
      else pos.setXYZ(i, 0, 0, 0)
    })
    if (cm && pos) {
      pos.needsUpdate = true
      const u = (cm.material as THREE.ShaderMaterial).uniforms
      u.uColor!.value = neon(si)
      u.opacity!.value = motion ? l.opacity : 0
    }
  })

  return (
    <group ref={group} visible={false}>
      <primitive ref={coreRef} object={core} renderOrder={-1} />
      <primitive ref={dustRef} object={dust} frustumCulled={false} />
      <group ref={spinner}>
        <primitive ref={gridRef} object={grid} frustumCulled={false} />
        {dots && <points ref={dotRef} geometry={dots.points} material={dotMat} frustumCulled={false} />}
        {dots && <lineSegments ref={plexusRef} geometry={dots.plexus} material={plexusMat} frustumCulled={false} />}
        {stops.map((s, i) => (
          <group
            key={i}
            position={s}
            quaternion={new THREE.Quaternion().setFromUnitVectors(UP, s.clone().normalize())}
            ref={(m) => {
              pins.current[i] = m
            }}
          >
            <group
              ref={(h) => {
                hqs.current[i] = h
              }}
            >
              <mesh geometry={cities[i]!.body}>
                <meshBasicMaterial color={neon(i)} transparent opacity={0} toneMapped={false} depthWrite={false} />
              </mesh>
              <lineSegments geometry={cities[i]!.frame} material={frames[i]} />
            </group>
            <mesh
              geometry={beacon}
              ref={(b) => {
                tops.current[i] = b
              }}
            >
              <meshBasicMaterial color={neon(i)} transparent opacity={0} toneMapped={false} wireframe />
            </mesh>
            <mesh
              geometry={beam}
              material={beams[i]}
              ref={(b) => {
                lights.current[i] = b
              }}
            />
            {[0, 1].map((j) => (
              <lineLoop
                key={j}
                geometry={ring}
                position={[0, 0.01, 0]}
                ref={(r: THREE.LineLoop | null) => {
                  ripples.current[i * 2 + j] = r
                }}
              >
                <lineBasicMaterial color={neon(i)} transparent opacity={0} toneMapped={false} depthWrite={false} />
              </lineLoop>
            ))}
          </group>
        ))}
        {labels?.map((m, i) => (
          <sprite
            key={i}
            material={m}
            position={stops[i]!.clone().normalize().multiplyScalar(R + LABEL.lift)}
            scale={[LABEL.height * 4, LABEL.height, 1]}
            center={[0, 0.2]}
            ref={(s: THREE.Sprite | null) => {
              tags.current[i] = s
            }}
          />
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
        <primitive ref={cometRef} object={comets} frustumCulled={false} />
      </group>
    </group>
  )
}
