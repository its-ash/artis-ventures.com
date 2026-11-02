import { Marquee } from '@/components/Marquee'
import { Label } from '@/components/ui/Label'
import { SplitHeadline } from '@/components/ui/SplitHeadline'
import { meta } from '@/components/ui/sectionMeta'
import { menu } from '@/content/site'

// Bento rhythm (12 columns) and HUD corner brackets; brackets open outward on hover.
const SPANS = ['md:col-span-7', 'md:col-span-5', 'md:col-span-5', 'md:col-span-7']
const CORNERS = [
  'left-3 top-3 border-l border-t group-hover:-translate-x-1 group-hover:-translate-y-1',
  'right-3 top-3 border-r border-t group-hover:translate-x-1 group-hover:-translate-y-1',
  'bottom-3 left-3 border-b border-l group-hover:-translate-x-1 group-hover:translate-y-1',
  'bottom-3 right-3 border-b border-r group-hover:translate-x-1 group-hover:translate-y-1',
]

export function Menu() {
  const m = meta('menu')
  return (
    <section id="menu" data-tone="light" data-section="menu" aria-labelledby="menu-title" className="tone">
      <div className="shell py-28 md:py-36">
        <div className="grid-12 gap-y-8">
          <Label n={m.n} className="col-span-12 md:col-span-3">
            {menu.label}
          </Label>
          <div className="col-span-12 md:col-span-9">
            <SplitHeadline id="menu-title" text={menu.headline} className="h-lg max-w-[20ch]" />
            <p className="prose-w mt-8 text-muted" data-reveal>
              {menu.intro}
            </p>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-5 md:mt-28 md:grid-cols-12">
          {menu.groups.map((g, i) => (
            <article
              key={g.title}
              className={`hair group relative flex flex-col gap-10 rounded-2xl border bg-stone-50/80 p-6 md:p-10 ${SPANS[i % SPANS.length]}`}
              data-reveal
            >
              {CORNERS.map((c) => (
                <span
                  key={c}
                  aria-hidden="true"
                  className={`absolute size-4 border-teal-700 transition-transform duration-300 ease-[var(--ease-out)] ${c}`}
                />
              ))}
              <div className="flex items-start justify-between gap-6">
                <h3 className="display h-md max-w-[16ch]">{g.title}</h3>
                <span className="label text-accent">[{String(i + 1).padStart(2, '0')}]</span>
              </div>
              <ul className="mt-auto">
                {g.items.map((x) => (
                  <li key={x} className="hair relative flex items-center gap-3 border-t py-4" data-menu-row>
                    <span aria-hidden="true" className="size-1.5 shrink-0 bg-teal-700" />
                    {x}
                    <span
                      data-menu-sweep
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-px origin-left bg-teal-700"
                    />
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
      <Marquee items={menu.marquee} />
    </section>
  )
}
