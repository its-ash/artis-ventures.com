'use client'

import { useId, useState, type FormEvent } from 'react'
import { contact } from '@/content/site'

const ENDPOINT = process.env.NEXT_PUBLIC_ENQUIRY_ENDPOINT ?? ''
const MAX = { short: 120, message: 4000 } as const
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/

const f = contact.form
type Field = 'name' | 'company' | 'email' | 'phone' | 'interest' | 'message' | 'consent'
type Errors = Partial<Record<Field, string>>
type Status = 'idle' | 'sending' | 'sent' | 'failed' | 'offline'

const validate = (d: FormData): Errors => {
  const s = (k: Field) => String(d.get(k) ?? '').trim()
  const e: Errors = {}
  for (const k of ['name', 'email', 'interest', 'message'] as const) if (!s(k)) e[k] = f.errors.required
  for (const k of ['name', 'company', 'email', 'phone'] as const) if (s(k).length > MAX.short) e[k] = f.errors.long
  if (s('message').length > MAX.message) e.message = f.errors.long
  if (s('email') && !EMAIL_RE.test(s('email'))) e.email = f.errors.email
  if (s('phone') && !PHONE_RE.test(s('phone'))) e.phone = f.errors.phone
  if (s('interest') && !(f.interests as readonly string[]).includes(s('interest'))) e.interest = f.errors.required
  if (!d.get('consent')) e.consent = f.errors.consent
  return e
}

const input =
  'mt-2 w-full rounded-xl border border-stone-50/15 bg-graphite-950 px-4 py-3 text-fg outline-none transition-colors placeholder:text-muted hover:border-stone-50/30 focus-visible:border-accent aria-invalid:border-[#ff8a80]'

export function ContactForm() {
  const uid = useId()
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const id = (k: Field) => `${uid}-${k}`

  const onBlur = (k: Field, form: HTMLFormElement | null) => {
    if (!form) return
    const e = validate(new FormData(form))
    setErrors((p) => ({ ...p, [k]: e[k] }))
  }

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const form = ev.currentTarget
    const data = new FormData(form)
    if (data.get('website')) return
    const e = validate(data)
    setErrors(e)
    const bad = Object.keys(e)[0] as Field | undefined
    if (bad) return form.querySelector<HTMLElement>(`#${CSS.escape(id(bad))}`)?.focus()
    if (!ENDPOINT) return setStatus('offline')

    setStatus('sending')
    try {
      const body = Object.fromEntries([...data].filter(([k]) => k !== 'website').map(([k, v]) => [k, String(v).trim()]))
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(String(res.status))
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('failed')
    }
  }

  const err = (k: Field) =>
    errors[k] ? (
      <p id={`${id(k)}-err`} className="label mt-2 text-[#ff8a80]">
        {errors[k]}
      </p>
    ) : null

  const a11y = (k: Field) => ({
    id: id(k),
    name: k,
    'aria-invalid': !!errors[k] || undefined,
    'aria-describedby': errors[k] ? `${id(k)}-err` : undefined,
  })

  const text = (k: 'name' | 'company' | 'email' | 'phone', type: string, auto: string, req = false) => (
    <div className="col-span-12 md:col-span-6">
      <label htmlFor={id(k)} className="label text-muted">
        {f.fields[k]}
        {req && <span aria-hidden="true"> *</span>}
      </label>
      <input
        {...a11y(k)}
        type={type}
        autoComplete={auto}
        maxLength={MAX.short}
        required={req}
        className={input}
        onBlur={(e) => onBlur(k, e.currentTarget.form)}
      />
      {err(k)}
    </div>
  )

  return (
    <form noValidate onSubmit={onSubmit} aria-labelledby={`${uid}-title`} className="grid-12 relative gap-y-8">
      <h3 id={`${uid}-title`} className="label col-span-12 text-accent">
        {f.title}
      </h3>
      {text('name', 'text', 'name', true)}
      {text('company', 'text', 'organization')}
      {text('email', 'email', 'email', true)}
      {text('phone', 'tel', 'tel')}

      <div className="col-span-12">
        <label htmlFor={id('interest')} className="label text-muted">
          {f.fields.interest}
          <span aria-hidden="true"> *</span>
        </label>
        <select
          {...a11y('interest')}
          required
          defaultValue=""
          className={`${input} appearance-none [&>option]:bg-graphite-950`}
          onBlur={(e) => onBlur('interest', e.currentTarget.form)}
        >
          <option value="" disabled>
            {f.choose}
          </option>
          {f.interests.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
        {err('interest')}
      </div>

      <div className="col-span-12">
        <label htmlFor={id('message')} className="label text-muted">
          {f.fields.message}
          <span aria-hidden="true"> *</span>
        </label>
        <textarea
          {...a11y('message')}
          required
          rows={5}
          maxLength={MAX.message}
          className={`${input} resize-y`}
          onBlur={(e) => onBlur('message', e.currentTarget.form)}
        />
        {err('message')}
      </div>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="col-span-12">
        <label className="flex cursor-pointer items-start gap-3 text-muted">
          <input
            {...a11y('consent')}
            type="checkbox"
            value="yes"
            required
            className="mt-1.5 size-4 shrink-0 accent-teal-500"
            onChange={(e) => onBlur('consent', e.currentTarget.form)}
          />
          <span>{f.fields.consent}</span>
        </label>
        {err('consent')}
      </div>

      <div className="col-span-12 flex flex-wrap items-center gap-6">
        <button type="submit" disabled={status === 'sending'} className="btn-outline label disabled:opacity-50">
          {status === 'sending' ? f.sending : f.submit}
        </button>
        <p role="status" aria-live="polite" className="label text-muted">
          {status === 'sent' ? f.sent : status === 'failed' ? f.failed : status === 'offline' ? f.offline : ''}
        </p>
      </div>
    </form>
  )
}
