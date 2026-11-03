import * as THREE from 'three'

// Unit cube (capabilities blocks, path nodes): transparent faces, border on the 12 edges.
export const cubeGeometry = () => new THREE.BoxGeometry(1, 1, 1)
export const cubeEdges = () => {
  const box = cubeGeometry()
  const edges = new THREE.EdgesGeometry(box)
  box.dispose()
  return edges
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
