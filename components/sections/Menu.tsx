import { Marquee } from '@/components/Marquee'
import { Label } from '@/components/ui/Label'
import { SplitHeadline } from '@/components/ui/SplitHeadline'
import { meta } from '@/components/ui/sectionMeta'
import { menu } from '@/content/site'

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

        <div className="mt-20 grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2 md:mt-28">
          {menu.groups.map((g, i) => (
            <div key={g.title}>
              <h3 className="display h-md flex items-baseline gap-4">
                <span className="label text-accent">{String(i + 1).padStart(2, '0')}</span>
                {g.title}
              </h3>
              <ul className="mt-6">
                {g.items.map((x) => (
                  <li key={x} className="hair relative border-t py-4" data-menu-row>
                    {x}
                    <span
                      data-menu-sweep
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-px origin-left bg-teal-700"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <Marquee items={menu.marquee} />
    </section>
  )
}
