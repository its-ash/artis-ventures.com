import { Stepper } from '@/components/Stepper'
import { BgVideo } from '@/components/ui/BgVideo'
import { Label } from '@/components/ui/Label'
import { SplitHeadline } from '@/components/ui/SplitHeadline'
import { meta } from '@/components/ui/sectionMeta'
import { approach } from '@/content/site'

export function Approach() {
  const m = meta('approach')
  return (
    <section
      id="approach"
      data-tone="dark"
      data-section="approach"
      aria-labelledby="approach-title"
      className="tone gridlines relative isolate overflow-hidden py-28 md:py-40"
    >
      <div className="absolute inset-0 -z-10 opacity-25" data-fallback-media>
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
            <p className="prose-w mt-8 text-muted" data-reveal>
              {approach.intro}
            </p>
          </div>
        </div>
        <div className="mt-20 md:mt-28">
          <Stepper steps={approach.steps} />
        </div>
      </div>
    </section>
  )
}
