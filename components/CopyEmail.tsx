'use client'

import { useState } from 'react'
import { ui } from '@/content/site'

export function CopyEmail({ email }: { email: string }) {
  const [done, setDone] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setDone(true)
      setTimeout(() => setDone(false), 2000)
    } catch {
      window.location.href = `mailto:${email}`
    }
  }

  return (
    <button type="button" onClick={copy} className="group text-left" aria-label={`${email}. ${ui.copy}`}>
      <span className="display h-md link-u break-all">{email}</span>
      <span className="label mt-2 block text-muted" aria-live="polite">
        {done ? ui.copied : ui.copy}
      </span>
    </button>
  )
}
