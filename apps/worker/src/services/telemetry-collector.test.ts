import { insertMeasure, notifyTelemetryChange } from '@repo/db'
import { getTelemetryFromMeter } from '@repo/telemetry'
import cron from 'node-cron'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
  checkMeterEnabled,
  getEligibleMeters,
  updateMeterFailure,
  updateMeterSuccess,
} from '../db/queries'
import { startTelemetryCollector } from './telemetry-collector'

vi.mock('@repo/db', async () => {
  const actual = await vi.importActual<typeof import('@repo/db')>('@repo/db')
  return {
    ...actual,
    insertMeasure: vi.fn().mockResolvedValue({ meterId: 1 }),
    notifyTelemetryChange: vi.fn().mockResolvedValue(undefined),
  }
})

vi.mock('@repo/telemetry', () => ({
  getTelemetryFromMeter: vi.fn(),
}))

vi.mock('../db/queries', () => ({
  getEligibleMeters: vi.fn(),
  checkMeterEnabled: vi.fn(),
  updateMeterSuccess: vi.fn(),
  updateMeterFailure: vi.fn(),
}))

vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn((_schedule: string, callback: () => Promise<void>) => {
      ;(globalThis as Record<string, unknown>).__cronCallback = callback
      return { stop: vi.fn() }
    }),
  },
}))

vi.mock('pino', () => ({
  default: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}))

type MockMeter = {
  id: number
  issoSerial: string
  name: string
  ip: string
  description: null
  active: boolean
  enabled: boolean
  health: 'healthy' | 'failing' | 'cooldown'
  failureCount: number
  lastFailedAt: string | null
  createdAt: string
}

function createMockMeter(overrides: Partial<MockMeter> = {}) {
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
    startTelemetryCollector()
    expect(cron.schedule).toHaveBeenCalled()
  })

  test('collects from eligible healthy meters', async () => {
    const mockMeter = createMockMeter({ ip: '192.168.1.1' })

    vi.mocked(getEligibleMeters).mockResolvedValue([mockMeter])
    vi.mocked(checkMeterEnabled).mockResolvedValue(true)
    vi.mocked(updateMeterSuccess).mockResolvedValue(undefined)
    vi.mocked(getTelemetryFromMeter).mockResolvedValue({
      potenciaAtivaFundamentalHarmonicaTotal: 100,
    })

    startTelemetryCollector()

    const callback = (globalThis as Record<string, unknown>)
      .__cronCallback as () => Promise<void>
    await callback()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(getEligibleMeters).toHaveBeenCalled()
    expect(getTelemetryFromMeter).toHaveBeenCalledWith('192.168.1.1')
    expect(insertMeasure).toHaveBeenCalled()
    expect(updateMeterSuccess).toHaveBeenCalledWith('192.168.1.1')
  })

  test('skips disabled meters during retry', async () => {
    const mockMeter = createMockMeter({ ip: '192.168.1.2' })

    vi.mocked(getEligibleMeters).mockResolvedValue([mockMeter])
    vi.mocked(checkMeterEnabled).mockResolvedValue(false)
    vi.mocked(updateMeterFailure).mockResolvedValue(undefined)
    vi.mocked(getTelemetryFromMeter).mockRejectedValue(
      new Error('Connection refused')
    )

    startTelemetryCollector()

    const callback = (globalThis as Record<string, unknown>)
      .__cronCallback as () => Promise<void>
    await callback()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(checkMeterEnabled).toHaveBeenCalledWith('192.168.1.2')
    expect(updateMeterFailure).not.toHaveBeenCalled()
  })

  test('marks meter as failing after all retries exhausted', async () => {
    const mockMeter = createMockMeter({ ip: '192.168.1.3', failureCount: 2 })

    vi.mocked(getEligibleMeters).mockResolvedValue([mockMeter])
    vi.mocked(checkMeterEnabled).mockResolvedValue(true)
    vi.mocked(updateMeterFailure).mockResolvedValue(undefined)
    vi.mocked(getTelemetryFromMeter).mockRejectedValue(
      new Error('Connection refused')
    )

    startTelemetryCollector()

    const callback = (globalThis as Record<string, unknown>)
      .__cronCallback as () => Promise<void>
    await callback()
    await new Promise((resolve) => setTimeout(resolve, 200))

    expect(updateMeterFailure).toHaveBeenCalledWith('192.168.1.3', 3)
  })

  test('inserts empty measure after all retries exhausted', async () => {
    const mockMeter = createMockMeter({ ip: '192.168.1.5', failureCount: 0 })

    vi.mocked(getEligibleMeters).mockResolvedValue([mockMeter])
    vi.mocked(checkMeterEnabled).mockResolvedValue(true)
    vi.mocked(updateMeterFailure).mockResolvedValue(undefined)
    vi.mocked(insertMeasure).mockResolvedValue({ meterId: 1 })
    vi.mocked(getTelemetryFromMeter).mockRejectedValue(
      new Error('Connection refused')
    )

    startTelemetryCollector()

    const callback = (globalThis as Record<string, unknown>)
      .__cronCallback as () => Promise<void>
    await callback()
    await new Promise((resolve) => setTimeout(resolve, 200))

    expect(insertMeasure).toHaveBeenCalledWith({}, '192.168.1.5')
    expect(updateMeterFailure).toHaveBeenCalledWith('192.168.1.5', 1)
  })

  test('skips meters in cooldown that have not expired', async () => {
    const mockMeter = createMockMeter({
      ip: '192.168.1.4',
      health: 'cooldown',
      failureCount: 1,
      lastFailedAt: new Date(Date.now() - 1000).toISOString(),
    })

    vi.mocked(getEligibleMeters).mockResolvedValue([mockMeter])

    startTelemetryCollector()

    const callback = (globalThis as Record<string, unknown>)
      .__cronCallback as () => Promise<void>
    await callback()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(getTelemetryFromMeter).not.toHaveBeenCalledWith('192.168.1.4')
  })

  test('calls notifyTelemetryChange on successful collection', async () => {
    const mockMeter = createMockMeter({ ip: '192.168.1.6' })

    vi.mocked(getEligibleMeters).mockResolvedValue([mockMeter])
    vi.mocked(checkMeterEnabled).mockResolvedValue(true)
    vi.mocked(updateMeterSuccess).mockResolvedValue(undefined)
    vi.mocked(getTelemetryFromMeter).mockResolvedValue({
      potenciaAtivaFundamentalHarmonicaTotal: 100,
    })

    startTelemetryCollector()

    const callback = (globalThis as Record<string, unknown>)
      .__cronCallback as () => Promise<void>
    await callback()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(notifyTelemetryChange).toHaveBeenCalledWith(1)
  })

  test('calls notifyTelemetryChange on failed collection (empty measure)', async () => {
    const mockMeter = createMockMeter({ ip: '192.168.1.7', failureCount: 0 })

    vi.mocked(getEligibleMeters).mockResolvedValue([mockMeter])
    vi.mocked(checkMeterEnabled).mockResolvedValue(true)
    vi.mocked(updateMeterFailure).mockResolvedValue(undefined)
    vi.mocked(getTelemetryFromMeter).mockRejectedValue(
      new Error('Connection refused')
    )

    startTelemetryCollector()

    const callback = (globalThis as Record<string, unknown>)
      .__cronCallback as () => Promise<void>
    await callback()
    await new Promise((resolve) => setTimeout(resolve, 200))

    expect(notifyTelemetryChange).toHaveBeenCalledWith(1)
  })
})
