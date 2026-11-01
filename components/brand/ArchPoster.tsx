import { A_MARK } from '@/components/brand/Logo'

// Still of the glass arch for browsers without WebGL (hidden when the 3D scene runs).
export function ArchPoster({ id, className = '' }: { id: string; className?: string }) {
  const fill = `arch-glass-${id}`
  return (
    <svg viewBox={A_MARK.viewBox} className={className} aria-hidden="true" data-fallback-media>
      <defs>
        <linearGradient id={fill} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7fd6db" stopOpacity="0.28" />
          <stop offset="0.55" stopColor="#33b7c2" stopOpacity="0.08" />
          <stop offset="1" stopColor="#1b1f24" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <g transform={A_MARK.transform}>
        <path d={A_MARK.d} fill={`url(#${fill})`} stroke="#7fd6db" strokeOpacity="0.7" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  )
}
