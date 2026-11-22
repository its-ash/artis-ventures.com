import { Logo } from '@/components/brand/Logo'
import { FooterWordmark } from '@/components/footer/FooterWordmark'
import Link from 'next/link'
import { footer, nav, offices, ui } from '@/content/site'
import { asset } from '@/lib/base'

const summary = offices.items.filter((o) => o.id !== 'london')

export function Footer() {
  return (
    <footer data-tone="dark" className="tone gridlines relative overflow-hidden">
      <div className="shell pb-8 pt-16 md:pb-10 md:pt-24">
        <div className="grid-12 gap-y-10 md:gap-y-12">
          <div className="col-span-12 md:col-span-4">
            <Link href="/" className="inline-flex min-h-11 w-40 items-center text-accent">
              <Logo className="h-auto w-full" />
            </Link>
            <p className="prose-w mt-5 text-sm text-muted md:mt-8">{footer.legal}</p>
          </div>
          <nav aria-label={ui.footerNav} className="col-span-12 md:col-span-2 md:col-start-6">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 md:grid-cols-1 md:gap-y-0">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={asset(`/${n.href}`)} className="label inline-flex min-h-11 min-w-11 items-center hover:text-accent">
                    {n.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={asset(footer.opportunities.href)} className="label inline-flex min-h-11 items-center hover:text-accent">
                  {footer.opportunities.label}
                </a>
              </li>
            </ul>
          </nav>
          <ul className="col-span-12 grid grid-cols-1 gap-7 sm:grid-cols-3 md:col-span-5 md:col-start-8 md:gap-8">
            {summary.map((o) => (
              <li key={o.id}>
                <p className="label text-accent">{o.label}</p>
                <address className="mt-2.5 text-sm not-italic text-muted md:mt-3">
                  {o.lines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </address>
              </li>
            ))}
          </ul>
        </div>
        <div className="hair mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-4 pb-[env(safe-area-inset-bottom)] md:mt-20 md:pt-6">
          <p className="label text-muted">{footer.copyright}</p>
          <a href={asset(footer.privacy.href)} className="label link-u inline-flex min-h-11 items-center text-muted">
            {footer.privacy.label}
          </a>
        </div>
      </div>
      {/* With WebGL the word is a 3D field of columns (FooterWordmark). Without it, each letter is a teal
          outline under a graphite fill that rises and fills with the scroll. Without JS the filled word shows as is. */}
      <FooterWordmark word={footer.word}>
      <p
        aria-hidden="true"
        data-footer-word
        className="display pointer-events-none relative select-none px-(--pad) text-center text-[26vw] leading-[0.78]"
      >
        {[...footer.word].map((ch, i) => (
          <span key={i} data-footer-char className="text-outline pointer-events-auto relative inline-block">
            {ch}
            <span data-footer-fill className="absolute inset-0 text-graphite-800">
              {ch}
            </span>
          </span>
        ))}
        <span data-footer-glint className="text-outline-glint absolute inset-0 px-(--pad)" style={{ clipPath: 'inset(0% 100% 0% 0%)' }}>
          {footer.word}
        </span>
      </p>
      </FooterWordmark>
    </footer>
  )
}
