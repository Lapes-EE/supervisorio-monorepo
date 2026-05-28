import { describe, expect, test, vi, beforeEach } from 'vitest'
import { startTelemetryCollector } from './telemetry-collector'
import * as queries from '../db/queries'

vi.mock('@repo/db', async () => {
  const actual = await vi.importActual<typeof import('@repo/db')>('@repo/db')
  return {
    ...actual,
    insertMeasure: vi.fn(),
  }
})

vi.mock('@repo/telemetry', () => ({
  getTelemetryFromMeter: vi.fn(),
}))

vi.mock('node-cron', () => ({
  schedule: vi.fn((schedule: string, callback: Function) => {
    ;(globalThis as any).__cronCallback = callback
    return { stop: vi.fn() }
  }),
}))

vi.mock('pino', () => ({
  default: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}))

function createMockMeter(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    issoSerial: 'TEST-001',
    name: 'Test Meter',
    ip: '192.168.1.1',
    description: null,
    active: true,
    enabled: true,
    health: 'healthy' as const,
    failureCount: 0,
    lastFailedAt: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('Telemetry Collector Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('starts and registers cron schedule', () => {
    const cron = require('node-cron')
    startTelemetryCollector()
    expect(cron.schedule).toHaveBeenCalled()
  })

  test('collects from eligible healthy meters', async () => {
    const { getTelemetryFromMeter } = await import('@repo/telemetry')
    const { insertMeasure } = await import('@repo/db')

    const mockMeter = createMockMeter({ ip: '192.168.1.1' })

    vi.spyOn(queries, 'getEligibleMeters').mockResolvedValue([mockMeter] as any)
    vi.spyOn(queries, 'checkMeterEnabled').mockResolvedValue(true)
    vi.spyOn(queries, 'updateMeterSuccess').mockResolvedValue(undefined as any)
    ;(getTelemetryFromMeter as any).mockResolvedValue({
      potenciaAtivaFundamentalHarmonicaTotal: 100,
    })

    startTelemetryCollector()

    const callback = (globalThis as any).__cronCallback
    await callback()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(queries.getEligibleMeters).toHaveBeenCalled()
    expect(getTelemetryFromMeter).toHaveBeenCalledWith('192.168.1.1')
    expect(insertMeasure).toHaveBeenCalled()
    expect(queries.updateMeterSuccess).toHaveBeenCalledWith('192.168.1.1')
  })

  test('skips disabled meters during retry', async () => {
    const { getTelemetryFromMeter } = await import('@repo/telemetry')

    const mockMeter = createMockMeter({ ip: '192.168.1.2' })

    vi.spyOn(queries, 'getEligibleMeters').mockResolvedValue([mockMeter] as any)
    vi.spyOn(queries, 'checkMeterEnabled').mockResolvedValue(false)
    vi.spyOn(queries, 'updateMeterFailure').mockResolvedValue(undefined as any)
    ;(getTelemetryFromMeter as any).mockRejectedValue(new Error('Connection refused'))

    startTelemetryCollector()

    const callback = (globalThis as any).__cronCallback
    await callback()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(queries.checkMeterEnabled).toHaveBeenCalledWith('192.168.1.2')
    expect(queries.updateMeterFailure).not.toHaveBeenCalled()
  })

  test('marks meter as failing after all retries exhausted', async () => {
    const { getTelemetryFromMeter } = await import('@repo/telemetry')

    const mockMeter = createMockMeter({ ip: '192.168.1.3', failureCount: 2 })

    vi.spyOn(queries, 'getEligibleMeters').mockResolvedValue([mockMeter] as any)
    vi.spyOn(queries, 'checkMeterEnabled').mockResolvedValue(true)
    vi.spyOn(queries, 'updateMeterFailure').mockResolvedValue(undefined as any)
    ;(getTelemetryFromMeter as any).mockRejectedValue(new Error('Connection refused'))

    startTelemetryCollector()

    const callback = (globalThis as any).__cronCallback
    await callback()
    await new Promise((resolve) => setTimeout(resolve, 200))

    expect(queries.updateMeterFailure).toHaveBeenCalledWith('192.168.1.3', 3)
  })

  test('skips meters in cooldown that have not expired', async () => {
    const mockMeter = createMockMeter({
      ip: '192.168.1.4',
      health: 'cooldown',
      failureCount: 1,
      lastFailedAt: new Date(Date.now() - 1000).toISOString(),
    })

    vi.spyOn(queries, 'getEligibleMeters').mockResolvedValue([mockMeter] as any)

    startTelemetryCollector()

    const callback = (globalThis as any).__cronCallback
    await callback()
    await new Promise((resolve) => setTimeout(resolve, 100))

    const { getTelemetryFromMeter } = await import('@repo/telemetry')
    expect(getTelemetryFromMeter).not.toHaveBeenCalledWith('192.168.1.4')
  })
})
