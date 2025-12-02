import { fakerPT_BR as faker } from '@faker-js/faker'
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

test('Create a meter', async () => {
  const response = await request(api.server)
    .post('/meters')
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .send({
      name: faker.lorem.words(2),
      ip: faker.internet.ipv4(),
      description: faker.lorem.sentence(),
    })

  expect(response.status).toBe(201)
  expect(response.body).toEqual({
    createdAt: expect.any(String),
  })
})

test('Create a meter without authorization', async () => {
  const response = await request(api.server)
    .post('/meters')
    .send({
      name: faker.lorem.words(2),
      ip: faker.internet.ipv4(),
      description: faker.lorem.sentence(),
    })

  expect(response.status).toBe(401)
  expect(response.body).toEqual({ error: 'Token inválido ou ausente' })
})
