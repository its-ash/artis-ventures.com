import { ReachStage } from '@/components/sections/ReachStage'
import { Label } from '@/components/ui/Label'
import { SplitHeadline } from '@/components/ui/SplitHeadline'
import { meta } from '@/components/ui/sectionMeta'
import { reach } from '@/content/site'

export function Reach() {
  const m = meta('reach')
  return (
    <section
      id="reach"
      data-tone="dark"
      data-section="reach"
      aria-labelledby="reach-title"
      className="tone gridlines relative isolate overflow-hidden py-16 md:py-36"
    >
      <div className="shell">
        <div className="grid-12 gap-y-8">
          <div className="col-span-12 md:col-span-3">
            <Label n={m.n}>{reach.label}</Label>
          </div>
          <div className="col-span-12 md:col-span-9">
            <SplitHeadline id="reach-title" text={reach.headline} className="h-xl max-w-[14ch]" />
            <p className="prose-w mt-7 text-[16px] leading-[1.68] text-[#b8c0c9] sm:text-[17px]" data-reveal>
              {reach.intro}
            </p>
            <ul className="mt-7 flex flex-wrap gap-2.5" data-reveal>
              {reach.regulators.map((r) => (
                <li
                  key={r.code}
                  className="surface-pill inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium text-[#dde2e7]"
                >
                  <span className="font-mono text-[11px] tracking-[0.1em] text-teal-300">{r.code}</span>
                  <span className="text-muted">{r.country}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ReachStage />
      </div>
    </section>
  )
}
