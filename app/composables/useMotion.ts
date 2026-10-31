export const prefersReducedMotion = () => import.meta.client && matchMedia(MQ.reduce).matches

export const isLowEnd = () => {
  if (import.meta.server) return false
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  return (nav.hardwareConcurrency ?? 8) < 4 || (nav.deviceMemory ?? 8) <= 2 || !!nav.connection?.saveData
}
