import * as THREE from 'three'

// "Matrix" rain for the cube faces: glyph columns fall at their own speed, with a bright head
// and a fading trail; glyphs flicker. One glyph atlas is shared by every cube.

const GRID = 8 // atlas is 8 × 8 glyphs
const GLYPHS = '0123456789ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ+=<>*:'

let atlas: THREE.CanvasTexture | null = null

export const glyphAtlas = () => {
  if (atlas) return atlas
  const cell = 64
  const c = document.createElement('canvas')
  c.width = c.height = cell * GRID
  const ctx = c.getContext('2d')!
  const mono = getComputedStyle(document.documentElement).getPropertyValue('--font-jetbrains').trim() || 'monospace'
  ctx.fillStyle = '#fff'
  ctx.font = `400 ${cell * 0.72}px ${mono}, monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ;[...GLYPHS].slice(0, GRID * GRID).forEach((g, i) => ctx.fillText(g, (i % GRID) * cell + cell / 2, Math.floor(i / GRID) * cell + cell / 2))
  atlas = new THREE.CanvasTexture(c)
  atlas.minFilter = THREE.LinearMipmapLinearFilter
  return atlas
}

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform sampler2D uGlyphs;
  uniform vec3 uColor;
  uniform float uTime, uOpacity, uSeed, uGlow;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    const float COLS = 9.0;
    const float GRID = ${GRID.toFixed(1)};
    vec2 g = vUv * COLS;
    vec2 cell = floor(g);
    vec2 f = fract(g);
    float col = hash(vec2(cell.x, uSeed));
    float speed = (0.25 + col * 0.45) * (0.6 + uGlow);
    // Head position runs top → bottom; trail fades behind it.
    float head = fract(uTime * speed + col);
    float y = 1.0 - (cell.y + 0.5) / COLS;
    float dist = fract(head - y + 1.0);
    float trail = smoothstep(0.6, 0.0, dist);
    float lead = step(dist, 1.0 / COLS);
    float pick = floor(hash(cell + floor(uTime * (2.0 + col * 6.0)) + uSeed) * GRID * GRID);
    vec2 auv = (vec2(mod(pick, GRID), GRID - 1.0 - floor(pick / GRID)) + f) / GRID;
    float glyph = texture2D(uGlyphs, auv).r;
    float a = glyph * (trail * (0.35 + 0.45 * uGlow) + lead * 0.9) + 0.025;
    gl_FragColor = vec4(uColor * (1.0 + lead * 0.6), a * uOpacity);
  }
`

export const matrixMaterial = (seed: number) =>
  new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
    uniforms: {
      uGlyphs: { value: glyphAtlas() },
      uColor: { value: new THREE.Color('#7fd6db') },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uSeed: { value: seed },
      uGlow: { value: 0 },
    },
  })

export const RAIN_DARK = new THREE.Color('#7fd6db').multiplyScalar(1.15)
export const RAIN_LIGHT = new THREE.Color('#1d6f76')
export const EDGE_DARK = new THREE.Color('#7fd6db').multiplyScalar(1.6)
export const EDGE_LIGHT = new THREE.Color('#1d6f76')
