<script setup lang="ts">
import { regulators, regulatory, sections } from '~/data/site'

const s = sections.regulatory
const root = ref<HTMLElement>()
const lead = ref<HTMLElement>()
const text = useTextReveal()
const { reveal, drawLine } = useScrollAnimation()

useGsap(root, ({ reduce, desktop }, { gsap }) => {
  text(lead.value, { type: 'lines', reduce })
  drawLine('[data-link]', { trigger: '[data-juris]', start: 'top 75%', end: 'bottom 55%', axis: desktop ? 'x' : 'y', reduce })

  gsap.utils.toArray<HTMLElement>('[data-reg]').forEach((el, i) => {
    const q = gsap.utils.selector(el)
    const st = { trigger: el, start: 'top 82%', once: true }
    if (reduce) return void gsap.from(el, { autoAlpha: 0, duration: 0.5, ease: 'none', scrollTrigger: st })
    gsap
      .timeline({ delay: desktop ? i * 0.15 : 0, scrollTrigger: st })
      .from(q('[data-node]'), { scale: 0, duration: 0.7, ease: 'back.out(2)' })
      .from(q('[data-ring]'), { scale: 0.4, autoAlpha: 0.9, duration: 1.6, ease: 'expo.out' }, 0.2)
      .from(q('[data-code]'), { yPercent: 110, duration: 1 }, 0.1)
      .from(q('[data-meta]'), { autoAlpha: 0, x: -12, duration: 0.8, stagger: 0.08 }, 0.35)
  })

  reveal('[data-pillar]', { trigger: '[data-pillars]', stagger: 0.12, reduce })
  if (!reduce) gsap.from('[data-pillar-rule]', { scaleX: 0, duration: 1.2, ease: 'expo.inOut', stagger: 0.12, scrollTrigger: { trigger: '[data-pillars]', start: 'top 85%', once: true } })
})
</script>

<template>
  <section id="regulatory" ref="root" class="relative overflow-hidden bg-ink-950 py-24 sm:py-32" aria-labelledby="reg-title">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_85%_10%,rgb(215_176_101/0.1),transparent_70%),radial-gradient(50%_40%_at_0%_100%,rgb(29_53_86/0.6),transparent_70%)]" />
    <div class="container-x relative">
      <SectionLabel :n="s.n" :label="s.label" />
      <div class="mt-6 lg:grid lg:grid-cols-12 lg:items-end lg:gap-16">
        <KineticHeading id="reg-title" :text="s.title" :accent="s.accent" split="chars" class="h-section max-w-[14ch] lg:col-span-7" />
        <p ref="lead" class="lead mt-6 lg:col-span-5 lg:mt-0 lg:pb-3">{{ s.lead }}</p>
      </div>

      <div data-juris class="relative mt-16 sm:mt-20">
        <span aria-hidden="true" class="juris-line absolute bg-line" />
        <span data-link aria-hidden="true" class="juris-line juris-fill absolute bg-gold-400" />
        <ul class="relative grid gap-10 lg:grid-cols-3 lg:gap-8">
          <li v-for="r in regulators" :key="r.code" data-reg class="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-6 lg:grid-cols-1 lg:gap-y-8">
            <span aria-hidden="true" class="relative mt-5 grid size-6 place-items-center lg:mt-0">
              <span data-ring class="absolute inset-0 rounded-full border border-gold-400/50" />
              <span data-node class="size-2.5 rounded-full bg-gold-400" />
            </span>
            <div class="panel p-6 sm:p-8">
              <p class="overflow-hidden pb-[0.05em]">
                <span data-code class="block font-display text-[3.5rem] leading-none text-gold-300 sm:text-7xl">{{ r.code }}</span>
              </p>
              <p data-meta class="mt-5 font-display text-xl">{{ r.authority }}</p>
              <p data-meta class="label mt-2">{{ r.country }}</p>
            </div>
          </li>
        </ul>
      </div>

      <ol data-pillars class="mt-20 grid gap-px border-y border-line bg-line sm:mt-24 md:grid-cols-3">
        <li v-for="p in regulatory" :key="p.numeral" data-pillar class="bg-ink-950 py-8 md:px-8 md:first:pl-0">
          <p class="flex items-center gap-4">
            <span class="font-display text-2xl text-gold-400" aria-hidden="true">{{ p.numeral }}</span>
            <span data-pillar-rule aria-hidden="true" class="rule w-12" />
          </p>
          <h3 class="mt-5 font-display text-2xl leading-snug">{{ p.title }}</h3>
          <ol class="mt-5 grid gap-3">
            <li v-for="st in p.steps" :key="st" class="flex items-center gap-3 text-fg-muted">
              <span aria-hidden="true" class="h-px w-4 shrink-0 bg-gold-400" />{{ st }}
            </li>
          </ol>
        </li>
      </ol>

      <p class="mt-8 max-w-[70ch] text-sm leading-relaxed text-fg-subtle">These references describe the licensing experience of our team with each regulator.</p>
    </div>
  </section>
</template>

<style scoped>
.juris-line {
  left: calc(0.75rem - 0.5px);
  top: 2rem;
  bottom: 2rem;
  width: 1px;
  transform-origin: top center;
}

@media (min-width: 1024px) {
  .juris-line {
    left: 0.75rem;
    right: calc((100% - 4rem) / 3 - 0.75rem);
    top: calc(0.75rem - 0.5px);
    bottom: auto;
    width: auto;
    height: 1px;
    transform-origin: left center;
  }
}
</style>
