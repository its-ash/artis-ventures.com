import * as THREE from 'three'
import { asset } from '@/lib/base'
import { latLonToVec } from '@/scene/geo'

// Unit cube (capabilities blocks, path nodes): transparent faces, border on the 12 edges.
export const cubeGeometry = () => new THREE.BoxGeometry(1, 1, 1)
export const cubeEdges = () => {
  const box = cubeGeometry()
  const edges = new THREE.EdgesGeometry(box)
  box.dispose()
  return edges
}

// Dot globe: a Fibonacci lattice of `n` points, flagged by an equirectangular mask (white = land).
// Every land point stays; one sea point in three stays as a dim ocean. Points geometry with
// aLand (1 land · 0 sea) and aRnd.
export const landDots = async (radius: number, n: number, src = asset('/textures/landmask.png')) => {
  const img = new Image()
  img.src = src
  await img.decode()
  const c = document.createElement('canvas')
  c.width = img.width
  c.height = img.height
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0)
  const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height)
  const land = (lat: number, lon: number) => {
    const l = ((((lon + 180) % 360) + 360) % 360) - 180
    const u = Math.min(width - 1, Math.floor(((l + 180) / 360) * width))
    const v = Math.min(height - 1, Math.max(0, Math.floor(((90 - lat) / 180) * height)))
    return data[(v * width + u) * 4]! > 127
  }
  const pos: number[] = []
  const flag: number[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const lat = 90 - (Math.acos(1 - (2 * (i + 0.5)) / n) * 180) / Math.PI
    const lon = (((i * golden * 180) / Math.PI) % 360) - 180
    const on = land(lat, lon)
    if (!on && i % 3) continue
    pos.push(...latLonToVec(lat, lon, radius * 1.01))
    flag.push(on ? 1 : 0)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('aLand', new THREE.Float32BufferAttribute(flag, 1))
  g.setAttribute('aRnd', new THREE.Float32BufferAttribute(flag.map(() => Math.random()), 1))
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), radius * 3)
  return g
}

const cssFont = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || 'sans-serif'

// Rasterise texts in the site's display font, each centred on one shared frame (the widest text sets it).
// Channel R is the crisp glyph mask, G a soft halo around it. Sizes are world units: `height` per `px` of type;
// `w`/`h` is the frame, `tw` the widest glyph run, `cap` the cap height.
export const textTextures = async (texts: readonly string[], height = 2.6, px = 320, halo = 0.05) => {
  const font = `500 ${px}px ${cssFont('--font-inter-tight')}`
  await document.fonts.load(font, texts.join('')).catch(() => [])
  const style = (ctx: CanvasRenderingContext2D) => {
    ctx.font = font
    ctx.letterSpacing = `${-0.04 * px}px`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
  }
  const probe = document.createElement('canvas').getContext('2d')!
  style(probe)
  const run = Math.max(...texts.map((t) => probe.measureText(t).width))
  const blur = Math.round(px * halo)
  const W = Math.ceil(run) + blur * 6
  const H = Math.ceil(px * 1.2) + blur * 4
  const maps = texts.map((t) => {
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const ctx = c.getContext('2d')!
    // Opaque black ground, so each channel carries its own value (no premultiplied fringes).
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, W, H)
    style(ctx)
    ctx.globalCompositeOperation = 'lighter'
    ctx.filter = `blur(${blur}px)`
    ctx.fillStyle = '#0f0'
    ctx.fillText(t, W / 2, H / 2)
    ctx.filter = 'none'
    ctx.fillStyle = '#f00'
    ctx.fillText(t, W / 2, H / 2)
    const tex = new THREE.CanvasTexture(c)
    tex.anisotropy = 8
    return tex
  })
  const k = height / px
  return { maps, w: W * k, h: H * k, tw: run * k, cap: px * 0.72 * k }
}

export type TextTextures = Awaited<ReturnType<typeof textTextures>>

// Value noise, for dissolve fronts and flowing sheens in the glyph shaders.
export const glslNoise = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
`
