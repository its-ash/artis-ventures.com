type Props = { items: readonly string[]; repeat?: number }

// Text is in the DOM once for screen readers; visual copies are aria-hidden.
export function Marquee({ items, repeat = 3 }: Props) {
  const line = items.join(' · ')
  return (
    <div data-marquee className="hair overflow-hidden border-y py-6 md:py-8">
      <p className="sr-only">{line}</p>
      <div data-marquee-track className="flex w-max whitespace-nowrap" aria-hidden="true">
        {Array.from({ length: repeat * 2 }, (_, i) => (
          <span key={i} className="display flex items-center text-[clamp(2rem,5vw,4.75rem)] leading-none">
            {items.map((x) => (
              <span key={x} className="flex items-center">
                <span className="px-[0.4em]">{x}</span>
                <span className="text-teal-700">·</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
}
