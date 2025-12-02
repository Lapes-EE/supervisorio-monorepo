import { faker } from '@faker-js/faker'
import request from 'supertest'
import { beforeEach, expect, test } from 'vitest'
import { api } from '@/app'
import { makeMeters } from '../tests/factories/make-meters'

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

test('Update a non-existing meter', async () => {
  const response = await request(api.server)
    .put('/meters/99999')
    .set('Authorization', `Bearer ${token}`)
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
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .send({
      name: faker.lorem.words(2),
      ip: faker.internet.ipv4(),
      description: faker.lorem.sentence(),
    })

  expect(response.status).toBe(200)
})

test('Update a meter without authorization', async () => {
  const response = await request(api.server)
    .put('/meters/1')
    .send({
      name: faker.lorem.words(2),
      ip: faker.internet.ipv4(),
      description: faker.lorem.sentence(),
    })

  expect(response.status).toBe(401)
  expect(response.body).toEqual({ error: 'Token inválido ou ausente' })
})
