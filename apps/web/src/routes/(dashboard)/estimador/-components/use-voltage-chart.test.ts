import { describe, expect, it } from 'vitest'
import {
  buildFiveMinuteBuckets,
  calculateVoltageError,
} from './use-voltage-chart'

describe('use-voltage-chart utilities', () => {
  describe('calculateVoltageError', () => {
    it('returns null if either actual or estimated is null', () => {
      expect(calculateVoltageError(null, 220.0)).toBeNull()
      expect(calculateVoltageError(220.0, null)).toBeNull()
      expect(calculateVoltageError(null, null)).toBeNull()
    })

    it('calculates voltage error accurately', () => {
      expect(calculateVoltageError(220.5, 220.0)).toBe(0.5)
      expect(calculateVoltageError(218.25, 220.0)).toBe(-1.75)
    })
  })

  describe('buildFiveMinuteBuckets', () => {
    const referenceDate = new Date('2026-08-21T15:00:00.000Z')

    it('builds 5 consecutive minute buckets ending at reference date', () => {
      const buckets = buildFiveMinuteBuckets([], 220.0, referenceDate)

      expect(buckets).toHaveLength(5)
      expect(buckets.map((b) => b.actual)).toEqual([
        null,
        null,
        null,
        null,
        null,
      ])
      expect(buckets.map((b) => b.estimated)).toEqual([
        null,
        null,
        null,
        null,
        null,
      ])
    })

    it('aggregates measurements into correct minute buckets and applies estimated voltage', () => {
      const measurements = [
        {
          time: '2026-08-21T14:59:15.000Z',
          meterId: 1,
          measurements: { tensaoFaseNeutroC: 220.0 },
        },
        {
          time: '2026-08-21T14:59:45.000Z',
          meterId: 1,
          measurements: { tensaoFaseNeutroC: 222.0 },
        },
        {
          time: '2026-08-21T14:58:10.000Z',
          meterId: 1,
          measurements: { tensaoFaseNeutroC: 219.0 },
        },
      ]

      const buckets = buildFiveMinuteBuckets(measurements, 220.0, referenceDate)

      expect(buckets).toHaveLength(5)

      // Bucket 4 (i=0, 14:59) should average 220.0 and 222.0 -> 221.0
      const bucket1459 = buckets[4]
      expect(bucket1459.actual).toBe(221.0)
      expect(bucket1459.estimated).toBe(220.0)
      expect(bucket1459.error).toBe(1.0)

      // Bucket 3 (i=1, 14:58) should have 219.0
      const bucket1458 = buckets[3]
      expect(bucket1458.actual).toBe(219.0)
      expect(bucket1458.estimated).toBe(220.0)
      expect(bucket1458.error).toBe(-1.0)
    })
  })
})
