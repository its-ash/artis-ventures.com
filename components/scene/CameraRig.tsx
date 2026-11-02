'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { damp, damp3 } from 'maath/easing'
import { pathCurve } from '@/components/scene/ApproachPath'
import { CAMERA_DAMP, DAMP, keyframes as K } from '@/scene/keyframes'
import { flux, frameStep, targets } from '@/scene/store'

const OFFSET = new THREE.Vector3(...K.approach.camOffset)
// Scroll-speed warp: a slight bank in the scroll direction and a wider lens.
const ROLL = 0.03
const FOV_KICK = 4

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
      pathCurve.getPointAt(t, w.a).add(OFFSET)
      pathCurve.getPointAt(Math.min(1, t + K.approach.lookAhead), w.b)
      w.pos.lerp(w.a, path.follow)
      w.look.lerp(w.b, path.follow)
    }
    const step = frameStep(dt)
    damp3(cam.position, w.pos, CAMERA_DAMP, step)
    damp3(look.current, w.look, CAMERA_DAMP, step)
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
