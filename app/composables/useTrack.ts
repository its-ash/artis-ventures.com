type Props = Record<string, string | number | boolean>

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

export const useTrack = () => (event: string, props: Props = {}) => {
  if (import.meta.server) return
  ;(window.dataLayer ??= []).push({ event, ...props })
}
