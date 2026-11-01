import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import { latLonToVec } from '@/scene/geo'

// Point targets for the particle morph. Each fills `n` xyz triples.

export const sampleSurface = (geo: THREE.BufferGeometry, n: number, offsets: [number, number, number][] = [[0, 0, 0]]) => {
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(geo)).build()
  const out = new Float32Array(n * 3)
  const p = new THREE.Vector3()
  for (let i = 0; i < n; i++) {
    sampler.sample(p)
    const o = offsets[i % offsets.length]!
    out.set([p.x + o[0], p.y + o[1], p.z + o[2]], i * 3)
  }
  return out
}

// Unit cube (capabilities blocks, path nodes): transparent faces, border on the 12 edges.
export const cubeGeometry = () => new THREE.BoxGeometry(1, 1, 1)
export const cubeEdges = () => {
  const box = cubeGeometry()
  const edges = new THREE.EdgesGeometry(box)
  box.dispose()
  return edges
}

export const sampleBlocks = (n: number, gap: number) => {
  const geo = cubeGeometry()
  const out = sampleSurface(geo, n, [0, 1, 2, 3].map((i) => [i * gap, 0, 0]))
  geo.dispose()
  return out
}

const cssFont = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || 'sans-serif'

// Rasterise text in the site's display font and scatter points over the filled pixels.
export const sampleText = async (text: string, n: number, height = 2.6) => {
  const family = cssFont('--font-inter-tight')
  const px = 320
  const font = `500 ${px}px ${family}`
  await document.fonts.load(font, text).catch(() => [])
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.font = font
  ctx.letterSpacing = `${-0.04 * px}px`
  const w = Math.ceil(ctx.measureText(text).width) + 40
  const h = Math.ceil(px * 1.2)
  c.width = w
  c.height = h
  ctx.font = font
  ctx.letterSpacing = `${-0.04 * px}px`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, w / 2, h / 2)
  const data = ctx.getImageData(0, 0, w, h).data
  const hits: number[] = []
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (data[(y * w + x) * 4 + 3]! > 128) hits.push(x, y)
  const k = height / px
  const out = new Float32Array(n * 3)
  const count = hits.length / 2
  for (let i = 0; i < n && count; i++) {
    const j = Math.floor(Math.random() * count) * 2
    out.set(
      [
        (hits[j]! - w / 2 + Math.random() * 2) * k,
        (h / 2 - hits[j + 1]! + Math.random() * 2) * k,
        (Math.random() - 0.5) * 0.25,
      ],
      i * 3,
    )
  }
  return out
}

// Dots on land: a Fibonacci sphere filtered by an equirectangular land mask (white = land).
export const sampleLand = async (n: number, radius: number, src = '/textures/landmask.png') => {
  const img = new Image()
  img.src = src
  await img.decode()
  const c = document.createElement('canvas')
  c.width = img.width
  c.height = img.height
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0)
  const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height)
  const land: [number, number][] = []
  const N = 20000
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < N; i++) {
    const y = 1 - (2 * (i + 0.5)) / N
    const lat = 90 - (Math.acos(y) * 180) / Math.PI
    const lon = (((i * golden * 180) / Math.PI) % 360) - 180
    const u = Math.min(width - 1, Math.floor(((lon + 180) / 360) * width))
    const v = Math.min(height - 1, Math.floor(((90 - lat) / 180) * height))
    if (data[(v * width + u) * 4]! > 127) land.push([lat, lon])
  }
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n && land.length; i++) {
    const [lat, lon] = land[i % land.length]!
    out.set(latLonToVec(lat, lon, radius), i * 3)
  }
  return out
}
