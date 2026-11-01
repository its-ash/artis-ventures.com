type Props = { n?: string; children: React.ReactNode; className?: string }

export function Label({ n, children, className = '' }: Props) {
  return (
    <p className={`label text-muted ${className}`}>
      {n && <span className="text-accent">[{n}] </span>}
      {children}
    </p>
  )
}
