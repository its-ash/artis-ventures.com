<script setup lang="ts">
import { PhArrowRight, PhEnvelopeSimple, PhPhone } from '@phosphor-icons/vue'
import { contact, sections } from '~/data/site'

const s = sections.contact
const root = ref<HTMLElement>()
const { reveal } = useScrollAnimation()
const track = useTrack()

useGsap(root, ({ reduce, desktop }, { gsap }) => {
  reveal('[data-copy]', { trigger: '[data-copy]', stagger: 0.12, delay: 0.4, reduce })
  if (reduce) return
  const st = { trigger: root.value, start: 'top bottom', end: 'bottom top', scrub: true }
  ;[0, 1, 2].forEach((l) => gsap.fromTo(`[data-layer="${l}"]`, { y: 40 + l * 40, xPercent: 0 }, { y: -20 - l * 30, xPercent: (l - 1) * (desktop ? 3 : 5), ease: 'none', scrollTrigger: st }))
  gsap.fromTo('[data-sky]', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: st })
  gsap.from('[data-cta-rule]', { scaleX: 0, duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: '[data-cta-rule]', start: 'top 90%', once: true } })
})
</script>

<template>
  <section id="contact" ref="root" class="relative flex min-h-svh flex-col justify-center overflow-hidden bg-ink-950 py-24 sm:py-32" aria-labelledby="contact-title">
    <div data-sky aria-hidden="true" class="pointer-events-none absolute inset-0 origin-bottom">
      <ArchBackdrop variant="skyline" />
      <div class="absolute inset-0 bg-[linear-gradient(180deg,var(--color-ink-950)_0%,rgb(4_10_20/0.6)_45%,rgb(4_10_20/0.35)_100%)]" />
    </div>

    <div class="container-x relative">
      <SectionLabel :n="s.n" :label="s.label" />
      <KineticHeading id="contact-title" :text="s.title" :accent="s.accent" split="chars" class="h-display mt-8 max-w-[12ch] text-gold-200" />
      <span data-cta-rule aria-hidden="true" class="rule mt-8 w-40 sm:w-72" />
      <p data-copy class="lead mt-8 text-fg">{{ s.lead }}</p>

      <div data-copy class="mt-10 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
        <a :href="`tel:${contact.tel}`" class="magnetic btn btn-gold min-h-16 px-8 text-sm" @click="track('cta_click', { location: 'contact', action: 'call' })">
          <PhPhone :size="18" aria-hidden="true" />
          Talk to an Adviser
          <PhArrowRight :size="16" aria-hidden="true" class="arrow-nudge" />
        </a>
        <a :href="`mailto:${contact.email}`" class="btn btn-line min-h-16 px-6 tracking-[0.08em] normal-case" @click="track('cta_click', { location: 'contact', action: 'email' })">
          <PhEnvelopeSimple :size="18" aria-hidden="true" class="shrink-0" />
          <span class="truncate">{{ contact.email }}</span>
        </a>
      </div>
      <p data-copy class="mt-5 font-mono text-sm tracking-[0.12em] text-fg-muted tabular">{{ contact.phone }}</p>
    </div>
  </section>
</template>
