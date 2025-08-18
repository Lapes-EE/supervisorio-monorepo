import request from 'supertest'
import { beforeEach, expect, test } from 'vitest'
import { api } from '@/app'
import { makeMeters } from '../tests/factories/make-meters'

beforeEach(async () => {
  await api.ready()
})

test('Delete a meter', async () => {
  const meter = await makeMeters()

  const response = await request(api.server).delete(`/meters/${meter.id}`)

  expect(response.status).toBe(204)
})

test('Delete a non-existing meter', async () => {
  const response = await request(api.server).delete('/meters/99999')

  expect(response.status).toBe(404)
  expect(response.body).toEqual({ error: 'Meter not found' })
})
