# Artis Ventures — project instructions

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4. Host: Vercel.
- 3D: React Three Fiber, drei, postprocessing. Motion: GSAP 3 (ScrollTrigger, SplitText, `@gsap/react`), Lenis on desktop only.
- Shared scene state: zustand.

## Rules
- All copy lives in `content/site.ts`. Do not put text in components.
- Copy comes word for word from the company profile (`files/company_profile_2026.pdf`, not in git). Do not invent clients, figures or awards.
- Never imply that Artis holds a CMA, FCA or FSC licence. Use "Regulatory frameworks we navigate".
- Colour tokens are CSS variables in `app/globals.css`. No gold. Teal text on light surfaces uses `--teal-700` for contrast.
- No custom cursor, no cursor-follow or magnetic effects.
- Animate only transform, opacity, clip-path; filter only on video.
- Content must render and read without JS. Set hidden states with `gsap.set`, not CSS.
- Scene keyframes live in `scene/keyframes.ts`.

## Commands
- `make run` — dev server
- `make build` — production build
- `make deploy` — build, commit on `main`, push (Vercel deploys from `main`)
