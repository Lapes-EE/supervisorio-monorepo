import { describe, expect, test, beforeEach } from 'vitest'
import { db, schema } from '@repo/db'
import { eq } from 'drizzle-orm'
import { 
  getEligibleMeters, 
  updateMeterSuccess, 
  updateMeterFailure,
  checkMeterEnabled
} from './queries'

beforeEach(async () => {
  await db.delete(schema.meters).execute()
})

describe('Worker DB Queries Integration', () => {
  test('getEligibleMeters returns enabled meters', async () => {
    await db.insert(schema.meters).values([
      { 
        name: 'Enabled', 
        ip: '1.1.1.1', 
        issoSerial: 'ABC-111-ABC-111',
        enabled: true,
        health: 'healthy'
      },
      { 
        name: 'Disabled', 
        ip: '2.2.2.2', 
        issoSerial: 'ABC-222-ABC-222',
        enabled: false,
        health: 'healthy'
      }
    ]).execute()

    const eligible = await getEligibleMeters()
    expect(eligible).toHaveLength(1)
    expect(eligible[0].ip).toBe('1.1.1.1')
  })

  test('updateMeterSuccess resets health state', async () => {
    await db.insert(schema.meters).values({
      name: 'Test',
      ip: '1.1.1.1',
      issoSerial: 'ABC-111-ABC-111',
      enabled: true,
      health: 'cooldown',
      failureCount: 5,
      lastFailedAt: new Date().toISOString()
    }).execute()

    await updateMeterSuccess('1.1.1.1')

    const [meter] = await db.select().from(schema.meters).where(eq(schema.meters.ip, '1.1.1.1'))
    expect(meter.health).toBe('healthy')
    expect(meter.failureCount).toBe(0)
    expect(meter.lastFailedAt).toBeNull()
  })

  test('updateMeterFailure updates health state', async () => {
    await db.insert(schema.meters).values({
      name: 'Test',
      ip: '1.1.1.1',
      issoSerial: 'ABC-111-ABC-111',
      enabled: true,
      health: 'healthy',
      failureCount: 0
    }).execute()

    await updateMeterFailure('1.1.1.1', 1)

    const [meter] = await db.select().from(schema.meters).where(eq(schema.meters.ip, '1.1.1.1'))
    expect(meter.health).toBe('cooldown')
    expect(meter.failureCount).toBe(1)
    expect(meter.lastFailedAt).not.toBeNull()
  })

  test('checkMeterEnabled returns correct status', async () => {
    await db.insert(schema.meters).values({
      name: 'Test',
      ip: '1.1.1.1',
      issoSerial: 'ABC-111-ABC-111',
      enabled: false
    }).execute()

    const isEnabled = await checkMeterEnabled('1.1.1.1')
    expect(isEnabled).toBe(false)
  })
})
