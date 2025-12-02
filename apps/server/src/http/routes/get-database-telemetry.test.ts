import request from 'supertest'
import { beforeEach, describe, expect, test } from 'vitest'
import { api } from '@/app'
import { makeMeters } from '../tests/factories/make-meters'
import { makeTelemetry } from '../tests/factories/make-telemetry'
import { availableFields } from '../utils/field-mapping'
import { getPeriodDates } from '../utils/period-utils'

describe('Telemetry API Tests', () => {
  beforeEach(async () => {
    await api.ready()
  })

  describe('Period Query Parameter Tests', () => {
    test('Get telemetry for last_5_minutes period', async () => {
      const meter = await makeMeters()
      const fiveMinutesAgo = new Date(Date.now() - 4 * 60 * 1000).toISOString()
      await makeTelemetry({ meterId: meter.id, time: fiveMinutesAgo })

      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: meter.id, period: 'last_5_minutes' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              meterId: meter.id,
              frequencia: expect.any(Number),
            }),
          ]),
          total: expect.any(Number),
          period: expect.objectContaining({
            startDate: expect.any(String),
            endDate: expect.any(String),
          }),
          nullCount: expect.any(Number),
        })
      )
    })

    test('Get telemetry for last_30_minutes period', async () => {
      const meter = await makeMeters()
      const twentyFiveMinutesAgo = new Date(
        Date.now() - 25 * 60 * 1000
      ).toISOString()
      await makeTelemetry({ meterId: meter.id, time: twentyFiveMinutesAgo })

      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: meter.id, period: 'last_30_minutes' })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
    })

    test('Get telemetry for last_hour period', async () => {
      const meter = await makeMeters()
      const oneHourAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      await makeTelemetry({ meterId: meter.id, time: oneHourAgo })

      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: meter.id, period: 'last_hour' })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.total).toBe(1)
    })

    test('Get telemetry for last_6_hours period', async () => {
      const meter = await makeMeters()
      const sixHoursAgo = new Date(
        Date.now() - 3 * 60 * 60 * 1000
      ).toISOString()
      await makeTelemetry({ meterId: meter.id, time: sixHoursAgo })

      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: meter.id, period: 'last_6_hours' })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
    })

    test('Get telemetry for last_12_hours period', async () => {
      const meter = await makeMeters()
      const twelveHoursAgo = new Date(
        Date.now() - 6 * 60 * 60 * 1000
      ).toISOString()
      await makeTelemetry({ meterId: meter.id, time: twelveHoursAgo })

      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: meter.id, period: 'last_12_hours' })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
    })

    test('Get telemetry for last_24_hours period', async () => {
      const meter = await makeMeters()
      await makeTelemetry({ meterId: meter.id })

      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: meter.id, period: 'last_24_hours' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              meterId: meter.id,
              frequencia: expect.any(Number),
            }),
          ]),
          total: expect.any(Number),
          period: expect.objectContaining({
            startDate: expect.any(String),
            endDate: expect.any(String),
          }),
          nullCount: expect.any(Number),
        })
      )
    })

    test('Get telemetry for today period', async () => {
      const meter = await makeMeters()
      const today = new Date()
      today.setHours(12, 0, 0, 0) // Set to noon today
      await makeTelemetry({ meterId: meter.id, time: today.toISOString() })

      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: meter.id, period: 'today' })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
    })

    test('Get telemetry for last_7_days period', async () => {
      const meter = await makeMeters()
      const threeDaysAgo = new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000
      ).toISOString()
      await makeTelemetry({ meterId: meter.id, time: threeDaysAgo })

      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: meter.id, period: 'last_7_days' })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
    })

    test('Get telemetry for this_month period', async () => {
      const meter = await makeMeters()
      const thisMonth = new Date()
      thisMonth.setDate(15) // Set to middle of current month
      await makeTelemetry({ meterId: meter.id, time: thisMonth.toISOString() })

      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: meter.id, period: 'this_month' })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
    })

    test('Get telemetry for last_30_days period', async () => {
      const meter = await makeMeters()
      const tenDaysAgo = new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000
      ).toISOString()
      await makeTelemetry({ meterId: meter.id, time: tenDaysAgo })

      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: meter.id, period: 'last_30_days' })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
    })

    test('Get telemetry for this_year period', async () => {
      const meter = await makeMeters()
      const thisYear = new Date()
      thisYear.setMonth(0, 1) // Set to Jan 1st
      await makeTelemetry({ meterId: meter.id, time: thisYear.toISOString() })

      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: meter.id, period: 'this_year' })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
    })

    test('Get telemetry with invalid period returns 200', async () => {
      const meter = await makeMeters()

      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: meter.id, period: 'invalid_period' })

      expect(response.status).toBe(400)
    })
  })

  describe('StartDate and EndDate Query Parameter Tests', () => {
    test('Get telemetry with custom startDate and endDate', async () => {
      const meter = await makeMeters()
      const startDate = new Date('2024-01-01T00:00:00.000Z').toISOString()
      const endDate = new Date('2024-01-02T00:00:00.000Z').toISOString()
      const testTime = new Date('2024-01-01T12:00:00.000Z').toISOString()

      await makeTelemetry({ meterId: meter.id, time: testTime })

      const response = await request(api.server).get('/telemetry').query({
        meterId: meter.id,
        startDate,
        endDate,
      })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.period.startDate).toBe(startDate)
      expect(response.body.period.endDate).toBe(endDate)
    })

    test('Get telemetry with only startDate', async () => {
      const meter = await makeMeters()
      const startDate = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      await makeTelemetry({ meterId: meter.id }) // Creates with current time

      const response = await request(api.server).get('/telemetry').query({
        meterId: meter.id,
        startDate,
      })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
    })

    test('Get telemetry with only endDate', async () => {
      const meter = await makeMeters()
      const endDate = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
      await makeTelemetry({ meterId: meter.id })

      const response = await request(api.server).get('/telemetry').query({
        meterId: meter.id,
        endDate,
      })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
    })

    test('Get telemetry with startDate after endDate returns empty', async () => {
      const meter = await makeMeters()
      const startDate = new Date('2024-01-02T00:00:00.000Z').toISOString()
      const endDate = new Date('2024-01-01T00:00:00.000Z').toISOString()

      const response = await request(api.server).get('/telemetry').query({
        meterId: meter.id,
        startDate,
        endDate,
      })

      expect(response.status).toBe(200)
      expect(response.body.data).toEqual([])
      expect(response.body.total).toBe(0)
    })
  })

  describe('MeterId Query Parameter Tests', () => {
    test('Get telemetry for specific meterId', async () => {
      const meter1 = await makeMeters()
      const meter2 = await makeMeters()

      await makeTelemetry({ meterId: meter1.id, frequencia: 50 })
      await makeTelemetry({ meterId: meter2.id, frequencia: 75 })

      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: meter1.id, period: 'last_24_hours' })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].meterId).toBe(meter1.id)
      expect(response.body.data[0].frequencia).toBe(50)
    })

    test('Get telemetry without meterId returns all meters data', async () => {
      const meter1 = await makeMeters()
      const meter2 = await makeMeters()

      await makeTelemetry({ meterId: meter1.id })
      await makeTelemetry({ meterId: meter2.id })

      const response = await request(api.server)
        .get('/telemetry')
        .query({ period: 'last_24_hours' })

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBeGreaterThanOrEqual(2)
    })

    test('Get telemetry with non-existent meterId returns empty array', async () => {
      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: 99_999, period: 'last_24_hours' })

      expect(response.status).toBe(200)
      expect(response.body.data).toEqual([])
      expect(response.body.total).toBe(0)
    })
  })

  describe('Invalid Query Parameter Tests', () => {
    test('Get telemetry with invalid period returns 400', async () => {
      const meter = await makeMeters()

      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: meter.id, period: 'invalid_period' })

      expect(response.status).toBe(400)
    })

    test('Get telemetry with invalid meterId format returns 400', async () => {
      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: 'not_a_number', period: 'last_24_hours' })

      expect(response.status).toBe(400)
    })

    test('Get telemetry with invalid startDate format returns 400', async () => {
      const meter = await makeMeters()

      const response = await request(api.server).get('/telemetry').query({
        meterId: meter.id,
        startDate: 'invalid-date-format',
      })

      expect(response.status).toBe(400)
    })

    test('Get telemetry with invalid endDate format returns 400', async () => {
      const meter = await makeMeters()

      const response = await request(api.server).get('/telemetry').query({
        meterId: meter.id,
        endDate: 'not-iso-datetime',
      })

      expect(response.status).toBe(400)
    })

    test('Get telemetry with negative meterId returns 400', async () => {
      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: -1, period: 'last_24_hours' })

      expect(response.status).toBe(400)
    })

    test('Get telemetry with zero meterId returns 400', async () => {
      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: 0, period: 'last_24_hours' })

      expect(response.status).toBe(400)
    })
  })

  describe('Combined Query Parameter Tests', () => {
    test('Get telemetry with meterId and period combination', async () => {
      const meter = await makeMeters()
      await makeTelemetry({ meterId: meter.id })

      const response = await request(api.server).get('/telemetry').query({
        meterId: meter.id,
        period: 'last_24_hours',
      })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
    })

    test('Get telemetry with meterId and custom date range', async () => {
      const meter = await makeMeters()
      const startDate = new Date('2024-01-01T00:00:00.000Z').toISOString()
      const endDate = new Date('2024-01-02T00:00:00.000Z').toISOString()
      const testTime = new Date('2024-01-01T12:00:00.000Z').toISOString()

      await makeTelemetry({ meterId: meter.id, time: testTime })

      const response = await request(api.server).get('/telemetry').query({
        meterId: meter.id,
        startDate,
        endDate,
      })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].meterId).toBe(meter.id)
    })

    test('Period parameter should override startDate/endDate', async () => {
      const meter = await makeMeters()
      const startDate = new Date('2020-01-01T00:00:00.000Z').toISOString()
      const endDate = new Date('2020-01-02T00:00:00.000Z').toISOString()

      await makeTelemetry({ meterId: meter.id }) // Creates with current time

      const response = await request(api.server).get('/telemetry').query({
        meterId: meter.id,
        period: 'last_24_hours',
        startDate,
        endDate,
      })

      expect(response.status).toBe(200)
      // Should return data from last 24 hours, not from 2020
      expect(response.body.data).toHaveLength(1)
    })
  })

  describe('Edge Cases', () => {
    test('Get telemetry with no query parameters', async () => {
      const response = await request(api.server).get('/telemetry')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('total')
    })

    test('Get telemetry with empty query values', async () => {
      const response = await request(api.server)
        .get('/telemetry')
        .query({ meterId: '', period: '', startDate: '', endDate: '' })

      // Depending on your validation, this might return 400 or handle empty strings
      expect([200, 400]).toContain(response.status)
    })
  })

  describe('Aggregation Tests', () => {
    test('Get aggregated telemetry', async () => {
      const meter = await makeMeters()
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

      // Create multiple telemetry points
      await makeTelemetry({
        meterId: meter.id,
        time: oneHourAgo.toISOString(),
        frequencia: 60,
      })
      await makeTelemetry({
        meterId: meter.id,
        time: now.toISOString(),
        frequencia: 60,
      })

      const response = await request(api.server).get('/telemetry').query({
        meterId: meter.id,
        period: 'last_24_hours',
        aggregation: '1 hour',
      })

      expect(response.status).toBe(200)
      expect(response.body.aggregation).toBe('1 hour')
      expect(response.body.data.length).toBeGreaterThan(0)
      // Verify structure of aggregated data
      expect(response.body.data[0]).toHaveProperty('frequencia')
      expect(response.body.data[0]).not.toHaveProperty('id') // Aggregated data shouldn't have ID
    })

    test('Get aggregated telemetry without meterId', async () => {
      const meter = await makeMeters()
      await makeTelemetry({
        meterId: meter.id,
        time: new Date().toISOString(),
        frequencia: 60,
      })

      const response = await request(api.server).get('/telemetry').query({
        period: 'last_24_hours',
        aggregation: '1 hour',
      })

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBeGreaterThan(0)
    })
  })
})

describe('getPeriodDates', () => {
  test('should throw error for invalid period', () => {
    // biome-ignore lint/suspicious/noExplicitAny: This function is typed, so i have to pass 'as any' to force a invalid period
    expect(() => getPeriodDates('invalid_period' as any)).toThrow(
      'Invalid period'
    )
  })
})

describe('Field Test', () => {
  test('should return only selected fields for raw aggregation', async () => {
    const meter = await makeMeters()
    await makeTelemetry({
      meterId: meter.id,
      frequencia: 60,
      tensaoFaseNeutroA: 220,
      correnteA: 10,
    })

    const response = await request(api.server)
      .get('/telemetry')
      .query({
        meterId: meter.id,
        period: 'last_24_hours',
        aggregation: 'raw',
        fields: ['frequencia', 'correnteA'],
      })

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1)
    const telemetryData = response.body.data[0]

    // Ensure selected fields are present
    expect(telemetryData).toHaveProperty('frequencia', 60)
    expect(telemetryData).toHaveProperty('correnteA', 10)

    // Ensure required fields are present
    expect(telemetryData).toHaveProperty('id')
    expect(telemetryData).toHaveProperty('meterId', meter.id)
    expect(telemetryData).toHaveProperty('time')

    // Ensure unselected fields are NOT present
    expect(telemetryData).not.toHaveProperty('tensaoFaseNeutroA')
    expect(telemetryData).not.toHaveProperty('potenciaReativaB')
  })

  test('should return only selected fields for aggregated data', async () => {
    const meter = await makeMeters()
    const now = new Date()
    now.setMinutes(30, 0, 0) // Ensure we are in the middle of an hour
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000)

    await makeTelemetry({
      meterId: meter.id,
      time: tenMinutesAgo.toISOString(),
      frequencia: 50,
      tensaoFaseNeutroA: 200,
    })
    await makeTelemetry({
      meterId: meter.id,
      time: now.toISOString(),
      frequencia: 70,
      tensaoFaseNeutroA: 240,
    })

    const response = await request(api.server)
      .get('/telemetry')
      .query({
        meterId: meter.id,
        period: 'last_24_hours',
        aggregation: '1 hour',
        fields: ['frequencia'],
      })

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1) // Aggregated into one hour
    const telemetryData = response.body.data[0]

    // Ensure selected fields are present (aggregated value)
    expect(telemetryData).toHaveProperty('frequencia')
    expect(telemetryData.frequencia).toBeCloseTo(60) // Average of 50 and 70

    // Ensure required fields are present
    expect(telemetryData).toHaveProperty('meterId', meter.id)
    expect(telemetryData).toHaveProperty('time')
    expect(telemetryData).not.toHaveProperty('id') // Aggregated data shouldn't have ID

    // Ensure unselected fields are NOT present
    expect(telemetryData).not.toHaveProperty('tensaoFaseNeutroA')
    expect(telemetryData).not.toHaveProperty('correnteA')
  })

  test('should return all fields if no fields are specified (raw)', async () => {
    const meter = await makeMeters()
    await makeTelemetry({
      meterId: meter.id,
      frequencia: 60,
      tensaoFaseNeutroA: 220,
    })

    const response = await request(api.server).get('/telemetry').query({
      meterId: meter.id,
      period: 'last_24_hours',
      aggregation: 'raw',
    })

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1)
    const telemetryData = response.body.data[0]

    // Ensure common fields are present
    expect(telemetryData).toHaveProperty('id')
    expect(telemetryData).toHaveProperty('meterId', meter.id)
    expect(telemetryData).toHaveProperty('time')

    // Ensure all defined availableFields are present (as number or null)
    for (const field of availableFields) {
      expect(telemetryData).toHaveProperty(field)
      if (field === 'frequencia') {
        expect(telemetryData[field]).toBe(60)
      } else if (field === 'tensaoFaseNeutroA') {
        expect(telemetryData[field]).toBe(220)
      } else {
        expect(telemetryData[field]).toBeNull()
      }
    }
  })

  test('should return all fields if no fields are specified (aggregated)', async () => {
    const meter = await makeMeters()
    await makeTelemetry({
      meterId: meter.id,
      frequencia: 60,
      tensaoFaseNeutroA: 220,
    })

    const response = await request(api.server).get('/telemetry').query({
      meterId: meter.id,
      period: 'last_24_hours',
      aggregation: '1 hour',
    })

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1)
    const telemetryData = response.body.data[0]

    // Ensure common fields are present
    expect(telemetryData).not.toHaveProperty('id') // Aggregated data shouldn't have ID
    expect(telemetryData).toHaveProperty('meterId', meter.id)
    expect(telemetryData).toHaveProperty('time')

    // Ensure all defined availableFields are present (as number or null)
    for (const field of availableFields) {
      expect(telemetryData).toHaveProperty(field)
      if (field === 'frequencia') {
        expect(telemetryData[field]).toBeCloseTo(60) // Average of 60
      } else if (field === 'tensaoFaseNeutroA') {
        expect(telemetryData[field]).toBeCloseTo(220) // Average of 220
      } else {
        expect(telemetryData[field]).toBeNull()
      }
    }
  })
})
