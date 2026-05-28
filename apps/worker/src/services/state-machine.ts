export type MeterState = {
  enabled: boolean
  health: 'healthy' | 'failing' | 'cooldown'
  failureCount: number
  lastFailedAt: string | null
}

export function calculateBackoff(
  failureCount: number,
  maxBackoffSeconds: number
): number {
  if (failureCount === 0) return 0
  // Formula: min(30 * 2^(failureCount-1), MAX_BACKOFF_SECONDS)
  // failureCount 1 -> 30 * 2^0 = 30
  // failureCount 2 -> 30 * 2^1 = 60
  // failureCount 3 -> 30 * 2^2 = 120
  const backoff = 30 * 2 ** (failureCount - 1)
  return Math.min(backoff, maxBackoffSeconds)
}

export function isMeterEligible(
  meter: MeterState,
  now: Date,
  maxBackoffSeconds: number
): boolean {
  if (!meter.enabled) return false

  if (meter.health === 'healthy') return true

  if (meter.health === 'failing') return false // Should be in cooldown already

  if (meter.health === 'cooldown') {
    if (!meter.lastFailedAt) return true // Should not happen if in cooldown

    const lastFailed = new Date(meter.lastFailedAt)
    const backoff = calculateBackoff(meter.failureCount, maxBackoffSeconds)
    const nextAttempt = new Date(lastFailed.getTime() + backoff * 1000)

    return now >= nextAttempt
  }

  return false
}
