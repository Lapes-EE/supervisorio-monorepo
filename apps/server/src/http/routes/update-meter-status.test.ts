import { db, schema } from '@repo/db'
import { eq } from 'drizzle-orm'
import request from 'supertest'
import { beforeEach, expect, test } from 'vitest'
import { api } from '@/app'

let token = ''

beforeEach(async () => {
  await api.ready()
  const loginResponse = await request(api.server)
    .post('/sessions/password')
    .send({
      username: 'lapes',
      password: 't2festado327',
    })
  token = loginResponse.body.token
})

test('PATCH /meter/:id with { enabled: true } resets health', async () => {
  // Seed a meter first
  const [seededMeter] = await db
    .insert(schema.meters)
    .values({
      name: 'Test Meter',
      ip: '1.2.3.4',
      issoSerial: 'XYZ-123-ABC-789',
      enabled: false,
      health: 'failing',
      failureCount: 5,
      lastFailedAt: new Date().toISOString(),
    })
    .returning()

  const response = await request(api.server)
    .patch(`/meter/${seededMeter.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ enabled: true })

  expect(response.status).toBe(204)

  const [meter] = await db
    .select()
    .from(schema.meters)
    .where(eq(schema.meters.id, seededMeter.id))
  expect(meter.enabled).toBe(true)
  expect(meter.health).toBe('healthy')
  expect(meter.failureCount).toBe(0)
  expect(meter.lastFailedAt).toBeNull()
})

test('PATCH /meter/:id with { enabled: false } disables meter', async () => {
  const [seededMeter] = await db
    .insert(schema.meters)
    .values({
      name: 'Test Meter 2',
      ip: '1.2.3.5',
      issoSerial: 'XYZ-123-ABC-780',
      enabled: true,
    })
    .returning()

  const response = await request(api.server)
    .patch(`/meter/${seededMeter.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ enabled: false })

  expect(response.status).toBe(204)

  const [meter] = await db
    .select()
    .from(schema.meters)
    .where(eq(schema.meters.id, seededMeter.id))
  expect(meter.enabled).toBe(false)
})

test('PATCH /meter/:id without authorization returns 401', async () => {
  const response = await request(api.server)
    .patch('/meter/1')
    .send({ enabled: true })

  expect(response.status).toBe(401)
})
