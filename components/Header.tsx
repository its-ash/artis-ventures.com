'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/brand/Logo'
import { useActiveSection } from '@/components/useActiveSection'
import { nav, sections, ui } from '@/content/site'
import { asset } from '@/lib/base'

const HIDE_AFTER = 120
const pad = (n: number) => String(n).padStart(2, '0')

export function Header() {
  const home = usePathname() === '/'
  const { index, tone } = useActiveSection()
  const [hidden, setHidden] = useState(false)
  const [top, setTop] = useState(true)
  const [open, setOpen] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const href = (h: string) => (home ? h : asset(`/${h}`))

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setHidden(y > HIDE_AFTER && y > last)
      setTop(y < 8)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Mobile menu is modal: page behind it is inert, focus moves in and returns to the toggle.
  useEffect(() => {
    if (!open) return
    const behind = [...document.querySelectorAll<HTMLElement>('main, footer, .skip')]
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      btn.current?.focus()
    }
    behind.forEach((el) => (el.inert = true))
    document.documentElement.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLElement>('a')?.focus()
    window.addEventListener('keydown', onKey)
    return () => {
      behind.forEach((el) => (el.inert = false))
      document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = sections[index]!
  const t = open ? 'dark' : tone

  return (
    <>
      <header
        data-header
        data-tone={t}
        className={`fixed inset-x-0 top-0 z-50 text-fg transition-[transform,background-color] duration-500 ease-(--ease-out) ${top || open ? 'bg-transparent' : 'bg-[color-mix(in_srgb,var(--bg)_90%,transparent)]'}`}
        style={{ transform: hidden && !open ? 'translateY(-100%)' : 'none' }}
        onFocusCapture={() => setHidden(false)}
      >
        <div className="shell flex h-(--header-h) items-center justify-between gap-6">
          <a href={home ? '#hero' : asset('/')} className="block w-28 shrink-0 text-accent md:w-32">
            <Logo className="h-auto w-full" />
          </a>
          <nav aria-label={ui.primaryNav} className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={href(n.href)} className="label py-2 transition-colors hover:text-accent">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            <a href={href('#contact')} className="btn-outline label hidden sm:inline-flex">
              {ui.cta}
            </a>
            <button
              ref={btn}
              type="button"
              className="label inline-flex min-h-11 items-center px-2 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? ui.close : ui.menu}
            </button>
          </div>
        </div>
      </header>

      {home && (
        <p
          aria-hidden="true"
          data-tone={tone}
          className="label pointer-events-none fixed right-(--pad) top-[calc(var(--header-h)+0.5rem)] z-40 hidden text-muted lg:block"
        >
          [{pad(index)}] {current.label}
        </p>
      )}

      <div
        ref={panel}
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label={ui.primaryNav}
        data-tone="dark"
        hidden={!open}
        className="tone fixed inset-0 z-40 overflow-y-auto pt-(--header-h) lg:hidden"
      >
        <nav aria-label={ui.primaryNav} className="shell flex min-h-full flex-col justify-between gap-12 py-10">
          <ul className="flex flex-col gap-2">
            {nav.map((n, i) => (
              <li key={n.href} className="hair border-b">
                <a
                  href={href(n.href)}
                  onClick={() => setOpen(false)}
                  className="display h-md flex items-baseline gap-4 py-4"
                >
                  <span className="label text-accent">{pad(i + 1)}</span>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <a href={href('#contact')} onClick={() => setOpen(false)} className="btn-outline label self-start">
            {ui.cta}
          </a>
        </nav>
      </div>
    </>
  )
}
