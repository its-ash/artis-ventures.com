<script setup lang="ts">
import { PhArrowRight, PhEnvelopeSimple, PhPhone } from '@phosphor-icons/vue'
import { contact, nav } from '~/data/site'

const open = defineModel<boolean>({ required: true })

const dialog = ref<HTMLDialogElement>()
const nuxt = useNuxtApp()
const track = useTrack()
let tl: gsap.core.Timeline | undefined
let builtReduce: boolean | undefined
let closing: Promise<void> | undefined

const build = (reduce: boolean) => {
  if (tl && builtReduce === reduce) return tl
  const gsap = nuxt.$gsap
  const q = gsap.utils.selector(dialog.value ?? null)
  tl?.revert()
  builtReduce = reduce
  tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
  if (reduce) return tl.fromTo(dialog.value!, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'none' })
  return tl
    .fromTo(q('[data-panel]'), { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' })
    .fromTo(q('[data-x="a"]'), { y: -4, rotate: 0 }, { y: 0, rotate: 45, duration: 0.5 }, 0.35)
    .fromTo(q('[data-x="b"]'), { y: 4, rotate: 0 }, { y: 0, rotate: -45, duration: 0.5 }, '<')
    .from(q('[data-link]'), { yPercent: 110, duration: 0.9, stagger: 0.06 }, 0.45)
    .from(q('[data-num]'), { autoAlpha: 0, duration: 0.6, stagger: 0.06 }, '<0.2')
    .from(q('[data-divider]'), { scaleX: 0, duration: 1, ease: 'expo.inOut', stagger: 0.06 }, 0.4)
    .from(q('[data-foot]'), { autoAlpha: 0, y: 16, duration: 0.8, stagger: 0.08 }, 0.8)
}

const show = () => {
  const d = dialog.value
  if (!d || d.open) return
  d.showModal()
  scroller.lenis?.stop()
  build(matchMedia(MQ.reduce).matches).timeScale(1).play(0)
}

const hide = () => {
  const d = dialog.value
  const finish = () => {
    d?.close()
    scroller.lenis?.start()
    closing = undefined
  }
  if (!d?.open || !tl || tl.progress() === 0) return Promise.resolve(finish())
  const t = tl
  return (closing ??= new Promise<void>((resolve) => void t.eventCallback('onReverseComplete', () => resolve(finish())).timeScale(2.2).reverse()))
}

watch(open, (v) => (v ? show() : void hide()))

const close = () => (open.value = false)

const go = async (e: MouseEvent, hash: string) => {
  e.preventDefault()
  open.value = false
  await hide()
  scrollToHash(hash)
}

onBeforeUnmount(() => {
  tl?.revert()
  scroller.lenis?.start()
})
</script>

<template>
  <dialog
    ref="dialog"
    class="menu m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-fg"
    aria-label="Menu"
    data-lenis-prevent
    @cancel.prevent="close"
  >
    <div data-panel class="flex min-h-full flex-col bg-ink-950">
      <div class="container-x flex h-16 shrink-0 items-center justify-between pr-2 sm:pr-6">
        <img src="/logo-word.webp" alt="Artis Ventures" width="419" height="72" class="h-6 w-auto sm:h-7" />
        <button type="button" class="grid size-12 place-items-center [grid-template-areas:'s']" aria-label="Close menu" autofocus @click="close">
          <span data-x="a" aria-hidden="true" class="h-px w-6 bg-current [grid-area:s]" />
          <span data-x="b" aria-hidden="true" class="h-px w-6 bg-current [grid-area:s]" />
        </button>
      </div>

      <nav aria-label="Menu" class="container-x mt-[4svh]">
        <ol>
          <li v-for="(n, i) in nav" :key="n.href" class="relative">
            <a :href="n.href" class="flex min-h-[min(4.5rem,10svh)] items-center gap-5 py-2" @click="go($event, n.href)">
              <span data-num aria-hidden="true" class="label tabular w-6">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="overflow-hidden pb-[0.08em]">
                <span data-link class="block font-display text-[clamp(2.25rem,9vw,3.5rem)] leading-none">{{ n.label }}</span>
              </span>
              <PhArrowRight :size="20" aria-hidden="true" class="arrow-nudge ml-auto text-gold-400" />
            </a>
            <span data-divider aria-hidden="true" class="rule absolute inset-x-0 bottom-0" />
          </li>
        </ol>
      </nav>

      <div class="container-x pb-safe mt-auto grid gap-2 pt-10">
        <a data-foot href="#contact" class="btn btn-gold w-full" @click="go($event, '#contact'); track('cta_click', { location: 'menu', action: 'contact' })">
          Talk to an Adviser
          <PhArrowRight :size="16" aria-hidden="true" />
        </a>
        <div data-foot class="grid grid-cols-2 gap-2">
          <a :href="`tel:${contact.tel}`" class="btn btn-line" @click="track('cta_click', { location: 'menu', action: 'call' })">
            <PhPhone :size="16" aria-hidden="true" />Call
          </a>
          <a :href="`mailto:${contact.email}`" class="btn btn-line" @click="track('cta_click', { location: 'menu', action: 'email' })">
            <PhEnvelopeSimple :size="16" aria-hidden="true" />Email
          </a>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.menu::backdrop {
  background: transparent;
}
</style>
