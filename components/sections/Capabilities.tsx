import { HorizontalTrack } from '@/components/HorizontalTrack'
import { Label } from '@/components/ui/Label'
import { SplitHeadline } from '@/components/ui/SplitHeadline'
import { meta } from '@/components/ui/sectionMeta'
import { capabilities } from '@/content/site'

export function Capabilities() {
  const m = meta('capabilities')
  return (
    <section
      id="capabilities"
      data-tone="light"
      data-section="capabilities"
      aria-labelledby="capabilities-title"
      className="tone stone-tex overflow-hidden py-16 md:py-36"
    >
      <div className="shell">
        <div className="grid-12 gap-y-6 pt-8 md:gap-y-8 md:pt-0">
          <Label n={m.n} className="col-span-12 md:col-span-3">
            {capabilities.label}
          </Label>
          <div className="col-span-12 md:col-span-9">
            <SplitHeadline id="capabilities-title" text={capabilities.headline} className="h-xl max-w-[16ch]" />
            <p className="prose-w mt-6 text-muted md:mt-8" data-reveal>
              {capabilities.intro}
            </p>
          </div>
        </div>
        <div className="mt-12 md:mt-24">
          <HorizontalTrack cards={capabilities.cards} />
        </div>
      </div>
    </section>
  )
}
