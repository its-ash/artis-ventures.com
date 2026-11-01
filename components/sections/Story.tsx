import { BgVideo } from '@/components/ui/BgVideo'
import { Label } from '@/components/ui/Label'
import { meta } from '@/components/ui/sectionMeta'
import { story } from '@/content/site'

export function Story() {
  const m = meta('story')
  return (
    <section
      id="story"
      data-tone="dark"
      data-section="story"
      aria-labelledby="story-title"
      className="tone gridlines relative isolate overflow-hidden py-28 md:py-40"
    >
      <div className="absolute inset-0 -z-10 opacity-[0.18] blur-[20px]" data-fallback-media>
        <BgVideo name="hero_city" />
      </div>
      <div className="shell">
        <div className="grid-12 gap-y-8">
          <div className="col-span-12 md:col-span-3">
            <Label n={m.n}>{story.label}</Label>
            <p className="label mt-2 text-muted">{story.eyebrow}</p>
          </div>
          <div className="col-span-12 md:col-span-9">
            <h2 id="story-title" className="display h-lg max-w-[22ch]" data-fill>
              {story.statement}
            </h2>
            <p className="prose-w mt-10 text-muted">{story.body}</p>
          </div>
        </div>

        <ol className="grid-12 mt-24 gap-y-10 md:mt-32">
          {story.pillars.map((p) => (
            <li key={p.n} className="hair col-span-12 border-t pt-6 md:col-span-4" data-pillar>
              <p className="label text-accent">{p.n}</p>
              <h3 className="display h-md mt-6">{p.title}</h3>
              <p className="mt-4 max-w-[36ch] text-muted">{p.body}</p>
            </li>
          ))}
        </ol>

        <dl className="hair mt-24 grid grid-cols-1 border-y sm:grid-cols-3 md:mt-32">
          {story.facts.map((f) => (
            <div key={f.k} className="hair border-b py-6 last:border-b-0 sm:border-b-0 sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0">
              <dt className="label text-muted">{f.k}</dt>
              <dd className="mt-3">
                <span className="label block text-[clamp(1.1rem,1.6vw,1.5rem)] tracking-[0.04em] text-fg">{f.v}</span>
                <span className="label mt-2 block text-muted">{f.note}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
