type Props = {
  name: 'hero_city' | 'contact_city' | 'approach_caustics'
  className?: string
  eager?: boolean
}

export function BgVideo({ name, className = '', eager = false }: Props) {
  return (
    <video
      className={`h-full w-full object-cover ${className}`}
      poster={`/posters/${name}.webp`}
      autoPlay
      muted
      loop
      playsInline
      preload={eager ? 'auto' : 'none'}
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
      data-video={name}
    >
      <source src={`/video/${name}.mp4`} type="video/mp4" />
    </video>
  )
}
