import { describe, expect, test } from 'vitest'
import {
  calculateBackoff,
  isMeterEligible,
  type MeterState,
} from './state-machine'

describe('calculateBackoff', () => {
  test('returns 0 for zero failures', () => {
    expect(calculateBackoff(0, 3600)).toBe(0)
  })

  test('returns 30 for 1 failure', () => {
    expect(calculateBackoff(1, 3600)).toBe(30)
  })

  test('returns 60 for 2 failures', () => {
    expect(calculateBackoff(2, 3600)).toBe(60)
  })

  test('returns 120 for 3 failures', () => {
    expect(calculateBackoff(3, 3600)).toBe(120)
  })

  test('returns 960 for 5 failures', () => {
    expect(calculateBackoff(6, 3600)).toBe(960)
  })

  test('caps at maxBackoffSeconds', () => {
    expect(calculateBackoff(10, 100)).toBe(100)
  })
})

describe('isMeterEligible', () => {
  const maxBackoff = 3600
  const now = new Date('2026-05-28T12:00:00Z')

  test('returns false if disabled', () => {
    const meter: MeterState = {
      enabled: false,
      health: 'healthy',
      failureCount: 0,
      lastFailedAt: null,
    }
    expect(isMeterEligible(meter, now, maxBackoff)).toBe(false)
  })

  test('returns true if healthy and enabled', () => {
    const meter: MeterState = {
      enabled: true,
      health: 'healthy',
      failureCount: 0,
      lastFailedAt: null,
    }
    expect(isMeterEligible(meter, now, maxBackoff)).toBe(true)
  })

  test('returns false if failing', () => {
    const meter: MeterState = {
      enabled: true,
      health: 'failing',
      failureCount: 5,
      lastFailedAt: null,
    }
    expect(isMeterEligible(meter, now, maxBackoff)).toBe(false)
  })

  test('returns true if cooldown expired', () => {
    const meter: MeterState = {
      enabled: true,
      health: 'cooldown',
      failureCount: 1, // backoff = 30s
      lastFailedAt: new Date(now.getTime() - 31 * 1000).toISOString(),
    }
    expect(isMeterEligible(meter, now, maxBackoff)).toBe(true)
  })

  test('returns false if cooldown NOT expired', () => {
    const meter: MeterState = {
      enabled: true,
      health: 'cooldown',
      failureCount: 1, // backoff = 30s
      lastFailedAt: new Date(now.getTime() - 29 * 1000).toISOString(),
    }
    expect(isMeterEligible(meter, now, maxBackoff)).toBe(false)
  })

  test('handles large failure count correctly', () => {
    const meter: MeterState = {
      enabled: true,
      health: 'cooldown',
      failureCount: 10, // backoff capped at 3600s
      lastFailedAt: new Date(now.getTime() - 3599 * 1000).toISOString(),
    }
    expect(isMeterEligible(meter, now, maxBackoff)).toBe(false)

    const later = new Date(now.getTime() + 2000)
    expect(isMeterEligible(meter, later, maxBackoff)).toBe(true)
  })
})
