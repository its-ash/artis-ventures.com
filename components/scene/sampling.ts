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

const cssFont = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || 'sans-serif'

// Rasterise text in the site's display font onto a grid of square cells.
// Each cell is [x, y, edge, column 0–1]; edge cells border empty space.
export const textCells = async (text: string, cell: number, height = 2.6) => {
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
  const cols = Math.floor(w / cell)
  const rows = Math.floor(h / cell)
  const inside = (i: number, j: number) =>
    i >= 0 && j >= 0 && i < cols && j < rows && data[(Math.floor(j * cell + cell / 2) * w + Math.floor(i * cell + cell / 2)) * 4 + 3]! > 128
  const k = height / px
  const out: number[] = []
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      if (!inside(i, j)) continue
      const edge = !inside(i - 1, j) || !inside(i + 1, j) || !inside(i, j - 1) || !inside(i, j + 1)
      out.push((i * cell + cell / 2 - w / 2) * k, (h / 2 - j * cell - cell / 2) * k, edge ? 1 : 0, i / Math.max(1, cols - 1))
    }
  return { cells: Float32Array.from(out), size: cell * k }
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
