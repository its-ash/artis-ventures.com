'use client'

import { create } from 'zustand'
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Layers,
  Rocket,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { approach } from '@/content/site'
import { targets } from '@/scene/store'

type ApproachStore = {
  index: number
  progress: number
}

export const useApproachStore = create<ApproachStore>()(() => ({
  index: 0,
  progress: 0,
}))

export const approachJump: { to?: (i: number) => void } = {}

const pad = (n: number) => String(n).padStart(2, '0')

const STAGE_META = [
  {
    short: 'Discover',
    phase: 'Diagnostic',
    deliverable: 'Market & Feasibility Diagnostic',
    outcome: 'Validated Thesis & KPI Baseline',
    icon: Compass,
  },
  {
    short: 'Design',
    phase: 'Architecture',
    deliverable: 'Jurisdiction & Operating Blueprint',
    outcome: 'Board-Ready Execution Roadmap',
    icon: Layers,
  },
  {
    short: 'Enable',
    phase: 'Implementation',
    deliverable: 'Entity, Banking & Core Integrations',
    outcome: 'Live, Investment-Ready Infrastructure',
    icon: Rocket,
  },
  {
    short: 'Govern',
    phase: 'Assurance',
    deliverable: 'Compliance Controls & Due Diligence',
    outcome: 'Audit-Ready Governance Posture',
    icon: ShieldCheck,
  },
  {
    short: 'Scale',
    phase: 'Expansion',
    deliverable: 'Cross-Border Growth Playbook',
    outcome: 'Sustained Institutional Scale',
    icon: TrendingUp,
  },
] as const

export function ApproachStage() {
  const index = useApproachStore((s) => s.index)
  const progress = useApproachStore((s) => s.progress)
  const steps = approach.steps
  const n = steps.length
  const safeIndex = Math.min(n - 1, Math.max(0, index))
  const step = steps[safeIndex]!
  const meta = STAGE_META[safeIndex]!
  const Icon = meta.icon

  const select = (i: number) => {
    const next = Math.min(n - 1, Math.max(0, i))
    if (approachJump.to) {
      approachJump.to(next)
    } else {
      const p = next / (n - 1)
      useApproachStore.setState({ index: next, progress: p })
      targets().path.draw = p
    }
  }

  const barScale = Math.max(0.08, Math.min(1, progress > 0 ? progress : (safeIndex + 1) / n))

  return (
    <div data-stepper className="relative flex flex-col justify-center py-4 lg:min-h-[78svh] lg:py-8">
      {/* Filled segmented stage rail inside a muted tonal track */}
      <div className="mb-6 flex items-center lg:mb-8">
        <div
          role="tablist"
          aria-label="Consulting engagement stages"
          className="surface-track no-scrollbar inline-flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-2xl p-1.5"
        >
          {steps.map((s, i) => {
            const m = STAGE_META[i]!
            const active = i === safeIndex
            return (
              <button
                key={s.title}
                type="button"
                role="tab"
                id={`approach-tab-${i}`}
                aria-selected={active}
                aria-controls={`approach-panel-${i}`}
                onClick={() => select(i)}
                className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-left transition-all duration-200 active:scale-[0.98] sm:px-4 ${
                  active
                    ? 'surface-tab-active text-fg'
                    : 'text-muted hover:bg-white/[0.04] hover:text-fg'
                }`}
              >
                <span className={`font-mono text-[11px] tabular-nums tracking-[0.1em] ${active ? 'text-teal-300' : 'text-muted'}`}>
                  {pad(i + 1)}
                </span>
                <span className="text-[13px] font-medium tracking-[-0.01em] whitespace-nowrap">{m.short}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Asymmetric split: Left 7 cols tonal stage console, Right 5 cols open gallery for the 3D orb */}
      <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
        <div
          key={safeIndex}
          id={`approach-panel-${safeIndex}`}
          role="tabpanel"
          aria-labelledby={`approach-tab-${safeIndex}`}
          className="surface-card stage-enter col-span-1 rounded-2xl p-6 sm:p-8 lg:col-span-7 lg:p-10"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="badge-tonal inline-flex h-10 w-10 items-center justify-center rounded-xl text-teal-300">
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="badge-tonal inline-flex items-center rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-teal-300">
                {meta.phase}
              </span>
            </div>
            <span className="font-mono text-sm tabular-nums tracking-[0.14em] text-muted">
              {pad(safeIndex + 1)} / {pad(n)}
            </span>
          </div>

          <h3 className="display mt-7 text-[clamp(1.85rem,3.4vw,3.15rem)] leading-[1.04] tracking-[-0.035em] text-fg">
            {step.title}
          </h3>

          <p className="mt-5 max-w-[54ch] text-[16px] leading-[1.68] text-[#c2c9d1] sm:text-[17px]">
            {step.body}
          </p>

          {/* Structured institutional outputs separated by hairline (no nested cards) */}
          <dl className="mt-8 grid grid-cols-1 gap-6 border-t border-white/10 pt-6 sm:grid-cols-2">
            <div>
              <dt className="label text-muted">Key Deliverable</dt>
              <dd className="mt-2 text-[15px] font-medium leading-snug text-fg">{meta.deliverable}</dd>
            </div>
            <div>
              <dt className="label text-muted">Stage Outcome</dt>
              <dd className="mt-2 text-[15px] font-medium leading-snug text-teal-300">{meta.outcome}</dd>
            </div>
          </dl>

          {/* Progress track + accessible prev/next stage controls */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
            <div className="flex min-w-[10rem] flex-1 items-center gap-3">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full origin-left rounded-full bg-teal-400 transition-transform duration-300 ease-out"
                  style={{ transform: `scaleX(${barScale})` }}
                />
              </div>
              <span className="font-mono text-[11px] tabular-nums text-muted">
                {Math.round(((safeIndex + 1) / n) * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => select(safeIndex - 1)}
                disabled={safeIndex === 0}
                aria-label="Previous stage"
                className="surface-btn inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-fg transition-all duration-200 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => select(safeIndex + 1)}
                disabled={safeIndex === n - 1}
                aria-label="Next stage"
                className="surface-btn inline-flex h-11 items-center gap-2 rounded-xl px-4 text-[13px] font-medium text-fg transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <span>{safeIndex < n - 1 ? STAGE_META[safeIndex + 1]!.short : 'Complete'}</span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated open gallery column on desktop so the 3D particle orb sits cleanly beside the console */}
        <div className="hidden lg:col-span-5 lg:flex lg:min-h-[28rem] lg:flex-col lg:items-end lg:justify-end">
          <div className="surface-pill rounded-full px-4 py-2 font-mono text-[11px] tabular-nums uppercase tracking-[0.12em] text-muted">
            Stage {pad(safeIndex + 1)} · {meta.short}
          </div>
        </div>
      </div>

      {/* Compact 5-step visual index strip below on desktop for instant scannability */}
      <ol className="mt-6 hidden grid-cols-5 gap-3 lg:grid">
        {steps.map((s, i) => {
          const active = i === safeIndex
          const done = i < safeIndex
          return (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => select(i)}
                className={`group flex w-full cursor-pointer flex-col gap-1.5 rounded-xl px-4 py-3 text-left transition-all duration-200 active:scale-[0.98] ${
                  active
                    ? 'surface-elevated text-fg'
                    : 'surface-subtle text-muted hover:text-fg'
                }`}
              >
                <span className={`font-mono text-[10.5px] tabular-nums tracking-[0.12em] ${active || done ? 'text-teal-300' : 'text-muted'}`}>
                  {pad(i + 1)}/{pad(n)}
                </span>
                <span className="truncate text-[13px] font-medium tracking-[-0.01em]">{s.title}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
