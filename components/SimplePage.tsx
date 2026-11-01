import Link from 'next/link'

type Props = { title: string; body: string; back: string }

export function SimplePage({ title, body, back }: Props) {
  return (
    <section data-tone="dark" className="tone gridlines min-h-[80svh] pb-28 pt-[calc(var(--header-h)+6rem)]">
      <div className="shell">
        <h1 className="display h-xl">{title}</h1>
        <p className="prose-w mt-10 text-muted">{body}</p>
        <Link href="/" className="label link-u mt-12 inline-block">
          {back}
        </Link>
      </div>
    </section>
  )
}
