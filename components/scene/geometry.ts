import * as THREE from 'three'
import { ARCH_DEPTH, ARCH_OPS, BEVEL, COUNTER, SHARDS } from '@/scene/aShape'

export const TEAL = new THREE.Color('#33b7c2')
export const GLOW = new THREE.Color('#7fd6db').multiplyScalar(1.6)

const EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: ARCH_DEPTH,
  curveSegments: 28,
  bevelEnabled: true,
  bevelThickness: BEVEL,
  bevelSize: BEVEL * 0.7,
  bevelSegments: 5,
}

const extrude = (shape: THREE.Shape) => {
  const g = new THREE.ExtrudeGeometry(shape, EXTRUDE)
  g.translate(0, 0, -ARCH_DEPTH / 2)
  g.computeVertexNormals()
  return g
}

const archShape = () => {
  const s = new THREE.Shape()
  for (const o of ARCH_OPS) {
    if (o.k === 'C') s.bezierCurveTo(o.p[0][0], o.p[0][1], o.p[1][0], o.p[1][1], o.p[2][0], o.p[2][1])
    else if (o.k === 'M') s.moveTo(o.p[0], o.p[1])
    else s.lineTo(o.p[0], o.p[1])
  }
  return s
}

// Edge segments sorted bottom → top so the preloader draws the arch upward.
const sortedEdges = (geo: THREE.BufferGeometry) => {
  const e = new THREE.EdgesGeometry(geo, 28)
  const a = e.getAttribute('position').array as Float32Array
  const segs: number[][] = []
  for (let i = 0; i < a.length; i += 6) segs.push(Array.from(a.subarray(i, i + 6)))
  segs.sort((p, q) => Math.min(p[1]!, p[4]!) - Math.min(q[1]!, q[4]!))
  const out = new THREE.BufferGeometry()
  out.setAttribute('position', new THREE.Float32BufferAttribute(segs.flat(), 3))
  e.dispose()
  return out
}

export const buildArch = () => {
  const geometry = extrude(archShape())
  const counter = new THREE.Shape(COUNTER.map(([x, y]) => new THREE.Vector2(x, y)))
  return { geometry, edges: sortedEdges(geometry), counter: new THREE.ShapeGeometry(counter) }
}

export const buildShards = () =>
  SHARDS.map((s) => extrude(new THREE.Shape(s.points.map(([x, y]) => new THREE.Vector2(x, y)))))

// Glass faces + brushed graphite sides. Below quality 2 the glass drops transmission.
export const makeGlass = (quality: number) => {
  const glass =
    quality >= 2
      ? new THREE.MeshPhysicalMaterial({
          color: '#ffffff',
          transmission: 1,
          roughness: 0.15,
          thickness: 1.2,
          ior: 1.45,
          attenuationColor: TEAL,
          attenuationDistance: 2.4,
          specularIntensity: 1,
          // A faint prism split and thin-film sheen on the glass edges.
          dispersion: 0.35,
          iridescence: 0.18,
          iridescenceIOR: 1.3,
          clearcoat: 0.4,
          clearcoatRoughness: 0.2,
          envMapIntensity: 1.1,
          transparent: true,
          opacity: 0,
        })
      : rimMaterial()
  const metal = new THREE.MeshStandardMaterial({
    color: '#4a5058',
    metalness: 1,
    roughness: 0.36,
    envMapIntensity: 1,
    transparent: true,
    opacity: 0,
  })
  return { glass, metal }
}

// Low-cost glass stand-in: dark standard material with a teal fresnel rim.
export const rimMaterial = () => {
  const m = new THREE.MeshStandardMaterial({
    color: '#1b1f24',
    metalness: 0.3,
    roughness: 0.25,
    envMapIntensity: 1.2,
    transparent: true,
    opacity: 0,
  })
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uRim = { value: TEAL }
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uRim;')
      .replace(
        '#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\nfloat fres = pow(1.0 - abs(dot(normalize(vViewPosition), normal)), 3.0);\ntotalEmissiveRadiance += uRim * fres * 1.4;',
      )
  }
  return m
}

export const disposeAll = (...items: { dispose: () => void }[]) => items.forEach((i) => i.dispose())
