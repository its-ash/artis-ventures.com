// GitHub Pages project path (set in next.config.ts). Next adds it to <Link> and its own assets only.
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export const asset = (p: string) => `${BASE}${p}`
