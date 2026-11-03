import { Logo } from '@/components/brand/Logo'
import { FooterWordmark } from '@/components/footer/FooterWordmark'
import Link from 'next/link'
import { footer, nav, offices, ui } from '@/content/site'
import { asset } from '@/lib/base'

const summary = offices.items.filter((o) => o.id !== 'london')

export function Footer() {
  return (
    <footer data-tone="dark" className="tone gridlines relative overflow-hidden">
      <div className="shell pb-10 pt-24">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 md:col-span-4">
            <Link href="/" className="block w-40 text-accent">
              <Logo className="h-auto w-full" />
            </Link>
            <p className="prose-w mt-8 text-sm text-muted">{footer.legal}</p>
          </div>
          <nav aria-label={ui.footerNav} className="col-span-6 md:col-span-2 md:col-start-6">
            <ul className="space-y-3">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={asset(`/${n.href}`)} className="label hover:text-accent">
                    {n.label}
                  </a>
                </li>
              ))}
              <li>
                <a href={asset(footer.opportunities.href)} className="label hover:text-accent">
                  {footer.opportunities.label}
                </a>
              </li>
            </ul>
          </nav>
          <ul className="col-span-12 grid grid-cols-1 gap-8 sm:grid-cols-3 md:col-span-5 md:col-start-8">
            {summary.map((o) => (
              <li key={o.id}>
                <p className="label text-accent">{o.label}</p>
                <address className="mt-3 text-sm not-italic text-muted">
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
        <div className="hair mt-20 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <p className="label text-muted">{footer.copyright}</p>
          <a href={asset(footer.privacy.href)} className="label link-u text-muted">
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
