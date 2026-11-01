// Old site URLs and their new home. Served as 301s on Vercel (next.config.ts) and as
// static redirect pages in the GitHub Pages export (app/[legacy]/page.tsx).
export const legacy = {
  'about-us': '/#story',
  services: '/#capabilities',
  'business-plan-writing': '/#capabilities',
  team: '/#leadership',
  'contact-us': '/#contact',
} as const

export type LegacySlug = keyof typeof legacy
