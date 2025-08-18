import { fakerPT_BR as faker } from '@faker-js/faker'
import request from 'supertest'
import { expect, test } from 'vitest'
import { api } from '@/app'

test('Create a meter', async () => {
  api.ready()

  const response = await request(api.server)
    .post('/meters')
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
