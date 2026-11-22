import { ApproachStage } from '@/components/sections/ApproachStage'
import { BgVideo } from '@/components/ui/BgVideo'
import { Label } from '@/components/ui/Label'
import { SplitHeadline } from '@/components/ui/SplitHeadline'
import { meta } from '@/components/ui/sectionMeta'
import { approach } from '@/content/site'

const PRINCIPLES = [
  'Clear deliverables at every gate',
  'Defined milestones & timelines',
  'Measurable institutional KPIs',
] as const

export function Approach() {
  const m = meta('approach')
  return (
    <section
      id="approach"
      data-tone="dark"
      data-section="approach"
      aria-labelledby="approach-title"
      className="tone gridlines relative isolate overflow-hidden py-16 md:py-36"
    >
      <div className="absolute inset-0 -z-10 opacity-20" data-fallback-media>
        <BgVideo name="approach_caustics" />
      </div>
      <div className="shell">
        <div className="grid-12 gap-y-8">
          <div className="col-span-12 md:col-span-3">
            <Label n={m.n}>{approach.label}</Label>
            <p className="label mt-2 text-muted">{approach.eyebrow}</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <SplitHeadline id="approach-title" text={approach.headline} className="h-xl max-w-[16ch]" />
            <p className="prose-w mt-7 text-[16px] leading-[1.68] text-[#b8c0c9] sm:text-[17px]" data-reveal>
              {approach.intro}
            </p>
            <ul className="mt-7 flex flex-wrap gap-2.5" data-reveal>
              {PRINCIPLES.map((item) => (
                <li
                  key={item}
                  className="surface-pill inline-flex items-center rounded-full px-3.5 py-1.5 text-[12.5px] font-medium text-[#d4dae0]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 md:mt-20">
          <ApproachStage />
        </div>
      </div>
    </section>
  )
}
