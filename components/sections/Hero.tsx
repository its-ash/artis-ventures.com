import { ArchPoster } from '@/components/brand/ArchPoster'
import { SplitHeadline } from '@/components/ui/SplitHeadline'
import { brand, hero } from '@/content/site'

// Transparent: the fixed stage video (and the 3D arch, when available) sits behind it.
export function Hero() {
  return (
    <section
      id="hero"
      data-tone="dark"
      data-section="hero"
      aria-labelledby="hero-title"
      className="gridlines relative isolate flex min-h-dvh flex-col overflow-hidden text-fg"
    >
      <ArchPoster id="hero" className="absolute left-1/2 top-[38%] -z-10 w-[min(74vw,30rem)] -translate-x-1/2 -translate-y-1/2 md:top-[42%]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-graphite-950/65 via-graphite-950/20 to-graphite-950/92"
      />
      <div
        data-hero-content
        className="shell flex flex-1 flex-col justify-end pb-[calc(1.75rem+env(safe-area-inset-bottom))] pt-[calc(var(--header-h)+2.5rem+env(safe-area-inset-top))] md:pb-14 md:pt-[calc(var(--header-h)+3rem)]"
      >
        <p className="label mb-4 text-mist-400 md:mb-6" data-hero-label>
          {hero.label}
        </p>
        <SplitHeadline as="h1" id="hero-title" text={hero.headline} className="h-hero max-w-[12ch]" />
        <div className="grid-12 mt-7 gap-y-4 md:mt-14 md:gap-y-6" data-hero-sub>
          <p className="display h-md col-span-12 md:col-span-5">{hero.sub}</p>
          <p className="prose-w col-span-12 text-mist-400 md:col-span-6 md:col-start-7">{hero.pitch}</p>
        </div>
        <p className="label hair mt-7 border-t pt-4 text-mist-400 md:mt-14 md:pt-5">{brand.presence}</p>
      </div>
    </section>
  )
}
