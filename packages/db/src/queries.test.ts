import { beforeEach, describe, expect, test } from 'vitest'
import { db, sql } from './connections'
import { insertMeasure, notifyTelemetryChange } from './queries'
import { meters } from './schema/meters'

beforeEach(async () => {
  await sql`TRUNCATE TABLE meters, measures RESTART IDENTITY CASCADE`
})

describe('Database queries', () => {
  test('insertMeasure returns meterId on successful insertion', async () => {
    // Seed a meter
    await db.insert(meters).values({
      issoSerial: '123456',
      name: 'Test Meter',
      ip: '192.168.1.50',
      description: 'Test Description',
    })

    const result = await insertMeasure(
      {
        frequencia: 60,
        tensao_fase_neutro_a: 220,
      },
      '192.168.1.50'
    )

    expect(result).toEqual({ meterId: 1 })
  })

  test('insertMeasure throws an error if meter IP is not found', async () => {
    await expect(
      insertMeasure(
        {
          frequencia: 60,
        },
        '192.168.1.99'
      )
    ).rejects.toThrow('Medidor com IP 192.168.1.99 não encontrado')
  })

  test('notifyTelemetryChange runs without throwing', async () => {
    await expect(notifyTelemetryChange(1)).resolves.not.toThrow()
  })
})
