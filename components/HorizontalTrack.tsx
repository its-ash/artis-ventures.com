import { capabilities } from '@/content/site'

type Card = (typeof capabilities.cards)[number]

const pad = (n: number) => String(n).padStart(2, '0')

// Static grid without JS; the SceneDirector pins it and turns it into a horizontal track on desktop.
export function HorizontalTrack({ cards }: { cards: readonly Card[] }) {
  return (
    <div data-track className="relative">
      <ol data-track-rail className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {cards.map((c) => (
          <li
            key={c.n}
            data-track-card
            className="hair flex min-h-[30rem] flex-col justify-between gap-12 border bg-stone-50/60 p-7 md:p-10"
          >
            <div>
              <p className="label text-accent">[{c.n}]</p>
              <h3 className="display h-md mt-8 max-w-[16ch]">{c.title}</h3>
              <p className="mt-5 max-w-[46ch] text-muted">{c.body}</p>
            </div>
            <ul className="space-y-0">
              {c.services.map((s) => (
                <li key={s} className="hair label border-t py-3 text-fg">
                  {s}
                </li>
              ))}
            </ul>
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
