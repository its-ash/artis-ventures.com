import { CardDiagram } from '@/components/ui/CardDiagram'
import { capabilities } from '@/content/site'

type Card = (typeof capabilities.cards)[number]

const pad = (n: number) => String(n).padStart(2, '0')

// Folder-tab cards: the tab carries index and title, the body a line diagram and the services.
// Static grid without JS; the SceneDirector pins it and turns it into a horizontal track on desktop.
export function HorizontalTrack({ cards }: { cards: readonly Card[] }) {
  return (
    <div data-track className="relative">
      <ol data-track-rail className="grid grid-cols-1 items-start gap-x-5 gap-y-14 pt-11 md:grid-cols-2">
        {cards.map((c, i) => (
          <li key={c.n} data-track-card data-tone="dark" className={`relative flex flex-col text-fg ${i % 2 ? 'md:mt-20' : ''}`}>
            <div className="absolute bottom-full left-0 flex max-w-full items-end">
              <div className="flex min-h-11 items-center gap-3 rounded-tl-2xl bg-graphite-950 py-2 pl-5 pr-3">
                <span className="label text-muted">{c.n}</span>
                <h3 className="display text-[1.0625rem] leading-tight tracking-[-0.02em]">{c.title}</h3>
              </div>
              <svg viewBox="0 0 62 44" className="-ml-px h-11 w-[3.875rem] shrink-0 text-graphite-950" aria-hidden="true" focusable="false">
                <path d="M0 0C22 0 26 44 62 44H0Z" fill="currentColor" />
              </svg>
            </div>
            <div className="flex min-h-[26rem] flex-col gap-6 rounded-[0_1rem_1rem_1rem] bg-graphite-950 p-6 md:p-8">
              <p className="max-w-[46ch] text-[0.95rem] leading-relaxed text-muted">{c.body}</p>
              <div className="hair border-y py-4">
                <CardDiagram i={i} />
              </div>
              <ul className="mt-auto flex flex-col gap-2.5">
                {c.services.map((s) => (
                  <li key={s} className="label flex items-center gap-2.5 text-fg">
                    <span className="size-[0.4rem] shrink-0 bg-teal-500" aria-hidden="true" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-8 hidden items-center gap-6 lg:flex" aria-hidden="true">
        <div className="hair relative h-px flex-1 border-t">
          <div
            data-track-progress
            className="absolute left-0 top-[-1px] h-px w-full origin-left bg-teal-700"
            style={{ transform: `scaleX(${1 / cards.length})` }}
          />
        </div>
        <p className="label" data-track-count>
          [{pad(1)}/{pad(cards.length)}]
        </p>
      </div>
    </div>
  )
}
