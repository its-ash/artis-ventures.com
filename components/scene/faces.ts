import * as THREE from 'three'

// Cube faces: line diagrams of the practice each cube stands for (same motifs as the capability
// cards), inside a HUD frame with corner brackets. A light sweep crosses the face; the active cube
// burns brighter.

const S = 512
const C = S / 2

export const FACE = { launch: 0, deal: 1, growth: 2, frame: 3, target: 4 } as const

type Ctx = CanvasRenderingContext2D

const stroke = (ctx: Ctx, w: number, a: number, dash: number[] = []) => {
  ctx.lineWidth = w
  ctx.globalAlpha = a
  ctx.setLineDash(dash)
}
const square = (ctx: Ctx, x: number, y: number, s: number, fill = false) =>
  fill ? ctx.fillRect(x - s / 2, y - s / 2, s, s) : ctx.strokeRect(x - s / 2, y - s / 2, s, s)
const circle = (ctx: Ctx, x: number, y: number, r: number) => {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.stroke()
}
const path = (ctx: Ctx, pts: number[][]) => {
  ctx.beginPath()
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x!, y!) : ctx.moveTo(x!, y!)))
  ctx.stroke()
}

const frame = (ctx: Ctx) => {
  ctx.globalAlpha = 0.16
  for (let x = 64; x < S; x += 64) for (let y = 64; y < S; y += 64) ctx.fillRect(x - 2, y - 2, 4, 4)
  stroke(ctx, 3, 0.35)
  ctx.strokeRect(24, 24, S - 48, S - 48)
  stroke(ctx, 8, 1)
  const L = 48
  for (const [x, y, dx, dy] of [
    [24, 24, 1, 1],
    [S - 24, 24, -1, 1],
    [24, S - 24, 1, -1],
    [S - 24, S - 24, -1, -1],
  ] as const)
    path(ctx, [
      [x, y + dy * L],
      [x, y],
      [x + dx * L, y],
    ])
}

const DRAW: Record<number, (ctx: Ctx) => void> = {
  // Turnkey: a venture node with a satellite on its launch orbit.
  [FACE.launch]: (ctx) => {
    stroke(ctx, 4, 0.5, [14, 22])
    circle(ctx, C, C, 150)
    stroke(ctx, 3, 0.35)
    circle(ctx, C, C, 90)
    path(ctx, [
      [40, C],
      [106, C],
    ])
    path(ctx, [
      [406, C],
      [472, C],
    ])
    ctx.globalAlpha = 1
    square(ctx, C, C, 36, true)
    const a = (-40 * Math.PI) / 180
    square(ctx, C + Math.cos(a) * 150, C + Math.sin(a) * 150, 24, true)
  },
  // M&A: two entities joined by a deal line, a token on the way.
  [FACE.deal]: (ctx) => {
    stroke(ctx, 6, 1)
    square(ctx, 135, C, 130)
    square(ctx, 377, C, 130)
    stroke(ctx, 3, 0.35)
    square(ctx, 135, C, 60)
    square(ctx, 377, C, 60)
    stroke(ctx, 4, 0.5, [10, 14])
    path(ctx, [
      [200, C],
      [312, C],
    ])
    ctx.globalAlpha = 1
    square(ctx, 245, C, 22, true)
  },
  // Strategy: a growth path through waypoints.
  [FACE.growth]: (ctx) => {
    stroke(ctx, 3, 0.35)
    path(ctx, [
      [90, 100],
      [90, 420],
      [430, 420],
    ])
    const pts = [
      [90, 390],
      [180, 330],
      [260, 350],
      [340, 230],
      [420, 140],
    ]
    stroke(ctx, 6, 1)
    path(ctx, pts)
    ctx.globalAlpha = 1
    pts.slice(1, -1).forEach(([x, y]) => square(ctx, x!, y!, 20, true))
    square(ctx, 420, 140, 32, true)
  },
  // Regulatory: a checked core inside a frame, with a crosshair.
  [FACE.frame]: (ctx) => {
    stroke(ctx, 3, 0.4, [16, 16])
    square(ctx, C, C, 260)
    stroke(ctx, 6, 1)
    ctx.save()
    ctx.translate(C, C)
    ctx.rotate(Math.PI / 4)
    square(ctx, 0, 0, 180)
    ctx.restore()
    path(ctx, [
      [212, C],
      [242, 286],
      [302, 226],
    ])
    stroke(ctx, 3, 0.35)
    for (const [a, b] of [
      [
        [60, C],
        [110, C],
      ],
      [
        [402, C],
        [452, C],
      ],
      [
        [C, 60],
        [C, 110],
      ],
      [
        [C, 402],
        [C, 452],
      ],
    ])
      path(ctx, [a!, b!])
  },
  // Approach destination: a target reticle.
  [FACE.target]: (ctx) => {
    stroke(ctx, 6, 1)
    circle(ctx, C, C, 60)
    stroke(ctx, 3, 0.4)
    circle(ctx, C, C, 120)
    stroke(ctx, 4, 0.5, [12, 18])
    circle(ctx, C, C, 180)
    stroke(ctx, 3, 0.35)
    path(ctx, [
      [C, 50],
      [C, 160],
    ])
    path(ctx, [
      [C, 352],
      [C, 462],
    ])
    path(ctx, [
      [50, C],
      [160, C],
    ])
    path(ctx, [
      [352, C],
      [462, C],
    ])
    ctx.globalAlpha = 1
    square(ctx, C, C, 22, true)
  },
}

export const faceTexture = (kind: number) => {
  const c = document.createElement('canvas')
  c.width = c.height = S
  const ctx = c.getContext('2d')!
  ctx.strokeStyle = ctx.fillStyle = '#fff'
  ctx.lineCap = 'square'
  frame(ctx)
  DRAW[kind]?.(ctx)
  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 4
  return tex
}

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uColor;
  uniform float uTime, uOpacity, uSeed, uGlow;
  varying vec2 vUv;
  void main() {
    float ink = texture2D(uMap, vUv).a;
    // Diagonal light sweep, each cube on its own phase.
    float band = fract(uTime * 0.22 + uSeed * 0.13) * 1.8 - 0.4;
    float sweep = smoothstep(0.08, 0.0, abs(band - (vUv.x + vUv.y) * 0.5));
    float a = ink * (0.45 + 0.55 * uGlow) + ink * sweep * 0.8 + 0.03 + 0.04 * uGlow;
    gl_FragColor = vec4(uColor * (1.0 + sweep * 0.6), a * uOpacity);
  }
`

// Same uniforms the cube components already drive (uTime, uOpacity, uGlow, uColor).
export const faceMaterial = (kind: number, seed: number) =>
  new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
    uniforms: {
      uMap: { value: faceTexture(kind) },
      uColor: { value: new THREE.Color('#7fd6db') },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uSeed: { value: seed },
      uGlow: { value: 0 },
    },
  })

// Disposes the material and its canvas texture.
export const disposeFace = (m: THREE.ShaderMaterial) => {
  ;(m.uniforms.uMap!.value as THREE.Texture).dispose()
  m.dispose()
}

// Diagram ink and border colours on graphite (dark) and on stone (light).
export const INK_DARK = new THREE.Color('#7fd6db').multiplyScalar(1.15)
export const INK_LIGHT = new THREE.Color('#1d6f76')
export const EDGE_DARK = new THREE.Color('#7fd6db').multiplyScalar(1.6)
export const EDGE_LIGHT = new THREE.Color('#1d6f76')
