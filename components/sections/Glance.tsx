import { Label } from '@/components/ui/Label'
import { SplitHeadline } from '@/components/ui/SplitHeadline'
import { meta } from '@/components/ui/sectionMeta'
import { glance } from '@/content/site'

export function Glance() {
  const m = meta('glance')
  return (
    <section id="glance" data-tone="light" data-section="glance" aria-labelledby="glance-title" className="tone">
      <h2 id="glance-title" className="sr-only">
        {glance.about.label}
      </h2>
      {/* Static list without JS; with WebGL the rows stack into one pinned stage and particles draw the numerals. */}
      <div className="shell flex min-h-svh flex-col justify-end py-24 md:py-32 lg:justify-center" data-glance-stage>
        <div className="flex items-baseline justify-between gap-6">
          <Label n={m.n}>{glance.about.label}</Label>
          <p className="label text-muted" aria-hidden="true" data-glance-count>
            [01/{String(glance.stats.length).padStart(2, '0')}]
          </p>
        </div>
        <ul className="mt-12" data-stats>
          {glance.stats.map((s, i) => (
            <li key={s.value} className="hair grid-12 items-end gap-y-4 border-t py-8" data-stat={i}>
              <p
                className="display col-span-12 text-[clamp(4.5rem,11vw,11rem)] leading-none lg:col-span-7"
                aria-hidden="true"
                data-stat-num
              >
                {s.value}
              </p>
              <p className="display h-md col-span-12 max-w-[18ch] lg:col-span-4 lg:col-start-9">
                <span className="sr-only">{s.value} </span>
                {s.label}
              </p>
            </li>
          ))}
        </ul>
        <p className="label hair border-t pt-6 text-accent">{glance.motto}</p>
      </div>

      <div className="shell pb-28 md:pb-40">
        <div className="grid-12 gap-y-10">
          <div className="col-span-12 md:col-span-5">
            <SplitHeadline as="h3" text={glance.about.headline} className="h-lg max-w-[14ch]" />
          </div>
          <div className="col-span-12 space-y-6 md:col-span-6 md:col-start-7">
            {glance.about.body.map((p) => (
              <p key={p.slice(0, 24)} className="prose-w text-muted" data-reveal>
                {p}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-20 md:mt-28">
          <p className="label text-muted">{glance.expertise.label}</p>
          <ul className="mt-6 grid grid-cols-1 md:grid-cols-2">
            {glance.expertise.items.map((x, i) => (
              <li key={x} className="hair display h-md flex items-baseline gap-5 border-t py-6 md:pr-8" data-reveal>
                <span className="label text-accent">{String(i + 1).padStart(2, '0')}</span>
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
