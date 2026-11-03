import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { capabilities, sections, type SectionId } from '@/content/site'
import { keyframes as K } from './keyframes'
import { targets, useScene, type Targets, type VideoName } from './store'
import { layout, vx, vy } from './view'

gsap.registerPlugin(ScrollTrigger)

// Reduced motion: no pins, no flights. Each section shows a still of its object state;
// changes are short fades of the canvas, video and stone layers. Components snap (no damping).

type Pose = {
  scene?: { [P in keyof Targets]?: Partial<Targets[P]> }
  canvas?: number
  video?: number
  video2?: number
  stone?: number
  portal?: VideoName
}

const FADE_OUT = 0.25
const FADE_IN = 0.4

const poses = (): Record<SectionId, Pose> => {
  const L = layout()
  const cam = K.stage.camera
  const arch = { rx: 0, ry: 0, rz: 0, z: 0, opacity: 1, fill: 1, wire: 1, idle: 0 }
  const row = { x: vx(L.row.x), y: vy(L.row.y), scale: L.row.scale, gap: L.row.gap, toPath: 0, collapse: 0 }
  const z = K.contact.camera.z
  return {
    hero: { scene: { camera: { ...K.hero.idle.camera }, object: { ...K.hero.idle.object, ...arch } } },
    story: {
      scene: { camera: { ...cam }, object: { ...arch, x: vx(L.story.x), y: vy(L.story.y), scale: L.story.scale } },
      video: K.story.video.opacity,
    },
    // The DOM numerals carry this section; the canvas rests.
    glance: { canvas: 0, stone: 1 },
    capabilities: { scene: { blocks: { ...row, opacity: 1, active: 0 } }, stone: 1, canvas: L.mobile ? 0 : 1 },
    menu: {
      scene: { blocks: { ...row, scale: row.scale * K.menu.recede.scale, opacity: K.menu.recede.opacity, active: capabilities.cards.length - 1 } },
      stone: 1,
      canvas: L.mobile ? 0 : 1,
    },
    approach: {
      scene: { blocks: { ...row, opacity: 1, toPath: 1 }, path: { opacity: 1, draw: 1, follow: 0 } },
      video2: K.approach.video,
    },
    // The DOM stop cards carry this section (no turning cubes under reduced motion); the canvas rests.
    reach: { canvas: 0 },
    leadership: { canvas: 0, stone: 1 },
    contact: {
      scene: {
        camera: { ...cam, z },
        object: { ...arch, x: vx(L.contact.x, z), y: vy(L.contact.y, z), scale: L.contact.scale },
      },
      portal: 'contact_city',
    },
  }
}

// Everything hidden; a pose switches on only what its section shows.
const reset = (t: Targets) => {
  t.object.opacity = 0
  t.shards.opacity = 0
  Object.assign(t.particles, { opacity: 0, noise: 0 })
  t.blocks.opacity = 0
  Object.assign(t.path, { opacity: 0, follow: 0 })
  t.wall.opacity = 0
}

const apply = (pose: Pose) => {
  const t = targets()
  gsap.killTweensOf([t.canvas, t.video, t.video2, t.stone])
  gsap.to(t.video, { opacity: pose.video ?? 0, blur: pose.video ? K.story.video.blur : 0, duration: FADE_IN })
  gsap.to(t.video2, { opacity: pose.video2 ?? 0, duration: FADE_IN })
  gsap.to(t.stone, { opacity: pose.stone ?? 0, duration: FADE_IN })
  gsap.to(t.canvas, {
    opacity: 0,
    duration: FADE_OUT,
    onComplete: () => {
      reset(t)
      for (const [k, v] of Object.entries(pose.scene ?? {})) Object.assign(t[k as keyof Targets], v)
      useScene.setState({ portal: pose.portal ?? 'hero_city' })
      gsap.to(t.canvas, { opacity: pose.canvas ?? 1, duration: FADE_IN })
    },
  })
}

export function stillScene() {
  const all = poses()
  const t = targets()
  reset(t)
  Object.assign(t.camera, all.hero.scene!.camera)
  Object.assign(t.object, all.hero.scene!.object)
  Object.assign(t.video, { opacity: 0, blur: 0, scale: 1 })
  t.canvas.opacity = 1

  for (const s of sections) {
    const el = document.getElementById(s.id)
    if (!el) continue
    ScrollTrigger.create({
      trigger: el,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (st) => st.isActive && apply(all[s.id]),
    })
  }

  // Inside a section: the block for the card in view turns.
  gsap.utils.toArray<HTMLElement>('[data-track-card]').forEach((card, i) =>
    ScrollTrigger.create({ trigger: card, start: 'top 55%', end: 'bottom 45%', onToggle: (st) => st.isActive && (t.blocks.active = i) }),
  )
}
