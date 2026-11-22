import Image from 'next/image'
import { Label } from '@/components/ui/Label'
import { SplitHeadline } from '@/components/ui/SplitHeadline'
import { meta } from '@/components/ui/sectionMeta'
import { leadership, ui } from '@/content/site'

const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')

export function Leadership() {
  const m = meta('leadership')
  return (
    <section
      id="leadership"
      data-tone="light"
      data-section="leadership"
      aria-labelledby="leadership-title"
      className="tone py-16 md:py-40"
    >
      <div className="shell">
        <div className="grid-12 gap-y-6 md:gap-y-8">
          <div className="col-span-12 md:col-span-3">
            <Label n={m.n}>{leadership.label}</Label>
            <p className="label mt-2 text-muted">{leadership.eyebrow}</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <SplitHeadline id="leadership-title" text={leadership.headline} className="h-xl max-w-[16ch]" />
            <p className="prose-w mt-6 text-muted md:mt-8" data-reveal>
              {leadership.intro}
            </p>
          </div>
        </div>

        <ul className="mt-12 md:mt-28">
          {leadership.people.map((p) => (
            <li key={p.name} className="hair grid-12 gap-y-6 border-t py-8 md:gap-y-8 md:py-16" data-leader>
              <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3">
                <div
                  data-leader-photo
                  className="hair relative aspect-4/5 max-w-[16rem] overflow-hidden rounded-2xl border bg-stone-200/50 sm:max-w-none sm:rounded-none"
                >
                  {p.photo ? (
                    <Image src={p.photo} alt={p.name} fill sizes="(min-width: 1024px) 25vw, 65vw" className="object-cover" />
                  ) : (
                    <span aria-hidden="true" className="display absolute inset-0 grid place-items-center text-6xl text-stone-200">
                      {initials(p.name)}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-span-12 md:col-span-8 md:col-start-5 lg:col-span-8 lg:col-start-5">
                <h3 className="display h-lg" data-leader-name>
                  {p.name}
                </h3>
                <p className="label mt-3 text-accent md:mt-4">{p.role}</p>
                <div className="mt-5 grid grid-cols-1 gap-4 md:mt-8 md:gap-6 lg:grid-cols-2">
                  {p.bio.map((b) => (
                    <p key={b.slice(0, 24)} className="text-muted" data-reveal>
                      {b}
                    </p>
                  ))}
                </div>
                {p.linkedin && (
                  <a
                    href={p.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label link-u mt-8 inline-block"
                    aria-label={`${p.name} — ${leadership.linkedin} (${ui.newTab})`}
                  >
                    {leadership.linkedin}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
