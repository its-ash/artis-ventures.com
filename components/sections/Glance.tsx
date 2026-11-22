import { GlanceMotion } from '@/components/sections/GlanceMotion'
import { glance } from '@/content/site'

export function Glance() {
  return (
    <section id="glance" data-tone="light" data-section="glance" aria-labelledby="glance-title" className="tone">
      <h2 id="glance-title" className="sr-only">
        {glance.about.label}
      </h2>
      <GlanceMotion />
    </section>
  )
}
