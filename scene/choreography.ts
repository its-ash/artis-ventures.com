import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { capabilities, sections } from '@/content/site'
import { SHARDS } from './aShape'
import { faceRotation, nearAngle } from './geo'
import { keyframes as K } from './keyframes'
import { targets, useScene } from './store'
import { at, type Segment } from './track'
import { layout, pxToWorld, vx, vy } from './view'

gsap.registerPlugin(ScrollTrigger)

export type Pins = {
  hero: ScrollTrigger
  glance: ScrollTrigger | null
  track: ScrollTrigger | null
  approach: ScrollTrigger | null
  reach: ScrollTrigger | null
}

// Range-only triggers refresh after the pins so their positions include pin spacing.
const range = (vars: ScrollTrigger.Vars) => ScrollTrigger.create({ refreshPriority: -1, ...vars })
const qa = (s: string) => gsap.utils.toArray<HTMLElement>(s)

export const stopRotation = (s: { lat: number; lon: number }) => faceRotation(s.lat, s.lon, K.reach.tilt)
export const isHub = (s: { lat: number; lon: number }) =>
  Math.abs(s.lat - K.reach.hub.lat) < 0.5 && Math.abs(s.lon - K.reach.hub.lon) < 0.5

export function buildScene(p: Pins): Segment[] {
  const t = targets()
  const H = K.hero
  const S = K.story
  const Lay = layout()
  const cam = K.stage.camera
  const segs: Segment[] = []
  const add = (r: ScrollTrigger, fn: Segment['add']) => segs.push({ range: r, add: fn })
  const span = ([a, b]: readonly [number, number]) => b - a

  // State at scroll 0.
  Object.assign(t.camera, H.idle.camera)
  Object.assign(t.object, H.idle.object)
  SHARDS.forEach((s, i) => Object.assign(t.shards.s[i]!, { x: s.rest.x, y: s.rest.y, z: 0, rx: 0, ry: 0, rz: 0, scale: 1 }))

  // 1 · Hero: dolly through the opening, then the portal hands over to the DOM video.
  const [vIn, vOut] = H.handoff
  const mid = vIn + span(H.handoff) * 0.3
  add(p.hero, (tl, s, L) =>
    tl
      // Ease in and out: the dolly settles in the opening as the video comes up, instead of lurching through.
      .fromTo(t.camera, { ...H.idle.camera }, { ...H.flight.camera, duration: L * span(H.flight.at), ease: 'power2.inOut' }, at(s, L, H.flight.at[0]))
      .fromTo(t.object, { idle: 1 }, { idle: 0, duration: L * 0.4 }, s)
      // Video comes up under the still-opaque portal, then the canvas fades: no luminance dip.
      .fromTo(t.video, { opacity: 0, blur: 0, scale: 1 }, { opacity: 1, duration: L * (mid - vIn) }, at(s, L, vIn))
      .fromTo(t.canvas, { opacity: 1 }, { opacity: 0, duration: L * (vOut - mid) }, at(s, L, mid)),
  )

  // 2 · Who We Are: video settles to 18% + blur; the arch re-enters from below.
  const E = Lay.story
  const storyIn = range({ trigger: '#story', start: 'top bottom', end: 'top top' })
  add(storyIn, (tl, s, L) =>
    tl
      .set(t.camera, { ...cam }, s)
      .set(t.object, { x: vx(E.x), y: E.fromY, z: 0, rx: 0, ry: -0.5, rz: 0, scale: E.scale, opacity: 1, idle: 0, fill: 1, wire: 1 }, s)
      .fromTo(t.video, { opacity: 1, blur: 0, scale: 1 }, { ...S.video, duration: L }, s)
      .fromTo(t.canvas, { opacity: 0 }, { opacity: 1, duration: L * 0.4 }, at(s, L, 0.3))
      .fromTo(t.object, { y: E.fromY, ry: -0.5 }, { y: vy(E.y), ry: 0.12, duration: L * 0.7, ease: 'power3.out' }, at(s, L, 0.3)),
  )

  // 3 · Pillars: the arch splits; each stroke docks beside its pillar and rides with it.
  const glanceIn = range({ trigger: '#glance', start: 'top bottom', end: 'top top' })
  const pillars = qa('[data-pillar]').slice(0, SHARDS.length)
  const dockScale = S.dock.scale / E.scale
  // Dock in the arch's local space at a given scroll position.
  const dock = (el: HTMLElement, scroll: number) => {
    const r = el.getBoundingClientRect()
    const top = r.top + window.scrollY
    const [wx, wy] = pxToWorld(r.right + S.dock.dx, top - scroll + S.dock.dy)
    return { x: (wx - vx(E.x)) / E.scale, y: (wy - vy(E.y)) / E.scale }
  }

  pillars.forEach((el, i) => {
    const r = range({ trigger: el, start: S.pillarRange[0], end: S.pillarRange[1] })
    add(r, (tl, s, L) => {
      const sh = t.shards.s[i]!
      const rest = SHARDS[i]!.rest
      const landed = at(s, L, 0.35)
      const a = dock(el, landed)
      const b = dock(el, glanceIn.start)
      const mx = (rest.x + a.x) / 2
      const my = (rest.y + a.y) / 2 + 0.4
      if (i === 0)
        tl.fromTo(t.object, { opacity: 1, ry: 0.12 }, { opacity: 0, ry: 0, duration: L * 0.08 }, s).fromTo(
          t.shards,
          { opacity: 0 },
          { opacity: 1, duration: L * 0.08 },
          s,
        )
      tl.fromTo(
        sh,
        { x: rest.x, y: rest.y, z: 0, rx: 0, ry: 0, rz: 0, scale: 1 },
        { x: mx, y: my, z: 1.1, rx: 0.3, ry: 1.3, rz: 0.4, scale: (1 + dockScale) / 2, duration: (landed - s) / 2, ease: 'power2.in' },
        s,
      )
        .fromTo(
          sh,
          { x: mx, y: my, z: 1.1, rx: 0.3, ry: 1.3, rz: 0.4, scale: (1 + dockScale) / 2 },
          { x: a.x, y: a.y, z: 0.6, rx: 0, ry: 0, rz: 0, scale: dockScale, duration: (landed - s) / 2, ease: 'power2.out' },
          (s + landed) / 2,
        )
        .fromTo(sh, { x: a.x, y: a.y }, { x: b.x, y: b.y, duration: Math.max(1, glanceIn.start - landed) }, landed)
    })
  })

  // 4 · At a glance (approach): strokes regroup, dissolve into particles, arch → 100+.
  const N = Lay.numeral
  const numeral = { x: vx(N.x), y: vy(N.y), scale: N.scale }
  add(glanceIn, (tl, s, L) => {
    pillars.forEach((el, i) => {
      const d = dock(el, s)
      const rest = SHARDS[i]!.rest
      tl.fromTo(
        t.shards.s[i]!,
        { x: d.x, y: d.y, z: 0.6, rx: 0, ry: 0, rz: 0, scale: dockScale },
        { x: rest.x, y: rest.y, z: 0, scale: 1, duration: L * 0.35, ease: 'power2.inOut' },
        s,
      )
    })
    tl.fromTo(t.object, { x: vx(E.x), y: vy(E.y), scale: E.scale, ry: 0 }, { x: numeral.x, y: numeral.y, scale: 0.8, duration: L * 0.35, ease: 'power2.inOut' }, s)
      .set(t.particles, { x: numeral.x, y: numeral.y, z: 0, rx: 0, ry: 0, rz: 0, scale: 0.8, morph: 0 }, at(s, L, 0.35))
      .fromTo(t.shards, { opacity: 1 }, { opacity: 0, duration: L * 0.1 }, at(s, L, 0.36))
      .fromTo(t.particles, { opacity: 0 }, { opacity: 1, duration: L * 0.1 }, at(s, L, 0.36))
      .fromTo(t.particles, { morph: 0, scale: 0.8 }, { morph: 1, scale: N.scale, duration: L * 0.5, ease: 'power2.inOut' }, at(s, L, 0.48))
      .fromTo(t.particles, { light: 0 }, { light: 1, duration: L * 0.5 }, at(s, L, 0.25))
      .fromTo(t.video, { opacity: S.video.opacity }, { opacity: 0, duration: L * 0.6 }, s)
  })

  // 5 · At a glance (pinned): 100+ → 40+ → 15+ → 3.
  if (p.glance)
    add(p.glance, (tl, s, L) => {
      for (let k = 1; k < K.glance.morphs.length; k++)
        tl.fromTo(t.particles, { morph: k }, { morph: k + 1, duration: L * K.glance.morphLen, ease: 'power1.inOut' }, at(s, L, K.glance.morphs[k]!))
    })

  // 6 · At a glance (out): the last numeral (3) dissolves as soon as its pin releases, within 30vh of
  // scroll, so it never stays on screen while the rest of the section and Capabilities scroll in.
  const G = p.glance
  const glanceOut = G
    ? range({ start: () => G.end, end: () => G.end + innerHeight * 0.3 })
    : range({ trigger: '#glance', start: 'bottom bottom', end: 'bottom 70%' })
  add(glanceOut, (tl, s, L) =>
    tl
      .fromTo(t.particles, { morph: 4 }, { morph: 5, duration: L, ease: 'power1.in' }, s)
      .fromTo(t.particles, { opacity: 1 }, { opacity: 0, duration: L * 0.5 }, at(s, L, 0.5)),
  )

  // 7 · Capabilities (approach): the four blocks fade up in their row.
  const R = Lay.row
  const row = { x: vx(R.x), y: vy(R.y), scale: R.scale }
  const capIn = range({
    trigger: '#capabilities',
    start: 'top bottom',
    endTrigger: '[data-track]',
    end: p.track ? K.capabilities.trackStart : 'top 40%',
  })
  add(capIn, (tl, s, L) =>
    tl
      .set(t.blocks, { ...row, gap: R.gap, active: 0, toPath: 0, collapse: 0 }, s)
      .fromTo(t.blocks, { opacity: 0 }, { opacity: 1, duration: L * 0.3 }, at(s, L, 0.3)),
  )

  // 7 · Track: on desktop the scrubbed card timeline drives `blocks.active` itself (SceneDirector),
  // so the cubes stay in step with the cards. Mobile (stacked cards) follows scroll here.
  if (!p.track)
    add(range({ trigger: '[data-track]', start: 'top 60%', end: 'bottom 40%' }), (tl, s, L) =>
      tl.fromTo(t.blocks, { active: 0 }, { active: capabilities.cards.length - 1, duration: L }, s),
    )

  // 8 · Full menu: blocks recede behind the text.
  const M = K.menu.recede
  add(range({ trigger: '#menu', start: 'top 80%', end: 'top 20%' }), (tl, s, L) =>
    tl.fromTo(t.blocks, { scale: R.scale, opacity: 1 }, { scale: R.scale * M.scale, opacity: M.opacity, duration: L }, s),
  )

  // 9 · Approach (in): blocks fly to the path nodes; the camera joins the curve.
  const apIn = range({ trigger: '#approach', start: 'top bottom', endTrigger: '[data-stepper]', end: 'center center' })
  add(apIn, (tl, s, L) =>
    tl
      .fromTo(t.blocks, { toPath: 0, opacity: M.opacity }, { toPath: 1, opacity: 1, duration: L * 0.75, ease: 'power2.inOut' }, s)
      .fromTo(t.path, { opacity: 0, draw: 0, follow: 0 }, { opacity: 1, follow: 1, duration: L * 0.6, ease: 'power2.inOut' }, at(s, L, 0.4))
      .fromTo(t.video2, { opacity: 0 }, { opacity: K.approach.video, duration: L * 0.5 }, s),
  )

  // 10 · Approach (pinned): the tube draws and the camera rides it.
  if (p.approach) add(p.approach, (tl, s, L) => tl.fromTo(t.path, { draw: 0 }, { draw: 1, duration: L }, s))

  // 11 · Approach (out): camera returns to the stage view.
  add(range({ trigger: '#reach', start: 'top bottom', end: 'top 30%' }), (tl, s, L) =>
    tl
      .fromTo(t.path, { opacity: 1, follow: 1, draw: 1 }, { opacity: 0, follow: 0, duration: L, ease: 'power2.inOut' }, s)
      .fromTo(t.video2, { opacity: K.approach.video }, { opacity: 0, duration: L * 0.6 }, s)
      .fromTo(t.blocks, { opacity: 1 }, { opacity: 0.35, duration: L }, s),
  )

  // 12 · Reach (in): nodes fly into the globe centre as the land dots bloom.
  const Gl = Lay.globe
  const globe = { x: vx(Gl.x), y: vy(Gl.y) }
  const stops = K.reach.stops
  const rot0 = stopRotation(stops[0]!)
  let last = rot0
  add(range({ trigger: '[data-reach-stage]', start: 'top bottom', end: 'top top' }), (tl, s, L) =>
    tl
      .set(t.particles, { ...globe, z: 0, rx: rot0.rx, ry: rot0.ry, rz: 0, scale: Gl.scale, morph: 5, light: 0 }, s)
      .set(t.blocks, { gx: globe.x, gy: globe.y }, s)
      .fromTo(t.blocks, { collapse: 0, opacity: 0.35 }, { collapse: 1, opacity: 0, duration: L * 0.55, ease: 'power2.in' }, s)
      .fromTo(t.particles, { opacity: 0 }, { opacity: 1, duration: L * 0.3 }, at(s, L, 0.25))
      .fromTo(t.particles, { morph: 5 }, { morph: 6, duration: L * 0.65, ease: 'power2.out' }, at(s, L, 0.25))
      .fromTo(t.globe, { opacity: 0, pins: 0, arcs: 0 }, { opacity: 1, duration: L * 0.4 }, at(s, L, 0.55))
      .set(t.globe, { spin: 1, stop: 0 }, s),
  )

  // 13 · Reach (pinned): UAE → UK → Mauritius → Dubai → Hong Kong; pins rise, arcs draw from Dubai.
  if (p.reach)
    add(p.reach, (tl, s, L) => {
      const n = stops.length
      let prev = rot0
      let arcs = 0
      // The free spin rolls forward into the first stop, then the stops take over.
      tl.fromTo(t.globe, { spin: 1 }, { spin: 0, duration: L * 0.05 }, s)
      tl.fromTo(t.globe, { pins: 0 }, { pins: 1, duration: L * 0.06 }, s)
      if (!isHub(stops[0]!)) tl.fromTo(t.globe, { arcs: 0 }, { arcs: ++arcs, duration: L * 0.1 }, s)
      for (let k = 1; k < n; k++) {
        const r = stopRotation(stops[k]!)
        const next = { rx: r.rx, ry: nearAngle(prev.ry, r.ry) }
        tl.fromTo(t.particles, { rx: prev.rx, ry: prev.ry }, { ...next, duration: L * 0.12, ease: 'power2.inOut' }, at(s, L, k / n - 0.07))
        tl.fromTo(t.globe, { stop: k - 1 }, { stop: k, duration: L * 0.12, ease: 'power2.inOut' }, at(s, L, k / n - 0.07))
        tl.fromTo(t.globe, { pins: k }, { pins: k + 1, duration: L * 0.06 }, at(s, L, k / n))
        if (!isHub(stops[k]!)) tl.fromTo(t.globe, { arcs }, { arcs: ++arcs, duration: L * 0.1 }, at(s, L, k / n))
        prev = next
      }
      last = prev
    })

  // 14 · Leadership: canvas fades out; rendering pauses while hidden.
  const [ls, le] = K.leadership.range
  add(range({ trigger: '#leadership', start: ls, end: le }), (tl, s, L) => tl.fromTo(t.canvas, { opacity: 1 }, { opacity: 0, duration: L }, s))

  // 15 · Contact: globe dots reassemble into the arch on the left half; portal shows contact_city.
  const C = K.contact
  const conR = range({
    trigger: '#contact',
    start: C.range[0],
    end: C.range[1],
    onEnter: () => useScene.setState({ portal: 'contact_city' }),
    onLeaveBack: () => useScene.setState({ portal: 'hero_city' }),
  })
  add(conR, (tl, s, L) => {
    const z = C.camera.z
    const a = Lay.contact
    const pose = { x: vx(a.x, z), y: vy(a.y, z), z: 0, rx: 0, ry: 0, rz: 0, scale: a.scale }
    tl.set(t.object, { ...pose, opacity: 0, fill: 1, wire: 1, idle: 0 }, s)
      .fromTo(t.canvas, { opacity: 0 }, { opacity: 1, duration: L * 0.3 }, s)
      .fromTo(t.camera, { ...cam }, { ...cam, z, duration: L, ease: 'power2.inOut' }, s)
      .fromTo(t.globe, { opacity: 1 }, { opacity: 0, duration: L * 0.3 }, s)
      .fromTo(
        t.particles,
        { ...globe, z: 0, rx: last.rx, ry: last.ry, rz: 0, scale: Gl.scale, morph: 6 },
        { ...pose, morph: 7, duration: L * 0.75, ease: 'power2.inOut' },
        s,
      )
      .fromTo(t.particles, { opacity: 1 }, { opacity: 0, duration: L * 0.2 }, at(s, L, 0.8))
      .fromTo(t.object, { opacity: 0, idle: 0 }, { opacity: 1, idle: 1, duration: L * 0.2 }, at(s, L, 0.8))
  })

  // 16 · Footer: the opaque footer covers the stage, so the canvas fades out and rendering pauses.
  const [fs, fe] = K.footer.hide
  add(range({ trigger: 'footer', start: fs, end: fe }), (tl, s, L) => tl.fromTo(t.canvas, { opacity: 1 }, { opacity: 0, duration: L * 0.6 }, s))

  // Section tones: stone layer opacity changes with no hard cuts.
  let prevTone = 'dark'
  for (const sec of sections) {
    const el = document.getElementById(sec.id)
    const tone = el?.dataset.tone ?? sec.tone
    if (!el || tone === prevTone) continue
    const from = prevTone === 'light' ? 1 : 0
    add(range({ trigger: el, start: K.stone.from, end: K.stone.to }), (tl, s, L) =>
      tl.fromTo(t.stone, { opacity: from }, { opacity: 1 - from, duration: L }, s),
    )
    prevTone = tone
  }

  return segs
}
