<script setup lang="ts">
import { PhArrowUpRight, PhEnvelopeSimple, PhPhone } from '@phosphor-icons/vue'
import { contact, disclosure, nav, socials } from '~/data/site'

const year = new Date().getFullYear()
const root = ref<HTMLElement>()
const { reveal } = useScrollAnimation()
const track = useTrack()

useGsap(root, ({ reduce }, { gsap }) => {
  reveal('[data-col]', { trigger: root.value!, start: 'top 90%', stagger: 0.1, y: 24, reduce })
  if (reduce) return
  gsap.utils.toArray<HTMLElement>('[data-divider]').forEach((d) => gsap.from(d, { scaleX: 0, duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: d, start: 'top 95%', once: true } }))
  gsap.from('[data-mark]', { yPercent: 40, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: '[data-mark]', start: 'top bottom', end: 'bottom 85%', scrub: true } })
})
</script>

<template>
  <footer ref="root" class="relative overflow-hidden bg-ink-950 pt-20 pb-[max(2rem,env(safe-area-inset-bottom))]">
    <div class="container-x">
      <span data-divider aria-hidden="true" class="rule w-full" />

      <div class="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div data-col class="lg:col-span-4">
          <img src="/logo.webp" alt="Artis Ventures, gateway to excellence" width="457" height="112" loading="lazy" decoding="async" class="h-12 w-auto" />
          <p class="mt-6 max-w-[22ch] font-display text-2xl leading-snug">{{ contact.tagline }}</p>
        </div>

        <nav data-col aria-label="Footer" class="lg:col-span-2">
          <h2 class="label">Navigate</h2>
          <ul class="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1">
            <li v-for="n in nav" :key="n.href">
              <a :href="n.href" class="footer-link inline-flex min-h-12 items-center text-fg-muted">{{ n.label }}</a>
            </li>
          </ul>
        </nav>

        <div data-col class="lg:col-span-3">
          <h2 class="label">Contact</h2>
          <ul class="mt-4">
            <li>
              <a :href="`tel:${contact.tel}`" class="footer-link inline-flex min-h-12 items-center gap-3 text-fg-muted" @click="track('cta_click', { location: 'footer', action: 'call' })">
                <PhPhone :size="16" aria-hidden="true" class="text-gold-400" />{{ contact.phone }}
              </a>
            </li>
            <li>
              <a :href="`mailto:${contact.email}`" class="footer-link inline-flex min-h-12 items-center gap-3 break-all text-fg-muted" @click="track('cta_click', { location: 'footer', action: 'email' })">
                <PhEnvelopeSimple :size="16" aria-hidden="true" class="shrink-0 text-gold-400" />{{ contact.email }}
              </a>
            </li>
            <li v-for="sl in socials" :key="sl.href">
              <a :href="sl.href" target="_blank" rel="noopener noreferrer" class="footer-link inline-flex min-h-12 items-center gap-3 text-fg-muted">
                {{ sl.label }}<PhArrowUpRight :size="14" aria-hidden="true" /><span class="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>

        <div data-col class="lg:col-span-3">
          <h2 class="label">Offices</h2>
          <ul class="mt-4 grid gap-4 text-sm leading-relaxed text-fg-muted">
            <li v-for="o in contact.offices" :key="o.id">
              <span class="block font-display text-base text-fg">{{ o.title }}</span>
              <span>{{ o.lines.at(-1) }}</span>
            </li>
          </ul>
        </div>
      </div>

      <img data-mark src="/logo-word.webp" alt="" aria-hidden="true" width="419" height="72" loading="lazy" decoding="async" class="mt-20 w-full opacity-[0.08] select-none" />

      <span data-divider aria-hidden="true" class="rule mt-10 w-full" />
      <div class="mt-8 grid gap-4 text-sm leading-relaxed text-fg-subtle">
        <p class="text-fg-muted">{{ contact.legal }}</p>
        <p class="max-w-[90ch]">{{ disclosure }}</p>
        <p>© {{ year }} Artis Ventures LLC-FZ</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-link {
  transition: color 200ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .footer-link:hover {
    color: var(--c-fg);
  }
}
</style>
