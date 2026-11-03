'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { damp } from 'maath/easing'
import { reach } from '@/content/site'
import { stops, type Stop } from '@/content/stops'
import { DAMP, keyframes as K } from '@/scene/keyframes'
import { flux, frameStep, targets, useScene } from '@/scene/store'
import { layout, view, vy } from '@/scene/view'

// Reach: a square wall of white cubes at the stage centre, flush (no gaps) so each stop card reads as one
// panel, sliced across the cubes. As `targets.wall.step` moves k → k + 1 the wall opens (gaps grow), the
// cubes roll a quarter turn about X, each in its own place, in a wave from the top-left corner, then the
// gaps close and the cubes merge into the next card. Faces round X carry cards k, k + 1, … in turn, so any
// number of stops fits on four faces.

const ATLAS_COLS = 3
// Material white (kept under 0.97, the bloom threshold) with black type; same as `--card-*` in globals.css.
const WHITE = '#f5f5f5'
const INK = '#111111'
const GREY = '#5f6368'
const SIDE = new THREE.Color('#d6d6d6')
// Share of a step spent opening and closing the gaps; the turns run between.
const OPEN = 0.2

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smooth = (t: number) => t * t * (3 - 2 * t)
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const pad = (n: number) => String(n).padStart(2, '0')
const cssFont = (v: string, d: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || d

type Atlas = { tex: THREE.CanvasTexture; cols: number; rows: number }

// Largest size (≤ `size`) at which `text` fits in `max` px.
const fit = (ctx: CanvasRenderingContext2D, text: string, font: (s: number) => string, size: number, max: number, track = 0) => {
  let s = size
  for (; s > 8; s *= 0.94) {
    ctx.font = font(s)
    ctx.letterSpacing = `${track * s}px`
    if (ctx.measureText(text).width <= max) break
  }
  return s
}

function drawCard(ctx: CanvasRenderingContext2D, s: Stop, k: number, S: number, f: { display: string; mono: string; sans: string }) {
  const u = S / 1024
  const P = 88 * u
  const W = S - 2 * P
  const mono = (z: number) => `400 ${z}px ${f.mono}`

  ctx.fillStyle = WHITE
  ctx.fillRect(0, 0, S, S)
  ctx.strokeStyle = INK
  ctx.lineWidth = 2 * u
  ctx.strokeRect(36 * u, 36 * u, S - 72 * u, S - 72 * u)

  ctx.textBaseline = 'top'
  ctx.fillStyle = GREY
  ctx.textAlign = 'left'
  fit(ctx, s.kicker.toUpperCase(), mono, 30 * u, W * 0.72, 0.12)
  ctx.fillText(s.kicker.toUpperCase(), P, P)
  ctx.textAlign = 'right'
  ctx.fillText(`[${pad(k + 1)}/${pad(stops.length)}]`, S - P, P)
  ctx.textAlign = 'left'

  const ts = fit(ctx, s.title, (z) => `500 ${z}px ${f.display}`, (s.title.length <= 3 ? 340 : 156) * u, W, -0.04)
  let y = P + 90 * u + ts * 0.74
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = INK
  ctx.fillText(s.title, P, y)

  y += 86 * u
  if (s.sub) {
    ctx.fillStyle = INK
    fit(ctx, s.sub.toUpperCase(), mono, 38 * u, W, 0.12)
    ctx.fillText(s.sub.toUpperCase(), P, y)
    y += 58 * u
  }
  s.meta.forEach((m, i) => {
    ctx.fillStyle = i ? GREY : INK
    fit(ctx, m.toUpperCase(), mono, 28 * u, W, 0.1)
    ctx.fillText(m.toUpperCase(), P, y)
    y += 46 * u
  })

  // Address on the bottom edge; a regulator with no office there shows the frameworks caption.
  const lines = s.address.length ? s.address : [reach.caption]
  const lh = 50 * u
  lines.forEach((l, i) => {
    ctx.fillStyle = s.address.length ? GREY : INK
    if (s.address.length) fit(ctx, l, (z) => `400 ${z}px ${f.sans}`, 36 * u, W)
    else fit(ctx, l.toUpperCase(), mono, 28 * u, W, 0.12)
    ctx.fillText(s.address.length ? l : l.toUpperCase(), P, S - P - (lines.length - 1 - i) * lh)
  })
}

const cardAtlas = async (px: number): Promise<Atlas> => {
  await document.fonts.ready
  const f = {
    display: cssFont('--font-inter-tight', 'sans-serif'),
    mono: cssFont('--font-jetbrains', 'monospace'),
    sans: cssFont('--font-inter', 'sans-serif'),
  }
  const rows = Math.ceil(stops.length / ATLAS_COLS)
  const c = document.createElement('canvas')
  c.width = ATLAS_COLS * px
  c.height = rows * px
  const ctx = c.getContext('2d')!
  stops.forEach((s, k) => {
    ctx.save()
    ctx.translate((k % ATLAS_COLS) * px, Math.floor(k / ATLAS_COLS) * px)
    ctx.beginPath()
    ctx.rect(0, 0, px, px)
    ctx.clip()
    drawCard(ctx, s, k, px, f)
    ctx.restore()
  })
  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 8
  return { tex, cols: ATLAS_COLS, rows }
}

// Face j round X: 0 front · 1 bottom · 2 back · 3 top (BoxGeometry normals); ±X are the sides.
// The cube turns -90° · step about X, so face j is in front at step j (mod 4) and carries the card
// nearest to the step that matches it. `q` is where a point lands once its face turns to the front.
const vertex = /* glsl */ `
  attribute vec2 aCell;
  attribute float aStep;
  uniform vec2 uGrid;
  uniform float uCount;
  varying vec2 vUv;
  varying vec2 vLocal;
  varying float vCard;
  varying float vSide;
  varying float vShade;
  void main() {
    float j = normal.z > 0.5 ? 0.0 : normal.y < -0.5 ? 1.0 : normal.z < -0.5 ? 2.0 : normal.y > 0.5 ? 3.0 : -1.0;
    vSide = step(j, -0.5);
    float a = -max(j, 0.0) * 1.5707963;
    vec2 q = vec2(position.x, position.y * cos(a) - position.z * sin(a));
    vLocal = q + 0.5;
    vUv = (aCell + vLocal) / uGrid;
    vCard = clamp(j + 4.0 * floor((aStep - j) / 4.0 + 0.5), 0.0, uCount - 1.0);
    vShade = max(normalize(normalMatrix * mat3(instanceMatrix) * normal).z, 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform vec2 uAtlasGrid;
  uniform vec3 uSide;
  uniform float uOpacity;
  uniform float uOpen;
  varying vec2 vUv;
  varying vec2 vLocal;
  varying float vCard;
  varying float vSide;
  varying float vShade;
  void main() {
    float card = floor(vCard + 0.5);
    vec2 cell = vec2(mod(card, uAtlasGrid.x), floor(card / uAtlasGrid.x));
    vec2 uv = vec2((cell.x + vUv.x) / uAtlasGrid.x, (uAtlasGrid.y - 1.0 - cell.y + vUv.y) / uAtlasGrid.y);
    vec3 face = mix(texture2D(uAtlas, uv).rgb, uSide, vSide);
    vec2 e = min(vLocal, 1.0 - vLocal);
    // Cube edges show only while the wall is open, so the merged wall reads as one card.
    float edge = (1.0 - smoothstep(0.0, 0.03, min(e.x, e.y))) * uOpen;
    gl_FragColor = vec4(face * (0.55 + 0.45 * vShade) * (1.0 - 0.18 * edge), uOpacity);
  }
`

const wallMaterial = () =>
  new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    toneMapped: false,
    uniforms: {
      uAtlas: { value: null },
      uAtlasGrid: { value: new THREE.Vector2(ATLAS_COLS, 1) },
      uGrid: { value: new THREE.Vector2(1, 1) },
      uCount: { value: stops.length },
      uSide: { value: SIDE },
      uOpacity: { value: 0 },
      uOpen: { value: 0 },
    },
  })

function Wall({ n }: { n: number }) {
  const mobile = useScene((s) => s.mobile)
  const quality = useScene((s) => s.quality)
  const px = mobile || quality === 0 ? 512 : 1024
  const count = n * n
  const [atlas, setAtlas] = useState<Atlas | null>(null)
  useEffect(() => {
    let off = false
    let made: Atlas | null = null
    void cardAtlas(px).then((a) => {
      if (off) return a.tex.dispose()
      made = a
      setAtlas(a)
    })
    return () => {
      off = true
      made?.tex.dispose()
    }
  }, [px])

  const geo = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1)
    const cell = new Float32Array(count * 2)
    for (let i = 0; i < count; i++) {
      cell[i * 2] = i % n
      cell[i * 2 + 1] = Math.floor(i / n)
    }
    g.setAttribute('aCell', new THREE.InstancedBufferAttribute(cell, 2))
    g.setAttribute('aStep', new THREE.InstancedBufferAttribute(new Float32Array(count), 1).setUsage(THREE.DynamicDrawUsage))
    return g
  }, [n, count])
  const mat = useMemo(() => wallMaterial(), [])
  useEffect(() => () => geo.dispose(), [geo])
  useEffect(() => () => mat.dispose(), [mat])

  const mesh = useRef<THREE.InstancedMesh>(null)
  const live = useRef({ opacity: 0, step: 0 })
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((_, dt) => {
    const m = mesh.current
    if (!m) return
    const w = targets().wall
    const fs = frameStep(dt)
    const l = live.current
    damp(l, 'opacity', w.opacity, DAMP, fs)
    damp(l, 'step', w.step, DAMP, fs)
    m.visible = !!atlas && l.opacity > 0.002
    if (!atlas || !m.visible) return
    const u = (m.material as THREE.ShaderMaterial).uniforms
    u.uAtlas!.value = atlas.tex
    ;(u.uAtlasGrid!.value as THREE.Vector2).set(atlas.cols, atlas.rows)
    ;(u.uGrid!.value as THREE.Vector2).set(n, n)
    u.uOpacity!.value = l.opacity

    const W = layout().wall
    const v = view()
    const pitch = (Math.min(v.w, v.h) * 2 * W.size) / n
    const cy = vy(W.y)
    const last = stops.length - 1
    const P = Math.min(last, Math.max(0, l.step))
    const k = Math.max(0, Math.min(Math.floor(P), last - 1))
    const f = P - k
    // Open → turn → close: the gaps grow over the first OPEN of the step and shrink over the last.
    const open = smooth(clamp01(f / OPEN)) * smooth(clamp01((1 - f) / OPEN))
    const span = pitch * (1 + W.open * open)
    const turn = clamp01((f - OPEN * 0.75) / (1 - OPEN * 1.5))
    u.uOpen!.value = open
    const steps = m.geometry.getAttribute('aStep') as THREE.InstancedBufferAttribute
    for (let i = 0; i < count; i++) {
      const c = i % n
      const r = Math.floor(i / n)
      // Diagonal wave: the top-left cube turns first, the bottom-right last.
      const delay = n > 1 ? (c + (n - 1 - r)) / (2 * (n - 1)) : 0
      const t = clamp01((turn - delay * W.spread) / (1 - W.spread))
      const s = k + ease(t)
      // A turning cube lifts a little toward the camera; the open gaps keep its corners clear.
      dummy.position.set((c - (n - 1) / 2) * span, cy + (r - (n - 1) / 2) * span, Math.sin(Math.PI * t) * pitch * W.lift)
      dummy.rotation.set((-s * Math.PI) / 2, 0, 0)
      // A hair over the cell, so merged cubes leave no hairline seams.
      dummy.scale.setScalar(pitch * 1.002)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      steps.setX(i, s)
    }
    m.instanceMatrix.needsUpdate = true
    steps.needsUpdate = true
    // The wall leans a little with the scroll speed.
    m.rotation.set(-flux.v * 0.08, flux.v * 0.12, 0)
  })

  return <instancedMesh ref={mesh} args={[geo, mat, count]} frustumCulled={false} visible={false} />
}

export function CubeWall() {
  const mobile = useScene((s) => s.mobile)
  const n = mobile ? K.mobile.wall.grid : K.reach.wall.grid
  return <Wall key={n} n={n} />
}
