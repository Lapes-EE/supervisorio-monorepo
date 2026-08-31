export interface MeterState {
  enabled: boolean
  failureCount: number
  health: "healthy" | "failing" | "cooldown"
  lastFailedAt: string | null
}

export function calculateBackoff(
  failureCount: number,
  maxBackoffSeconds: number
): number {
  if (failureCount === 0) {
    return 0
  }
  const backoff = 30 * 2 ** (failureCount - 1)
  return Math.min(backoff, maxBackoffSeconds)
}

export function isMeterEligible(
  meter: MeterState,
  now: Date,
  maxBackoffSeconds: number
): boolean {
  if (!meter.enabled) {
    return false
  }

  if (meter.health === "healthy") {
    return true
  }

  if (meter.health === "failing") {
    return false
  }

  if (meter.health === "cooldown") {
    if (!meter.lastFailedAt) {
      return true
    }

    const lastFailed = new Date(meter.lastFailedAt)
    const backoff = calculateBackoff(meter.failureCount, maxBackoffSeconds)
    const nextAttempt = new Date(lastFailed.getTime() + backoff * 1000)

    return now >= nextAttempt
  }

  return false
}
