import { Label } from '@/components/ui/Label'
import { SplitHeadline } from '@/components/ui/SplitHeadline'
import { meta } from '@/components/ui/sectionMeta'
import { reach } from '@/content/site'
import { stops } from '@/content/stops'

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

        {/* Stage: with WebGL (and motion) the cube wall shows these cards at the centre and the list stays
            for screen readers only. Without it, the cards show as a grid. */}
        <div className="relative mt-24 flex min-h-svh flex-col justify-between gap-10 py-12 md:mt-32" data-reach-stage>
          <div className="flex items-baseline justify-between gap-6">
            <p className="label text-muted">{reach.reachLabel}</p>
            <p className="label text-muted" aria-hidden="true" data-reach-count />
          </div>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-describedby="reach-caption" data-stops>
            {stops.map((s) => (
              <li key={s.id} className="stop-card" data-stop>
                <p className="label text-muted">{s.kicker}</p>
                <p
                  className={`display mt-4 leading-none ${s.title.length <= 3 ? 'text-[clamp(3.5rem,7vw,6rem)]' : 'text-[clamp(2rem,3.4vw,3.25rem)]'}`}
                >
                  {s.title}
                </p>
                {s.sub && <p className="label mt-5 text-fg">{s.sub}</p>}
                {s.meta.map((l, i) => (
                  <p key={l} className={`label mt-3 ${i ? 'text-muted' : 'text-fg'}`}>
                    {l}
                  </p>
                ))}
                {s.address.length > 0 && (
                  <address className="mt-4 not-italic text-muted">
                    {s.address.map((l) => (
                      <span key={l} className="block">
                        {l}
                      </span>
                    ))}
                  </address>
                )}
              </li>
            ))}
          </ul>
          <p id="reach-caption" className="label hair border-t pt-4 text-muted">
            {reach.caption}
          </p>
        </div>
      </div>
    </section>
  )
}
