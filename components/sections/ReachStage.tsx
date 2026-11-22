'use client'

import { create } from 'zustand'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  FileCheck2,
  Globe2,
  MapPin,
  SearchCheck,
  ShieldCheck,
} from 'lucide-react'
import { offices, reach } from '@/content/site'
import { faceRotation } from '@/scene/geo'
import { keyframes as K } from '@/scene/keyframes'
import { targets } from '@/scene/store'

type ReachStore = {
  index: number
  progress: number
}

export const useReachStore = create<ReachStore>()(() => ({
  index: 0,
  progress: 0,
}))

export const reachJump: { to?: (i: number) => void } = {}

const pad = (n: number) => String(n).padStart(2, '0')

const formatCoord = (lat: number, lon: number) => {
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(2)}° ${ns} · ${Math.abs(lon).toFixed(2)}° ${ew}`
}

const PILLAR_META = [
  {
    category: 'Applications',
    icon: FileCheck2,
  },
  {
    category: 'Risk & Readiness',
    icon: SearchCheck,
  },
  {
    category: 'Governance',
    icon: ShieldCheck,
  },
] as const

const stageOffices = offices.items.filter((o) => o.id === 'dubai' || o.id === 'hong-kong')

type HubStop = {
  id: string
  tab: string
  kind: 'Regulatory Reach' | 'Operating Hub'
  title: string
  subtitle: string
  licence?: string
  note: string
  lat: number
  lon: number
}

const HUB_NOTES: Record<string, string> = {
  CMA: 'Federal UAE capital markets licensing, regulatory liaison, and institutional approval management.',
  FCA: 'United Kingdom financial-services authorization structuring, readiness review, and market access.',
  FSC: 'Mauritius cross-border investment dealer and multi-asset brokerage licensing pathways.',
  dubai: 'Active GCC client advisory, licensing coordination, and corporate structuring desk.',
  'hong-kong': 'Asia-Pacific cross-border institutional advisory and regional market expansion hub.',
}

const STOPS: HubStop[] = [
  ...reach.regulators.map((r) => ({
    id: r.code,
    tab: r.code,
    kind: 'Regulatory Reach' as const,
    title: r.code,
    subtitle: r.country,
    note: HUB_NOTES[r.code]!,
    lat: r.lat,
    lon: r.lon,
  })),
  ...stageOffices.map((o) => ({
    id: o.id,
    tab: o.id === 'dubai' ? 'Dubai' : 'Hong Kong',
    kind: 'Operating Hub' as const,
    title: o.label,
    subtitle: o.entity ?? o.label,
    licence: o.licence,
    note: HUB_NOTES[o.id]!,
    lat: o.lat,
    lon: o.lon,
  })),
]

const OFFICE_ROLE: Record<string, string> = {
  registered: 'Headquarters',
  dubai: 'Operating Branch',
  'hong-kong': 'Asia Advisory',
  london: 'UK Market Access',
}

export function ReachStage() {
  const index = useReachStore((s) => s.index)
  const n = STOPS.length
  const safeIndex = Math.min(n - 1, Math.max(0, index))
  const activeStop = STOPS[safeIndex]!

  const selectStop = (i: number) => {
    const next = Math.min(n - 1, Math.max(0, i))
    if (reachJump.to) {
      reachJump.to(next)
    } else {
      useReachStore.setState({ index: next, progress: next / (n - 1) })
      const s = K.reach.stops[next]
      if (s) {
        const rot = faceRotation(s.lat, s.lon, K.reach.tilt)
        const t = targets()
        t.particles.rx = rot.rx
        t.particles.ry = rot.ry
        t.globe.stop = next
        t.globe.pins = Math.max(t.globe.pins, next + 1)
      }
    }
  }

  return (
    <>
      {/* 3-Column Tonal Regulatory Architecture Matrix (replaces flat border-t list) */}
      <ol className="mt-16 grid grid-cols-1 gap-5 md:mt-24 lg:grid-cols-3">
        {reach.items.map((item, idx) => {
          const meta = PILLAR_META[idx]!
          const Icon = meta.icon
          return (
            <li
              key={item.n}
              data-reach-item
              className="surface-card group flex flex-col justify-between rounded-2xl p-6 transition-colors duration-200 hover:border-teal-500/35 sm:p-8"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <span className="badge-tonal inline-flex h-10 w-10 items-center justify-center rounded-xl text-teal-300">
                    <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="badge-tonal rounded-full px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-teal-300">
                      {meta.category}
                    </span>
                    <span className="font-mono text-xs tracking-[0.12em] text-muted">{item.n}</span>
                  </div>
                </div>

                <h3 className="display mt-7 text-[clamp(1.45rem,2.1vw,1.85rem)] leading-[1.12] tracking-[-0.025em] text-fg">
                  {item.title}
                </h3>

                <p className="mt-4 text-[15px] leading-[1.68] text-[#b8c0c9]">{item.body}</p>
              </div>

              <ul className="mt-7 space-y-2.5 border-t border-white/10 pt-5">
                {item.tags.map((tag) => (
                  <li key={tag} className="flex items-center gap-2.5 text-[13.5px] text-[#dde2e7]">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-300">
                      <Check className="h-3 w-3" strokeWidth={2.25} aria-hidden="true" />
                    </span>
                    <span>{tag}</span>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ol>

      {/* Interactive Split Globe Console: Left 5 cols tonal hub desk, Right 7 cols unobstructed 3D DotGlobe */}
      <div
        data-reach-stage
        className="grid-12 mt-20 items-center gap-y-10 py-6 md:mt-28 lg:min-h-svh lg:py-0"
      >
        <div className="col-span-12 flex flex-col gap-5 lg:col-span-5" data-stops>
          {/* Filled rounded pill switcher synced 1:1 with the 3D globe stops */}
          <div
            role="tablist"
            aria-label="Global regulatory and operating hubs"
            className="surface-track no-scrollbar inline-flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-2xl p-1.5"
          >
            {STOPS.map((st, i) => {
              const active = i === safeIndex
              return (
                <button
                  key={st.id}
                  type="button"
                  role="tab"
                  id={`reach-tab-${st.id}`}
                  aria-selected={active}
                  aria-controls={`reach-panel-${st.id}`}
                  onClick={() => selectStop(i)}
                  className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-medium transition-all duration-200 active:scale-[0.98] ${
                    active
                      ? 'surface-tab-active text-fg'
                      : 'text-muted hover:bg-white/[0.04] hover:text-fg'
                  }`}
                >
                  <span className={`font-mono text-[10.5px] tabular-nums ${active ? 'text-teal-300' : 'text-muted'}`}>
                    {pad(i + 1)}
                  </span>
                  <span className="whitespace-nowrap">{st.tab}</span>
                </button>
              )
            })}
          </div>

          {/* Active Hub Console Card */}
          <div
            key={activeStop.id}
            id={`reach-panel-${activeStop.id}`}
            role="tabpanel"
            aria-labelledby={`reach-tab-${activeStop.id}`}
            className="surface-card stage-enter rounded-2xl p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="badge-tonal inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-teal-300">
                {activeStop.kind === 'Regulatory Reach' ? (
                  <Globe2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                ) : (
                  <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                )}
                {activeStop.kind}
              </span>
              <span className="font-mono text-[11px] tabular-nums tracking-[0.08em] text-muted">
                {formatCoord(activeStop.lat, activeStop.lon)}
              </span>
            </div>

            <p className="display mt-6 text-[clamp(2.8rem,5.8vw,4.75rem)] leading-[0.96] tracking-[-0.04em] text-fg">
              {activeStop.title}
            </p>

            <p className="mt-3 text-[16px] font-medium text-teal-300">{activeStop.subtitle}</p>

            {activeStop.licence && (
              <p className="mt-2 font-mono text-[11.5px] tabular-nums tracking-[0.08em] text-muted">
                {activeStop.licence}
              </p>
            )}

            <p className="mt-5 text-[15px] leading-[1.66] text-[#c2c9d1]">{activeStop.note}</p>

            <div className="mt-7 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
              <span className="label tabular-nums text-muted">
                {activeStop.kind === 'Regulatory Reach' ? reach.caption : offices.label}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectStop(safeIndex - 1)}
                  disabled={safeIndex === 0}
                  aria-label="Previous jurisdiction"
                  className="surface-btn inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-fg transition-all duration-200 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => selectStop(safeIndex + 1)}
                  disabled={safeIndex === n - 1}
                  aria-label="Next jurisdiction"
                  className="surface-btn inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-fg transition-all duration-200 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Offices Directory */}
      <div className="mt-20 md:mt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label text-teal-300">{offices.label}</p>
            <h3 className="display mt-2 text-[clamp(1.65rem,2.8vw,2.45rem)] leading-[1.08] tracking-[-0.03em] text-fg">
              Global operating presence
            </h3>
          </div>
          <p className="label text-muted">Dubai, Hong Kong &amp; London</p>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {offices.items.map((o) => (
            <li
              key={o.id}
              data-office={o.id}
              className="surface-card flex flex-col justify-between rounded-2xl p-6 transition-colors duration-200 hover:border-teal-500/35"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="badge-tonal rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-teal-300">
                    {OFFICE_ROLE[o.id] ?? 'Office'}
                  </span>
                  <MapPin className="h-3.5 w-3.5 text-muted" strokeWidth={1.75} aria-hidden="true" />
                </div>

                <h4 className="display mt-5 text-[1.25rem] leading-tight tracking-[-0.02em] text-fg">
                  {o.label}
                </h4>

                {'entity' in o && (
                  <p className="mt-2 text-[14px] font-medium text-[#dde2e7]">{o.entity}</p>
                )}

                {'licence' in o && (
                  <p className="mt-2 font-mono text-[11px] tabular-nums tracking-[0.06em] text-teal-300/90">
                    {o.licence}
                  </p>
                )}

                <address className="mt-4 text-[14px] leading-[1.6] not-italic text-[#a6aeb7]">
                  {o.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </div>

              <p className="mt-6 border-t border-white/10 pt-3.5 font-mono text-[10.5px] tabular-nums tracking-[0.08em] text-muted">
                {formatCoord(o.lat, o.lon)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
