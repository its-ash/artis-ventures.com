<script setup lang="ts">
import { nav } from '~/data/site'

const el = ref<HTMLElement>()
const menuOpen = ref(false)
const introDone = useState('intro-done', () => false)
const track = useTrack()

const openMenu = () => {
  menuOpen.value = true
  track('menu_open')
}

useGsap(el, ({ reduce }, { gsap, ScrollTrigger }) => {
  const header = el.value!
  const bar = header.querySelector('[data-progress]')
  gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } })
  ScrollTrigger.create({ start: 48, end: 'max', toggleClass: { targets: header, className: 'is-solid' } })

  if (reduce) return
  const show = gsap.quickTo(header, 'yPercent', { duration: 0.5, ease: 'expo.out' })
  ScrollTrigger.create({
    start: 'top -120',
    end: 'max',
    onUpdate: (s) => !menuOpen.value && show(s.direction === 1 ? -100 : 0),
    onLeaveBack: () => show(0),
  })

  if (introDone.value) return
  gsap.set(header, { yPercent: -100 })
  const stop = watch(introDone, (v) => v && gsap.to(header, { yPercent: 0, duration: 1, ease: 'expo.out' }))
  return stop
})
</script>

<template>
  <header ref="el" class="site-header fixed inset-x-0 top-0 z-40">
    <div class="container-x flex h-16 items-center justify-between gap-4 pr-2 sm:pr-6 lg:pr-12">
      <a href="#top" class="flex min-h-12 shrink-0 items-center" aria-label="Artis Ventures, back to top">
        <img src="/logo-word.webp" alt="Artis Ventures" width="419" height="72" fetchpriority="high" class="h-6 w-auto sm:h-7" />
      </a>

      <nav aria-label="Primary" class="hidden lg:block">
        <ul class="flex items-center">
          <li v-for="n in nav.slice(0, -1)" :key="n.href">
            <a :href="n.href" class="nav-link inline-flex min-h-12 items-center px-3 font-mono text-[0.75rem] tracking-[0.16em] text-fg-muted uppercase xl:px-4">{{ n.label }}</a>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-2">
        <a href="#contact" class="magnetic btn btn-gold hidden min-h-11 px-5 lg:inline-flex" @click="track('cta_click', { location: 'header', action: 'contact' })">Talk to an Adviser</a>
        <button type="button" class="menu-btn grid size-12 place-items-center lg:hidden" aria-label="Open menu" aria-haspopup="dialog" :aria-expanded="menuOpen" @click="openMenu">
          <span aria-hidden="true" class="menu-line" />
          <span aria-hidden="true" class="menu-line" />
        </button>
      </div>
    </div>
    <span data-progress aria-hidden="true" class="absolute inset-x-0 bottom-0 h-px origin-left bg-gold-400" />
  </header>

  <MobileMenu v-model="menuOpen" />
</template>

<style scoped>
.site-header {
  transition:
    background-color 400ms ease,
    border-color 400ms ease;
  border-bottom: 1px solid transparent;
}

.site-header.is-solid {
  background: rgb(4 10 20 / 0.94);
  border-color: var(--c-line);
}

.menu-btn {
  grid-template-areas: 'stack';
}

.menu-line {
  grid-area: stack;
  width: 1.5rem;
  height: 1px;
  background: currentColor;
  transition: transform 300ms var(--ease-out);
}

.menu-line:first-child {
  transform: translateY(-4px);
}

.menu-line:last-child {
  transform: translateY(4px) scaleX(0.6);
  transform-origin: right;
}

@media (hover: hover) and (pointer: fine) {
  .menu-btn:hover .menu-line:last-child {
    transform: translateY(4px);
  }
}

.nav-link {
  position: relative;
  transition: color 200ms ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  inset: auto 0.75rem 0.7rem;
  height: 1px;
  background: var(--color-gold-400);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 250ms var(--ease-out);
}

.nav-link:focus-visible::after {
  transform: scaleX(1);
}

@media (hover: hover) and (pointer: fine) {
  .nav-link:hover {
    color: var(--c-fg);
  }

  .nav-link:hover::after {
    transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-link::after,
  .menu-line {
    transition: none;
  }
}
</style>
