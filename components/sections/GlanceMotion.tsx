'use client'

import { useEffect, useRef, useState } from 'react'
import { create } from 'zustand'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Label } from '@/components/ui/Label'
import { SplitHeadline } from '@/components/ui/SplitHeadline'
import { meta } from '@/components/ui/sectionMeta'
import { glance } from '@/content/site'

gsap.registerPlugin(ScrollTrigger)

type GlanceStore = {
  index: number
  progress: number
}

export const useGlanceStore = create<GlanceStore>()(() => ({
  index: 0,
  progress: 0,
}))

export const glanceJump: { to?: (i: number) => void } = {}

const pad = (n: number) => String(n).padStart(2, '0')

const STAT_META = [
  {
    tab: '100+',
    eyebrow: 'Leadership Depth',
    detail: 'Founder-led execution forged across decades of institutional market cycles.',
    meta: '25+ yrs Global Markets · 30 yrs Fintech · 30 yrs Advisory',
  },
  {
    tab: '40+',
    eyebrow: 'Regulatory Mastery',
    detail: 'Structured applications, regulatory liaison, and end-to-end approval management.',
    meta: 'CMA · FCA · FSC · VARA · DFSA',
  },
  {
    tab: '15+',
    eyebrow: 'Global Footprint',
    detail: 'Active structuring, banking, liquidity, and market expansion across global hubs.',
    meta: 'GCC & MENA · United Kingdom · Europe · Asia-Pacific',
  },
  {
    tab: '3',
    eyebrow: 'Core Jurisdictions',
    detail: 'Direct licensing pathways anchoring institutional brokerages across three key hubs.',
    meta: 'UAE (CMA) · United Kingdom (FCA) · Mauritius (FSC)',
  },
] as const

const LIFECYCLE = [
  {
    n: '01',
    short: 'Validation',
    title: 'Idea Validation',
    desc: 'Pressure-testing business models, market fit, capital requirements, and financial feasibility before committing resources.',
  },
  {
    n: '02',
    short: 'Market Entry',
    title: 'Market Entry & Structuring',
    desc: 'Selecting the optimal jurisdiction, entity architecture, and regulatory sequence for a clean market launch.',
  },
  {
    n: '03',
    short: 'Operations',
    title: 'Operational Readiness',
    desc: 'Establishing banking rails, digital payment gateways, liquidity providers, and institutional workflows.',
  },
  {
    n: '04',
    short: 'M&A',
    title: 'Mergers & Acquisitions',
    desc: 'Buy-side target sourcing, sell-side exit planning, valuation, and end-to-end deal negotiation.',
  },
  {
    n: '05',
    short: 'Licensing',
    title: 'Regulatory Licensing',
    desc: 'Navigating CMA, FCA, FSC, and virtual-asset licensing applications with disciplined compliance oversight.',
  },
  {
    n: '06',
    short: 'Scale',
    title: 'Global Expansion',
    desc: 'Scaling live operations across borders with ongoing governance and long-term advisory partnership.',
  },
] as const

const EXPERTISE_META = [
  {
    tag: 'Corporate & Deal Advisory',
    desc: 'Valuation, buy-side and sell-side mandates, and executive boardroom strategy.',
  },
  {
    tag: 'Multi-Asset Infrastructure',
    desc: 'Turnkey brokerage architecture, liquidity routing, and market-access advisory.',
  },
  {
    tag: 'Venture-to-Enterprise Scale',
    desc: 'De-risked operating models turning high-conviction ventures into resilient businesses.',
  },
  {
    tag: 'Cross-Border Expansion',
    desc: 'Disciplined entry into UAE, UK, Mauritius, and Asian financial corridors.',
  },
] as const

const CREDENTIALS = [
  { k: 'Established', v: '2023' },
  { k: 'Licence No.', v: '2307889.01' },
  { k: 'Jurisdiction', v: 'Meydan Free Zone, Dubai' },
] as const

// Gallery-grade fine-line architectural motion artwork blended directly onto the warm stone surface
function StatArtwork({ active }: { active: number }) {
  return (
    <div className="relative h-56 w-full sm:h-72 lg:h-[360px]" aria-hidden="true">
      {/* 01 · 100+ Years: Swiss precision concentric chronometer arcs */}
      <svg
        viewBox="0 0 440 340"
        className={`absolute inset-0 h-full w-full transition-all duration-700 ease-(--ease-out) ${
          active === 0 ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <g transform="translate(220 170)">
          <circle r="134" fill="none" stroke="#14171b" strokeOpacity="0.12" strokeDasharray="3 7" className="glance-spin-slow" />
          <circle r="106" fill="none" stroke="#1d6f76" strokeOpacity="0.45" strokeWidth="1.75" strokeDasharray="185 85 110 75" className="glance-spin" />
          <circle r="76" fill="none" stroke="#14171b" strokeOpacity="0.32" strokeWidth="1.5" strokeDasharray="130 60 88 60" className="glance-spin-rev" />
          <circle r="44" fill="#1d6f76" fillOpacity="0.08" stroke="#1d6f76" strokeWidth="1.4" />
          <circle r="44" fill="none" stroke="#1d6f76" strokeOpacity="0.45" strokeWidth="1.1" className="glance-ping" />
          <g className="glance-spin-slow">
            <circle cx="106" cy="0" r="5" fill="#1d6f76" />
            <circle cx="-53" cy="91.8" r="5" fill="#14171b" />
            <circle cx="-53" cy="-91.8" r="4.5" fill="#33b7c2" />
          </g>
          <text y="-2" textAnchor="middle" fill="#14171b" fontSize="22" fontWeight="500" fontFamily="var(--font-display)">
            100+
          </text>
          <text y="16" textAnchor="middle" fill="#1d6f76" fontSize="9" letterSpacing="1.8" fontFamily="var(--font-mono)">
            YEARS
          </text>
        </g>
      </svg>

      {/* 02 · 40+ Licences: Clean hexagonal compliance seal & regulator nodes */}
      <svg
        viewBox="0 0 440 340"
        className={`absolute inset-0 h-full w-full transition-all duration-700 ease-(--ease-out) ${
          active === 1 ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <g transform="translate(220 170)">
          <circle r="118" fill="none" stroke="#14171b" strokeOpacity="0.1" strokeDasharray="3 6" />
          {(
            [
              [118, 0, 'CMA'],
              [59, 98, 'FCA'],
              [-59, 98, 'FSC'],
              [-118, 0, 'VARA'],
              [-59, -98, 'DFSA'],
              [59, -98, 'EMI'],
            ] as const
          ).map(([x, y, label], idx) => (
            <g key={label}>
              <line x1="0" y1="0" x2={x} y2={y} stroke="#14171b" strokeOpacity="0.16" strokeWidth="1.1" />
              <line
                x1="0"
                y1="0"
                x2={x}
                y2={y}
                stroke="#1d6f76"
                strokeWidth="2"
                strokeDasharray="18 110"
                className="glance-flow"
                style={{ animationDelay: `${idx * -0.45}s` }}
              />
              <circle cx={x} cy={y} r="21" fill="#f6f4ef" stroke="#1d6f76" strokeOpacity="0.55" strokeWidth="1.25" />
              <text x={x} y={y + 3.5} textAnchor="middle" fill="#14171b" fontSize="9.5" letterSpacing="1.1" fontFamily="var(--font-mono)">
                {label}
              </text>
            </g>
          ))}
          <polygon points="0,-38 33,-19 33,19 0,38 -33,19 -33,-19" fill="#14171b" />
          <polygon points="0,-38 33,-19 33,19 0,38 -33,19 -33,-19" fill="none" stroke="#1d6f76" strokeOpacity="0.55" className="glance-ping" />
          <text y="5" textAnchor="middle" fill="#eeebe5" fontSize="16" fontWeight="500" fontFamily="var(--font-display)">
            40+
          </text>
        </g>
      </svg>

      {/* 03 · 15+ Countries: Minimalist cartographic corridor arcs from Dubai */}
      <svg
        viewBox="0 0 440 340"
        className={`absolute inset-0 h-full w-full transition-all duration-700 ease-(--ease-out) ${
          active === 2 ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <g transform="translate(220 170)">
          <ellipse rx="164" ry="108" fill="none" stroke="#14171b" strokeOpacity="0.12" />
          <ellipse rx="112" ry="74" fill="none" stroke="#1d6f76" strokeOpacity="0.22" strokeDasharray="4 6" />
          <ellipse rx="60" ry="40" fill="none" stroke="#14171b" strokeOpacity="0.14" />
          {(
            [
              ['M0 0 Q-58 -68 -120 -38', -120, -38, 'LDN'],
              ['M0 0 Q56 -72 126 -24', 126, -24, 'HKG'],
              ['M0 0 Q26 58 38 86', 38, 86, 'MRU'],
              ['M0 0 Q-66 40 -106 60', -106, 60, 'EU'],
              ['M0 0 Q82 34 132 48', 132, 48, 'APAC'],
            ] as const
          ).map(([d, x, y, lbl], idx) => (
            <g key={lbl}>
              <path d={d} fill="none" stroke="#14171b" strokeOpacity="0.18" strokeWidth="1.2" />
              <path
                d={d}
                fill="none"
                stroke="#1d6f76"
                strokeWidth="2.2"
                strokeDasharray="24 140"
                className="glance-flow"
                style={{ animationDelay: `${idx * -0.5}s` }}
              />
              <circle cx={x} cy={y} r="4.5" fill="#1d6f76" />
              <circle cx={x} cy={y} r="10" fill="none" stroke="#1d6f76" strokeOpacity="0.45" className="glance-ping" style={{ animationDelay: `${idx * 0.4}s` }} />
              <text x={x + 9} y={y + 4} fill="#14171b" fontSize="9.5" letterSpacing="1.1" fontFamily="var(--font-mono)">
                {lbl}
              </text>
            </g>
          ))}
          <circle r="7" fill="#14171b" />
          <text y="-14" textAnchor="middle" fill="#1d6f76" fontSize="9.5" letterSpacing="1.3" fontFamily="var(--font-mono)">
            DXB HUB
          </text>
        </g>
      </svg>

      {/* 04 · 3 Jurisdictions: Architectural tri-pillar triangle */}
      <svg
        viewBox="0 0 440 340"
        className={`absolute inset-0 h-full w-full transition-all duration-700 ease-(--ease-out) ${
          active === 3 ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <g>
          <polygon points="220,58 96,262 344,262" fill="#1d6f76" fillOpacity="0.06" stroke="#14171b" strokeOpacity="0.22" strokeWidth="1.4" />
          <polygon
            points="220,58 96,262 344,262"
            fill="none"
            stroke="#1d6f76"
            strokeWidth="2.4"
            strokeDasharray="52 240"
            className="glance-flow-long"
          />
          <line x1="220" y1="58" x2="220" y2="196" stroke="#14171b" strokeOpacity="0.14" strokeDasharray="3 5" />
          <line x1="96" y1="262" x2="220" y2="196" stroke="#14171b" strokeOpacity="0.14" strokeDasharray="3 5" />
          <line x1="344" y1="262" x2="220" y2="196" stroke="#14171b" strokeOpacity="0.14" strokeDasharray="3 5" />
          <circle cx="220" cy="196" r="16" fill="#14171b" />
          <text x="220" y="200" textAnchor="middle" fill="#eeebe5" fontSize="11" fontFamily="var(--font-mono)">
            3
          </text>
          {[
            { x: 220, y: 58, code: 'UAE', sub: 'CMA · DUBAI' },
            { x: 96, y: 262, code: 'UK', sub: 'FCA · LONDON' },
            { x: 344, y: 262, code: 'MU', sub: 'FSC · MAURITIUS' },
          ].map((node, idx) => (
            <g key={node.code}>
              <circle cx={node.x} cy={node.y} r="28" fill="#f6f4ef" stroke="#1d6f76" strokeWidth="1.5" />
              <circle cx={node.x} cy={node.y} r="28" fill="none" stroke="#1d6f76" strokeOpacity="0.5" className="glance-ping" style={{ animationDelay: `${idx * 0.65}s` }} />
              <text x={node.x} y={node.y + 4.5} textAnchor="middle" fill="#14171b" fontSize="13.5" fontWeight="500" fontFamily="var(--font-display)">
                {node.code}
              </text>
              <text x={node.x} y={node.y + 46} textAnchor="middle" fill="#1d6f76" fontSize="9.5" letterSpacing="1.3" fontFamily="var(--font-mono)">
                {node.sub}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

// Transparent architectural SVG motion artwork blended seamlessly into each Expertise card
function ExpertiseGraphic({ i }: { i: number }) {
  return (
    <div className="relative h-32 w-full overflow-hidden bg-transparent sm:h-36">
      <svg viewBox="0 0 360 132" className="h-full w-full" aria-hidden="true">
        {i === 0 && (
          <g>
            <line x1="16" y1="108" x2="344" y2="108" stroke="#14171b" strokeOpacity="0.14" />
            {[
              [36, 74, 22, 34],
              [70, 60, 22, 48],
              [104, 44, 22, 64],
              [138, 26, 22, 82],
            ].map(([x, y, w, h], idx) => (
              <rect
                key={x}
                x={x}
                y={y}
                width={w}
                height={h}
                rx="3"
                fill="#1d6f76"
                fillOpacity={0.1 + idx * 0.08}
                stroke="#1d6f76"
                strokeOpacity={0.42 + idx * 0.16}
                strokeWidth="1.25"
                className="glance-bar"
                style={{ animationDelay: `${idx * 0.2}s` }}
              />
            ))}
            <g transform="translate(256 64)">
              <rect x="-42" y="-24" width="46" height="46" rx="6" fill="none" stroke="#14171b" strokeOpacity="0.65" strokeWidth="1.4" className="glance-slide-r" />
              <rect x="-4" y="-24" width="46" height="46" rx="6" fill="#1d6f76" fillOpacity="0.14" stroke="#1d6f76" strokeWidth="1.5" className="glance-slide-l" />
              <circle r="4.5" fill="#14171b" />
              <circle r="15" fill="none" stroke="#1d6f76" strokeOpacity="0.5" className="glance-ping" />
            </g>
          </g>
        )}

        {i === 1 && (
          <g>
            <path d="M16 92 Q80 40 144 70 T268 42 T344 26" fill="none" stroke="#14171b" strokeOpacity="0.14" strokeWidth="1.4" />
            <path d="M16 92 Q80 40 144 70 T268 42 T344 26" fill="none" stroke="#1d6f76" strokeWidth="2.3" strokeDasharray="48 160" className="glance-flow" />
            <path d="M16 108 Q96 80 166 88 T288 64 T344 50" fill="none" stroke="#14171b" strokeOpacity="0.1" strokeWidth="1.2" />
            <path d="M16 108 Q96 80 166 88 T288 64 T344 50" fill="none" stroke="#33b7c2" strokeWidth="1.9" strokeDasharray="36 150" className="glance-flow" style={{ animationDelay: '-1.1s' }} />
            {[
              [82, 58],
              [166, 72],
              [268, 42],
              [322, 32],
            ].map(([x, y], idx) => (
              <g key={x}>
                <line x1={x} y1={y! - 15} x2={x} y2={y! + 17} stroke="#14171b" strokeOpacity="0.32" strokeWidth="1.2" />
                <rect x={x! - 4.5} y={y! - 7.5} width="9" height="15" rx="2" fill={idx % 2 === 0 ? '#1d6f76' : '#14171b'} />
              </g>
            ))}
          </g>
        )}

        {i === 2 && (
          <g>
            <path d="M24 108 H336" stroke="#14171b" strokeOpacity="0.16" />
            {[
              [34, 88, 56, 20],
              [104, 70, 56, 38],
              [174, 50, 56, 58],
              [244, 26, 74, 82],
            ].map(([x, y, w, h], idx) => (
              <rect
                key={x}
                x={x}
                y={y}
                width={w}
                height={h}
                rx="4"
                fill="#1d6f76"
                fillOpacity={0.07 + idx * 0.06}
                stroke="#1d6f76"
                strokeOpacity={0.3 + idx * 0.18}
                strokeWidth="1.25"
              />
            ))}
            <path d="M38 96 C115 88 185 64 308 22" fill="none" stroke="#1d6f76" strokeWidth="2.3" strokeDasharray="60 180" className="glance-flow" />
            <circle cx="308" cy="22" r="4.5" fill="#14171b" />
            <circle cx="308" cy="22" r="14" fill="none" stroke="#1d6f76" strokeOpacity="0.55" className="glance-ping" />
          </g>
        )}

        {i === 3 && (
          <g transform="translate(180 70)">
            <ellipse rx="138" ry="46" fill="none" stroke="#14171b" strokeOpacity="0.14" strokeDasharray="4 6" />
            <ellipse rx="90" ry="32" fill="none" stroke="#1d6f76" strokeOpacity="0.28" />
            <path d="M0 0 Q-56 -50 -116 -8" fill="none" stroke="#1d6f76" strokeWidth="2.1" strokeDasharray="24 110" className="glance-flow" />
            <path d="M0 0 Q56 -52 122 -10" fill="none" stroke="#1d6f76" strokeWidth="2.1" strokeDasharray="24 110" className="glance-flow" style={{ animationDelay: '-0.7s' }} />
            <path d="M0 0 Q20 44 84 28" fill="none" stroke="#33b7c2" strokeWidth="1.9" strokeDasharray="22 100" className="glance-flow" style={{ animationDelay: '-1.3s' }} />
            <circle cx="-116" cy="-8" r="4.5" fill="#1d6f76" />
            <circle cx="122" cy="-10" r="4.5" fill="#1d6f76" />
            <circle cx="84" cy="28" r="4.5" fill="#33b7c2" />
            <circle r="6.5" fill="#14171b" />
            <circle r="19" fill="none" stroke="#1d6f76" strokeOpacity="0.48" className="glance-ping" />
          </g>
        )}
      </svg>
    </div>
  )
}

export function GlanceMotion() {
  const m = meta('glance')
  const active = useGlanceStore((s) => s.index)
  const progress = useGlanceStore((s) => s.progress)
  const [stageIdx, setStageIdx] = useState(0)
  const [cardsIn, setCardsIn] = useState(false)
  const journeyRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const cards = cardsRef.current
    const journey = journeyRef.current

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          if (e.target === cards) setCardsIn(true)
          io.unobserve(e.target)
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' },
    )
    if (cards) io.observe(cards)

    if (reduced || !journey || !matchMedia('(min-width: 1024px)').matches) {
      return () => io.disconnect()
    }

    const st = ScrollTrigger.create({
      trigger: journey,
      start: 'top 76%',
      end: 'bottom 44%',
      scrub: 0.35,
      refreshPriority: -2,
      onUpdate: (self) => {
        const idx = Math.min(LIFECYCLE.length - 1, Math.floor(self.progress * LIFECYCLE.length))
        setStageIdx(idx)
      },
    })

    return () => {
      io.disconnect()
      st.kill()
    }
  }, [])

  const currentStat = glance.stats[active] ?? glance.stats[0]!
  const currentMeta = STAT_META[active] ?? STAT_META[0]!
  const activeStage = LIFECYCLE[stageIdx] ?? LIFECYCLE[0]!

  return (
    <>
      {/* PART 1 · Classy Editorial Metrics Showcase (pinned on desktop, native single-screen interactive on phone) */}
      <div className="shell flex flex-col justify-center py-20 md:py-28 lg:min-h-dvh" data-glance-stage>
        {/* Top bar: single-row on every viewport, compact high-contrast segmented control */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-900/12 pb-5">
          <Label n={m.n}>{glance.about.label}</Label>
          <div className="flex items-center gap-3">
            <div
              role="tablist"
              aria-label="Firm metrics"
              className="inline-flex items-center gap-1 rounded-full border border-ink-900/12 bg-[#f6f4ef]/90 p-1"
            >
              {STAT_META.map((item, i) => (
                <button
                  key={item.tab}
                  type="button"
                  role="tab"
                  aria-selected={active === i}
                  onClick={() => {
                    useGlanceStore.setState({ index: i, progress: i / (STAT_META.length - 1) })
                    glanceJump.to?.(i)
                  }}
                  className={`label min-h-11 min-w-[3.25rem] cursor-pointer rounded-full px-3.5 transition-colors duration-200 ${
                    active === i
                      ? 'bg-ink-900 text-stone-50'
                      : 'text-ink-600 hover:text-ink-900'
                  }`}
                >
                  {item.tab}
                </button>
              ))}
            </div>
            <p className="label hidden text-ink-600 sm:block" aria-hidden="true" data-glance-count>
              [{pad(active + 1)}/{pad(glance.stats.length)}]
            </p>
          </div>
        </div>

        {/* Clean asymmetric Swiss editorial composition directly on the stone canvas */}
        <div className="grid-12 mt-10 items-center gap-y-10 md:mt-14">
          <div className="col-span-12 flex flex-col gap-5 lg:col-span-7">
            <p className="label text-accent">
              {pad(active + 1)} · {currentMeta.eyebrow}
            </p>

            <div className="overflow-hidden py-1">
              <p
                key={currentStat.value}
                className="display glance-num-in text-[clamp(4.75rem,14vw,13rem)] leading-[0.88] tracking-[-0.05em] text-ink-900"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {currentStat.value}
              </p>
            </div>

            <h3 className="display h-md max-w-[20ch] text-ink-900">{currentStat.label}</h3>
            <p className="max-w-[46ch] text-base leading-relaxed text-ink-600 md:text-lg">{currentMeta.detail}</p>
            <p className="label pt-1 text-ink-900/70">{currentMeta.meta}</p>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <StatArtwork active={active} />
          </div>
        </div>

        {/* Refined progress baseline */}
        <div className="mt-10 md:mt-14">
          <div className="relative h-px w-full bg-ink-900/12" aria-hidden="true">
            <div
              className="absolute inset-y-0 left-0 h-[2px] w-full origin-left bg-teal-700 transition-transform duration-300 ease-(--ease-out)"
              style={{ transform: `scaleX(${Math.max((active + 1) / STAT_META.length, progress).toFixed(4)})` }}
            />
          </div>
          <p className="label mt-5 text-accent">{glance.motto}</p>
        </div>

        <ul className="sr-only">
          {glance.stats.map((s) => (
            <li key={s.value}>
              {s.value} {s.label}
            </li>
          ))}
        </ul>
      </div>

      {/* PART 2 · Editorial Narrative + Interactive "Inception to Scale" Journey */}
      <div className="shell pb-24 pt-12 md:pb-36 md:pt-20">
        <div className="grid-12 gap-y-10 border-t border-ink-900/12 pt-14 md:pt-20">
          <div className="col-span-12 flex flex-col justify-between gap-8 lg:col-span-5">
            <div>
              <p className="label text-accent">About the Firm</p>
              <SplitHeadline as="h3" text={glance.about.headline} className="h-xl mt-4 max-w-[13ch] text-ink-900" />
            </div>

            {/* Clean Swiss annual-report ledger (no boxed clutter) */}
            <dl className="grid grid-cols-1 gap-4 border-t border-ink-900/12 pt-6 sm:grid-cols-3 lg:grid-cols-1 lg:gap-0 lg:divide-y lg:divide-ink-900/10">
              {CREDENTIALS.map((c) => (
                <div key={c.k} className="flex flex-col gap-1 lg:flex-row lg:items-baseline lg:justify-between lg:py-3">
                  <dt className="label text-ink-600">{c.k}</dt>
                  <dd className="font-mono text-sm font-medium text-ink-900">{c.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="col-span-12 space-y-6 lg:col-span-6 lg:col-start-7">
            {glance.about.body.map((p) => (
              <p key={p.slice(0, 24)} className="text-[17px] leading-[1.72] text-ink-900/85 md:text-[19px]" data-reveal>
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Single-surface interactive Inception → Scale stepper (effortless on phone, crisp on desktop) */}
        <div
          ref={journeyRef}
          className="mt-16 rounded-2xl border border-ink-900/12 bg-[#f6f4ef]/88 p-5 shadow-[0_24px_60px_-36px_rgb(20_23_27/0.16)] backdrop-blur-sm sm:p-8 md:mt-24 md:p-10"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="label text-accent">Inception to Scale</p>
            <p className="label text-ink-600">
              {activeStage.n} / {pad(LIFECYCLE.length)}
            </p>
          </div>

          {/* Horizontal pill-bar selector: 6 equal columns on desktop, clean 2x3 or horizontal strip on phone */}
          <div
            role="tablist"
            aria-label="Engagement lifecycle stages"
            className="mt-5 grid grid-cols-2 gap-1.5 rounded-xl bg-ink-900/[0.045] p-1.5 sm:grid-cols-3 lg:grid-cols-6"
          >
            {LIFECYCLE.map((step, i) => {
              const current = i === stageIdx
              return (
                <button
                  key={step.n}
                  type="button"
                  role="tab"
                  aria-selected={current}
                  onClick={() => setStageIdx(i)}
                  className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-center transition-all duration-200 ${
                    current
                      ? 'bg-ink-900 text-stone-50 shadow-sm'
                      : 'text-ink-600 hover:bg-ink-900/[0.04] hover:text-ink-900'
                  }`}
                >
                  <span className={`font-mono text-[11px] ${current ? 'text-teal-300' : 'text-accent'}`}>{step.n}</span>
                  <span className="font-mono text-[11px] tracking-[0.06em] uppercase">{step.short}</span>
                </button>
              )
            })}
          </div>

          {/* Subtle progress bar tracking the active stage */}
          <div className="relative mt-6 h-px w-full bg-ink-900/10" aria-hidden="true">
            <div
              className="h-[2px] w-full origin-left bg-teal-700 transition-transform duration-300 ease-(--ease-out)"
              style={{ transform: `scaleX(${((stageIdx + 1) / LIFECYCLE.length).toFixed(4)})` }}
            />
          </div>

          {/* Active stage editorial spotlight */}
          <div key={activeStage.n} className="glance-num-in grid-12 mt-7 items-baseline gap-y-3">
            <p className="display col-span-12 text-4xl text-teal-700 sm:col-span-2 sm:text-5xl" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {activeStage.n}
            </p>
            <h4 className="display h-md col-span-12 text-ink-900 sm:col-span-4">{activeStage.title}</h4>
            <p className="col-span-12 text-base leading-relaxed text-ink-600 sm:col-span-6">{activeStage.desc}</p>
          </div>
        </div>

        {/* PART 3 · Areas of Expertise — 2×2 Classy Editorial Cards with Transparent Blended Animations */}
        <div className="mt-20 md:mt-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label text-accent">{glance.expertise.label}</p>
              <h4 className="display h-lg mt-3 max-w-[18ch] text-ink-900">Four core pillars of institutional advisory</h4>
            </div>
            <p className="label text-ink-600">04 Specialist Practices</p>
          </div>

          <ul ref={cardsRef} className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            {glance.expertise.items.map((x, i) => {
              const info = EXPERTISE_META[i]!
              return (
                <li
                  key={x}
                  className={`group flex flex-col gap-5 rounded-2xl border border-ink-900/10 bg-[#f6f4ef]/88 p-6 shadow-[0_18px_48px_-32px_rgb(20_23_27/0.16)] backdrop-blur-sm transition-[opacity,transform,border-color] duration-700 ease-(--ease-out) hover:-translate-y-1 hover:border-teal-700/40 md:p-8 ${
                    cardsIn ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-6 scale-[0.98] opacity-0'
                  }`}
                  style={{ transitionDelay: `${i * 85}ms` }}
                >
                  <div className="flex items-center justify-between gap-4 border-b border-ink-900/10 pb-4">
                    <span className="label text-accent">{info.tag}</span>
                    <span className="font-mono text-xs text-ink-600" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {pad(i + 1)}
                    </span>
                  </div>

                  <ExpertiseGraphic i={i} />

                  <div className="mt-auto space-y-2">
                    <h5 className="display h-md text-ink-900">{x}</h5>
                    <p className="text-[15px] leading-relaxed text-ink-600 md:text-base">{info.desc}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </>
  )
}
