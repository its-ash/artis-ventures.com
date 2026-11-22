'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { damp, damp3 } from 'maath/easing'
import { CAMERA_DAMP, DAMP } from '@/scene/keyframes'
import { flux, frameStep, targets, useScene } from '@/scene/store'

// Scroll-speed response: a barely-there bank and lens breath, so fast scrolls feel weighted, not warped.
const ROLL = 0.012
const FOV_KICK = 1.5

// Damps toward the camera targets; `path.follow` blends in a ride along the approach curve.
export function CameraRig() {
  const look = useRef(new THREE.Vector3())
  const roll = useRef(0)
  const want = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3() })

  useFrame(({ camera }, dt) => {
    const { camera: c, path } = targets()
    const cam = camera as THREE.PerspectiveCamera
    const w = want.current
    w.pos.set(c.x, c.y, c.z)
    w.look.set(c.tx, c.ty, c.tz)
    if (path.follow > 1e-3) {
      const t = THREE.MathUtils.clamp(path.draw, 0, 1)
      const mobile = useScene.getState().mobile
      // Frame the 3D particle orb cleanly in the right gallery frame on desktop, centered on mobile.
      const offsetX = mobile ? 0 : -1.65
      const camX = offsetX + THREE.MathUtils.lerp(-0.28, 0.28, t)
      const camY = THREE.MathUtils.lerp(-0.06, 0.08, t)
      const camZ = (mobile ? 8.8 : 8.45) - Math.sin(t * Math.PI) * 0.45
      w.a.set(camX, camY, camZ)
      w.b.set(offsetX, 0, 0)
      w.pos.lerp(w.a, path.follow)
      w.look.lerp(w.b, path.follow)
    }
    const step = frameStep(dt)
    const camDamp = THREE.MathUtils.lerp(CAMERA_DAMP, 0.095, path.follow)
    damp3(cam.position, w.pos, camDamp, step)
    damp3(look.current, w.look, camDamp, step)
    cam.lookAt(look.current)
    roll.current = THREE.MathUtils.damp(roll.current, -flux.v * ROLL, 6, step)
    cam.rotateZ(roll.current)
    const fov = c.fov + flux.a * FOV_KICK
    if (Math.abs(cam.fov - fov) > 1e-3) {
      damp(cam, 'fov', fov, DAMP, step)
      cam.updateProjectionMatrix()
    }
  })

  return null
}
