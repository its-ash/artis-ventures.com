import type { CSSProperties } from 'react'

// Line diagrams for the capability cards, one per practice. Decorative: hidden from assistive tech.
const C = { cx: 100, cy: 45 }
const faint = { stroke: 'currentColor', strokeOpacity: 0.28, fill: 'none', strokeWidth: 1 } as const
const solid = { stroke: 'currentColor', fill: 'none', strokeWidth: 1.25 } as const
const origin = (x: number, y: number): CSSProperties => ({ transformOrigin: `${x}px ${y}px` })

// 01 Turnkey: a venture node with a satellite on its launch orbit.
const Launch = () => (
  <>
    <circle cx={C.cx} cy={C.cy} r={34} {...faint} strokeDasharray="3 5" className="dg-spin" />
    <circle cx={C.cx} cy={C.cy} r={20} {...faint} />
    <g className="dg-orbit" style={origin(C.cx, C.cy)}>
      <rect x={C.cx + 31} y={C.cy - 3} width={6} height={6} fill="currentColor" />
    </g>
    <rect x={C.cx - 4} y={C.cy - 4} width={8} height={8} fill="currentColor" />
    <rect x={C.cx - 4} y={C.cy - 4} width={8} height={8} {...solid} className="dg-ping" />
    <path d={`M20 ${C.cy}H62M138 ${C.cy}H180`} {...faint} />
  </>
)

// 02 M&A: two entities joined by a deal line; a token travels between them.
const Deal = () => (
  <>
    <rect x={36} y={25} width={40} height={40} {...solid} />
    <rect x={124} y={25} width={40} height={40} {...solid} />
    <rect x={46} y={35} width={20} height={20} {...faint} />
    <rect x={134} y={35} width={20} height={20} {...faint} />
    <path d={`M76 ${C.cy}H124`} {...faint} strokeDasharray="2 4" />
    <rect x={76} y={C.cy - 3} width={6} height={6} fill="currentColor" className="dg-run" style={{ '--run': '42px' } as CSSProperties} />
    <rect x={136} y={37} width={16} height={16} {...solid} className="dg-ping" />
  </>
)

// 03 Strategy: a growth path through waypoints with a scan line reading across.
const Growth = () => (
  <>
    <path d="M20 75H180M20 75V12" {...faint} />
    <path d="M20 68L58 56L92 60L128 34L170 18" {...solid} />
    {[
      [58, 56],
      [92, 60],
      [128, 34],
    ].map(([x, y]) => (
      <rect key={x} x={x! - 3} y={y! - 3} width={6} height={6} fill="currentColor" />
    ))}
    <rect x={166} y={14} width={8} height={8} fill="currentColor" />
    <rect x={166} y={14} width={8} height={8} {...solid} className="dg-ping" />
    <path d="M24 14V74" {...faint} strokeOpacity={0.5} className="dg-run" style={{ '--run': '140px' } as CSSProperties} />
  </>
)

// 04 Regulatory: a rotating frame around a checked core, with a crosshair.
const Frame = () => (
  <>
    <rect x={C.cx - 26} y={C.cy - 26} width={52} height={52} {...faint} strokeDasharray="4 4" className="dg-spin" />
    <rect x={C.cx - 18} y={C.cy - 18} width={36} height={36} {...solid} transform={`rotate(45 ${C.cx} ${C.cy})`} />
    <path d={`M${C.cx - 44} ${C.cy}H${C.cx - 30}M${C.cx + 30} ${C.cy}H${C.cx + 44}M${C.cx} 4V12M${C.cx} 78V86`} {...faint} />
    <path d={`M${C.cx - 7} ${C.cy}l5 5l10 -10`} {...solid} />
    <circle cx={C.cx} cy={C.cy} r={14} {...solid} className="dg-ping" />
  </>
)

const SHAPES = [Launch, Deal, Growth, Frame]

export function CardDiagram({ i }: { i: number }) {
  const Shape = SHAPES[i % SHAPES.length]!
  return (
    <svg viewBox="0 0 200 90" className="block h-auto max-h-24 w-full text-teal-500" aria-hidden="true" focusable="false">
      <Shape />
    </svg>
  )
}
