import { keyframes as K } from './keyframes'

// Stage-camera geometry and responsive layout, shared by the scroll track and the reduced-motion stills.

export const isMobile = () => window.innerWidth < 1024

// Half-extents of the z = 0 plane seen by the stage camera at distance z.
export const view = (z: number = K.stage.camera.z) => {
  const h = Math.tan((K.stage.camera.fov * Math.PI) / 360) * z
  return { h, w: (h * window.innerWidth) / window.innerHeight }
}
export const vx = (f: number, z?: number) => f * view(z).w
export const vy = (f: number, z?: number) => f * view(z).h
export const pxToWorld = (px: number, py: number) => {
  const v = view()
  return [((px / window.innerWidth) * 2 - 1) * v.w, (1 - (py / window.innerHeight) * 2) * v.h] as const
}

export const layout = () => {
  const m = isMobile()
  const M = K.mobile
  return {
    mobile: m,
    story: m ? { ...K.story.enter, ...M.story } : K.story.enter,
    numeral: m ? M.numeral : K.glance.numeral,
    row: m ? { ...K.capabilities.row, ...M.row } : K.capabilities.row,
    globe: m ? { ...K.reach.globe, ...M.globe } : K.reach.globe,
    contact: m ? M.contact : K.contact.arch,
    heroPin: m ? M.heroPin : K.hero.pin,
    pin: (n: number) => (m ? n * M.pinScale : n),
  }
}
