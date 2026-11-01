import Image from 'next/image'
import { BgVideo } from '@/components/ui/BgVideo'

// Fixed layers behind the canvas: stone tone (tweened opacity) and the full-bleed stage video.
// The poster is the LCP element; the 3D scene loads after it.
export function StageLayers() {
  return (
    <>
      <div aria-hidden="true" data-stone className="stone-surface pointer-events-none fixed inset-0 -z-30 opacity-0" />
      <div aria-hidden="true" data-stage className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
        <Image src="/posters/hero_city.webp" alt="" fill preload sizes="100vw" className="object-cover" />
        <BgVideo name="hero_city" eager className="absolute inset-0" />
      </div>
      <div aria-hidden="true" data-stage-alt className="pointer-events-none fixed inset-0 -z-20 hidden opacity-0">
        <BgVideo name="approach_caustics" className="absolute inset-0" />
      </div>
    </>
  )
}
