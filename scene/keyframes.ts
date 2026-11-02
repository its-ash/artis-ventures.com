import { offices, reach } from '@/content/site'
import { FRONT_Z, OPENING } from './aShape'

// Every tunable scene value. Scroll positions are fractions of the section's pinned scroll.
// Screen positions marked (vx, vy) are fractions of the half-viewport at z = 0 seen by the stage camera:
// -1 left/bottom edge, 0 centre, 1 right/top edge.

export const DAMP = 0.15
// The camera is heavier than the objects: it glides a beat behind the scroll.
export const CAMERA_DAMP = 0.24

const office = (id: string) => offices.items.find((o) => o.id === id)!

export const keyframes = {
  // Camera for every section after the hero (z = 0 plane is the layout plane).
  stage: { camera: { x: 0, y: 0, z: 9, tx: 0, ty: 0, tz: 0, fov: 35 } },

  // Numerals: glyph cell size in raster px (desktop / mobile). Globe: lattice points sampled for the dots.
  matrix: { cell: 9, mobileCell: 12, dots: 30000, mobileDots: 14000 },

  preload: {
    minTime: 1.2, // s, counter never finishes faster than this
    maxTime: 12, // s, give up waiting for assets and enter anyway
    backdrop: 0.25, // stage video opacity behind the drawing edges
    fill: 1.4, // s, glass fill-in after load
    wireRest: 0.12, // edge line opacity once the glass is in
  },

  hero: {
    pin: 3, // viewport heights
    idle: {
      camera: { x: 0, y: 0, z: 9, tx: 0, ty: 0, tz: 0, fov: 35 },
      object: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, scale: 1, opacity: 1, idle: 1 },
      swing: (6 * Math.PI) / 180, // ±6° on Y
      speed: 0.35, // rad/s of the swing
    },
    // 0 → 0.7: dolly from z 9 straight through the opening
    flight: {
      at: [0, 0.7],
      camera: { x: OPENING.x, y: OPENING.y, z: FRONT_Z + 0.3, tx: OPENING.x, ty: OPENING.y, tz: -10, fov: 35 },
    },
    headlineOut: [0.24, 0.36],
    subIn: [0.34, 0.52],
    // 0.7 → 1: portal fills the viewport, canvas hands off to the DOM video
    handoff: [0.7, 1],
  },

  portal: {
    planeZ: -4, // world z of the video plane seen through the opening
    aspect: 16 / 9,
  },

  story: {
    video: { opacity: 0.18, blur: 20, scale: 1.04 },
    // Arch re-enters from below, then rests behind the statement.
    enter: { fromY: -6, x: 0.45, y: 0.05, scale: 0.62 }, // x, y in (vx, vy)
    // Shards dock at the top-right of each pillar, facing the camera.
    dock: { dx: -70, dy: 40, scale: 0.26 }, // px from the pillar's top-right corner
    pillarRange: ['top 82%', 'top 18%'],
  },

  glance: {
    pin: 2.8, // 4 steps × 70vh
    numeral: { x: -0.42, y: 0, scale: 1 }, // (vx, vy)
    morphs: [0.08, 0.33, 0.58, 0.83], // pin progress where numeral n → n+1 starts (first is in the approach)
    morphLen: 0.14,
  },

  capabilities: {
    row: { x: -0.35, y: 0.5, scale: 0.42, gap: 1.6 }, // x, y in (vx, vy); gap in block units
    trackStart: 'bottom 94%',
  },

  menu: { recede: { scale: 0.6, opacity: 0.25 } },

  approach: {
    pin: 4, // 5 steps × 80vh
    video: 0.25,
    nodes: [
      [-3.2, -0.6, 0],
      [-1.4, 0.7, -3],
      [0.4, -0.5, -6],
      [2.2, 0.8, -9],
      [4, 0, -12],
    ] as [number, number, number][],
    nodeScale: 0.32,
    camOffset: [0, 0.7, 3.6] as [number, number, number],
    lookAhead: 0.1,
  },

  reach: {
    pin: 3.5, // 5 stops × 70vh
    globe: { x: 0.45, y: -0.02, radius: 1.7, scale: 1 }, // x, y in (vx, vy)
    tilt: -0.18, // rad, stop sits a little below the globe centre
    // Tint per stop, in `stops` order, from the site palette (teal, mist, stone):
    // CMA (UAE) · FCA (UK) · FSC (Mauritius) · Dubai · Hong Kong
    neon: ['#7fd6db', '#33b7c2', '#9aa3ab', '#eeebe5', '#5fc6cd'],
    hub: { lat: office('dubai').lat, lon: office('dubai').lon },
    stops: [
      ...reach.regulators.map((r) => ({ lat: r.lat, lon: r.lon })),
      { lat: office('dubai').lat, lon: office('dubai').lon },
      { lat: office('hong-kong').lat, lon: office('hong-kong').lon },
    ],
  },

  leadership: { range: ['top bottom', 'top 45%'] },

  contact: {
    arch: { x: -0.52, y: 0.02, scale: 0.78 }, // (vx, vy)
    camera: { z: 10.5 },
    range: ['top bottom', 'top 20%'],
  },

  // Below 1024px: objects sit above the text column, pins are shorter.
  mobile: {
    heroPin: 2.2,
    pinScale: 0.6, // glance, approach, reach
    story: { x: 0, y: 0.32, scale: 0.42 },
    numeral: { x: 0, y: 0.36, scale: 0.42 },
    row: { x: 0, y: 0.5, scale: 0.34 },
    globe: { x: 0, y: 0.34, scale: 0.6 },
    contact: { x: 0, y: 0.5, scale: 0.42 },
  },

  stone: {
    // tone change between sections: incoming section top from → to (viewport %)
    from: 'top 75%',
    to: 'top 25%',
  },
} as const
