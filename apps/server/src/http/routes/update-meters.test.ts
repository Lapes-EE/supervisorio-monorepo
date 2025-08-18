import { faker } from '@faker-js/faker'
import request from 'supertest'
import { beforeEach, expect, test } from 'vitest'
import { api } from '@/app'
import { makeMeters } from '../tests/factories/make-meters'

beforeEach(async () => {
  await api.ready()
})

test('Update a non-existing meter', async () => {
  const response = await request(api.server)
    .put('/meters/99999')
    .set('Content-Type', 'application/json')
    .send({
      name: faker.lorem.words(2),
      ip: faker.internet.ipv4(),
      description: faker.lorem.sentence(),
    })

  expect(response.status).toBe(404)
  expect(response.body).toEqual({ error: 'Meter not found' })
})

test('Update a meter', async () => {
  const meter = await makeMeters()

  const response = await request(api.server)
    .put(`/meters/${meter.id}`)
    .set('Content-Type', 'application/json')
    .send({
      name: faker.lorem.words(2),
      ip: faker.internet.ipv4(),
      description: faker.lorem.sentence(),
    })

  expect(response.status).toBe(200)
})
