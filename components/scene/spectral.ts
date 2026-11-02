import * as THREE from 'three'

// Spectral split shared by the approach line and the cube borders: red, green and blue copies drift
// apart and recombine, so edges carry colour fringes around a bright core.

export const SPECTRUM = [new THREE.Color('#ff3d7f'), new THREE.Color('#2dffb3'), new THREE.Color('#3d7bff')]

// One line material per channel; render the same edges three times.
export const spectralLines = () =>
  SPECTRUM.map((c) => new THREE.LineBasicMaterial({ color: c.clone(), transparent: true, opacity: 0, toneMapped: false, depthWrite: false }))

// Scales for the three copies at a moment: red swells, blue shrinks, green holds; `amount` sets the spread.
export const splitScales = (time: number, amount: number, seed = 0) => {
  const s = amount * (0.4 + 0.6 * (Math.sin(time * 1.7 + seed) * 0.5 + 0.5))
  return [1 + s, 1, 1 - s] as const
}

// Glowing sine line, the reference shader unchanged: each channel is 0.05 / |y + sin((x + time) · xScale) · yScale|,
// with red and blue x stretched by ± length(p) · distortion. Mapped onto a tube: x runs along the path
// (centred, `uSpan` units long), y runs round the tube, so the waves wrap the round line. Drawn up to `uDraw`;
// additive, so the dark field vanishes.
export const waveMaterial = (span: number) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: {
      time: { value: 0 },
      xScale: { value: 1.0 },
      yScale: { value: 0.5 },
      distortion: { value: 0.05 },
      uSpan: { value: span },
      uDraw: { value: 0 },
      uOpacity: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float time, xScale, yScale, distortion, uSpan, uDraw, uOpacity;
      varying vec2 vUv;
      void main() {
        if (vUv.x > uDraw) discard;
        vec2 p = vec2((vUv.x - 0.5) * uSpan, vUv.y * 2.0 - 1.0);

        float d = length(p) * distortion;

        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
        float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
        float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);

        gl_FragColor = vec4(vec3(r, g, b) * uOpacity, 1.0);
      }
    `,
  })
