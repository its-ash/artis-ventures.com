import { Label } from '@/components/ui/Label'
import { SplitHeadline } from '@/components/ui/SplitHeadline'
import { meta } from '@/components/ui/sectionMeta'
import { offices, reach } from '@/content/site'

// Globe stops after the three regulators: the two operating offices.
const stageOffices = offices.items.filter((o) => o.id === 'dubai' || o.id === 'hong-kong')

export function Reach() {
  const m = meta('reach')
  return (
    <section
      id="reach"
      data-tone="dark"
      data-section="reach"
      aria-labelledby="reach-title"
      className="tone gridlines relative isolate overflow-hidden py-28 md:py-40"
    >
      <div className="shell">
        <div className="grid-12 gap-y-8">
          <Label n={m.n} className="col-span-12 md:col-span-3">
            {reach.label}
          </Label>
          <div className="col-span-12 md:col-span-9">
            <SplitHeadline id="reach-title" text={reach.headline} className="h-xl max-w-[14ch]" />
            <p className="prose-w mt-8 text-muted" data-reveal>
              {reach.intro}
            </p>
          </div>
        </div>

        <ol className="mt-20 md:mt-28">
          {reach.items.map((x) => (
            <li key={x.n} className="hair grid-12 gap-y-4 border-t py-10" data-reach-item>
              <p className="display h-md col-span-12 text-accent md:col-span-2">{x.n}</p>
              <div className="col-span-12 md:col-span-10 lg:col-span-7">
                <h3 className="display h-md">{x.title}</h3>
                <p className="prose-w mt-4 text-muted">{x.body}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {x.tags.map((t) => (
                    <li key={t} className="label hair rounded-full border px-3 py-1.5 text-muted">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>

        {/* Globe stage: stops stack into one cell and swap while the globe turns (with WebGL). */}
        <div className="grid-12 mt-24 min-h-svh items-end gap-y-10 pb-12 md:mt-32 lg:items-center lg:pb-0" data-reach-stage>
          <div className="col-span-12 lg:col-span-5">
            <p className="label text-muted">{reach.reachLabel}</p>
            <ul className="mt-6" aria-describedby="reach-caption" data-stops>
              {reach.regulators.map((r) => (
                <li key={r.code} className="hair border-t py-8" data-stop>
                  <p className="display text-[clamp(4rem,10vw,9rem)] leading-none">{r.code}</p>
                  <p className="label mt-4 text-muted">{r.country}</p>
                </li>
              ))}
              {stageOffices.map((o) => (
                <li key={o.id} className="hair border-t py-8" data-stop>
                  <p className="display text-[clamp(2.75rem,6vw,5.5rem)] leading-none">{o.label}</p>
                  {'entity' in o && <p className="label mt-4 text-fg">{o.entity}</p>}
                  {'licence' in o && <p className="label mt-2 text-muted">{o.licence}</p>}
                </li>
              ))}
            </ul>
            <p id="reach-caption" className="label hair border-t pt-4 text-muted">
              {reach.caption}
            </p>
          </div>
        </div>

        <div className="mt-24 md:mt-32">
          <p className="label text-muted">{offices.label}</p>
          <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {offices.items.map((o) => (
              <li key={o.id} data-office={o.id} className="hair flex flex-col gap-4 border bg-graphite-800/40 p-6">
                <p className="label text-accent">{o.label}</p>
                {'entity' in o && <p className="display text-xl tracking-[-0.02em]">{o.entity}</p>}
                {'licence' in o && <p className="label text-muted">{o.licence}</p>}
                <address className="not-italic text-muted">
                  {o.lines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </address>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
