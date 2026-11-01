import type { ElementType } from 'react'

type Props = {
  text: string
  as?: ElementType
  className?: string
  id?: string
}

// Server-rendered and readable without JS; the SceneDirector splits it into masked lines.
export function SplitHeadline({ text, as: Tag = 'h2', className = '', id }: Props) {
  return (
    <Tag id={id} className={`display ${className}`} data-split aria-label={text}>
      <span aria-hidden="true">{text}</span>
    </Tag>
  )
}
