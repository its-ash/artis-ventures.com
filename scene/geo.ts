// Sphere maths shared by the globe (three.js) and the director (plain numbers).

export type V3 = [number, number, number]

export const latLonToVec = (lat: number, lon: number, r = 1): V3 => {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lon + 180) * Math.PI) / 180
  return [-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)]
}

// Euler (XYZ order) that turns the point at lat/lon to face +z, i.e. the camera.
export const faceRotation = (lat: number, lon: number, tilt = 0) => {
  const [x, y, z] = latLonToVec(lat, lon)
  const ry = Math.atan2(-x, z)
  const zr = -x * Math.sin(ry) + z * Math.cos(ry)
  return { rx: Math.atan2(y, zr) + tilt, ry }
}

// Shortest-path unwrap so a tween between two yaw angles never spins the long way.
export const nearAngle = (from: number, to: number) => {
  const d = ((((to - from) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI
  return from + d
}
