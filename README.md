# Artis Ventures — Gateway to Excellence

Single-page, scroll-driven site for Artis Ventures LLC-FZ. Next.js 16 (App Router), TypeScript, Tailwind CSS 4, React Three Fiber, GSAP.

## Setup

```bash
nvm use            # Node 24 (.nvmrc)
npm install
cp .env.example .env.local
make run           # http://localhost:3000
make build         # production build
```

### Environment

| Variable | Use |
|---|---|
| `NEXT_PUBLIC_ENQUIRY_ENDPOINT` | URL that receives the enquiry form as JSON `POST`. While empty, the form validates but sends nothing. |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata and JSON-LD. Default `https://www.artis-ventures.com`. |

## Content

All text is in `content/site.ts`. It comes word for word from the 2026 company profile. Comments show the page (`// p3`). Items marked `// brief` come from the project brief, not the profile.

Open items for the client:
- Leadership photos: set `photo` per person (file in `public/`). Until then the card shows initials.
- LinkedIn URLs: set `linkedin` per person. The link shows only when a URL is set.
- Copy for `/affiliate-program` (Opportunities) and `/privacy-statement`.

## Media

| File | Use |
|---|---|
| `public/video/hero_city.mp4` | Hero portal and full-bleed hero video, Who We Are backdrop |
| `public/video/approach_caustics.mp4` | Approach backdrop |
| `public/video/contact_city.mp4` | Contact portal and backdrop |
| `public/posters/<name>.webp` | First frame of each video. Poster, LCP image and no-WebGL fallback |
| `public/textures/stone.webp` | Limestone texture on light sections |
| `public/hdri/city_512.hdr` | Environment map for the glass (drei "city" preset, self-hosted, downsized to 512 × 256, 390 KB) |
| `public/og.jpg` | Open Graph / Twitter card image, 1200 × 630, cropped from the hero poster |
| `public/textures/landmask.png` | Equirectangular land mask (white = land) for the globe dots, made from the three.js `earth_specular_2048.jpg` example texture (MIT) |

Source files are in `files/` (not in git).

### Swap a video

Keep the file name, or change the `name` union in `components/ui/BgVideo.tsx`. Encode and make the poster:

```bash
ffmpeg -i source.mp4 -an -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart public/video/hero_city.mp4
ffmpeg -i source.mp4 -frames:v 1 /tmp/poster.png && cwebp -q 72 /tmp/poster.png -o public/posters/hero_city.webp
```

Media files have a 7-day cache. After a swap, redeploy and purge the Vercel cache, or use a new file name.

## 3D scene

- `components/Experience.tsx` checks WebGL2, reduced motion and the viewport. It sets the `has-gl` class, then loads `components/scene/SceneCanvas.tsx` with a dynamic import. The 3D code is not in the initial bundle.
- Layers, back to front: stone tone (`[data-stone]`), stage video (`[data-stage]`, its poster is the LCP image), canvas, page content. With `has-gl`, section backgrounds are transparent so the layers show through.
- `scene/store.ts` (zustand) holds `targets`: plain values for object, camera, video and canvas. GSAP tweens them and `useFrame` damps toward them. Changes to `targets` do not re-render React.
- `components/SceneDirector.tsx` builds every ScrollTrigger: Lenis (fine pointers only), text reveals, tone changes, the hero fly-through.
- `scene/aShape.ts` turns the logo "A" path into world units and gives the portal opening (the A's counter).

### Tune the scene

All values are in `scene/keyframes.ts`:

| Key | Controls |
|---|---|
| `DAMP` | Smoothing time (s) of every damped value |
| `preload.*` | Minimum and maximum preloader time, glass fill duration, edge opacity at rest |
| `hero.pin` | Hero pin length in viewport heights |
| `hero.idle` | Start camera and arch pose, idle swing (±6°) and speed |
| `hero.flight` | Scroll range (0–1 of the pin) and end camera of the fly-through |
| `hero.headlineOut`, `hero.subIn` | Scroll ranges of the headline exit and the sub-line reveal |
| `hero.handoff` | Scroll range in which the portal hands over to the DOM video |
| `portal.planeZ` | Depth of the video plane seen through the opening |
| `stage.camera` | Camera for every section after the hero |
| `particles.*` | Particle count (desktop / mobile), point size, curl-noise strength |
| `story.video` | Stage video opacity, blur and scale in Who We Are |
| `story.enter`, `story.dock`, `story.pillarRange` | Arch re-entry pose; where and how big the strokes dock beside the pillars |
| `glance.*` | Pin length, numeral position, where each numeral morph starts and how long it takes |
| `capabilities.row`, `capabilities.trackStart` | Block row position, scale and gap; where the horizontal track pins |
| `menu.recede` | Block scale and opacity behind the full menu |
| `approach.*` | Pin length, caustics video opacity, the 5 path nodes, node size, camera offset and look-ahead |
| `reach.*` | Pin length, globe position and radius, stop tilt, Dubai hub, the 5 stops (from `content/site.ts`) |
| `leadership.range` | Where the canvas fades out |
| `contact.*` | Arch pose on the left half, camera pull-back, scroll range |
| `stone.from`, `stone.to` | Where a tone change starts and ends on the incoming section |

Screen positions marked `(vx, vy)` are fractions of the half-viewport: -1 is the left/bottom edge, 1 the right/top edge.

`scene/choreography.ts` turns these values into the scroll track, section by section. `scene/track.ts` keeps every scene value in one timeline in scroll-pixel time, so fast jumps in either direction always land on the right state.

Quality tiers (`store.quality`): 3 full, 2 no postprocessing, 1 no transmission, 0 fewer particles. `PerformanceMonitor` steps down when FPS drops. Touch and narrow screens start at 1.

## Fallbacks

| Case | Behaviour |
|---|---|
| Below 1024px or touch | Rim-lit standard material instead of glass transmission, no postprocessing, 3k particles, native scroll. Objects move above the text column (`keyframes.mobile`). Pins are shorter (`mobile.pinScale`, `mobile.heroPin`). Capability cards stack; approach steps stack so only the active one shows. |
| `prefers-reduced-motion` | No pins, flights or preloader. Each section shows a still of its object (`scene/still.ts`), swapped with short fades. Scene objects snap instead of damping. Decorative videos hold their poster frame. Text reveals are fades. |
| No WebGL | No canvas. Sections keep their own backgrounds, fallback videos and posters, and an SVG arch poster in the hero and contact. All DOM content and the form work. |
| No JS | Server-rendered page with all copy, lists unstacked, videos autoplaying with posters. |

The loader (`components/Preloader.tsx`) is server-rendered so it covers the page from the first paint. It tracks real progress: 3D chunk, environment map and portal video with WebGL; fonts and the hero poster without. It then wipes up into the hero (a plain fade under reduced motion). It is hidden by `<noscript>` when JS is off, and a CSS failsafe fades it out after 14 s if a script fails. Timing values are in `keyframes.preload`.

An inline script in `<head>` adds `has-gl` before first paint when WebGL2 is available, so opaque sections and fallback media never flash.

Test switches (any page URL): `?nogl` forces the no-WebGL path, `?reduced` forces reduced motion, `?debug` exposes the scene store as `window.__scene`.

## Performance and accessibility

- Initial JS: 247 KB gzip (budget 250 KB). The 3D scene (three, R3F, drei, postprocessing, about 300 KB gzip), the scroll choreography (`scene/scenery.ts`) and Lenis load with dynamic imports after hydration.
- The hero poster is preloaded and is the intended LCP element; the 3D scene loads after it. Fonts use `next/font` with metric-matched fallbacks.
- Pixel ratio caps at 1.75 (full), 1.5 (mobile / tier 1), 1 (tier 0). The canvas renders on demand while hidden (Leadership).
- Media: posters as WebP, H.264 videos with fast start, 512 px HDR (390 KB), 3 KB land mask.
- Landmarks, one `h1`, ordered headings, named links and controls, teal focus rings, a skip link. In-page links move keyboard focus to their target, also with Lenis.
- The mobile menu is a modal dialog: content behind it is inert, focus moves in, Escape closes it and returns focus. The auto-hiding header comes back when it receives focus.
- Stacked stages (glance, reach, mobile steps) hide items with opacity only, so screen readers read every item.
- The marquee moves only while the user scrolls (no autonomous motion, WCAG 2.2.2).
- Text contrast is at least 4.9:1 on both surfaces. Teal `#33b7c2` is used for text only on graphite; light sections use `--teal-700`.

Check with Lighthouse in a foreground tab: hidden tabs do not report LCP correctly.

## Redirects

`next.config.ts` sends 301s: `/about-us` → `/#story`, `/services` and `/business-plan-writing` → `/#capabilities`, `/team` → `/#leadership`, `/contact-us` → `/#contact`.

## Deploy

`make deploy` builds, commits on `main` and pushes. Vercel deploys from `main`.
