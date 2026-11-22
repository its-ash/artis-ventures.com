import { ArchPoster } from '@/components/brand/ArchPoster'
import { ContactForm } from '@/components/ContactForm'
import { CopyEmail } from '@/components/CopyEmail'
import { BgVideo } from '@/components/ui/BgVideo'
import { Label } from '@/components/ui/Label'
import { SplitHeadline } from '@/components/ui/SplitHeadline'
import { meta } from '@/components/ui/sectionMeta'
import { contact } from '@/content/site'

export function Contact() {
  const m = meta('contact')
  return (
    <section
      id="contact"
      data-tone="dark"
      data-section="contact"
      aria-labelledby="contact-title"
      className="tone gridlines relative isolate overflow-hidden py-16 md:py-40"
    >
      <div className="absolute inset-0 -z-10 opacity-30" data-fallback-media>
        <BgVideo name="contact_city" />
        <div className="absolute inset-0 bg-linear-to-r from-graphite-950/40 to-graphite-950" />
      </div>
      <ArchPoster id="contact" className="absolute left-[6vw] top-24 -z-10 w-[min(60vw,26rem)] opacity-60 lg:top-1/2 lg:-translate-y-1/2" />
      <div className="shell grid-12 gap-y-12 pt-8 md:gap-y-16 md:pt-0">
        <div className="col-span-12 lg:col-span-6">
          <Label n={m.n}>{contact.label}</Label>
          <p className="label mt-2 text-muted">{contact.eyebrow}</p>
          <SplitHeadline id="contact-title" text={contact.headline} className="h-xl mt-6 max-w-[13ch] md:mt-10" />
          <dl className="mt-10 space-y-6 md:mt-14 md:space-y-8">
            {contact.channels.map((c) => (
              <div key={c.k}>
                <dt className="label text-accent">{c.k}</dt>
                <dd className="mt-1">
                  {'copy' in c ? (
                    <CopyEmail email={c.v} />
                  ) : (
                    <a href={c.href} className="display h-md link-u inline-flex min-h-11 items-center">
                      {c.v}
                    </a>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="col-span-12 lg:col-span-5 lg:col-start-8 lg:self-start">
          <div className="rounded-2xl border border-stone-50/10 bg-graphite-800/95 [--line:rgb(238_235_229/0.18)] p-5 shadow-[0_32px_80px_-24px_rgb(0_0_0/0.85)] sm:p-6 md:p-10">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  )
}
