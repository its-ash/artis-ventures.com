# Artis Ventures website

Mobile-first, single-page, animation-rich marketing site for Artis Ventures LLC-FZ (Dubai). Nuxt 4, static output.

## Stack

- Nuxt 4 (`app/` directory, no `pages/`; `app/app.vue` is the page). Components auto-import without path prefix from `app/components/{navigation,sections,cards,common,animations}`.
- Tailwind CSS v4 through `@tailwindcss/vite`. Tokens are in `app/assets/css/main.css`: `ink-*` (navy), `gold-*` (accent), `paper` (light sections). Semantic tokens `fg`, `fg-muted`, `fg-subtle`, `line`, `accent`, `surface` swap through `.theme-dark` / `.theme-light`.
- Fonts: Bodoni Moda (display, variable `opsz`), Geist (body), Geist Mono (labels, buttons). `@nuxt/fonts` self-hosts them. Do not add a fourth font.
- Brand: source logo is `public/Artis_Final.png`. `logo-word.webp` (wordmark) is in the header, menu and intro. `logo.webp` (wordmark plus light tagline) is in the footer. Palette is navy and gold. Square corners everywhere (no radius scale). No glassmorphism.
- Images: architectural visuals are procedural SVG (`ArchBackdrop.vue`, variants `tower`, `facade`, `skyline`). No photo files are needed.
- Icons: `@phosphor-icons/vue`.

## Motion

- GSAP 3 with ScrollTrigger and SplitText, registered in `app/plugins/gsap.client.ts` and provided as `$gsap`, `$ScrollTrigger`, `$SplitText`. Lenis runs only on fine pointers without reduced motion; touch uses native scroll.
- `useGsap(scopeRef, (conditions, api) => cleanup?)` runs inside a scoped `gsap.matchMedia` with `MQ` conditions (`mobile`, `tablet`, `desktop`, `fine`, `reduce`) from `app/utils/motion.ts`. Everything reverts on unmount and on breakpoint change. Always branch on `reduce`.
- `useScrollAnimation()`: `reveal`, `drawLine`, `parallax`, `clipReveal`, `toggleHeight`. `useTextReveal()`: SplitText chars, words or lines with mask and gold `.hl` sweep. `useResponsive()`: reactive media flags.
- Shared pieces: `KineticHeading`, `SectionLabel`, `DrawBorder`, `StatCounter`, `MarketsBand`.
- Intro: `HeroSection.vue` owns the curtain (navy screen, gold line, logo, char headline, CTAs, background zoom). It shortens on repeat visits in the same session and fades under reduced motion. A CSS failsafe clears it after 4.5 s if JS fails.
- Desktop only: pinned horizontal scroll in `CapabilitiesSection` and `ApproachSection` (classes `is-pinned`, `is-rail`, `is-row` are added by JS, so the static layout stays usable). Mobile: vertical timeline, tap-to-expand cards, sticky stacked service cards.
- Light sections (`AboutSection`, `ServicesSection`) open with a clip-path wipe.

## Commands

- `make run`: start the dev server.
- `make build`: generate the static site into `docs/` with `.nojekyll`.
- `make deploy`: build, commit and push to `main`. GitHub Pages serves `docs/`.

## Content

- All copy, section headings, contact data, offices, presence cities, regulators, leaders, socials and the disclosure are in `app/data/site.ts`. Change content there, not in components. `socials` is empty until real profile URLs exist.
- Leader headshots: put files at `public/leaders/<leader-id>.webp` (800 x 1000, 4:5). If a file is missing, the card shows initials.
- Analytics: `useTrack()` pushes events to `window.dataLayer`. Events: `cta_click`, `accordion_toggle`, `profile_toggle`, `capabilities_depth`, `menu_open`, `map_open`.

## Rules

- Mobile first. Touch targets 48px minimum. No hover-only interactions; gate hover styles with `(hover: hover) and (pointer: fine)`.
- Every animation needs a `prefers-reduced-motion` branch (fade or static state).
- Animate only `transform`, `opacity`, `clip-path` or SVG stroke offsets. No scroll hijacking on touch. No autoplay video or sound.
- GSAP runs only on the client inside `useGsap`; never touch the DOM in `setup` or on the server.
- Keep WCAG 2.2 AA contrast. Gold on light sections uses `gold-700` through `--c-accent`.
- Keep the disclosure in the footer when you add financial capability claims. Do not invent achievements, authorisations or clients.
- Copy: outcome first, no em dashes.
