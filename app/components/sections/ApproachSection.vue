<script setup lang="ts">
import { PhCheck } from '@phosphor-icons/vue'
import { approach, sections } from '~/data/site'

const s = sections.approach
const root = ref<HTMLElement>()
const lead = ref<HTMLElement>()
const active = ref(-1)
const text = useTextReveal()
const { reveal } = useScrollAnimation()
const last = approach.length - 1

const state = (i: number) => (i < active.value ? 'is-done' : i === active.value ? 'is-current' : '')

useGsap(root, ({ reduce, desktop }, { gsap, ScrollTrigger }) => {
  text(lead.value, { type: 'lines', reduce })
  const steps = gsap.utils.toArray<HTMLElement>('[data-step]')

  if (reduce) {
    active.value = last
    reveal(steps, { trigger: '[data-steps]', reduce })
    return
  }

  if (!desktop) {
    gsap.fromTo('[data-rail]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-steps]', start: 'top 60%', end: 'bottom 60%', scrub: 0.5 } })
    steps.forEach((step, i) => {
      ScrollTrigger.create({ trigger: step, start: 'top 60%', end: 'bottom 60%', onToggle: (t) => t.isActive && (active.value = i), onLeaveBack: () => i === 0 && (active.value = -1) })
      const q = gsap.utils.selector(step)
      gsap
        .timeline({ scrollTrigger: { trigger: step, start: 'top 82%', once: true } })
        .from(q('[data-marker]'), { scale: 0.6, autoAlpha: 0, duration: 0.8, clearProps: 'transform' })
        .from(q('[data-step-copy]'), { autoAlpha: 0, y: 18, duration: 0.9, stagger: 0.1 }, 0.25)
      text(q('[data-step-title]')[0], { type: 'words', trigger: step, start: 'top 82%', delay: 0.1 })
    })
    return () => void (active.value = -1)
  }

  const pin = root.value!.querySelector<HTMLElement>('[data-pin]')!
  const rail = root.value!.querySelector<HTMLElement>('[data-track]')!
  pin.classList.add('is-pinned')
  rail.classList.add('is-row')
  const distance = () => Math.max(0, rail.scrollWidth - rail.parentElement!.clientWidth)

  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: () => `+=${Math.max(distance(), innerHeight) * 1.2}`,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => void (active.value = Math.min(last, Math.floor(progress * approach.length))),
        onLeaveBack: () => void (active.value = -1),
      },
    })
    .to(rail, { x: () => -distance() })
    .fromTo('[data-rail]', { scaleX: 0 }, { scaleX: 1 }, 0)
  reveal(steps, { trigger: pin, stagger: 0.1, start: 'top 60%' })

  return () => {
    pin.classList.remove('is-pinned')
    rail.classList.remove('is-row')
    active.value = -1
  }
})
</script>

<template>
  <section id="approach" ref="root" class="relative bg-ink-900" aria-labelledby="approach-title">
    <div data-pin class="stage overflow-hidden py-24 sm:py-32">
      <div class="container-x">
        <SectionLabel :n="s.n" :label="s.label" />
        <div class="mt-6 lg:flex lg:items-end lg:justify-between lg:gap-16">
          <KineticHeading id="approach-title" :text="s.title" :accent="s.accent" class="h-section max-w-[16ch] lg:text-[clamp(2.5rem,4.2vw,4rem)]" />
          <p ref="lead" class="lead mt-6 lg:mt-0 lg:max-w-[36ch] lg:pb-3">{{ s.lead }}</p>
        </div>

        <div class="viewport mt-14">
          <div data-track class="track relative">
            <span aria-hidden="true" class="rail-base absolute bg-line" />
            <span data-rail aria-hidden="true" class="rail-fill absolute bg-gold-400" />
            <ol data-steps class="steps relative grid">
              <li v-for="(st, i) in approach" :key="st.id" data-step class="step grid grid-cols-[3rem_minmax(0,1fr)] gap-x-5 pb-14 last:pb-0 sm:gap-x-8" :class="state(i)" :aria-current="i === active ? 'step' : undefined">
                <span data-marker class="marker relative grid size-12 place-items-center border font-mono text-sm tabular">
                  <span class="num">{{ String(i + 1).padStart(2, '0') }}</span>
                  <PhCheck :size="18" aria-hidden="true" class="check absolute" />
                </span>
                <div class="pt-2">
                  <h3 data-step-title class="font-display text-[1.75rem] leading-tight sm:text-3xl">{{ st.title }}</h3>
                  <p data-step-copy class="mt-3 text-lg text-accent">{{ st.lead }}</p>
                  <p data-step-copy class="mt-3 max-w-[48ch] leading-relaxed text-fg-muted">{{ st.body }}</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rail-base,
.rail-fill {
  top: 1.5rem;
  bottom: 0;
  left: 1.5rem;
  width: 1px;
  transform-origin: top center;
}

.marker {
  background: var(--color-ink-900);
  border-color: var(--c-line-strong);
  color: var(--c-fg-muted);
  transition:
    background-color 400ms ease,
    border-color 400ms ease,
    color 400ms ease;
}

.check {
  opacity: 0;
  transform: scale(0.6);
  transition:
    opacity 300ms ease,
    transform 300ms var(--ease-out);
}

.num {
  transition: opacity 300ms ease;
}

h3 {
  transition: color 400ms ease;
}

.is-current .marker {
  background: var(--color-gold-400);
  border-color: var(--color-gold-400);
  color: var(--color-ink-950);
}

.is-done .marker {
  border-color: var(--color-gold-400);
  color: var(--color-gold-400);
}

.is-done .num {
  opacity: 0;
}

.is-done .check {
  opacity: 1;
  transform: none;
}

.is-done h3 {
  color: var(--c-fg-muted);
}

@media (min-width: 1024px) {
  .stage.is-pinned {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100svh;
    padding-block: var(--header-h) 0;
  }

  .track.is-row {
    width: max-content;
  }

  .is-row .steps {
    display: flex;
    gap: 3rem;
  }

  .is-row .step {
    width: min(24rem, 30vw);
    grid-template-columns: minmax(0, 1fr);
    row-gap: 1.5rem;
    padding-bottom: 0;
  }

  .is-row .rail-base,
  .is-row .rail-fill {
    inset: 1.5rem 0 auto 0;
    width: auto;
    height: 1px;
    transform-origin: left center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .marker,
  .check,
  .num,
  h3 {
    transition: none;
  }
}
</style>
