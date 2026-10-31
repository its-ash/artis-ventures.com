<script setup lang="ts">
import { PhArrowRight } from '@phosphor-icons/vue'
import { hero } from '~/data/site'

const SEEN_KEY = 'av:intro'

const root = ref<HTMLElement>()
const title = ref<HTMLElement>()
const introDone = useState('intro-done', () => false)
const reveal = useTextReveal()
const track = useTrack()

const seen = () => {
  try {
    const v = sessionStorage.getItem(SEEN_KEY) === '1'
    sessionStorage.setItem(SEEN_KEY, '1')
    return v
  } catch {
    return false
  }
}

useGsap(root, ({ reduce, fine, desktop }, { gsap }) => {
  const done = () => void (introDone.value = true)
  const repeat = seen()
  gsap.set('[data-intro]', { animation: 'none' })

  if (reduce) {
    gsap
      .timeline({ onStart: done })
      .to('[data-intro]', { autoAlpha: 0, duration: 0.3, ease: 'none' })
      .from('[data-fade]', { autoAlpha: 0, duration: 0.4, ease: 'none' }, '<')
    return
  }

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
  if (repeat) {
    tl.to('[data-intro]', { autoAlpha: 0, duration: 0.35, ease: 'none', onComplete: done })
  } else {
    tl.from('[data-intro-line]', { scaleX: 0, duration: 0.8, ease: 'expo.inOut' })
      .from('[data-intro-logo]', { autoAlpha: 0, y: 14, duration: 0.6 }, 0.45)
      .to(['[data-intro-logo]', '[data-intro-line]'], { autoAlpha: 0, y: -10, duration: 0.35, ease: 'power2.in' }, 1.15)
      .to('[data-intro]', { yPercent: -100, duration: 0.8, ease: 'expo.inOut', onStart: done }, 1.25)
  }

  const t0 = repeat ? 0.1 : 1.45
  tl.fromTo('[data-zoom]', { scale: 1.28 }, { scale: 1.08, duration: 2.6, ease: 'expo.out' }, t0 - 0.2)
    .from('[data-eyebrow]', { autoAlpha: 0, x: -16, duration: 0.8 }, t0)
  reveal(title.value, { type: 'chars', timeline: tl, position: t0 + 0.05, stagger: 0.016 })
  tl.from('[data-rule]', { scaleX: 0, duration: 1.1, ease: 'expo.inOut' }, t0 + 0.5)
    .from('[data-body]', { autoAlpha: 0, y: 20, duration: 1 }, t0 + 0.75)
    .from('[data-cta] > *', { autoAlpha: 0, y: 24, duration: 1, stagger: 0.1 }, t0 + 0.9)
    .from('[data-cue]', { autoAlpha: 0, duration: 0.8 }, t0 + 1.2)
    .to('[data-zoom]', { scale: 1, duration: 14, ease: 'sine.out' })

  const st = { trigger: root.value, start: 'top top', end: 'bottom top', scrub: true }
  gsap.to('[data-content]', { yPercent: desktop ? -18 : -10, autoAlpha: 0.15, ease: 'none', scrollTrigger: st })
  gsap.to('[data-bg]', { yPercent: desktop ? 22 : 14, ease: 'none', scrollTrigger: st })
  gsap.to('[data-cue]', { autoAlpha: 0, ease: 'none', scrollTrigger: { ...st, end: '15% top' } })

  if (!fine) return
  const tx = gsap.quickTo('[data-tilt]', 'x', { duration: 1.2, ease: 'power3.out' })
  const ty = gsap.quickTo('[data-tilt]', 'y', { duration: 1.2, ease: 'power3.out' })
  const move = (e: PointerEvent) => {
    tx((e.clientX / innerWidth - 0.5) * -24)
    ty((e.clientY / innerHeight - 0.5) * -16)
  }
  root.value!.addEventListener('pointermove', move, { passive: true })
  return () => root.value?.removeEventListener('pointermove', move)
})

useHead({ noscript: [{ innerHTML: '<style>.intro{display:none}</style>' }] })
</script>

<template>
  <section id="top" ref="root" class="relative flex min-h-svh flex-col overflow-hidden bg-ink-950" aria-labelledby="hero-title">
    <div data-intro aria-hidden="true" class="intro fixed inset-0 z-50 grid place-items-center bg-ink-950">
      <div class="grid w-[min(72vw,22rem)] justify-items-center gap-6">
        <img data-intro-logo src="/logo-word.webp" alt="" width="419" height="72" class="h-8 w-auto sm:h-10" />
        <span data-intro-line class="block h-px w-full bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
      </div>
    </div>

    <div data-bg aria-hidden="true" class="pointer-events-none absolute -inset-x-6 -top-6 -bottom-[12%]">
      <div data-tilt class="size-full">
        <div data-zoom class="size-full origin-[50%_30%]">
          <ArchBackdrop variant="tower" />
        </div>
      </div>
      <div class="absolute inset-0 bg-[linear-gradient(180deg,rgb(4_10_20/0.55)_0%,rgb(4_10_20/0.2)_35%,rgb(4_10_20/0.75)_70%,var(--color-ink-950)_100%)]" />
      <div class="absolute inset-0 bg-[linear-gradient(90deg,rgb(4_10_20/0.7),transparent_70%)]" />
    </div>

    <div data-content class="container-x relative flex flex-1 flex-col pt-[calc(var(--header-h)+min(2.5rem,5svh))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pt-[calc(var(--header-h)+5rem)] lg:pb-16">
      <p data-eyebrow data-fade class="label">{{ hero.eyebrow }}</p>

      <h1 id="hero-title" ref="title" data-fade class="h-display mt-5 max-w-[13ch] lg:max-w-[16ch]">
        <span class="block">{{ hero.lineA }}</span>
        <span class="block text-gold-300">{{ hero.lineB }}</span>
      </h1>

      <span data-rule aria-hidden="true" class="rule mt-6 w-32 sm:mt-8 sm:w-64" />

      <div class="mt-auto pt-8 lg:ml-auto lg:max-w-md">
        <p data-body data-fade class="leading-relaxed text-fg-muted sm:text-lg">
          {{ hero.body }}
          <span class="mt-2 block font-mono text-sm tracking-[0.16em] text-fg">{{ hero.markets }}</span>
        </p>
        <div data-cta data-fade class="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
          <a href="#contact" class="magnetic btn btn-gold" @click="track('cta_click', { location: 'hero', action: 'contact' })">
            Talk to an Adviser
            <PhArrowRight :size="16" aria-hidden="true" class="arrow-nudge" />
          </a>
          <a href="#capabilities" class="btn btn-line" @click="track('cta_click', { location: 'hero', action: 'explore' })">Our capabilities</a>
        </div>
      </div>

      <a
        data-cue
        href="#about"
        class="mt-5 flex min-h-12 items-center gap-3 self-start sm:absolute sm:right-8 sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:mt-0 sm:flex-col-reverse sm:self-auto lg:right-auto lg:bottom-16 lg:left-12"
        aria-label="Scroll to Who We Are"
      >
        <span aria-hidden="true" class="relative block h-10 w-px overflow-hidden bg-line sm:h-14">
          <span class="cue-dot absolute inset-x-0 top-0 h-1/2 bg-gold-400" />
        </span>
        <span aria-hidden="true" class="label sm:[writing-mode:vertical-rl]">Scroll</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.cue-dot {
  animation: cue 2.4s var(--ease-in-out) infinite;
}

@keyframes cue {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(200%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cue-dot {
    animation: none;
  }
}
</style>
