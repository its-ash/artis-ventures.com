'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { damp, damp3 } from 'maath/easing'
import { pathCurve } from '@/components/scene/ApproachPath'
import { DAMP, keyframes as K } from '@/scene/keyframes'
import { frameStep, targets } from '@/scene/store'

const OFFSET = new THREE.Vector3(...K.approach.camOffset)

// Damps toward the camera targets; `path.follow` blends in a ride along the approach curve.
export function CameraRig() {
  const look = useRef(new THREE.Vector3())
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
    damp3(cam.position, w.pos, DAMP, step)
    damp3(look.current, w.look, DAMP, step)
    cam.lookAt(look.current)
    if (Math.abs(cam.fov - c.fov) > 1e-3) {
      damp(cam, 'fov', c.fov, DAMP, step)
      cam.updateProjectionMatrix()
    }
  })

  return null
}
