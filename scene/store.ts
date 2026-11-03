import { create } from 'zustand'

export type VideoName = 'hero_city' | 'contact_city' | 'approach_caustics'
export type Form = 'arch' | 'shards' | 'particles' | 'numerals' | 'blocks' | 'path'
// 3 full · 2 no postprocessing · 1 no transmission · 0 reduced particles
export type Quality = 0 | 1 | 2 | 3

const pose = () => ({ x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, scale: 1 })

export const createTargets = () => ({
  // Arch (glass A with portal)
  object: { form: 'arch' as Form, ...pose(), morph: 0, opacity: 1, idle: 1, wire: 0, fill: 0 },
  // Three strokes; positions are local to the arch pose (`object`)
  shards: { opacity: 0, s: [pose(), pose(), pose()] },
  // Pose and form of the numeral matrix (no particles; name kept for the timeline).
  // Morph index 0 arch · 1 100+ · 2 40+ · 3 15+ · 4 3 · 5 blocks
  particles: { ...pose(), opacity: 0, morph: 0, noise: 1, light: 0 },
  // Row (capabilities) → path nodes (approach) → cube wall centre (reach)
  blocks: { opacity: 0, x: 0, y: 0, scale: 1, gap: 1.6, active: 0, toPath: 0, collapse: 0, gx: 0, gy: 0 },
  path: { opacity: 0, draw: 0, follow: 0 },
  // Cube wall (reach): step = index of the stop card in front (fractional while the cubes turn)
  wall: { opacity: 0, step: 0 },
  camera: { x: 0, y: 0, z: 9, tx: 0, ty: 0, tz: 0, fov: 35 },
  video: { opacity: 1, blur: 0, scale: 1 },
  video2: { opacity: 0 },
  stone: { opacity: 0 },
  canvas: { opacity: 1 },
})

export type Targets = ReturnType<typeof createTargets>

export type Scenery = typeof import('./scenery')

type State = {
  scenery: Scenery | null // scroll choreography, loaded on demand with the 3D chunk
  // Mutable, tweened by GSAP and read in useFrame. Mutating it never re-renders.
  targets: Targets
  caps: boolean // capabilities below are detected
  gl: boolean
  motion: boolean
  mobile: boolean
  quality: Quality
  portal: VideoName
  load: { chunk: boolean; assets: number; video: boolean }
  entered: boolean
  portalEl: HTMLVideoElement | null
}

export const useScene = create<State>()(() => ({
  targets: createTargets(),
  scenery: null,
  caps: false,
  gl: false,
  motion: true,
  mobile: false,
  quality: 3,
  portal: 'hero_city',
  load: { chunk: false, assets: 0, video: false },
  entered: false,
  portalEl: null,
}))

export const targets = () => useScene.getState().targets

// Scroll velocity, damped: `v` signed (-1 up · 1 down), `a` magnitude. Written by SceneDirector, read in useFrame.
export const flux = { v: 0, a: 0 }

// Damping step: real frame time normally; a large step (instant snap) under reduced motion.
export const frameStep = (dt: number) => (useScene.getState().motion ? dt : 10)

export const loadProgress = ({ chunk, assets, video }: State['load']) =>
  Math.round((chunk ? 15 : 0) + assets * 65 + (video ? 20 : 0))
