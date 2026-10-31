<script setup lang="ts">
import { capabilities, sections } from '~/data/site'

const MILESTONES = [25, 50, 75, 100]

const s = sections.capabilities
const root = ref<HTMLElement>()
const lead = ref<HTMLElement>()
const text = useTextReveal()
const track = useTrack()

useGsap(root, ({ reduce, desktop }, { gsap }) => {
  text(lead.value, { type: 'lines', reduce })
  if (!desktop || reduce) return

  const pin = root.value!.querySelector<HTMLElement>('[data-pin]')!
  const rail = root.value!.querySelector<HTMLElement>('[data-track]')!
  pin.classList.add('is-pinned')
  rail.classList.add('is-rail')
  const distance = () => Math.max(0, rail.scrollWidth - innerWidth)
  const seen = new Set<number>()
  gsap
    .timeline({
      scrollTrigger: {
        trigger: '[data-pin]',
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          for (const m of MILESTONES) {
            if (progress * 100 < m - 0.5 || seen.has(m)) continue
            seen.add(m)
            track('capabilities_depth', { percent: m })
          }
        },
      },
    })
    .to(rail, { x: () => -distance(), ease: 'none' })
    .fromTo('[data-progress]', { scaleX: 0 }, { scaleX: 1, ease: 'none' }, 0)

  return () => {
    pin.classList.remove('is-pinned')
    rail.classList.remove('is-rail')
  }
})
</script>

<template>
  <section id="capabilities" ref="root" class="relative bg-ink-950" aria-labelledby="cap-title">
    <div data-pin class="stage overflow-hidden py-24 sm:py-32">
      <div class="container-x lg:flex lg:items-end lg:justify-between lg:gap-16">
        <div>
          <SectionLabel :n="s.n" :label="s.label" />
          <KineticHeading id="cap-title" :text="s.title" :accent="s.accent" class="h-section mt-6 max-w-[18ch] lg:text-[clamp(2.5rem,4.2vw,4rem)]" />
        </div>
        <p ref="lead" class="lead mt-6 lg:mt-0 lg:max-w-[34ch] lg:pb-3">{{ s.lead }}</p>
      </div>

      <ol data-track class="rail mt-12 grid gap-4 px-5 sm:grid-cols-2 sm:px-8">
        <li v-for="(c, i) in capabilities" :key="c.id">
          <CapabilityCard :item="c" :index="i" />
        </li>
      </ol>

      <div aria-hidden="true" class="rail-progress container-x mt-10 hidden">
        <span class="block h-px bg-line"><span data-progress class="block h-px origin-left bg-gold-400" /></span>
      </div>
    </div>
  </section>
</template>

<style scoped>
@media (min-width: 1024px) {
  .rail {
    max-width: 80rem;
    margin-inline: auto;
    padding-inline: 3rem;
    gap: 1.5rem;
  }

  .stage.is-pinned {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100svh;
    padding-block: var(--header-h) 0;
  }

  .rail.is-rail {
    display: flex;
    width: max-content;
    max-width: none;
    margin-inline: 0;
    padding-inline: max(3rem, calc(50vw - 37rem)) 3rem;
  }

  .rail.is-rail > li {
    width: min(30rem, 38vw);
  }

  .is-pinned .rail-progress {
    display: block;
  }
}
</style>
